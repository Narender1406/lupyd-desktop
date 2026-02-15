use std::sync::Arc;

use firefly_protos::{deserialize_proto, firefly::UserMessageInner};
use firefly_signal::db::messages::UserMessage;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
#[cfg(target_os = "android")]
use tauri::plugin::TauriPlugin;
use tauri::{
    plugin::{PluginApi, PluginHandle},
    AppHandle, Emitter, Manager, Runtime,
};

use crate::encryption_plugin::DATABASE;

#[derive(Debug, Clone)]
pub struct MessageNotification {
    msg_id: i64,
    other: String,
    text: Vec<u8>,
    sent_by_me: bool,
}
pub struct NotificationStore {
    pool: SqlitePool,
}

impl NotificationStore {
    pub async fn new(pool: SqlitePool) -> Result<Self, String> {
        let store = Self { pool };
        store.init_tables().await?;
        Ok(store)
    }

    async fn init_tables(&self) -> Result<(), String> {
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS user_message_notifications (
                msg_id INTEGER NOT NULL,
                other TEXT NOT NULL,
                text BLOB NOT NULL,
                sent_by_me BOOLEAN NOT NULL,
                PRIMARY KEY (other, msg_id)
            )",
        )
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub async fn get_from_user(
        &self,
        user: &str,
        limit: i32,
    ) -> Result<Vec<MessageNotification>, String> {
        let rows = sqlx::query(
            "SELECT msg_id, other, text, sent_by_me FROM user_message_notifications WHERE other = ? ORDER BY msg_id LIMIT ?"
        )
        .bind(user)
        .bind(limit)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| e.to_string())?;

        let notifications = rows
            .into_iter()
            .map(|row| MessageNotification {
                msg_id: row.get("msg_id"),
                other: row.get("other"),
                text: row.get("text"),
                sent_by_me: row.get("sent_by_me"),
            })
            .collect();

        Ok(notifications)
    }

    pub async fn put(&self, notification: &MessageNotification) -> Result<(), String> {
        sqlx::query(
            "INSERT OR REPLACE INTO user_message_notifications (msg_id, other, text, sent_by_me) VALUES (?, ?, ?, ?)"
        )
        .bind(notification.msg_id)
        .bind(&notification.other)
        .bind(&notification.text)
        .bind(notification.sent_by_me)
        .execute(&self.pool)
        .await
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub async fn delete_all(&self) -> Result<(), String> {
        sqlx::query("DELETE FROM user_message_notifications")
            .execute(&self.pool)
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub async fn delete_until_of_sender(
        &self,
        sender: &str,
        message_id: i64,
    ) -> Result<(), String> {
        sqlx::query("DELETE FROM user_message_notifications WHERE other = ? AND msg_id <= ?")
            .bind(sender)
            .bind(message_id)
            .execute(&self.pool)
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}

pub type ShowNotificationCallback = Arc<dyn FnOnce(String, String) -> Result<(), String>>;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct NotificationData {
    msg_id: i64,
    other: String,
    text: String,
    sent_by_me: bool,
}

#[derive(Serialize, Deserialize, Clone)]
struct UserBundledNotification {
    other: String,
    messages: Vec<NotificationData>,
}

fn show_user_bundled_notification<R: Runtime>(
    app: &AppHandle<R>,
    notification: UserBundledNotification,
) {
    if let Err(err) = app.emit(
        "plugin:NotificationHandler|showUserBundledNotification",
        notification,
    ) {
        log::error!("failed to invoke showUserBundledNotification {:?}", err);
    }
}

#[cfg(target_os = "android")]
pub fn init<R: Runtime, C: DeserializeOwned>(
    app: &AppHandle<R>,
    api: PluginApi<R, C>,
) -> Result<(), String> {
    const PLUGIN_IDENTIFIER: &str = "com.lupyd.client";

    let handle = api
        .register_android_plugin(PLUGIN_IDENTIFIER, "NotificationHandlerPlugin")
        .map_err(|e| e.to_string())?;
    // #[cfg(target_os = "ios")]
    // let handle = api.register_ios_plugin(init_plugin_notification)?;
    let handler = (NotificationHandler {
        plugin_handle: handle,
    });

    app.manage(handler);

    Ok(())
}

#[cfg(target_os = "android")]
pub fn init_plugin<R: Runtime>() -> TauriPlugin<R> {
    use tauri::plugin::Builder;

    Builder::new("notification_handler")
        .setup(|app, api| {
            init(app, api)?;
            Ok(())
        })
        .build()
}

pub struct NotificationHandler<R: Runtime> {
    plugin_handle: PluginHandle<R>,
}

impl<R: Runtime> NotificationHandler<R> {
    pub fn new(plugin_handle: PluginHandle<R>) -> Self {
        Self { plugin_handle }
    }

    pub async fn show_user_bundled_notification(&self, msg: &UserMessage) -> Result<(), String> {
        self.add_message_to_history(msg).await?;

        let store = NotificationStore::new(DATABASE.get().unwrap().clone()).await?;

        let messages = store.get_from_user(&msg.other, 6).await?;

        let mut notification = UserBundledNotification {
            other: msg.other.clone(),
            messages: Vec::new(),
        };

        for message in messages {
            let inner: UserMessageInner =
                deserialize_proto(&message.text).map_err(|e| e.to_string())?;

            let text = match inner.message {
                firefly_protos::firefly::mod_UserMessageInner::OneOfmessage::plainText(cow) => {
                    String::from_utf8(cow.to_vec()).map_err(|e| e.to_string())?
                }
                firefly_protos::firefly::mod_UserMessageInner::OneOfmessage::callMessage(
                    _call_message,
                ) => "call message".to_string(),
                firefly_protos::firefly::mod_UserMessageInner::OneOfmessage::messagePayload(
                    message_payload,
                ) => message_payload.text.to_string(),
                _ => {
                    continue;
                }
            };

            notification.messages.push(NotificationData {
                msg_id: message.msg_id,
                other: message.other,
                text,
                sent_by_me: message.sent_by_me,
            });
        }

        #[cfg(target_os = "android")]
        self.plugin_handle
            .run_mobile_plugin::<()>("showUserBundledNotification", notification)
            .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub async fn add_message_to_history(&self, msg: &UserMessage) -> Result<(), String> {
        let notification = MessageNotification {
            msg_id: msg.id as i64,
            other: msg.other.clone(),
            text: msg.message.clone(),
            sent_by_me: !msg.sent_by_other,
        };
        let store = NotificationStore::new(DATABASE.get().unwrap().clone()).await?;
        store.put(&notification).await
    }

    pub async fn clear_all(&self) -> Result<(), String> {
        let store = NotificationStore::new(DATABASE.get().unwrap().clone()).await?;
        store.delete_all().await
    }

    pub async fn request_all_permissions(&self) -> Result<(), String> {
        #[cfg(target_os = "android")]
        self.plugin_handle
            .run_mobile_plugin::<()>("requestAllPermissions", vec!["POST_NOTIFICATIONS"])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
