use std::{
    collections::HashMap,
    sync::{
        Arc,
        atomic::{AtomicBool, AtomicU64},
    },
    time::Duration,
};

use anyhow::Context;
use bytes::Bytes;
use firefly_core::FireflyMlsClient;
use futures::{SinkExt, StreamExt};
use libsignal_protocol::{DeviceId, PreKeyId, ProtocolAddress};
use mls_rs::MlsMessage;
use rand::RngCore;
use sqlx::SqlitePool;
use tokio::{
    net::TcpStream,
    sync::{RwLock, mpsc::Sender, oneshot},
};
use tokio_tungstenite::{MaybeTlsStream, WebSocketStream, tungstenite::Message};

use crate::{
    DumbError,
    db::{
        auth::{FfiAuthHandler, TokenResponse, get_claims_from_token},
        conversations::ConversationSettings,
        ffi_stores::FfiKeyStores,
        group_messages::{GroupMessage, GroupMessagesStore},
        group_stores::{GroupInfo, GroupInfoStore, SelfGroupKeyPackageStore},
        keyvalue::{KEY_FCM_TOKEN, KEY_LAST_RECEIVED_MESSAGE_ID, KeyValueStore},
        messages::UserMessage,
        setup_pool_from_path,
    },
    group::{FfiMlsClient, FfiMlsGroup},
    pb::firefly::firefly::{self, GroupMemberUpdate, GroupMemberUpdates, GroupMessageInner},
    utils::{
        HTTP_CLIENT, deserialize_proto, get_current_timestamp_microseconds_since_epoch,
        get_current_timestamp_millis_since_epoch, get_current_timestamp_seconds_since_epoch, rng,
        serialize_proto, write_url_comma_seperated,
    },
};

#[async_trait::async_trait]
pub trait FireflyWsClientCallback: Send + Sync {
    // async fn get_auth_token(&self) -> Option<String>;

    async fn on_message(&self, message: UserMessage);

    async fn on_group_message(&self, group_message: GroupMessage);
}

pub struct Connection {
    sender_task: tokio::task::JoinHandle<()>,
    receiver_task: tokio::task::JoinHandle<()>,
    sender: Sender<Bytes>,
}

impl Connection {
    pub fn new(
        callbacks: Arc<dyn FireflyWsClientCallback>,
        key_stores: Arc<FfiKeyStores>,
        pending_requests: PendingRequests,
        stream: WebSocketStream<MaybeTlsStream<TcpStream>>,
        on_connection_closed: oneshot::Sender<()>,
        key_value_store: KeyValueStore,
        firefly_mls_client: Arc<FfiMlsClient>,
        group_info_store: GroupInfoStore,
        group_messages_store: GroupMessagesStore,
    ) -> Self {
        let (mut ws_sender, mut ws_receiver) = stream.split();
        let receiver_task = tokio::spawn(async move {
            while let Some(Ok(msg)) = ws_receiver.next().await {
                match msg {
                    Message::Binary(bytes) => {
                        let payload = bytes;
                        match deserialize_proto::<firefly::ServerMessage>(&payload) {
                            Ok(server_message) => {
                                if let Err(err) = on_server_message(
                                    server_message,
                                    &pending_requests,
                                    &key_stores,
                                    &callbacks,
                                    &key_value_store,
                                    &firefly_mls_client,
                                    &group_info_store,
                                    &group_messages_store,
                                )
                                .await
                                {
                                    log::error!("failed to handle server message: {}", err);
                                }
                            }
                            Err(err) => log::error!("failed to deserialize message: {}", err),
                        }
                    }

                    Message::Close(close_frame) => {
                        log::info!("ws closed: {:?}", close_frame);
                        break;
                    }

                    _ => {
                        log::warn!("unhandled ws message type {:?}", msg);
                    }
                };
            }
            log::info!("ws receiver task finished");

            if on_connection_closed.send(()).is_err() {
                log::error!("unable to send on_connection_closed signal");
            }
        });
        let (sender, mut receiver) = tokio::sync::mpsc::channel::<Bytes>(100);

        let last_message_sent_ts_secs =
            Arc::new(AtomicU64::new(get_current_timestamp_seconds_since_epoch()));

        let sender_task = {
            let last_message_sent_ts_secs = last_message_sent_ts_secs.clone();
            tokio::spawn(async move {
                while let Some(msg) = receiver.recv().await {
                    if let Err(err) = ws_sender.send(Message::Binary(msg)).await {
                        log::error!("failed to send message: {}", err);
                        break;
                    }
                    last_message_sent_ts_secs.store(
                        get_current_timestamp_seconds_since_epoch(),
                        std::sync::atomic::Ordering::Relaxed,
                    );
                }
                log::info!("ws sender task finished");
            })
        };
        {
            let ping_sender = sender.clone();

            tokio::spawn(async move {
                loop {
                    tokio::time::sleep(Duration::from_secs(10)).await;

                    let now_secs = get_current_timestamp_seconds_since_epoch();
                    let last_sent_secs =
                        last_message_sent_ts_secs.load(std::sync::atomic::Ordering::Relaxed);

                    if now_secs - last_sent_secs < 30 {
                        continue;
                    }

                    let ping = vec![0u8; 64];
                    let ping = serialize_proto(&firefly::ClientMessage {
                        message: Some(firefly::client_message::Message::Ping(ping)),
                    })
                    .unwrap();

                    if ping_sender.send(ping).await.is_err() {
                        break;
                    }
                }
            });
        }
        Self {
            sender_task,
            receiver_task,
            sender,
        }
    }
}

impl Drop for Connection {
    fn drop(&mut self) {
        self.sender_task.abort();
        self.receiver_task.abort();
        log::info!("dropping connection");
    }
}

type PendingRequests = Arc<std::sync::Mutex<HashMap<u32, oneshot::Sender<firefly::Response>>>>;

#[derive(Default, Clone)]
pub enum ConnectionState {
    #[default]
    Disconnected,
    Initializing,
    Retrying,
    Connected,
    CheckingSetup,
}

pub struct FireflyWsClient {
    callbacks: Arc<dyn FireflyWsClientCallback>,
    retry_interval: Duration,
    firefly_base_url: String,
    firefly_base_ws_url: String,
    key_stores: Arc<FfiKeyStores>,

    key_value_store: KeyValueStore,

    connection: Arc<RwLock<Option<Connection>>>,
    last_connection_tried_timestamp: AtomicU64,

    pending_requests: PendingRequests,

    request_timeout: Duration,
    stop_reconnecting: AtomicBool,

    auth: Arc<FfiAuthHandler>,

    state: Arc<std::sync::RwLock<ConnectionState>>,

    address_id: AtomicU64,
    group_messages_store: GroupMessagesStore,
    firefly_mls_client: tokio::sync::OnceCell<Arc<FfiMlsClient>>,
    group_info_store: GroupInfoStore,
    self_group_key_packages_store: SelfGroupKeyPackageStore,
    pool: SqlitePool,
}

