use tauri::{plugin::Builder, Emitter, Manager, WindowEvent};
use tauri_plugin_deep_link::DeepLinkExt;

mod encryption_plugin;
mod notification;

#[cfg(desktop)]
use tauri_plugin_single_instance;

// pub const IS_DESKTOP: bool = cfg!(any(
//     target_os = "linux",
//     target_os = "windows",
//     target_os = "macos"
// ));

pub const IS_DESKTOP: bool = cfg!(desktop);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        // .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            encryption_plugin::encrypt_and_send,
            encryption_plugin::get_last_messages,
            encryption_plugin::get_last_messages_from_all_conversations,
            encryption_plugin::save_tokens,
            encryption_plugin::mark_as_read_until,
            encryption_plugin::show_user_notification,
            encryption_plugin::show_call_notification,
            encryption_plugin::delete_group,
            encryption_plugin::request_all_required_permissions,
            encryption_plugin::handle_message,
            encryption_plugin::get_file_server_url,
            encryption_plugin::get_last_group_messages,
            encryption_plugin::encrypt_and_send_group_message,
            encryption_plugin::get_group_extension,
            encryption_plugin::create_group,
            encryption_plugin::get_group_infos,
            encryption_plugin::get_group_info_and_extension,
            encryption_plugin::get_group_messages,
            encryption_plugin::update_group_channel,
            encryption_plugin::update_group_roles,
            encryption_plugin::update_group_roles_in_channel,
            encryption_plugin::update_group_users,
            encryption_plugin::get_conversations,
            encryption_plugin::dispose,
            encryption_plugin::add_group_member,
            encryption_plugin::kick_group_member,
            encryption_plugin::clear_notifications,
            encryption_plugin::test_method,
        ]);

    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, args, _cwd| {
            log::info!("Single Instance Args: {:?}", args);
            // Check for deep link in args
            if let Some(url) = args.iter().find(|arg| arg.starts_with("lupyd://")) {
                log::info!("Deep link received in single-instance: {}", url);
                // Emit deep link event to frontend
                if let Err(err) = app.emit("appUrlOpen", url) {
                    log::error!("deep link emit failed: {:?}", err);
                }
            }

            if let Some(w) = app.get_webview_window("main") {
                let _ = w.show();
                let _ = w.set_focus();
            }
        }));
    }

    #[cfg(target_os = "android")]
    {
        builder = builder.plugin(notification::init_plugin());
    }

    builder = builder.setup(|app| {
        if cfg!(debug_assertions) {
            app.handle().plugin(
                tauri_plugin_log::Builder::default()
                    .level(log::LevelFilter::Info)
                    .build(),
            )?;
        }

        // Initialize firefly client and file server
        let app_handle = app.handle().clone();
        tauri::async_runtime::spawn(async move {
            let app_data_dir = app_handle
                .path()
                .app_data_dir()
                .expect("failed to get app data dir");
            if let Err(e) = encryption_plugin::initialize_firefly_client(
                app_data_dir
                    .canonicalize()
                    .unwrap()
                    .to_string_lossy()
                    .to_string(),
            )
            .await
            {
                log::error!("Failed to initialize firefly client: {}", e);
            } else {
                log::info!("Firefly client initialized successfully");
                encryption_plugin::register_state(&app_handle);
            }
        });

        #[cfg(desktop)]
        {
            use tauri::menu::{Menu, MenuItem};
            use tauri::tray::{TrayIconBuilder, TrayIconEvent};
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i]).unwrap();

            let _tray = TrayIconBuilder::with_id("main")
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => {
                        // Cleanup before exit
                        tauri::async_runtime::block_on(async {
                            let _ = encryption_plugin::dispose(app.clone()).await;
                        });
                        app.exit(0);
                    }
                    _ => {}
                })
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();

                        #[cfg(not(target_os = "macos"))]
                        {
                            if let Some(webview_window) = app.get_webview_window("main") {
                                let _ = webview_window.show();
                                let _ = webview_window.set_focus();
                            }
                        }

                        #[cfg(target_os = "macos")]
                        {
                            let _ = tauri::AppHandle::show(&app.app_handle());
                        }
                    }
                })
                .build(app)?;
        }

        #[cfg(desktop)]
        {
            app.deep_link().register_all()?;
            app.deep_link().register("lupyd")?;
            log::info!("Deep link scheme registered: lupyd");
        }

        log::info!("Lupyd Desktop initialized successfully");

        Ok(())
    });

    #[cfg(desktop)]
    {
        builder = builder.on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                // Hide to tray instead of closing
                api.prevent_close();
                let _ = window.hide();
            }
        });
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_env_vars() {
        let api_url = env!("NEXT_PUBLIC_JS_ENV_CHAT_API_URL");
        assert!(
            !api_url.is_empty(),
            "NEXT_PUBLIC_JS_ENV_CHAT_API_URL should not be empty"
        );
        println!("NEXT_PUBLIC_JS_ENV_CHAT_API_URL: {}", api_url);
    }
}
