use std::fs;
use std::path::PathBuf;
use tauri::Manager;

pub mod commands;
use commands::AppState;
use kairo_core::{Database, Launcher};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .unwrap_or_else(|_| PathBuf::from("./kairo_data"));

            if !app_data_dir.exists() {
                let _ = fs::create_dir_all(&app_data_dir);
            }

            let db_path = app_data_dir.join("kairo.db");
            let db = Database::open(&db_path).expect("Impossible d'initialiser la base SQLite KaïroOS");
            let launcher = Launcher::new(db.clone());

            // Appliquer le mode plein écran et always on top au démarrage selon les paramètres sauvegardés
            if let Ok(settings) = db.get_app_settings() {
                if let Some(main_window) = app.get_webview_window("main") {
                    let _ = main_window.set_fullscreen(settings.fullscreen);
                    let _ = main_window.set_always_on_top(settings.always_on_top);
                }
            }

            app.manage(AppState { db, launcher });

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
        ])
        .run(tauri::generate_context!())
        .expect("Erreur lors de l'exécution de KaïroOS");
}