impl FireflyWsClient {
    pub async fn create(
        firefly_base_url: String,
        firefly_base_ws_url: String,
        retry_interval_in_ms: u64,
        callbacks: Box<dyn FireflyWsClientCallback>,
        key_stores_pathname: String,
        request_timeout_in_ms: u64,
        auth0_client_id: String,
        auth0_base_url: String,
    ) -> anyhow::Result<Self> {
        let pool = setup_pool_from_path(&key_stores_pathname, 5).await?;
        let key_stores = Arc::new(FfiKeyStores::new(pool.clone()).await?);
        let key_value_store = KeyValueStore::new(pool.clone()).await?;

        let groups_store = GroupMessagesStore::new(pool.clone()).await?;
        let self_group_key_packages_store = SelfGroupKeyPackageStore::new(pool.clone()).await?;

        let auth = Arc::new(FfiAuthHandler::new(
            key_value_store.clone(),
            auth0_client_id,
            auth0_base_url,
        ));
        let last_connection_established_timestamp = get_current_timestamp_millis_since_epoch();

        let group_info_store = GroupInfoStore::new(pool.clone()).await?;

        Ok(Self {
            pool,
            callbacks: callbacks.into(),
            retry_interval: Duration::from_millis(retry_interval_in_ms),
            firefly_base_url,
            firefly_base_ws_url,
            key_stores,
            last_connection_tried_timestamp: last_connection_established_timestamp.into(),

            pending_requests: Default::default(),
            request_timeout: Duration::from_millis(request_timeout_in_ms),
            connection: Default::default(),
            stop_reconnecting: AtomicBool::new(false),
            key_value_store: key_value_store,
            auth,
            state: Default::default(),
            address_id: Default::default(),
            group_messages_store: groups_store,
            self_group_key_packages_store,
            firefly_mls_client: Default::default(),
            group_info_store,
        })
    }

    pub async fn initialize_with_retrying(&self) -> anyhow::Result<()> {
        {
            *self.state.write().unwrap() = ConnectionState::CheckingSetup;
        }

        loop {
            log::info!("checking setup");
            match self.check_setup().await {
                Ok(_) => {
                    log::info!("setup check passed");
                    break;
                }
                Err(err) => {
                    log::error!("failed to check setup: {:?}", err);

                    tokio::time::sleep(Duration::from_secs(2)).await;
                    continue;
                }
            }
        }

        {
            *self.state.write().unwrap() = ConnectionState::Initializing;
        }
        while !self
            .stop_reconnecting
            .load(std::sync::atomic::Ordering::Relaxed)
        {
            {
                *self.state.write().unwrap() = ConnectionState::Retrying;
            }
            let duration_since_last_connection = Duration::from_millis(
                get_current_timestamp_millis_since_epoch()
                    - self
                        .last_connection_tried_timestamp
                        .load(std::sync::atomic::Ordering::Relaxed),
            );

            let time_to_wait = self
                .retry_interval
                .checked_sub(duration_since_last_connection)
                .unwrap_or_default();

            log::info!("waiting {}ms to reconnect", time_to_wait.as_millis());

            if !time_to_wait.is_zero() {
                tokio::time::sleep(time_to_wait).await;
            }

            self.last_connection_tried_timestamp.store(
                get_current_timestamp_millis_since_epoch(),
                std::sync::atomic::Ordering::Relaxed,
            );
            if let Err(err) = self.connect().await {
                log::error!("connection ended {:?}", err);
            }
        }

        {
            *self.state.write().unwrap() = ConnectionState::Disconnected;
        }

        Ok(())
    }

    async fn connect(&self) -> anyhow::Result<()> {
        let token = self.auth.get_access_token().await?;

        let address_id = self.address_id.load(std::sync::atomic::Ordering::Relaxed);

        if address_id == 0 {
            return Err(anyhow::anyhow!("address_id is not set"));
        }

        let device_id = self
            .key_stores
            .store()
            .identity_store
            .get_full_identity_key_pair()
            .await?
            .device_id;

        let last_synced_upto = self
            .key_value_store
            .get(KEY_LAST_RECEIVED_MESSAGE_ID)
            .await
            .unwrap_or_default()
            .parse::<u64>()
            .unwrap_or_default();

        let url = format!(
            "{}?uid={}&device_id={}&last_synced_upto={}&token={}",
            self.firefly_base_ws_url, address_id, device_id, last_synced_upto, token
        );

        log::info!("connecting to {}", url);

        let (stream, response) = match tokio_tungstenite::connect_async(&url).await {
            Ok(v) => v,
            Err(err) => {
                log::error!("connection request failed {:?}", err);
                return Err(err.into());
            }
        };

        {
            *self.state.write().unwrap() = ConnectionState::Connected;
        }

        log::info!(
            "connected successfully to {}, Headers: {:?} ",
            url,
            response.headers()
        );

        let pending_requests = self.pending_requests.clone();
        let key_stores = self.key_stores.clone();
        let callbacks = self.callbacks.clone();

        {
            pending_requests.lock().unwrap().clear(); // cleanup for fresh connection
        }

        let (on_connection_closed_tx, on_connection_closed_rx) = oneshot::channel::<()>();

        let firefly_mls_client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is uninitialized")?;

        {
            let mut g = self.connection.write().await;
            *g = Some(Connection::new(
                callbacks,
                key_stores,
                pending_requests,
                stream,
                on_connection_closed_tx,
                self.key_value_store.clone(),
                firefly_mls_client.clone(),
                self.group_info_store.clone(),
                self.group_messages_store.clone(),
            ));
        }

        if let Err(err) = self.sync_all_group_messages().await {
            log::error!("sync group messages failed: {:?}", err);
        }

        on_connection_closed_rx.await?;
        Ok(())
    }

    pub async fn dispose(&self) {
        self.stop_reconnecting
            .store(true, std::sync::atomic::Ordering::Relaxed);
        self.connection.write().await.take();
    }

    async fn create_encrypted_message(
        &self,
        address: ProtocolAddress,
        address_id: u64,
        settings: u32,
        payload: Vec<u8>,
    ) -> anyhow::Result<firefly::UserMessage> {
        let from_id = self.address_id.load(std::sync::atomic::Ordering::Relaxed);

        if from_id == 0 {
            return Err(anyhow::anyhow!("self.address_id not set"));
        }

        let cipher = self
            .key_stores
            .encrypt(address, payload)
            .await
            .map_err(|err| anyhow::anyhow!(err))?;

        let message = firefly::UserMessage {
            id: get_current_timestamp_microseconds_since_epoch(),
            to_id: address_id,
            from_id: from_id,
            text: cipher.cipher_text,
            r#type: cipher.ty as u32,
            settings,
            from_username: Default::default(),
            from_device_id: Default::default(),
        };

        return Ok(message);
    }

