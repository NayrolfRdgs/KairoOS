use kairo_core::{Database, Emulator, Game, GameConfig, Launcher, LaunchStatus, RomScanner, ScanStats, System};
use tauri::State;

pub struct AppState {
    pub db: Database,
    pub launcher: Launcher,
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
