use libsignal_protocol::ProtocolAddress;
use sqlx::SqlitePool;
use std::sync::{Arc, Mutex};

use crate::{
    EncryptedMessage, FfiPreKeyBundle,
    db::stores::KeyStores,
    error::DumbError,
};

pub enum Command {
    Exit,
    Decrypt {
        other: ProtocolAddress,
        cipher_text: Vec<u8>,
        ty: u8,
        reply: tokio::sync::oneshot::Sender<Result<Vec<u8>, DumbError>>,
    },
    Encrypt {
        other: ProtocolAddress,
        plain_text: Vec<u8>,
        reply: tokio::sync::oneshot::Sender<Result<EncryptedMessage, DumbError>>,
    },
    ProcessPreKeyBundle {
        other: String,
        pre_key_bundle: FfiPreKeyBundle,
        reply: tokio::sync::oneshot::Sender<Result<(), DumbError>>,
    },
    GeneratePreKeyBundle {
        reply: tokio::sync::oneshot::Sender<Result<FfiPreKeyBundle, DumbError>>,
    },
}

pub struct FfiKeyStores {
    sender: std::sync::mpsc::Sender<Command>,
    #[allow(unused)]
    handler: std::thread::JoinHandle<()>,
    // Shared with the background thread — single source of truth for all state
    stores: Arc<Mutex<KeyStores>>,
}

impl Drop for FfiKeyStores {
    fn drop(&mut self) {
        if self.sender.send(Command::Exit).is_err() {
            log::error!("Error sending exit command");
        }
    }
}

impl FfiKeyStores {
    // Returns a clone of KeyStores for field access (address_store, identity_store etc).
    // All sub-stores hold SqlitePool which is Arc-backed and cheap to clone.
    // State is always consistent because all writes go through the same SqlitePool.
    pub fn store(&self) -> KeyStores {
        self.stores.lock().expect("KeyStores mutex poisoned").clone()
    }
}

impl FfiKeyStores {
    pub async fn new(pool: SqlitePool) -> anyhow::Result<Self> {
        let stores = Arc::new(Mutex::new(KeyStores::new(pool).await?));

        let (sender, receiver) = std::sync::mpsc::channel::<Command>();
        let stores_clone = stores.clone();

        let handler = std::thread::spawn(move || {
            let rt = tokio::runtime::Runtime::new().unwrap();
            rt.block_on(async move {
                while let Ok(cmd) = receiver.recv() {
                    match cmd {
                        Command::Decrypt { other, cipher_text, ty, reply } => {
                            let result = stores_clone
                                .lock()
                                .expect("poisoned")
                                .decrypt(other, cipher_text, ty)
                                .await
                                .map_err(DumbError::from_anyhow);
                            if let Err(err) = reply.send(result) {
                                log::error!("Error sending decrypt reply: {:?}", err);
                            }
                        }
                        Command::Encrypt { other, plain_text, reply } => {
                            let result = stores_clone
                                .lock()
                                .expect("poisoned")
                                .encrypt(other, plain_text)
                                .await
                                .map_err(DumbError::from_anyhow);
                            if let Err(err) = reply.send(result) {
                                log::error!("Error sending encrypt reply: {:?}", err);
                            }
                        }
                        Command::ProcessPreKeyBundle { other, pre_key_bundle, reply } => {
                            let result = stores_clone
                                .lock()
                                .expect("poisoned")
                                .process_pre_key_bundle(other, pre_key_bundle)
                                .await
                                .map_err(DumbError::from_anyhow);
                            if let Err(err) = reply.send(result) {
                                log::error!("Error sending process_pre_key_bundle reply: {:?}", err);
                            }
                        }
                        Command::GeneratePreKeyBundle { reply } => {
                            let result = stores_clone
                                .lock()
                                .expect("poisoned")
                                .generate_prekey_bundle()
                                .await
                                .map_err(DumbError::from_anyhow);
                            if let Err(_) = reply.send(result) {
                                log::error!("Error sending generate_prekey_bundle reply");
                            }
                        }
                        Command::Exit => break,
                    }
                }
            });
        });

        Ok(Self { sender, handler, stores })
    }
}

