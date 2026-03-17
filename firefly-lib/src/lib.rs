use log::LevelFilter;

use crate::{error::DumbError, logger::TeeLogger, pb::firefly::firefly};

pub mod db;
pub mod error;
pub mod group;
pub mod logger;
pub mod pb;
pub mod schema;
pub mod utils;
pub mod websocket;

#[derive( Debug)]
pub struct EncryptedMessage {
    pub cipher_text: Vec<u8>,
    pub ty: u8,
}

#[derive( Clone)]
pub struct FfiPreKeyBundle {
    registration_id: u32,
    device_id: u8,
    pre_key_id: u32,
    pre_key: Vec<u8>,
    signed_pre_key_id: u32,
    signed_pre_key_public: Vec<u8>,
    signed_pre_key_signature: Vec<u8>,
    kyber_pre_key_id: u32,
    kyber_pre_key_public: Vec<u8>,
    kyber_pre_key_signature: Vec<u8>,
    identity_key: Vec<u8>,
}

impl From<firefly::PreKeyBundle> for FfiPreKeyBundle {
    fn from(bundle: firefly::PreKeyBundle) -> Self {
        Self {
            registration_id: bundle.registration_id as u32,
            device_id: bundle.device_id as u8,
            pre_key_id: bundle.pre_key_id as u32,
            pre_key: bundle.pre_public_key,
            signed_pre_key_id: bundle.signed_pre_key_id as u32,
            signed_pre_key_public: bundle.signed_pre_public_key,
            signed_pre_key_signature: bundle.signed_pre_key_signature,
            kyber_pre_key_id: bundle.kem_pre_key_id as u32,
            kyber_pre_key_public: bundle.kem_pre_public_key,
            kyber_pre_key_signature: bundle.kem_pre_key_signature,
            identity_key: bundle.identity_public_key,
        }
    }
}

impl Into<firefly::PreKeyBundle> for FfiPreKeyBundle {
    fn into(self) -> firefly::PreKeyBundle {
        firefly::PreKeyBundle {
            registration_id: self.registration_id,
            device_id: self.device_id as u32,
            pre_key_id: self.pre_key_id,
            pre_public_key: self.pre_key,
            signed_pre_key_id: self.signed_pre_key_id,
            signed_pre_public_key: self.signed_pre_key_public,
            signed_pre_key_signature: self.signed_pre_key_signature,
            kem_pre_key_id: self.kyber_pre_key_id,
            kem_pre_public_key: self.kyber_pre_key_public,
            kem_pre_key_signature: self.kyber_pre_key_signature,
            identity_public_key: self.identity_key,
        }
    }
}

static INIT_LOGGING: std::sync::Once = std::sync::Once::new();

pub fn init_logger(file_path: String) {
    INIT_LOGGING.call_once(|| {
        init_logging(&file_path);

        set_panic_handler();
    });
}

fn init_logging(file_path: &str) {
    let level = LevelFilter::Info;
    let tee_logger = TeeLogger::new(file_path, level).expect("can't initaite tee logger");

    log::set_boxed_logger(Box::new(tee_logger)).expect("set logger failed");
    log::set_max_level(level);
}

fn set_panic_handler() {
    std::panic::set_hook(Box::new(|panic_info| {
        let backtrace = std::backtrace::Backtrace::force_capture();
        let message = match panic_info.payload().downcast_ref::<&str>() {
            Some(s) => *s,
            None => match panic_info.payload().downcast_ref::<String>() {
                Some(s) => &s[..],
                None => "Box<Any>",
            },
        };
        let thread = std::thread::current();
        let thread = thread.name().unwrap_or("<unnamed>");
        let msg = format!(
            "thread '{}' panicked at '{}', {}\n{}",
            thread,
            message,
            panic_info.location().unwrap(),
            backtrace
        );
        log::error!("{}", msg);
        std::process::abort();
    }));
}

pub struct FfiFileServer {
    server: tokio::sync::Mutex<shfs::FileServer>,
}

impl FfiFileServer {
    pub fn create(base_path: String, token: String) -> Self {
        let server = tokio::sync::Mutex::new(shfs::FileServer::new(base_path, token));

        Self { server }
    }

    pub async fn start_serving(&self, port: Option<u16>) -> Result<u16, DumbError> {
        self.server
            .lock()
            .await
            .serve(port)
            .await
            .map_err(|e| DumbError::new(e.to_string()))
    }

    pub async fn token(&self) -> String {
        self.server.lock().await.token().to_string()
    }

    pub async fn port(&self) -> String {
        self.server.lock().await.port().to_string()
    }
}