    async fn create_conversation(
        &self,
        to: &str,
        settings: u64,
        token: &str,
    ) -> anyhow::Result<ConversationSettings> {
        let url = format!(
            "{}/user/conversation?other={}&settings={}&merge=true",
            self.firefly_base_url, to, settings
        );

        let response = HTTP_CLIENT.post(url).bearer_auth(token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status [{}]: {}",
                response.status(),
                response.text().await?
            ));
        }

        self.key_stores
            .store()
            .conversation_store
            .set_conversation(to, ConversationSettings::new(settings))
            .await?;

        Ok(ConversationSettings::new(settings))
    }

    pub async fn encrypt_and_send(
        &self,
        to: String,
        payload: Vec<u8>,
    ) -> anyhow::Result<UserMessage> {
        let token = self.auth.get_access_token().await?;

        let store = self.key_stores.store();

        let _settings =
            if let Some(settings) = store.conversation_store.get_conversation(&to).await? {
                settings
            } else {
                self.create_conversation(&to, 1, &token).await?
            };
        let address_store = self.key_stores.store().address_store;

        let other_addresses = address_store.get(&to).await?;

        if other_addresses.is_empty() {
            self.get_and_process_all_pre_key_bundles_of_user(&to, &token)
                .await?;
        }

        let other_addresses = self.key_stores.store().address_store.get(&to).await?;
        if other_addresses.is_empty() {
            return Err(anyhow::anyhow!("no addresses found for user {}", to));
        }

        let claims = get_claims_from_token(&token)?;
        let self_username = claims.uname;

        let self_addresses = address_store.get(&self_username).await?;

        let mut message_entries = firefly::UploadUserMessage::default();

        let message_settings = 0;
        let self_message_settings = 1;

        for address in other_addresses.iter() {
            let message = self
                .create_encrypted_message(
                    ProtocolAddress::new(to.clone(), DeviceId::new(address.device_id)?),
                    address.address_id,
                    message_settings,
                    payload.clone(),
                )
                .await?;
            message_entries.messages.push(message);
        }
        let self_message_payload = serialize_proto(&firefly::UserMessageInner {
            message: Some(firefly::user_message_inner::Message::SelfMessage(
                firefly::SelfUserMessage {
                    to: to.clone(),
                    inner: payload.clone(),
                },
            )),
        })?
        .to_vec();
        {
            for address in self_addresses.iter() {
                let message = self.create_encrypted_message(
                    ProtocolAddress::new(self_username.clone(), DeviceId::new(address.device_id)?),
                    address.address_id,
                    self_message_settings,
                    self_message_payload.clone(),
                );
                message_entries.messages.push(message.await?);
            }
        }
        let response = self
            .request(firefly::Request {
                payload: Some(firefly::request::Payload::UploadUserMessage(
                    message_entries,
                )),
                id: 0,
            })
            .await?;

        if let Some(error) = response.error {
            return Err(anyhow::anyhow!("[{}], {}", error.error_code, error.error));
        }

        let mut more_addresses_to_send_to = Vec::new();

        let mut addresses_to_not_send_to = self_addresses.clone();
        addresses_to_not_send_to.extend_from_slice(&other_addresses);

        if let Some(firefly::response::Body::UserMessageUploaded(body)) = response.body {
            log::info!("uploaded messages: {:?}", body);
            for ids in body.message_ids {
                if ids.to == 0 {
                    more_addresses_to_send_to.push(ids.to);
                } else {
                    if let Some(index) = addresses_to_not_send_to
                        .iter()
                        .position(|x| x.address_id == ids.to)
                    {
                        addresses_to_not_send_to.swap_remove(index);
                    }
                }
            }
        } else {
            return Err(anyhow::anyhow!("unexpected or empty body returned"));
        }

        for id in addresses_to_not_send_to {
            let _ = address_store.delete_by_id(id.address_id).await;
        }

        if more_addresses_to_send_to.is_empty() {
            return Ok(UserMessage {
                id: get_current_timestamp_microseconds_since_epoch(),
                other: to.clone(),
                message: payload.clone(),
                sent_by_other: false,
            });
        }

        self.get_and_process_pre_key_bundles_per_ids(&more_addresses_to_send_to, &token)
            .await?;

        let mut upload_request = firefly::UploadUserMessage::default();
        for address_id in more_addresses_to_send_to {
            let address = store.address_store.get_by_id(address_id).await?;
            if let Some(address) = address {
                let is_self = address.username == self_username;
                let protocol_address =
                    ProtocolAddress::new(address.username, DeviceId::new(address.device_id)?);
                let message = if is_self {
                    self.create_encrypted_message(
                        protocol_address,
                        address.address_id,
                        self_message_settings,
                        self_message_payload.clone(),
                    )
                } else {
                    self.create_encrypted_message(
                        protocol_address,
                        address.address_id,
                        message_settings,
                        payload.clone(),
                    )
                }
                .await?;

                upload_request.messages.push(message);
            } else {
                continue;
            }
        }

        let response = self
            .request(firefly::Request {
                id: 0,
                payload: Some(firefly::request::Payload::UploadUserMessage(upload_request)),
            })
            .await?;

        if let Some(error) = response.error {
            return Err(anyhow::anyhow!("[{}], {}", error.error_code, error.error));
        }

        if let Some(firefly::response::Body::UserMessageUploaded(uploaded)) = response.body {
            log::info!("uploaded messages: {:?}", uploaded);
        }

        return Ok(UserMessage {
            id: get_current_timestamp_microseconds_since_epoch(),
            other: to.clone(),
            message: payload.clone(),
            sent_by_other: false,
        });
    }

    async fn get_and_process_all_pre_key_bundles_of_user(
        &self,
        to: &str,
        token: &str,
    ) -> anyhow::Result<()> {
        let url = format!("{}/user/preKeyBundles?other={}", self.firefly_base_url, to);

        let response = HTTP_CLIENT.get(url).bearer_auth(token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status [{}] {}",
                response.status(),
                response.text().await?
            ));
        }

        let body = response.bytes().await?;

        let entries = deserialize_proto::<firefly::PreKeyBundleEntries>(&body)?.entries;

        for entry in entries {
            let Some(bundle) = entry.bundle else {
                log::warn!(
                    "failed to process key_bundle {} {} {} {}: no bundle",
                    entry.id,
                    entry.address,
                    entry.username,
                    entry.device_id
                );

                continue;
            };

            if let Err(err) = self
                .key_stores
                .process_pre_key_bundle(entry.username.clone(), bundle.into())
                .await
            {
                log::warn!(
                    "failed to process key_bundle {} {} {} {}: {err}",
                    entry.id,
                    entry.address,
                    entry.username,
                    entry.device_id
                );
            }

            self.key_stores
                .store()
                .address_store
                .add(entry.address, &entry.username, entry.device_id as u8)
                .await?;
        }

        Ok(())
    }

    async fn sync_all_group_messages(&self) -> anyhow::Result<()> {
        const LIMIT: usize = 100;
        let address_id = self.address_id.load(std::sync::atomic::Ordering::Relaxed);
        if address_id == 0 {
            return Err(anyhow::anyhow!("address_id is not set"));
        }

        let firefly_mls_client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is not initialized")?;

        loop {
            let token = self.auth.get_access_token().await?;
            let last_messages = self.group_messages_store.get_all_last_messages().await?;

            if last_messages.is_empty() {
                break;
            }

            let mut group_requests = firefly::GroupSyncRequests::default();

            for last_message in &last_messages {
                let mut request = firefly::GroupSyncRequest::default();
                request.group_id = last_message.group_id;
                request.start_after = last_message.id;
                group_requests.requests.push(request);
            }

            let body = serialize_proto(&group_requests)?;

            let url = format!(
                "{}/group/sync?address={}&limit={}",
                self.firefly_base_url, address_id, LIMIT
            );
            let response = HTTP_CLIENT
                .post(url)
                .bearer_auth(&token)
                .body(body)
                .send()
                .await?;

            if !response.status().is_success() {
                return Err(anyhow::anyhow!(
                    "unexpected status [{}]: {}",
                    response.status(),
                    response.text().await?
                ));
            }

            let body = response.bytes().await?;
            let messages = deserialize_proto::<firefly::GroupMessages>(&body)?;
            let messages_len = messages.messages.len();
            for message in messages.messages {
                if let Err(err) = on_group_message(
                    &message,
                    firefly_mls_client,
                    &self.group_info_store,
                    &self.group_messages_store,
                    &self.callbacks,
                )
                .await
                {
                    log::error!("failed to process group message {:?}", err)
                }
            }
            if messages_len < LIMIT {
                break;
            }
        }

        Ok(())
    }

    pub async fn get_and_process_pre_key_bundles_per_ids(
        &self,
        ids: &[u64],
        token: &str,
    ) -> anyhow::Result<()> {
        let mut url = String::with_capacity(256);

        url.push_str(&self.firefly_base_url);
        url.push_str("/user/preKeyBundles?ids=");

        write_url_comma_seperated(&mut url, ids.iter())?;

        let response = HTTP_CLIENT.get(url).bearer_auth(token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status [{}] {}",
                response.status(),
                response.text().await?
            ));
        }

        let body = response.bytes().await?;

        let entries = deserialize_proto::<firefly::PreKeyBundleEntries>(&body)?.entries;

        for entry in entries {
            let Some(bundle) = entry.bundle else {
                log::warn!(
                    "failed to process key_bundle {} {} {} {}: no bundle",
                    entry.id,
                    entry.address,
                    entry.username,
                    entry.device_id
                );

                continue;
            };

            if let Err(err) = self
                .key_stores
                .process_pre_key_bundle(entry.username.clone(), bundle.into())
                .await
            {
                log::warn!(
                    "failed to process key_bundle {} {} {} {}: {err}",
                    entry.id,
                    entry.address,
                    entry.username,
                    entry.device_id
                );
            }
            self.key_stores
                .store()
                .address_store
                .add(entry.address, &entry.username, entry.device_id as u8)
                .await?;
        }

        Ok(())
    }

    pub async fn request(
        &self,
        mut request: firefly::Request,
    ) -> anyhow::Result<firefly::Response> {
        let request_id = rand::random::<u32>();
        request.id = request_id;
        let (sender, receiver) = oneshot::channel::<firefly::Response>();
        {
            self.pending_requests
                .lock()
                .unwrap()
                .insert(request_id, sender);
        }

        let client_message = firefly::ClientMessage {
            message: Some(firefly::client_message::Message::Request(request)),
        };

        {
            let g = self.connection.read().await;
            if let Some(conn) = &*g {
                conn.sender.send(serialize_proto(&client_message)?).await?
            } else {
                return Err(anyhow::anyhow!("not connected"))?;
            }
        }

        let response = tokio::time::timeout(self.request_timeout.clone(), receiver).await;
        {
            self.pending_requests.lock().unwrap().remove(&request_id);
        }
        let response = response??;
        Ok(response)
    }

    async fn check_key_packages(
        &self,
        token: &str,
        address_id: u64,
        device_id: u8,
    ) -> anyhow::Result<()> {
        let firefly_mls_client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is not initialized")?;
        let url = format!(
            "{}/group/keyPackages?address_id={}&device_id={}",
            self.firefly_base_url, address_id, device_id
        );
        let response = HTTP_CLIENT.get(url).bearer_auth(&token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status [{}] {}",
                response.status(),
                response.text().await?
            ));
        }

        let key_packages =
            deserialize_proto::<firefly::GroupKeyPackages>(&response.bytes().await?)?;

        const MAX_KEY_PACKAGES_LIMIT: usize = 32;

        let received_key_packages_len = key_packages.packages.len();
        let mut ids_to_delete = Vec::with_capacity(received_key_packages_len);
        let current_signing_identity = firefly_mls_client.signing_identity();
        for package in key_packages.packages {
            let id = package.id;

            if let Ok(package_data) = self.self_group_key_packages_store.get(id).await {
                if package_data != package.package {
                    ids_to_delete.push(id);
                } else {
                    let message = MlsMessage::from_bytes(&package.package).ok();
                    if !message
                        .and_then(|x| {
                            x.as_key_package().and_then(|x| {
                                Some(x.signing_identity() == &current_signing_identity)
                            })
                        })
                        .unwrap_or_default()
                    {
                        ids_to_delete.push(id);
                        continue;
                    }
                }
            } else {
                ids_to_delete.push(id);
            }
        }

        if !ids_to_delete.is_empty() {
            let mut url = format!(
                "{}/group/keyPackages?address={}&device_id={}&ids=",
                self.firefly_base_url, address_id, device_id
            );
            write_url_comma_seperated(&mut url, ids_to_delete.iter())?;

            let response = HTTP_CLIENT.delete(url).bearer_auth(&token).send().await?;
            if !response.status().is_success() {
                return Err(anyhow::anyhow!(
                    "unexpected status [{}] {}",
                    response.status(),
                    response.text().await?
                ));
            }

            log::info!("deleted key packages: {:?}", ids_to_delete);
        }

        let keys_remained = received_key_packages_len - ids_to_delete.len();
        let keys_to_generate = MAX_KEY_PACKAGES_LIMIT - keys_remained;

        if keys_to_generate > 0 {
            let mut key_packages = firefly::GroupKeyPackages::default();
            for _ in 0..keys_to_generate {
                let id = (rng().next_u32() % 32000) as i32;
                let key_package = firefly_mls_client
                    .generate_key_package()
                    .await
                    .map_err(|e| anyhow::anyhow!(e))?;
                self.self_group_key_packages_store
                    .set(id, &key_package)
                    .await?;
                self.self_group_key_packages_store
                    .set(id, &key_package)
                    .await?;
                key_packages.packages.push(firefly::GroupKeyPackage {
                    id,
                    package: key_package,
                    address: address_id,
                    username: Default::default(),
                });
            }

            let body = serialize_proto(&key_packages)?;

            let url = format!(
                "{}/group/keyPackages?address={}&device_id={}",
                self.firefly_base_url, address_id, device_id
            );
            let response = HTTP_CLIENT
                .post(url)
                .bearer_auth(&token)
                .body(body)
                .send()
                .await?;

            if !response.status().is_success() {
                return Err(anyhow::anyhow!(
                    "unexpected status [{}] {}",
                    response.status(),
                    response.text().await?
                ));
            }

            log::info!(
                "group key packages uploaded: {}",
                key_packages.packages.len()
            );
        }
        Ok(())
    }

    async fn check_mls_setup(&self) -> anyhow::Result<()> {
        let token = self.auth.get_access_token().await?;

        let address_id = self.address_id.load(std::sync::atomic::Ordering::Relaxed);
        if address_id == 0 {
            return Err(anyhow::anyhow!("address_id is not set"));
        }

        let device_id = self
            .key_stores
            .store()
            .identity_store
            .get_full_identity_key_pair()
            .await?
            .device_id;

        let _firefly_mls_client = {
            let auth = self.auth.clone();
            let key_value_store = self.key_value_store.clone();
            let firefly_base_url = self.firefly_base_url.clone();
            let pool = self.pool.clone();
            self.firefly_mls_client
                .get_or_try_init(|| {
                    Box::pin(async move {
                        Ok::<_, anyhow::Error>(Arc::new(
                            FfiMlsClient::initialize(
                                device_id,
                                address_id,
                                auth,
                                key_value_store,
                                firefly_base_url,
                                pool,
                            )
                            .await?,
                        ))
                    })
                })
                .await?
        };

        self.check_key_packages(&token, address_id, device_id)
            .await?;

        let _ = self.join_groups(&token, address_id, device_id).await;
        let _ = self
            .request_group_re_adds(&token, address_id, device_id)
            .await;
        let _ = self
            .add_requested_re_add_group_members(&token, address_id, device_id)
            .await;

        let _ = self.update_group_commits(&token, address_id).await;

        Ok(())
    }
    async fn request_group_re_adds(
        &self,
        token: &str,
        address_id: u64,
        device_id: u8,
    ) -> anyhow::Result<()> {
        let url = format!("{}/groups", self.firefly_base_url);

        let response = HTTP_CLIENT.get(url).bearer_auth(&token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status [{}] {}",
                response.status(),
                response.text().await?
            ));
        }

        let groups = deserialize_proto::<firefly::Groups>(&response.bytes().await?)?;

        let mut group_ids_to_be_requested_to_add = Vec::new();

        for group in groups.groups {
            if self.group_info_store.get(group.id).await.is_err() {
                group_ids_to_be_requested_to_add.push(group.id);
            }
        }

        if !group_ids_to_be_requested_to_add.is_empty() {
            let mut url = format!(
                "{}/group/reAdd?address={}&device_id={}&groupIds=",
                self.firefly_base_url, address_id, device_id
            );
            write_url_comma_seperated(&mut url, group_ids_to_be_requested_to_add.iter())?;

            let response = HTTP_CLIENT.post(url).bearer_auth(&token).send().await?;
            if !response.status().is_success() {
                return Err(anyhow::anyhow!(
                    "unexpected status [{}] {}",
                    response.status(),
                    response.text().await?
                ));
            }
        }
        Ok(())
    }

    async fn add_requested_re_add_group_members(
        &self,
        token: &str,
        address_id: u64,
        _device_id: u8,
    ) -> anyhow::Result<()> {
        let groups = self.group_info_store.get_all().await?;

        if groups.is_empty() {
            return Ok(());
        }

        let mut url = format!(
            "{}/group/reAdds?address={}&groupIds=",
            address_id, self.firefly_base_url
        );

        write_url_comma_seperated(&mut url, groups.iter().map(|x| x.id))?;

        let response = HTTP_CLIENT.get(url).bearer_auth(&token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status [{}] {}",
                response.status(),
                response.text().await?
            ));
        }

        let requests = deserialize_proto::<firefly::GroupReAddRequests>(&response.bytes().await?)?;

        let firefly_mls_client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is not initialized")?;

        for request in requests.requests {
            match self
                .re_add_member(token, &firefly_mls_client, &request, address_id)
                .await
            {
                Ok(_) => {
                    log::info!("readded member: {:?}", request);
                }
                Err(err) => {
                    log::error!("failed to readd member {:?}", err);
                }
            }
        }

        Ok(())
    }

    async fn re_add_member(
        &self,
        token: &str,
        firefly_mls_client: &FfiMlsClient,
        request: &firefly::GroupReAddRequest,
        address_id: u64,
    ) -> anyhow::Result<()> {
        let group_id = request.group_id;
        let group_info = self.group_info_store.get(group_id).await?;
        let group = firefly_mls_client
            .load_group(group_id, group_info.identifier.clone())
            .await
            .map_err(|e| anyhow::anyhow!(e))?;
        let id = group
            .re_add_member(request.username.clone(), request.address_id)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        self.group_messages_store
            .update_cursor(id, group_id, group.epoch().await as u32)
            .await?;

        let response = HTTP_CLIENT
            .delete(format!(
                "{}/group/reAdd?groupId={}&address={}&myAddress={}",
                self.firefly_base_url, group_id, request.address_id, address_id,
            ))
            .bearer_auth(token)
            .send()
            .await?;

        log::info!(
            "delete reAdd result: [{}] {}",
            response.status(),
            response.text().await?
        );

        Ok(())
    }

    async fn join_groups(&self, token: &str, address_id: u64, device_id: u8) -> anyhow::Result<()> {
        let url = format!(
            "{}/group/invites?address={}&device_id={}",
            self.firefly_base_url, address_id, device_id
        );

        let response = HTTP_CLIENT.get(url).bearer_auth(token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status [{}] {}",
                response.status(),
                response.text().await?
            ));
        }

        let invites = deserialize_proto::<firefly::GroupInvites>(&response.bytes().await?)?;

        for invite in invites.invites.iter() {
            match self.join_group(invite, token, address_id, device_id).await {
                Ok(group) => {
                    log::info!("joined group via invite: {:?}", invite);

                    self.group_messages_store
                        .update_cursor(
                            invite.commit_id,
                            invite.group_id,
                            group.epoch().await as u32,
                        )
                        .await?;
                }
                Err(err) => {
                    log::error!("failed to join group via invite: {:?}: {:?}", invite, err);
                }
            };
        }

        {
            if !invites.invites.is_empty() {
                let mut url = format!(
                    "{}/group/invites?address={}&groupIds=",
                    address_id, self.firefly_base_url
                );
                write_url_comma_seperated(&mut url, invites.invites.iter().map(|x| x.group_id))?;
                let response = HTTP_CLIENT.delete(&url).bearer_auth(token).send().await?;
                if !response.status().is_success() {
                    return Err(anyhow::anyhow!(
                        "unexpected status [{}] {}",
                        response.status(),
                        response.text().await?
                    ));
                }

                log::info!("deleted invites: {}", url);
            }
        }

        Ok(())
    }

    pub async fn create_group(
        &self,
        name: String,
        description: String,
    ) -> anyhow::Result<GroupInfo> {
        let client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is not initialized")?;

        let group = client
            .create_group(name.clone())
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        self.group_info_store
            .set(
                group.group_id(),
                name.clone(),
                description,
                group
                    .group_identifier()
                    .await
                    .map_err(|e| anyhow::anyhow!(e))?,
            )
            .await?;

        return Ok(self.group_info_store.get(group.group_id()).await?);
    }

    pub async fn encrypt_and_send_group(
        &self,
        group_id: u64,
        message: GroupMessageInner,
    ) -> anyhow::Result<u64> {
        let firefly_mls_client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is not initialized")?;

        let group_info = self.group_info_store.get(group_id).await?;

        let group = firefly_mls_client
            .load_group(group_id, group_info.identifier)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        let payload = serialize_proto(&message)?;
        let encrypted = group
            .encrypt(payload.to_vec())
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        let epoch = group.epoch().await as u32;
        let group_message = firefly::GroupMessage {
            id: 0,
            group_id,
            message: encrypted,
            epoch,
        };

        let response = self
            .request(firefly::Request {
                id: 0,
                payload: Some(firefly::request::Payload::UploadGroupMessage(group_message)),
            })
            .await?;

        if let Some(err) = response.error {
            return Err(anyhow::anyhow!(
                "unexpected response: [{}] {:?}",
                err.error_code,
                err.error
            ));
        }

        let Some(firefly::response::Body::GroupMessageUploaded(uploaded_group_message)) =
            response.body
        else {
            return Err(anyhow::anyhow!("unexpected response: {:?}", response));
        };

        let claims = get_claims_from_token(&self.auth.get_access_token().await?)?;

        self.group_messages_store
            .add(
                uploaded_group_message.id,
                group_id,
                message.channel_id,
                uploaded_group_message.epoch,
                &claims.uname,
                &payload,
            )
            .await?;

        Ok(uploaded_group_message.id)
    }

    async fn join_group(
        &self,
        invite: &firefly::GroupInvite,
        token: &str,
        address_id: u64,
        device_id: u8,
    ) -> anyhow::Result<Arc<FfiMlsGroup>> {
        let group_id = invite.group_id;

        let firefly_mls_client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is not initialized")?;
        let group = firefly_mls_client
            .join_group(group_id, invite.welcome_message.clone())
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        log::info!("joined group: {}", invite.group_id);
        group.save().await.map_err(|e| anyhow::anyhow!(e))?;

        let url = format!("{}/group?id={}", self.firefly_base_url, group_id);
        let response = HTTP_CLIENT.get(url).bearer_auth(token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status [{}] {}",
                response.status(),
                response.text().await?
            ));
        }

        let group_info = deserialize_proto::<firefly::Group>(&response.bytes().await?)?;

        self.group_info_store
            .set(
                group_id,
                group_info.name,
                group_info.description,
                group
                    .group_identifier()
                    .await
                    .map_err(|e| anyhow::anyhow!(e))?,
            )
            .await?;

        let url = format!(
            "{}/group/member?groupId={}&address={}&device_id={}",
            self.firefly_base_url, group_id, address_id, device_id
        );

        let last_message_seen = self
            .group_messages_store
            .get_last_message_of_group(group_id)
            .await
            .map(|last_message| last_message.id)
            .unwrap_or(0);
        let update = GroupMemberUpdate {
            group_id,
            last_epoch: group.epoch().await as u32,
            last_message_seen: last_message_seen,
        };
        let response = HTTP_CLIENT
            .post(url)
            .bearer_auth(&token)
            .body(serialize_proto(&update)?)
            .send()
            .await?;
        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status [{}] {}",
                response.status(),
                response.text().await?
            ));
        }

        Ok(group)
    }

    async fn check_setup(&self) -> anyhow::Result<()> {
        let token = self.auth.get_access_token().await?;

        {
            let fcm_token = self
                .key_value_store
                .get(KEY_FCM_TOKEN)
                .await
                .unwrap_or_default();
            log::info!("fcm token: {}", KEY_FCM_TOKEN);

            let identity = self
                .key_stores
                .store()
                .identity_store
                .get_full_identity_key_pair()
                .await?;
            let address = firefly::Address {
                id: identity.id as u64,
                username: get_claims_from_token(&token)?.uname,
                device_id: identity.device_id as u32,
                fcm_token,
            };

            log::info!("address to upload {:?}", address);

            self.address_id
                .store(identity.id as u64, std::sync::atomic::Ordering::Relaxed);

            let response = HTTP_CLIENT
                .post(format!("{}/user/device", self.firefly_base_url))
                .body(serialize_proto(&address)?)
                .bearer_auth(&token)
                .send()
                .await?;

            if !response.status().is_success() {
                return Err(anyhow::anyhow!(
                    "unexpected status [{}]: {}",
                    response.status(),
                    response.text().await?
                ));
            }

            let body = response.bytes().await?;
            let address = deserialize_proto::<firefly::Address>(&body)?;

            self.address_id
                .store(address.id, std::sync::atomic::Ordering::Relaxed);

            self.key_stores
                .store()
                .identity_store
                .update_id_for_keypair(address.id as i64)
                .await?;

            self.update_pre_key_bundles(&token).await?;
        }

        {
            self.check_mls_setup().await?;
        }

        Ok(())
    }

    async fn update_pre_key_bundles(&self, token: &str) -> anyhow::Result<()> {
        let _registration_id = self
            .key_stores
            .store()
            .identity_store
            .get_local_registration_id()
            .await?;
        let claims = get_claims_from_token(token)?;
        let username = claims.uname.clone();

        let address_id = self.address_id.load(std::sync::atomic::Ordering::Relaxed);
        if address_id == 0 {
            return Err(anyhow::anyhow!("address_id is 0"));
        }
        let url = format!(
            "{}/user/preKeyBundles?id={}&onlyIds=true",
            self.firefly_base_url, address_id
        );
        let response = HTTP_CLIENT.get(url).bearer_auth(&token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "failed to get preKeyBundles: [{}] {}",
                response.status().as_u16(),
                response.text().await?
            ));
        }
        let bundles = deserialize_proto::<firefly::PreKeyBundleEntries>(&response.bytes().await?)?;

        let mut key_ids_to_delete = Vec::<u32>::new();

        let bundles_length = bundles.entries.len();

        log::info!("received {} key bundles", bundles_length);
        for bundle in bundles.entries {
            let bundle_id = bundle.id;
            if self
                .key_stores
                .store()
                .prekey_store
                .get_pre_key(PreKeyId::from(bundle_id))
                .await
                .is_err()
            {
                key_ids_to_delete.push(bundle_id);
            }
        }

        if !key_ids_to_delete.is_empty() {
            let mut url = String::with_capacity(256);

            use std::fmt::Write;
            write!(
                &mut url,
                "{}/user/preKeyBundles?addressId={}&ids=",
                self.firefly_base_url, address_id
            )
            .unwrap();

            write_url_comma_seperated(&mut url, key_ids_to_delete.iter())?;

            log::info!("Deleting preKeyBundles via {}", url);
            let response = HTTP_CLIENT.delete(&url).bearer_auth(&token).send().await?;

            if response.status().is_success() {
                log::info!("deleted preKeyBundles via {}", url);
            } else {
                return Err(anyhow::anyhow!(
                    "failed to delete preKeyBundles: [{}] {}",
                    response.status().as_u16(),
                    response.text().await?
                ));
            }
        }

        const MAX_KEYS_LIMIT: usize = 32;

        let keys_remaining = bundles_length - key_ids_to_delete.len();

        if keys_remaining < MAX_KEYS_LIMIT {
            let keys_to_create = MAX_KEYS_LIMIT - keys_remaining;

            log::info!("creating {} number of key bundles", keys_to_create);

            let mut bundles = firefly::PreKeyBundleEntries::default();
            for _ in 0..keys_to_create {
                let pre_key_bundle = self
                    .key_stores
                    .generate_prekey_bundle()
                    .await
                    .map_err(|err| anyhow::anyhow!(err))?;
                let device_id = pre_key_bundle.device_id;
                let pre_key: firefly::PreKeyBundle = pre_key_bundle.into();

                bundles.entries.push(firefly::PreKeyBundleEntry {
                    id: pre_key.pre_key_id,
                    address: address_id,
                    bundle: Some(pre_key),
                    username: username.to_string(),
                    device_id: device_id as u32,
                });
            }
            let url = format!("{}/user/preKeyBundles", self.firefly_base_url);
            let response = HTTP_CLIENT
                .post(url)
                .bearer_auth(&token)
                .body(serialize_proto(&bundles)?)
                .send()
                .await?;

            if response.status().is_success() {
                log::info!("created and uploaded preKeyBundles {} keys", keys_to_create);
            } else {
                return Err(anyhow::anyhow!(
                    "failed to create preKeyBundle: [{}] {}",
                    response.status().as_u16(),
                    response.text().await?
                ));
            }
        }

        Ok(())
    }

    pub async fn update_group_commits(&self, token: &str, address_id: u64) -> anyhow::Result<()> {
        let firefly_mls_client = self.firefly_mls_client.get().context("mls client uninit")?;
        let mut group_commit_syncs = GroupMemberUpdates::default();

        for info in self.group_info_store.get_all().await? {
            let group = firefly_mls_client
                .load_group(info.id, info.identifier)
                .await
                .map_err(|e| anyhow::anyhow!(e))?;
            let epoch = group.epoch().await;

            let last_message_seen = match self
                .group_messages_store
                .get_last_message_of_group(info.id)
                .await
            {
                Ok(message) => message.id,
                Err(_) => 0,
            };

            group_commit_syncs.updates.push(GroupMemberUpdate {
                group_id: info.id,
                last_message_seen: last_message_seen,
                last_epoch: epoch as u32,
            });
        }

        if group_commit_syncs.updates.is_empty() {
            return Ok(());
        }

        let response = HTTP_CLIENT
            .post(format!(
                "{}/group/syncUpdate?address={}",
                self.firefly_base_url, address_id
            ))
            .bearer_auth(token)
            .body(serialize_proto(&group_commit_syncs)?)
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "failed to sync group updates: [{}] {}",
                response.status().as_u16(),
                response.text().await?
            ));
        }
        log::info!("update group members sync");

        Ok(())
    }

    pub async fn upload_fcm_token(&self, token: Option<String>) -> anyhow::Result<()> {
        let _token = match token {
            Some(val) => {
                self.key_value_store.set(KEY_FCM_TOKEN, &val).await?;

                val
            }
            None => {
                let val = self.key_value_store.get(KEY_FCM_TOKEN).await?;
                val
            }
        };

        Ok(())
    }

    pub async fn get_conversations(&self, token: &str) -> anyhow::Result<Vec<FfiConversation>> {
        let url = format!("{}/user/conversations", self.firefly_base_url);

        let claims = get_claims_from_token(&token)?;

        let response = HTTP_CLIENT.get(url).bearer_auth(token).send().await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!(
                "unexpected status: [{}] {}",
                response.status(),
                response.text().await?
            ));
        }

        let body = response.bytes().await?;

        let conversations = deserialize_proto::<firefly::Conversations>(&body)?;

        let mut records = Vec::new();

        for conversation in conversations.conversations {
            let other = if conversation.user1 == claims.uname {
                conversation.user2
            } else {
                conversation.user1
            };

            let settings = conversation.settings;

            self.key_stores
                .store()
                .conversation_store
                .set_conversation(&other, ConversationSettings::new(settings))
                .await?;

            records.push(FfiConversation { other, settings });
        }

        Ok(records)
    }

    pub async fn get_group_extension(&self, group_id: u64) -> anyhow::Result<Vec<u8>> {
        let client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is unitialized")?;

        let group_info = self.group_info_store.get(group_id).await?;

        let group = client
            .load_group(group_id, group_info.identifier)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        group.extension().await.map_err(|e| anyhow::anyhow!(e))
    }

    pub async fn update_group_users(
        &self,
        group_id: u64,
        users: Vec<crate::group::UpdateUserProposalFfi>,
    ) -> anyhow::Result<u64> {
        let client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is unitialized")?;

        let group_info = self.group_info_store.get(group_id).await?;
        let group = client
            .load_group(group_id, group_info.identifier)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        let id = group
            .update_users(users)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        self.group_messages_store
            .update_cursor(id, group_id, group.epoch().await as u32)
            .await?;

        Ok(id)
    }

    pub async fn update_group_channel(
        &self,
        group_id: u64,
        id: u32,
        delete: bool,
        name: String,
        channel_ty: u8,
        default_permissions: u32,
    ) -> anyhow::Result<u64> {
        let client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is unitialized")?;

        let group_info = self.group_info_store.get(group_id).await?;
        let group = client
            .load_group(group_id, group_info.identifier)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;
        let old_epoch = group.epoch().await;

        log::info!(
            "updating channel group_id: {}, old_group_epoch: {}",
            group.group_id(),
            old_epoch,
        );

        let commit_id = match group
            .update_channel(id, delete, name, channel_ty, default_permissions)
            .await
        {
            Ok(commit_id) => commit_id,
            Err(err) => {
                log::error!(
                    "failed to update channel {:?}, epoch: {}",
                    err,
                    group.epoch().await
                );
                return Err(anyhow::anyhow!(err));
            }
        };

        log::info!("channel updated, commit_id: {}", commit_id);

        self.group_messages_store
            .update_cursor(commit_id, group_id, group.epoch().await as u32)
            .await?;
        Ok(commit_id)
    }

    pub async fn update_group_roles(
        &self,
        group_id: u64,
        roles: Vec<crate::group::UpdateRoleProposalFfi>,
    ) -> anyhow::Result<u64> {
        let client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is unitialized")?;

        let group_info = self.group_info_store.get(group_id).await?;
        let group = client
            .load_group(group_id, group_info.identifier)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        let id = group
            .update_roles(roles)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        self.group_messages_store
            .update_cursor(id, group_id, group.epoch().await as u32)
            .await?;
        Ok(id)
    }

    pub async fn update_group_roles_in_channel(
        &self,
        group_id: u64,
        channel_id: u32,
        roles: Vec<crate::group::UpdateRoleProposalFfi>,
    ) -> anyhow::Result<u64> {
        let client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is unitialized")?;

        let group_info = self.group_info_store.get(group_id).await?;
        let group = client
            .load_group(group_id, group_info.identifier)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        let id = group
            .update_roles_in_channel(channel_id, roles)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        self.group_messages_store
            .update_cursor(id, group_id, group.epoch().await as u32)
            .await?;
        Ok(id)
    }

    async fn add_group_member(
        &self,
        group_id: u64,
        username: String,
        role_id: u32,
    ) -> anyhow::Result<()> {
        let client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is unitialized")?;

        let group_info = self.group_info_store.get(group_id).await?;
        let group = client
            .load_group(group_id, group_info.identifier)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        let id = group.add_member(username, role_id).await?;

        self.group_messages_store
            .update_cursor(id, group_id, group.epoch().await as u32)
            .await?;

        Ok(())
    }

    async fn kick_group_member(&self, group_id: u64, username: String) -> anyhow::Result<()> {
        let client = self
            .firefly_mls_client
            .get()
            .context("firefly_mls_client is unitialized")?;

        let group_info = self.group_info_store.get(group_id).await?;
        let group = client
            .load_group(group_id, group_info.identifier)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        let id = group.kick_member(username).await?;

        self.group_messages_store
            .update_cursor(id, group_id, group.epoch().await as u32)
            .await?;

        Ok(())
    }

    async fn delete_group(&self, group_id: u64) -> anyhow::Result<()> {
        let url = format!("{}/group?id={}", self.firefly_base_url, group_id);
        let token = self.auth.get_access_token().await?;
        let resp = HTTP_CLIENT.delete(url).bearer_auth(&token).send().await?;

        log::info!(
            "delete group, response: [{}]: {}",
            resp.status(),
            resp.text().await?
        );

        self.group_info_store.delete(group_id).await?;
        self.group_messages_store
            .delete_by_group_id(group_id)
            .await?;

        Ok(())
    }
}

