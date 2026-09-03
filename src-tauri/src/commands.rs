use std::fs;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};
use kairo_core::{
    AppSettings, Database, Emulator, Game, GameConfig, Launcher, LaunchStatus,
    LocalGameMetadata, RemoteConfig, RomScanner, ScanStats, System,
};
use tauri::{State, Window};

pub struct AppState {
    pub db: Database,
    pub launcher: Launcher,
    pub app_mode: Arc<RwLock<String>>,
}

#[tauri::command]
pub fn get_app_settings(state: State<'_, AppState>) -> Result<AppSettings, String> {
    state.db.get_app_settings().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_app_settings(
    settings: AppSettings,
    window: Window,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let _ = window.set_fullscreen(settings.fullscreen);
    let _ = window.set_always_on_top(settings.always_on_top);
    state.db.save_app_settings(&settings).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_fullscreen(fullscreen: bool, window: Window) -> Result<(), String> {
    window.set_fullscreen(fullscreen).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_always_on_top(always_on_top: bool, window: Window) -> Result<(), String> {
    window.set_always_on_top(always_on_top).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn toggle_fullscreen(window: Window) -> Result<bool, String> {
    let current = window.is_fullscreen().map_err(|e| e.to_string())?;
    let next = !current;
    window.set_fullscreen(next).map_err(|e| e.to_string())?;
    Ok(next)
}

#[tauri::command]
pub fn get_systems(state: State<'_, AppState>) -> Result<Vec<System>, String> {
    state.db.get_systems().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_system_by_id(id: String, state: State<'_, AppState>) -> Result<Option<System>, String> {
    state.db.get_system_by_id(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_emulators(state: State<'_, AppState>) -> Result<Vec<Emulator>, String> {
    state.db.get_emulators().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_emulator_path(
    id: String,
    exe_path: Option<String>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    state
        .db
        .update_emulator_path(&id, exe_path.as_deref())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_games_by_system(system_id: String, state: State<'_, AppState>) -> Result<Vec<Game>, String> {
    state.db.get_games_by_system(&system_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_games(state: State<'_, AppState>) -> Result<Vec<Game>, String> {
    state.db.get_all_games().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_favorite_games(state: State<'_, AppState>) -> Result<Vec<Game>, String> {
    state.db.get_favorite_games().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_recent_games(limit: Option<usize>, state: State<'_, AppState>) -> Result<Vec<Game>, String> {
    state
        .db
        .get_recently_played_games(limit.unwrap_or(20))
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_game_details(
    game_id: String,
    state: State<'_, AppState>,
) -> Result<(Option<Game>, Option<GameConfig>), String> {
    let game = state.db.get_game_by_id(&game_id).map_err(|e| e.to_string())?;
    let config = state.db.get_game_config(&game_id).map_err(|e| e.to_string())?;
    Ok((game, config))
}

#[tauri::command]
pub fn toggle_favorite(game_id: String, state: State<'_, AppState>) -> Result<bool, String> {
    state.db.toggle_favorite(&game_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_game_config(config: GameConfig, state: State<'_, AppState>) -> Result<(), String> {
    state.db.upsert_game_config(&config).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn scan_roms_directory(
    path: String,
    calculate_hashes: Option<bool>,
    state: State<'_, AppState>,
) -> Result<ScanStats, String> {
    let scanner = RomScanner::new(state.db.clone())
        .with_hash_calculation(calculate_hashes.unwrap_or(false));
    scanner.scan_directory(path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn organize_game_into_franchise(
    game_id: String,
    franchise_name: String,
    target_base_dir: Option<String>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let game = state
        .db
        .get_game_by_id(&game_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Jeu introuvable: {}", game_id))?;

    let base_dir = if let Some(dir) = target_base_dir {
        PathBuf::from(dir)
    } else {
        Path::new(&game.file_path)
            .parent()
            .unwrap_or_else(|| Path::new("."))
            .to_path_buf()
    };

    let scanner = RomScanner::new(state.db.clone());
    let new_path = scanner
        .organize_game_into_franchise(&game_id, &franchise_name, &base_dir)
        .map_err(|e| e.to_string())?;

    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn save_local_game_metadata(
    game_id: String,
    metadata: LocalGameMetadata,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let mut game = state
        .db
        .get_game_by_id(&game_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Jeu introuvable: {}", game_id))?;

    // 1. Mettre à jour en base SQLite
    game.title = metadata.title.clone();
    if metadata.franchise.is_some() {
        game.franchise = metadata.franchise.clone();
    }
    if metadata.genre.is_some() {
        game.genre = metadata.genre.clone();
    }
    if metadata.developer.is_some() {
        game.developer = metadata.developer.clone();
    }
    if metadata.publisher.is_some() {
        game.publisher = metadata.publisher.clone();
    }
    if metadata.release_date.is_some() {
        game.release_date = metadata.release_date.clone();
    }
    if metadata.synopsis.is_some() {
        game.synopsis = metadata.synopsis.clone();
    }
    if metadata.rating.is_some() {
        game.rating = metadata.rating;
    }
    if metadata.players.is_some() {
        game.players = metadata.players;
    }
    if metadata.cover_url.is_some() {
        game.cover_url = metadata.cover_url.clone();
    }
    if metadata.backdrop_url.is_some() {
        game.backdrop_url = metadata.backdrop_url.clone();
    }
    // Note: Since DB game struct doesn't have screenshots or video_url, we just store them in metadata.json if we want.

    state.db.update_game(&game).map_err(|e| e.to_string())?;

    // 2. Écrire le fichier JSON adjacent à la ROM
    let rom_path = Path::new(&game.file_path);
    if let Some(parent) = rom_path.parent() {
        let json_path = parent.join("metadata.json");
        if let Ok(json_str) = serde_json::to_string_pretty(&metadata) {
            let _ = fs::write(json_path, json_str);
        }
    }

    Ok(())
}

#[tauri::command]
pub fn launch_game(game_id: String, state: State<'_, AppState>) -> Result<LaunchStatus, String> {
    state.launcher.launch_game_by_id(&game_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_launcher_status(state: State<'_, AppState>) -> LaunchStatus {
    state.launcher.get_status()
}

#[tauri::command]
pub fn kill_running_game(state: State<'_, AppState>) -> Result<(), String> {
    state.launcher.kill_current_game().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_gamepad_mappings(state: State<'_, AppState>) -> Result<Vec<kairo_core::GamepadMapping>, String> {
    state.db.get_gamepad_mappings().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_gamepad_mappings(
    mappings: Vec<kairo_core::GamepadMapping>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    state.db.save_gamepad_mappings(&mappings).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_app_mode(state: State<'_, AppState>) -> String {
    state.app_mode.read().map(|m| m.clone()).unwrap_or_else(|_| "admin".to_string())
}

#[tauri::command]
pub fn set_app_mode(
    mode: String,
    pin: Option<String>,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let remote_cfg = RemoteConfig::load();
    let current_mode = state.app_mode.read().map(|m| m.clone()).unwrap_or_else(|_| "admin".to_string());

    if current_mode == "kiosk" && mode == "admin" {
        // Validation du PIN pour passer de Kiosk à Admin
        let provided = pin.unwrap_or_default();
        if provided.trim() != remote_cfg.pin.trim() {
            return Err("Code PIN incorrect".into());
        }
    }

    if let Ok(mut mode_guard) = state.app_mode.write() {
        *mode_guard = mode.clone();
    }

    // Persister dans les paramètres
    if let Ok(mut settings) = state.db.get_app_settings() {
        settings.kiosk_mode = mode == "kiosk";
        let _ = state.db.save_app_settings(&settings);
    }

    Ok(mode)
}

#[tauri::command]
pub fn get_remote_config() -> RemoteConfig {
    RemoteConfig::load()
}

#[tauri::command]
pub fn save_remote_config(config: RemoteConfig) -> Result<(), String> {
    RemoteConfig::save(&config).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_manual_game(
    file_path: String,
    system_id: String,
    title: Option<String>,
    cover_url: Option<String>,
    franchise: Option<String>,
    genre: Option<String>,
    developer: Option<String>,
    release_date: Option<String>,
    synopsis: Option<String>,
    rating: Option<f32>,
    players: Option<u32>,
    state: State<'_, AppState>,
) -> Result<Game, String> {
    let path = Path::new(&file_path);
    let file_name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    let file_size = if path.exists() {
        path.metadata().map(|m| m.len()).unwrap_or(0)
    } else {
        0
    };

    let clean_title = title.unwrap_or_else(|| {
        RomScanner::clean_game_title(&file_name)
    });

    let short_id = uuid::Uuid::new_v4().to_string().replace('-', "");
    let id = format!("{}-{}", system_id, &short_id[..8]);
    let now = chrono::Utc::now();

    let game = Game {
        id: id.clone(),
        system_id,
        title: clean_title,
        original_title: None,
        file_path: file_path.clone(),
        file_name,
        file_size,
        file_hash: None,
        franchise,
        cover_url,
        backdrop_url: None,
        logo_url: None,
        release_date,
        publisher: None,
        developer,
        genre,
        players: players.or(Some(1)),
        rating: rating.or(Some(4.5)),
        synopsis,
        favorite: false,
        hidden: false,
        play_count: 0,
        play_time_seconds: 0,
        last_played: None,
        created_at: now,
        updated_at: now,
    };

    state.db.insert_game(&game).map_err(|e| e.to_string())?;

    let config = GameConfig {
        id: format!("cfg-{}", id),
        game_id: id,
        emulator_id_override: None,
        custom_cli_args: None,
        custom_core: None,
        screen_ratio: None,
        shader: None,
        auto_save_state: true,
        forced_fullscreen: None,
    };
    let _ = state.db.upsert_game_config(&config);

    Ok(game)
}

/// Supprime un jeu de la base de données (ne supprime PAS les fichiers du disque)
#[tauri::command]
pub fn delete_game(game_id: String, state: State<'_, AppState>) -> Result<(), String> {
    state.db.delete_game(&game_id).map_err(|e| e.to_string())
}

/// Supprime de la base de données tous les jeux dont le fichier ROM n'existe plus sur le disque.
/// Retourne le nombre d'entrées supprimées.
#[tauri::command]
pub fn purge_missing_games(state: State<'_, AppState>) -> Result<usize, String> {
    let games = state.db.get_all_games().map_err(|e| e.to_string())?;
    let mut removed = 0usize;

    for game in games {
        if !std::path::Path::new(&game.file_path).exists() {
            if let Ok(()) = state.db.delete_game(&game.id) {
                removed += 1;
            }
        }
    }

    Ok(removed)
}
