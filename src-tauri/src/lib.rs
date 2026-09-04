use std::fs;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};
use tauri::Manager;

pub mod commands;
use commands::AppState;
use kairo_core::{start_remote_server, Database, Launcher};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            // Détection du mode CLI (--mode kiosk / --mode admin / --kiosk)
            let args: Vec<String> = std::env::args().collect();
            let mut cli_mode: Option<String> = None;

            for i in 0..args.len() {
                if args[i] == "--mode" && i + 1 < args.len() {
                    cli_mode = Some(args[i + 1].to_lowercase());
                } else if args[i] == "--kiosk" {
                    cli_mode = Some("kiosk".to_string());
                } else if args[i] == "--admin" {
                    cli_mode = Some("admin".to_string());
                }
            }

            // Détection du mode Portable : si ./kairo_data ou ./roms existe directement à côté de l'exécutable
            let exe_dir = std::env::current_exe()
                .ok()
                .and_then(|p| p.parent().map(|p| p.to_path_buf()))
                .unwrap_or_else(|| PathBuf::from("."));

            let is_portable = exe_dir.join("roms").exists()
                || exe_dir.join("kairo_data").exists();

            let app_data_dir = if is_portable {
                let p_dir = exe_dir.join("kairo_data");
                let _ = fs::create_dir_all(&p_dir);
                p_dir
            } else {
                let default_dir = app
                    .path()
                    .app_data_dir()
                    .unwrap_or_else(|_| PathBuf::from("./kairo_data"));
                let _ = fs::create_dir_all(&default_dir);
                default_dir
            };

            let db_path = app_data_dir.join("kairo.db");
            let db = Database::open(&db_path).expect("Impossible d'initialiser la base SQLite KaïroOS");
            let launcher = Launcher::new(db.clone());

            let settings = db.get_app_settings().unwrap_or_default();
            let initial_mode = match cli_mode {
                Some(m) => m,
                None => {
                    if settings.kiosk_mode {
                        "kiosk".to_string()
                    } else {
                        "admin".to_string()
                    }
                }
            };

            let app_mode = Arc::new(RwLock::new(initial_mode));

            // Démarrer automatiquement le serveur distant Axum en arrière-plan
            start_remote_server(db.clone(), launcher.clone());

            // Appliquer le mode plein écran et always on top au démarrage selon les paramètres sauvegardés
            if let Some(main_window) = app.get_webview_window("main") {
                let _ = main_window.set_fullscreen(settings.fullscreen);
                let _ = main_window.set_always_on_top(settings.always_on_top);
            }

            app.manage(AppState {
                db,
                launcher,
                app_mode,
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_app_settings,
            commands::save_app_settings,
            commands::set_fullscreen,
            commands::set_always_on_top,
            commands::toggle_fullscreen,
            commands::get_systems,
            commands::get_system_by_id,
            commands::get_emulators,
            commands::update_emulator_path,
            commands::get_games_by_system,
            commands::get_all_games,
            commands::get_favorite_games,
            commands::get_recent_games,
            commands::get_game_details,
            commands::toggle_favorite,
            commands::update_game_config,
            commands::scan_roms_directory,
            commands::organize_game_into_franchise,
            commands::save_local_game_metadata,
            commands::launch_game,
            commands::get_launcher_status,
            commands::kill_running_game,
            commands::get_gamepad_mappings,
            commands::save_gamepad_mappings,
            commands::get_app_mode,
            commands::set_app_mode,
            commands::get_remote_config,
            commands::save_remote_config,
            commands::add_manual_game,
            commands::delete_game,
            commands::purge_missing_games,
            commands::get_themes,
            commands::get_theme,
            commands::set_theme,
            commands::save_theme,
            commands::open_themes_folder,
            commands::open_logs_folder,
            commands::test_emulator_exe,
            commands::export_config,
            commands::import_config,
            commands::reset_settings,
            commands::download_community_theme,
        ])
        .run(tauri::generate_context!())

        .expect("Erreur lors de l'exécution de KaïroOS");
}