async fn on_group_message(
    group_message: &firefly::GroupMessage,
    firefly_mls_client: &FfiMlsClient,
    group_info_store: &GroupInfoStore,
    group_message_store: &GroupMessagesStore,
    callbacks: &Arc<dyn FireflyWsClientCallback>,
) -> anyhow::Result<()> {
    let group_id = group_message.group_id;
    let group = group_info_store.get(group_id).await?;

    let group = firefly_mls_client
        .load_group(group_id, group.identifier)
        .await
        .map_err(|err| anyhow::anyhow!(err))?;

    log::info!(
        "processing group message at group epoch: {} id: {}, len: {}, message_epoch: {}",
        group.epoch().await,
        group_message.id,
        group_message.message.len(),
        group_message.epoch
    );

    let message = group
        .process(group_message.message.clone())
        .await
        .map_err(|err| anyhow::anyhow!(err))?;

    let epoch = group.epoch().await as u32;
    match message {
        crate::group::FireflyMlsReceivedMessage::Message(encrypted_group_message) => {
            let message = deserialize_proto::<GroupMessageInner>(&encrypted_group_message.message)?;

            group_message_store
                .add(
                    group_message.id,
                    group_id,
                    message.channel_id,
                    epoch,
                    &encrypted_group_message.sender,
                    &encrypted_group_message.message,
                )
                .await?;
            let message = GroupMessage {
                id: group_message.id,
                group_id,
                by: encrypted_group_message.sender,
                message: encrypted_group_message.message,
                epoch,
                channel_id: message.channel_id,
            };

            log::info!(
                "decrypted group message group_id: {}, id: {}, sender: {}, message_len: {}, message_epoch: {}, group_epoch: {}",
                message.group_id,
                message.id,
                message.by,
                message.message.len(),
                group_message.epoch,
                epoch,
            );
            callbacks.on_group_message(message).await;
        }
        _ => {
            group_message_store
                .update_cursor(group_message.id, group_message.group_id, epoch)
                .await?;
        }
    }

    Ok(())
}

