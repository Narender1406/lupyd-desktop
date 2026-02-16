use base64::{engine::general_purpose, Engine as _};
use firefly_signal::{
    db::{
        auth::TokenResponse,
        group_messages::GroupMessage,
        group_stores::GroupInfo,
        messages::{MessagesStore, UserMessage},
        setup_pool_from_path,
    },
    group::{UpdateRoleProposalFfi, UpdateUserProposalFfi},
    websocket::{ConnectionState, FfiFireflyWsClient, FireflyWsClientCallback},
    *,
};
use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{command, AppHandle, Emitter, Manager, Runtime, State};
use tauri_plugin_notification::NotificationExt;
use tokio::sync::{broadcast, OnceCell};

#[cfg(target_os = "android")]
use jni::objects::{JClass, JString};
#[cfg(target_os = "android")]
use jni::JNIEnv;

use crate::notification::{NotificationHandler, NotificationStore};

type FireflyClient = Arc<FfiFireflyWsClient>;
type MessageStore = Arc<MessagesStore>;
type FileServer = Arc<FfiFileServer>;
type Database = SqlitePool;

pub static DATABASE: OnceCell<Database> = OnceCell::const_new();
pub static MESSAGE_STORE: OnceCell<MessageStore> = OnceCell::const_new();
pub static FIREFLY_CLIENT: OnceCell<FireflyClient> = OnceCell::const_new();
pub static FILE_SERVER: OnceCell<FileServer> = OnceCell::const_new();

// Using once_cell::sync::Lazy for the event channel as it doesn't require async initialization
// and is simple to use for this purpose.
use once_cell::sync::Lazy;

static EVENT_CHANNEL: Lazy<broadcast::Sender<FireflyEvent>> = Lazy::new(|| {
    let (tx, _) = broadcast::channel(100);
    tx
});

#[derive(Clone)]
pub enum FireflyEvent {
    UserMessage(Arc<UserMessage>),
    GroupMessage(Arc<GroupMessage>),
}

