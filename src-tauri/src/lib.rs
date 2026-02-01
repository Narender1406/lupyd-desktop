use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri::{Manager, WindowEvent};
use tauri_plugin_deep_link::DeepLinkExt;

mod encryption_plugin;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .invoke_handler(tauri::generate_handler![
            encryption_plugin::encrypt_and_send,
            encryption_plugin::get_last_messages,
            encryption_plugin::get_last_messages_from_all_conversations,
            encryption_plugin::save_tokens,
            encryption_plugin::mark_as_read_until,
            encryption_plugin::show_user_notification,
            encryption_plugin::show_call_notification,
            encryption_plugin::request_all_permissions,
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
        ])
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(w) = app.get_webview_window("main") {
                w.show().unwrap();
                w.set_focus().unwrap();
            }
        }))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&quit_i]).unwrap();

            let _tray = TrayIconBuilder::with_id("main")
                .menu(&menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id().as_ref() {
                    "quit" => {
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
                            tauri::AppHandle::show(&app.app_handle()).unwrap();
                        }
                    }
                })
                .build(app)?;

            let start_urls = app.deep_link().get_current()?;
            if let Some(urls) = start_urls {
                // app was likely started by a deep link
                println!("start_urls deep link URLs: {:?}", urls);
            }

            app.deep_link().on_open_url(|event| {
                println!("on_open_url deep link URLs: {:?}", event.urls());
            });
            app.deep_link().register_all()?;
            app.deep_link().register("lupyd")?;

            println!("deep link scheme registered: lupyd");

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                window.hide().unwrap()
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