async fn on_user_message(
    user_message: &firefly::UserMessage,

    callbacks: &Arc<dyn FireflyWsClientCallback>,
    key_stores: &Arc<FfiKeyStores>,
    key_value_store: &KeyValueStore,
) -> anyhow::Result<()> {
    if let Err(err) = key_value_store
        .update_last_received_message_id(user_message.id)
        .await
    {
        log::error!("failed to update last received message id: {}", err);
    }

    let from = user_message.from_username.clone();
    let from_device_id = user_message.from_device_id as u8;
    let decrypted = key_stores
        .decrypt(
            ProtocolAddress::new(from.clone(), from_device_id.try_into()?),
            user_message.text.clone(),
            user_message.r#type as u8,
        )
        .await
        .map_err(|err| anyhow::anyhow!(err))?;
    callbacks
        .on_message(UserMessage {
            id: user_message.id,
            other: from.clone(),
            message: decrypted,
            sent_by_other: true,
        })
        .await;

    Ok(())
}

async fn on_server_message(
    msg: firefly::ServerMessage,
    pending_requests: &PendingRequests,
    key_stores: &Arc<FfiKeyStores>,
    callbacks: &Arc<dyn FireflyWsClientCallback>,
    key_value_store: &KeyValueStore,
    firefly_mls_client: &FfiMlsClient,
    group_info_store: &GroupInfoStore,
    group_message_store: &GroupMessagesStore,
) -> anyhow::Result<()> {
    let Some(message) = msg.message else {
        return Err(anyhow::anyhow!("no message"));
    };

    match message {
        firefly::server_message::Message::UserMessage(user_message) => {
            log::info!(
                "from server user message: id: {}, from: {}, from_id: {}, from_device_id: {}, payload_ty: {}, payload_len: {}",
                user_message.id,
                user_message.from_username,
                user_message.from_id,
                user_message.from_device_id,
                user_message.text.len(),
                user_message.r#type,
            );

            on_user_message(&user_message, callbacks, key_stores, key_value_store).await?;
        }
        firefly::server_message::Message::GroupMessage(group_message) => {
            log::info!(
                "from server group message: id: {}, group_id: {}, payload_len: {}, epoch: {}",
                group_message.id,
                group_message.group_id,
                group_message.message.len(),
                group_message.epoch,
            );
            on_group_message(
                &group_message,
                firefly_mls_client,
                group_info_store,
                group_message_store,
                callbacks,
            )
            .await?;
        }
        firefly::server_message::Message::Response(response) => {
            if let Some(sender) = pending_requests.lock().unwrap().remove(&response.id) {
                if sender.send(response).is_err() {
                    log::warn!("failed to send response");
                }
            }
        }
        firefly::server_message::Message::Pong(_pong_bytes) => {}
        firefly::server_message::Message::Ping(_ping_bytes) => {}
        _ => return Err(anyhow::anyhow!("unhandled server message")),
    };
    Ok(())
}