struct Constants;
impl Constants {
    const FIREFLY_API_URL: &'static str = env!("NEXT_PUBLIC_JS_ENV_CHAT_API_URL");
    const FIREFLY_WS_URL: &'static str = env!("NEXT_PUBLIC_JS_ENV_CHAT_WEBSOCKET_URL");
    const AUTH0_DOMAIN: &'static str = env!("NEXT_PUBLIC_JS_ENV_AUTH0_DOMAIN");
    const AUTH0_CLIENT_ID: &'static str = env!("NEXT_PUBLIC_JS_ENV_AUTH0_CLIENT_ID");
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateRoleProposal {
    name: String,
    #[serde(rename = "roleId")]
    role_id: u32,
    permissions: u32,
    delete: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateUserProposal {
    username: String,
    #[serde(rename = "roleId")]
    role_id: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Conversation {
    other: String,
    settings: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BUserMessage {
    id: u64,
    other: String,
    #[serde(rename = "sentByOther")]
    sent_by_other: bool,
    #[serde(rename = "textB64")]
    text_b64: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BGroupMessage {
    sender: String,
    #[serde(rename = "groupId")]
    group_id: u64,
    #[serde(rename = "textB64")]
    text_b64: String,
    id: u64,
    #[serde(rename = "channelId")]
    channel_id: u32,
    epoch: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BGroupInfo {
    name: String,
    #[serde(rename = "groupId")]
    group_id: u64,
    description: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileServerResponse {
    url: String,
    token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MessageIdResponse {
    #[serde(rename = "messageId")]
    message_id: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupExtensionResponse {
    #[serde(rename = "resultB64")]
    result_b64: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupInfoAndExtension {
    name: String,
    #[serde(rename = "groupId")]
    group_id: u64,
    description: String,
    #[serde(rename = "extensionB64")]
    extension_b64: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LastMessagesResponse {
    result: Vec<BUserMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LastGroupMessagesResponse {
    result: Vec<BGroupMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversationWithCount {
    message: BUserMessage,
    count: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AllConversationsResponse {
    result: Vec<ConversationWithCount>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GroupInfosResponse {
    result: Vec<BGroupInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversationsResponse {
    result: Vec<Conversation>,
}

pub async fn initialize_firefly_client(app_data_dir: String) -> Result<(), String> {
    let app_data_dir = PathBuf::from(app_data_dir);
    let app_dbs_dir = app_data_dir.join("dbs");
    tokio::fs::create_dir_all(&app_dbs_dir)
        .await
        .map_err(|e| e.to_string())?;

    log::info!("created dir: {:?}", app_dbs_dir);

    // Initialize Database
    DATABASE
        .get_or_try_init(|| async {
            let db_path = app_dbs_dir.join("app.db");
            log::info!("using app db path: {}", db_path.display());
            setup_pool_from_path(&db_path.display().to_string(), 5)
                .await
                .map_err(|e| e.to_string())
        })
        .await?;

    // Initialize Message Store
    MESSAGE_STORE
        .get_or_try_init(|| async {
            let messages_db_path = app_dbs_dir.join("user_messages.db");
            let store = MessagesStore::from_path(messages_db_path.to_string_lossy().to_string())
                .await
                .map_err(|e| format!("Failed to create messages store: {}", e))?;
            Ok::<Arc<MessagesStore>, String>(Arc::new(store))
        })
        .await?;

    // Initialize Firefly Client
    let client = FIREFLY_CLIENT
        .get_or_try_init(|| async {
            let firefly_db_path = app_dbs_dir.join("firefly.db");
            let callback = GlobalFireflyCallback;

            let client = FfiFireflyWsClient::create(
                Constants::FIREFLY_API_URL.to_string(),
                Constants::FIREFLY_WS_URL.to_string(),
                1000,
                Box::new(callback),
                firefly_db_path.to_string_lossy().to_string(),
                5000,
                Constants::AUTH0_CLIENT_ID.to_string(),
                Constants::AUTH0_DOMAIN.to_string(),
            )
            .await
            .map_err(|e| format!("Failed to create firefly client: {}", e))?;

            Ok::<Arc<FfiFireflyWsClient>, String>(Arc::new(client))
        })
        .await?;

    // Initialize File Server
    FILE_SERVER
        .get_or_try_init(|| async {
            let file_server_token: String = rand::thread_rng()
                .sample_iter(&Alphanumeric)
                .take(32)
                .map(char::from)
                .collect();

            let file_server_dir = app_data_dir.join("files");
            tokio::fs::create_dir_all(&file_server_dir)
                .await
                .map_err(|e| e.to_string())?;

            log::info!("created dir: {:?}", file_server_dir);
            let file_server = FfiFileServer::create(
                file_server_dir.to_string_lossy().to_string(),
                file_server_token,
            );

            let file_server = Arc::new(file_server);
            let server_clone = file_server.clone();
            tokio::spawn(async move {
                let _ = server_clone.start_serving(None).await;
            });

            Ok::<Arc<FfiFileServer>, String>(file_server)
        })
        .await?;

    // Initialize client connection
    let client_clone = client.clone();
    tokio::spawn(async move {
        if matches!(
            client_clone.get_connection_state(),
            ConnectionState::Disconnected
        ) {
            if let Err(err) = client_clone.initialize_with_retrying().await {
                log::error!("retry initing failed: {:?}", err);
            }
        }
    });

    Ok(())
}

pub fn register_state<R: Runtime>(app: &AppHandle<R>) {
    // Register Database
    if let Some(db) = DATABASE.get() {
        app.manage(db.clone());
    }

    // Register Message Store
    if let Some(store) = MESSAGE_STORE.get() {
        app.manage(store.clone());
    }

    // Register Firefly Client
    if let Some(client) = FIREFLY_CLIENT.get() {
        app.manage(client.clone());
    }

    // Register File Server
    if let Some(server) = FILE_SERVER.get() {
        app.manage(server.clone());
    }

    // Spawn event listener
    let mut rx = EVENT_CHANNEL.subscribe();
    let app_handle = app.clone();

    tauri::async_runtime::spawn(async move {
        while let Ok(event) = rx.recv().await {
            match event {
                FireflyEvent::UserMessage(user_message) => {
                    let b_message = user_message_to_b_user_message(&user_message);
                    let _ = app_handle.emit("onUserMessage", &b_message);
                }
                FireflyEvent::GroupMessage(group_message) => {
                    let b_message = group_message_to_b_group_message(&group_message);
                    let _ = app_handle.emit("onGroupMessage", &b_message);
                }
            }
        }
    });
}

struct GlobalFireflyCallback;

#[async_trait::async_trait]
impl FireflyWsClientCallback for GlobalFireflyCallback {
    async fn on_message(&self, message: UserMessage) {
        let _ = EVENT_CHANNEL.send(FireflyEvent::UserMessage(Arc::new(message)));
    }

    async fn on_group_message(&self, message: GroupMessage) {
        let _ = EVENT_CHANNEL.send(FireflyEvent::GroupMessage(Arc::new(message)));
    }
}

fn user_message_to_b_user_message(msg: &UserMessage) -> BUserMessage {
    BUserMessage {
        id: msg.id,
        other: msg.other.clone(),
        sent_by_other: msg.sent_by_other,
        text_b64: general_purpose::STANDARD.encode(&msg.message),
    }
}

fn group_message_to_b_group_message(msg: &GroupMessage) -> BGroupMessage {
    BGroupMessage {
        sender: msg.by.clone(),
        group_id: msg.group_id,
        text_b64: general_purpose::STANDARD.encode(&msg.message),
        id: msg.id,
        channel_id: msg.channel_id,
        epoch: msg.epoch,
    }
}

fn group_info_to_b_group_info(info: &GroupInfo) -> BGroupInfo {
    BGroupInfo {
        name: info.name.clone(),
        group_id: info.id,
        description: info.description.clone(),
    }
}

#[command]
pub async fn encrypt_and_send<R: Runtime>(
    app: AppHandle<R>,
    text_b64: String,
    to: String,
) -> Result<BUserMessage, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let message_bytes = general_purpose::STANDARD
        .decode(&text_b64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let user_message = client
        .encrypt_and_send(to, message_bytes)
        .await
        .map_err(|e| format!("Failed to encrypt and send: {}", e))?;

    let store_state: State<MessageStore> = app.state();
    let store = store_state.inner().clone();

    let b_user_message = user_message_to_b_user_message(&user_message);
    let _ = store.insert_user_message(user_message).await;

    Ok(b_user_message)
}

#[command]
pub async fn get_last_messages<R: Runtime>(
    app: AppHandle<R>,
    other: String,
    limit: u64,
    before: u64,
) -> Result<LastMessagesResponse, String> {
    let store_state: State<MessageStore> = app.state();
    let store = store_state.inner().clone();

    let messages = store
        .get_last_messages_of(&other, before as i64, limit as i64)
        .await
        .map_err(|e| format!("Failed to get messages: {}", e))?;

    let result = messages
        .iter()
        .map(user_message_to_b_user_message)
        .collect();
    Ok(LastMessagesResponse { result })
}

#[command]
pub async fn get_last_messages_from_all_conversations<R: Runtime>(
    app: AppHandle<R>,
) -> Result<AllConversationsResponse, String> {
    let store_state: State<MessageStore> = app.state();
    let store = store_state.inner().clone();

    let conversations = store
        .get_last_message_from_all_conversations()
        .await
        .map_err(|e| format!("Failed to get conversations: {}", e))?;

    let result = conversations
        .iter()
        .map(|conv| ConversationWithCount {
            message: user_message_to_b_user_message(&conv.message),
            count: conv.count,
        })
        .collect();

    Ok(AllConversationsResponse { result })
}

#[command]
pub async fn save_tokens<R: Runtime>(
    app: AppHandle<R>,
    access_token: String,
    refresh_token: String,
) -> Result<(), String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let tokens = TokenResponse {
        access_token,
        refresh_token,
    };

    client
        .set_auth_tokens(tokens)
        .await
        .map_err(|e| format!("Failed to save tokens: {}", e))?;

    Ok(())
}

#[command]
pub async fn mark_as_read_until<R: Runtime>(
    app: AppHandle<R>,
    username: String,
    ts: u64,
) -> Result<(), String> {
    let store_state: State<MessageStore> = app.state();
    let store = store_state.inner().clone();

    store
        .mark_as_read_until(&username, ts as i64)
        .await
        .map_err(|e| format!("Failed to mark as read: {}", e))?;

    let db_state: State<Database> = app.state();
    let pool = db_state.inner().clone();
    if let Ok(notification_store) = NotificationStore::new(pool).await {
        let _ = notification_store
            .delete_until_of_sender(&username, ts as i64)
            .await;
    }

    Ok(())
}

#[command]
pub async fn show_user_notification<R: Runtime>(
    app: AppHandle<R>,
    message: BUserMessage,
) -> Result<(), String> {
    app.notification()
        .builder()
        .title(format!("Message from {}", message.other))
        .body("New message received")
        .show()
        .map_err(|e| format!("Failed to show notification: {}", e))?;

    Ok(())
}

#[command]
pub async fn show_call_notification<R: Runtime>(
    app: AppHandle<R>,
    caller: String,
    _session_id: u32,
    _conversation_id: u32,
) -> Result<(), String> {
    app.notification()
        .builder()
        .title("Incoming Call")
        .body(format!("{} is calling...", caller))
        .show()
        .map_err(|e| format!("Failed to show call notification: {}", e))?;

    Ok(())
}

#[command]
pub async fn clear_notifications<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let handler = app.state::<Arc<NotificationHandler<R>>>();
    handler.clear_all().await?;
    Ok(())
}

#[command]
pub async fn get_file_server_url<R: Runtime>(
    app: AppHandle<R>,
) -> Result<FileServerResponse, String> {
    let server_state: State<FileServer> = app.state();
    let server = server_state.inner().clone();

    Ok(FileServerResponse {
        url: format!("http://localhost:{}", server.port().await),
        token: server.token().await,
    })
}

#[command]
pub async fn request_all_required_permissions<R: Runtime>(
    app: AppHandle<R>,
    _permissions: Vec<String>,
) -> Result<bool, String> {
    app.state::<Arc<NotificationHandler<R>>>()
        .request_all_permissions()
        .await
        .map_err(|e| format!("Failed to request permissions: {}", e))?;

    Ok(true)
}

#[command]
pub async fn handle_message<R: Runtime>(
    _app: AppHandle<R>,
    _message: BUserMessage,
) -> Result<(), String> {
    Ok(())
}

#[command]
pub async fn test_method<R: Runtime>(
    _app: AppHandle<R>,
    data: serde_json::Value,
) -> Result<serde_json::Value, String> {
    let mut result = serde_json::json!({
        "receivedAt": chrono::Utc::now().timestamp_millis()
    });

    if let Some(obj) = data.as_object() {
        for (key, value) in obj {
            result[key] = value.clone();
        }
    }

    Ok(result)
}

#[command]
pub async fn dispose<R: Runtime>(app: AppHandle<R>) -> Result<(), String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();
    client.dispose().await;

    let db_state: State<Database> = app.state();
    let pool = db_state.inner().clone();
    pool.close().await;

    Ok(())
}

#[command]
pub async fn get_last_group_messages<R: Runtime>(
    app: AppHandle<R>,
) -> Result<LastGroupMessagesResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let messages = client
        .group_message_store()
        .get_all_last_messages_ffi()
        .await
        .map_err(|e| format!("Failed to get group messages: {}", e))?;

    let result = messages
        .iter()
        .map(group_message_to_b_group_message)
        .collect();
    Ok(LastGroupMessagesResponse { result })
}

#[command]
pub async fn encrypt_and_send_group_message<R: Runtime>(
    app: AppHandle<R>,
    text_b64: String,
    group_id: u64,
) -> Result<MessageIdResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let message_bytes = general_purpose::STANDARD
        .decode(&text_b64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let message_id = client
        .encrypt_and_send_group(group_id, message_bytes)
        .await
        .map_err(|e| format!("Failed to encrypt and send group message: {}", e))?;

    Ok(MessageIdResponse { message_id })
}

#[command]
pub async fn get_group_extension<R: Runtime>(
    app: AppHandle<R>,
    group_id: u64,
) -> Result<GroupExtensionResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let extension = client
        .get_group_extension(group_id)
        .await
        .map_err(|e| format!("Failed to get group extension: {}", e))?;

    Ok(GroupExtensionResponse {
        result_b64: general_purpose::STANDARD.encode(&extension),
    })
}

#[command]
pub async fn create_group<R: Runtime>(
    app: AppHandle<R>,
    group_name: String,
) -> Result<BGroupInfo, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let group_info = client
        .create_group(group_name, "".into())
        .await
        .map_err(|e| format!("Failed to create group: {}", e))?;

    Ok(group_info_to_b_group_info(&group_info))
}

#[command]
pub async fn get_group_infos<R: Runtime>(app: AppHandle<R>) -> Result<GroupInfosResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let groups = client
        .group_info_store()
        .get_all_ffi()
        .await
        .map_err(|e| format!("Failed to get group infos: {}", e))?;

    let result = groups.iter().map(group_info_to_b_group_info).collect();
    Ok(GroupInfosResponse { result })
}

#[command]
pub async fn get_group_info_and_extension<R: Runtime>(
    app: AppHandle<R>,
    group_id: u64,
) -> Result<GroupInfoAndExtension, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let group_info = client
        .group_info_store()
        .get_ffi(group_id)
        .await
        .map_err(|e| format!("Failed to get group info: {}", e))?;

    let extension = client
        .get_group_extension(group_id)
        .await
        .map_err(|e| format!("Failed to get group extension: {}", e))?;

    Ok(GroupInfoAndExtension {
        name: group_info.name,
        group_id: group_info.id,
        description: group_info.description,
        extension_b64: general_purpose::STANDARD.encode(&extension),
    })
}

#[command]
pub async fn get_group_messages<R: Runtime>(
    app: AppHandle<R>,
    group_id: u64,
    start_before: u64,
    limit: u32,
) -> Result<LastGroupMessagesResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let messages = client
        .group_message_store()
        .get_ffi(group_id, start_before, limit)
        .await
        .map_err(|e| format!("Failed to get group messages: {}", e))?;

    let result = messages
        .iter()
        .map(group_message_to_b_group_message)
        .collect();
    Ok(LastGroupMessagesResponse { result })
}

#[command]
pub async fn update_group_channel<R: Runtime>(
    app: AppHandle<R>,
    group_id: u64,
    id: u32,
    delete: bool,
    name: String,
    channel_ty: u8,
    default_permissions: u32,
) -> Result<MessageIdResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let message_id = client
        .update_group_channel(group_id, id, delete, name, channel_ty, default_permissions)
        .await
        .map_err(|e| format!("Failed to update group channel: {}", e))?;

    Ok(MessageIdResponse { message_id })
}

#[command]
pub async fn delete_group<R: Runtime>(app: AppHandle<R>, group_id: u64) -> Result<(), String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    client
        .delete_group(group_id)
        .await
        .map_err(|e| format!("Failed to delete group: {}", e))?;

    Ok(())
}

#[command]
pub async fn update_group_roles<R: Runtime>(
    app: AppHandle<R>,
    group_id: u64,
    roles: Vec<UpdateRoleProposal>,
) -> Result<MessageIdResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let ffi_roles: Vec<UpdateRoleProposalFfi> = roles
        .into_iter()
        .map(|r| UpdateRoleProposalFfi {
            name: r.name,
            role_id: r.role_id,
            permissions: r.permissions,
            delete: r.delete,
        })
        .collect();

    let message_id = client
        .update_group_roles(group_id, ffi_roles)
        .await
        .map_err(|e| format!("Failed to update group roles: {}", e))?;

    Ok(MessageIdResponse { message_id })
}

#[command]
pub async fn update_group_roles_in_channel<R: Runtime>(
    app: AppHandle<R>,
    group_id: u64,
    channel_id: u32,
    roles: Vec<UpdateRoleProposal>,
) -> Result<MessageIdResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let ffi_roles: Vec<UpdateRoleProposalFfi> = roles
        .into_iter()
        .map(|r| UpdateRoleProposalFfi {
            name: r.name,
            role_id: r.role_id,
            permissions: r.permissions,
            delete: r.delete,
        })
        .collect();

    let message_id = client
        .update_group_roles_in_channel(group_id, channel_id, ffi_roles)
        .await
        .map_err(|e| format!("Failed to update group roles in channel: {}", e))?;

    Ok(MessageIdResponse { message_id })
}

#[command]
pub async fn update_group_users<R: Runtime>(
    app: AppHandle<R>,
    group_id: u64,
    users: Vec<UpdateUserProposal>,
) -> Result<MessageIdResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let ffi_users: Vec<UpdateUserProposalFfi> = users
        .into_iter()
        .map(|u| UpdateUserProposalFfi {
            username: u.username,
            role_id: u.role_id,
        })
        .collect();

    let message_id = client
        .update_group_users(group_id, ffi_users)
        .await
        .map_err(|e| format!("Failed to update group users: {}", e))?;

    Ok(MessageIdResponse { message_id })
}

#[command]
pub async fn get_conversations<R: Runtime>(
    app: AppHandle<R>,
    token: String,
) -> Result<ConversationsResponse, String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    let conversations = client
        .get_conversations(token)
        .await
        .map_err(|e| format!("Failed to get conversations: {}", e))?;

    let result = conversations
        .into_iter()
        .map(|c| Conversation {
            other: c.other,
            settings: c.settings,
        })
        .collect();

    Ok(ConversationsResponse { result })
}

#[command]
pub async fn add_group_member<R: Runtime>(
    app: AppHandle<R>,
    group_id: u64,
    username: String,
    role_id: u32,
) -> Result<(), String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    client
        .add_group_member(group_id, username, role_id)
        .await
        .map_err(|e| format!("Failed to add group member: {}", e))?;

    Ok(())
}

#[command]
pub async fn kick_group_member<R: Runtime>(
    app: AppHandle<R>,
    group_id: u64,
    username: String,
) -> Result<(), String> {
    let client_state: State<FireflyClient> = app.state();
    let client = client_state.inner().clone();

    client
        .kick_group_member(group_id, username)
        .await
        .map_err(|e| format!("Failed to kick group member: {}", e))?;

    Ok(())
}

#[cfg(target_os = "android")]
#[no_mangle]
pub extern "C" fn Java_com_lupyd_client_EncryptionPlugin_initializeFireflyClient(
    mut env: JNIEnv,
    _class: JClass,
    app_data_dir: JString,
) {
    let app_data_dir: String = env
        .get_string(&app_data_dir)
        .expect("Couldn't get java string!")
        .into();

    tauri::async_runtime::spawn(async move {
        if let Err(e) = initialize_firefly_client(app_data_dir).await {
            log::error!("Failed to initialize firefly client from Kotlin: {}", e);
        }
    });
}
