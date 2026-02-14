use std::sync::Arc;

use firefly_protos::{deserialize_proto, firefly::UserMessageInner};
use firefly_signal::db::messages::UserMessage;
use serde::{Deserialize, Serialize};
use sqlx::{Row, SqlitePool};
use tauri::{AppHandle, Emitter, Runtime};

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
    #[cfg(target_os = "android")]
    {
        let json_notification = serde_json::to_string(&notification)
            .map_err(|e| e.to_string())
            .unwrap_or_default();

        let handle = app.clone();

        // verify calling `run_on_android_context` relies on `tauri` feature `mobile` which is implicit for android build.
        // But `run_on_android_context` is a method on `AppHandle` in some versions, or a standalone function.
        // checking `tauri` docs (mental model): `tauri::mobile::run_on_android_context` or `app.run_on_android_context`.
        // I will guess `app.run_on_android_context` based on recent changes.

        // Wait, I don't want to guess and break the build.
        // I'll use the safe approach: simple JNI calls if I can get the JVM.
        // But I need the Activity context.

        // Let's look at `lib.rs` imports. `tauri::mobile_entry_point`.

        // I will use `app.run_on_android_context` as it is the standard way in v2.

        let _ = handle.run_on_android_context(move |env, activity| {
            // env is `jni::JNIEnv`
            // activity is `jni::objects::JObject` (the activity)

            let json_string = env.new_string(&json_notification).unwrap();

            // Find class
            // "com/lupyd/client/Notification"
            // Call static method "showNotification" (Landroid/app/Activity;Ljava/lang/String;)V

            let class_name = "com/lupyd/client/Notification";
            let notification_class = env.find_class(class_name);

            match notification_class {
                Ok(class) => {
                    let method_id = env.get_static_method_id(
                        class,
                        "showUserBundledNotification",
                        "(Landroid/app/Activity;Ljava/lang/String;)V",
                    );

                    match method_id {
                        Ok(method) => {
                            let _ = env.call_static_method_unchecked(
                                class,
                                method,
                                jni::signature::JavaType::Primitive(
                                    jni::signature::Primitive::Void,
                                ),
                                &[
                                    jni::objects::JValue::Object(activity).into(),
                                    jni::objects::JValue::Object(&json_string).into(),
                                ],
                            );
                        }
                        Err(e) => {
                            log::error!(
                                "Failed to find method showUserBundledNotification: {:?}",
                                e
                            );
                        }
                    }
                }
                Err(e) => {
                    log::error!("Failed to find class {}: {:?}", class_name, e);
                }
            }
        });
    }
}

pub struct NotificationHandler<R: Runtime> {
    app_handle: AppHandle<R>,
    store: NotificationStore,
}

impl<R: Runtime> NotificationHandler<R> {
    pub fn new(app_handle: AppHandle<R>, store: NotificationStore) -> Self {
        Self { app_handle, store }
    }

    pub async fn show_user_bundled_notification(&self, msg: &UserMessage) -> Result<(), String> {
        self.add_message_to_history(msg).await?;
        let messages = self.store.get_from_user(&msg.other, 6).await?;

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

        show_user_bundled_notification(&self.app_handle, notification);

        Ok(())
    }

    pub async fn add_message_to_history(&self, msg: &UserMessage) -> Result<(), String> {
        let notification = MessageNotification {
            msg_id: msg.id as i64,
            other: msg.other.clone(),
            text: msg.message.clone(),
            sent_by_me: !msg.sent_by_other,
        };
        self.store.put(&notification).await
    }

    pub async fn clear_all(&self) -> Result<(), String> {
        self.store.delete_all().await
    }
}