pub struct FfiConversation {
    pub other: String,
    pub settings: u64,
}

pub struct FfiFireflyWsClient {
    inner: FireflyWsClient,
}

impl FfiFireflyWsClient {
    pub async fn create(
        firefly_base_url: String,
        firefly_base_ws_url: String,
        retry_interval_in_ms: u64,
        callbacks: Box<dyn FireflyWsClientCallback>,
        key_stores_pathname: String,
        request_timeout_in_ms: u64,
        auth0_client_id: String,
        auth0_base_url: String,
    ) -> Result<Self, DumbError> {
        Ok(Self {
            inner: FireflyWsClient::create(
                firefly_base_url,
                firefly_base_ws_url,
                retry_interval_in_ms,
                callbacks,
                key_stores_pathname,
                request_timeout_in_ms,
                auth0_client_id,
                auth0_base_url,
            )
            .await
            .map_err(DumbError::from_anyhow)?,
        })
    }

    pub async fn initialize_with_retrying(&self) -> Result<(), DumbError> {
        self.inner
            .initialize_with_retrying()
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn dispose(&self) {
        self.inner.dispose().await;
    }

    pub async fn encrypt_and_send(
        &self,
        to: String,
        payload: Vec<u8>,
    ) -> Result<UserMessage, DumbError> {
        self.inner
            .encrypt_and_send(to, payload)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn set_auth_tokens(&self, tokens: TokenResponse) -> Result<(), DumbError> {
        self.inner
            .auth
            .set_access_token(tokens.access_token)
            .await?;
        self.inner
            .auth
            .set_refresh_token(tokens.refresh_token)
            .await?;
        Ok(())
    }

    pub async fn upload_fcm_token(&self, token: Option<String>) -> Result<(), DumbError> {
        self.inner
            .upload_fcm_token(token)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub fn get_connection_state(&self) -> ConnectionState {
        let guard = self.inner.state.read().unwrap();
        return guard.clone();
    }

    pub async fn get_conversations(
        &self,
        token: String,
    ) -> Result<Vec<FfiConversation>, DumbError> {
        self.inner
            .get_conversations(&token)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn create_group(
        &self,
        name: String,
        description: String,
    ) -> Result<GroupInfo, DumbError> {
        self.inner
            .create_group(name, description)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn encrypt_and_send_group(
        &self,
        group_id: u64,
        payload: Vec<u8>,
    ) -> Result<u64, DumbError> {
        let payload = deserialize_proto::<GroupMessageInner>(&payload)?;
        self.inner
            .encrypt_and_send_group(group_id, payload)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub fn group_message_store(&self) -> GroupMessagesStore {
        self.inner.group_messages_store.clone()
    }

    pub fn group_info_store(&self) -> GroupInfoStore {
        self.inner.group_info_store.clone()
    }

    pub async fn get_group_extension(&self, group_id: u64) -> Result<Vec<u8>, DumbError> {
        self.inner
            .get_group_extension(group_id)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn update_group_users(
        &self,
        group_id: u64,
        users: Vec<crate::group::UpdateUserProposalFfi>,
    ) -> Result<u64, DumbError> {
        self.inner
            .update_group_users(group_id, users)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn update_group_channel(
        &self,
        group_id: u64,
        id: u32,
        delete: bool,
        name: String,
        channel_ty: u8,
        default_permissions: u32,
    ) -> Result<u64, DumbError> {
        self.inner
            .update_group_channel(group_id, id, delete, name, channel_ty, default_permissions)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn update_group_roles(
        &self,
        group_id: u64,
        roles: Vec<crate::group::UpdateRoleProposalFfi>,
    ) -> Result<u64, DumbError> {
        self.inner
            .update_group_roles(group_id, roles)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn update_group_roles_in_channel(
        &self,
        group_id: u64,
        channel_id: u32,
        roles: Vec<crate::group::UpdateRoleProposalFfi>,
    ) -> Result<u64, DumbError> {
        self.inner
            .update_group_roles_in_channel(group_id, channel_id, roles)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn add_group_member(
        &self,
        group_id: u64,
        username: String,
        role_id: u32,
    ) -> Result<(), DumbError> {
        self.inner
            .add_group_member(group_id, username, role_id)
            .await
            .map_err(DumbError::from_anyhow)
    }
    pub async fn kick_group_member(
        &self,
        group_id: u64,
        username: String,
    ) -> Result<(), DumbError> {
        self.inner
            .kick_group_member(group_id, username)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn delete_group(&self, group_id: u64) -> Result<(), DumbError> {
        self.inner
            .delete_group(group_id)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn check_setup(&self) -> Result<(), DumbError> {
        self.inner
            .check_setup()
            .await
            .map_err(DumbError::from_anyhow)
    }
}