impl FfiKeyStores {
    pub async fn decrypt(
        &self,
        other: ProtocolAddress,
        cipher_text: Vec<u8>,
        ty: u8,
    ) -> Result<Vec<u8>, DumbError> {
        let (reply, receiver) = tokio::sync::oneshot::channel();
        self.sender.send(Command::Decrypt { other, cipher_text, ty, reply })?;
        receiver.await?
    }

    pub async fn encrypt(
        &self,
        other: ProtocolAddress,
        plain_text: Vec<u8>,
    ) -> Result<EncryptedMessage, DumbError> {
        let (reply, receiver) = tokio::sync::oneshot::channel();
        self.sender.send(Command::Encrypt { other, plain_text, reply })?;
        receiver.await?
    }

    pub async fn process_pre_key_bundle(
        &self,
        other: String,
        pre_key_bundle: FfiPreKeyBundle,
    ) -> Result<(), DumbError> {
        let (reply, receiver) = tokio::sync::oneshot::channel();
        self.sender.send(Command::ProcessPreKeyBundle { other, pre_key_bundle, reply })?;
        receiver.await?
    }

    pub async fn generate_prekey_bundle(&self) -> Result<FfiPreKeyBundle, DumbError> {
        let (reply, receiver) = tokio::sync::oneshot::channel();
        self.sender.send(Command::GeneratePreKeyBundle { reply })?;
        receiver.await?
    }
}

#[cfg(test)]
mod tests {
    use crate::db::setup_pool;
    use super::*;
    use libsignal_protocol::{DeviceId, ProtocolAddress};

    const DB_URI: &str = ":memory:";

    async fn test_ffi_encryption(
        user1: &FfiKeyStores,
        user1_name: &str,
        user2: &FfiKeyStores,
        user2_name: &str,
        user2_pre_key_bundle: FfiPreKeyBundle,
    ) -> Result<(), DumbError> {
        let bob_device_id = user2.store().identity_store.get_full_identity_key_pair().await.unwrap().device_id;
        let alice_device_id = user1.store().identity_store.get_full_identity_key_pair().await.unwrap().device_id;

        let bob_address = ProtocolAddress::new(user2_name.to_string(), DeviceId::new(bob_device_id).unwrap());
        let alice_address = ProtocolAddress::new(user1_name.to_string(), DeviceId::new(alice_device_id).unwrap());

        user1.process_pre_key_bundle(user2_name.to_string(), user2_pre_key_bundle).await?;

        let msg1 = user1.encrypt(bob_address.clone(), b"Hello Bob".to_vec()).await?;
        let decrypted1 = user2.decrypt(alice_address.clone(), msg1.cipher_text, msg1.ty).await?;
        assert_eq!(decrypted1, b"Hello Bob");

        let msg2 = user2.encrypt(alice_address.clone(), b"Hi Alice".to_vec()).await?;
        let decrypted2 = user1.decrypt(bob_address.clone(), msg2.cipher_text, msg2.ty).await?;
        assert_eq!(decrypted2, b"Hi Alice");

        let msg3 = user1.encrypt(bob_address.clone(), b"How are you?".to_vec()).await?;
        let decrypted3 = user2.decrypt(alice_address.clone(), msg3.cipher_text, msg3.ty).await?;
        assert_eq!(decrypted3, b"How are you?");

        Ok(())
    }

    #[tokio::test]
    async fn test_ffi_alice_bob_encryption() {
        let alice_pool = setup_pool(DB_URI, 1).await.unwrap();
        let bob_pool = setup_pool(DB_URI, 1).await.unwrap();
        let charles_pool = setup_pool(DB_URI, 1).await.unwrap();

        let alice = FfiKeyStores::new(alice_pool).await.unwrap();
        let bob = FfiKeyStores::new(bob_pool).await.unwrap();
        let charles = FfiKeyStores::new(charles_pool).await.unwrap();

        let bob_bundle = bob.generate_prekey_bundle().await.unwrap();
        let bob_bundle2 = bob.generate_prekey_bundle().await.unwrap();

        test_ffi_encryption(&charles, "charles", &bob, "bob", bob_bundle).await.unwrap();
        test_ffi_encryption(&alice, "alice", &bob, "bob", bob_bundle2).await.unwrap();
    }
}
