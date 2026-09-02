use std::fs;
use std::path::{Path, PathBuf};
use kairo_core::{
    AppSettings, Database, Emulator, Game, GameConfig, Launcher, LaunchStatus,
    LocalGameMetadata, RomScanner, ScanStats, System,
};
use tauri::{State, Window};

pub struct AppState {
    pub db: Database,
    pub launcher: Launcher,
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

    state.db.update_game(&game).map_err(|e| e.to_string())?;

    // 2. Écrire le fichier JSON adjacent à la ROM
    let rom_path = Path::new(&game.file_path);
    let json_path = rom_path.with_extension("json");
    if let Ok(json_str) = serde_json::to_string_pretty(&metadata) {
        let _ = fs::write(json_path, json_str);
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

