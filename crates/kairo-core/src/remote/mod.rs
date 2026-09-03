use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use axum::{
    extract::{Path as AxumPath, Query, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};

use crate::db::Database;
use crate::launcher::Launcher;
use crate::models::{AppSettings, Emulator, Game};

/// Configuration du serveur distant (config/remote.json)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RemoteConfig {
    pub enabled: bool,
    pub port: u16,
    pub pin: String,
    pub allowed_origins: Vec<String>,
}

impl Default for RemoteConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            port: 8080,
            pin: "1234".into(),
            allowed_origins: vec!["*".into()],
        }
    }
}

impl RemoteConfig {
    pub fn load() -> Self {
        for path in &[
            Path::new("config/remote.json"),
            Path::new("../config/remote.json"),
            Path::new("dist-portable/config/remote.json"),
        ] {
            if path.exists() {
                if let Ok(content) = std::fs::read_to_string(path) {
                    if let Ok(cfg) = serde_json::from_str::<RemoteConfig>(&content) {
                        return cfg;
                    }
                }
            }
        }
        let default_cfg = Self::default();
        let _ = Self::save(&default_cfg);
        default_cfg
    }

    pub fn save(cfg: &RemoteConfig) -> std::io::Result<()> {
        let dir = Path::new("config");
        if !dir.exists() {
            let _ = std::fs::create_dir_all(dir);
        }
        let json = serde_json::to_string_pretty(cfg)?;
        std::fs::write(dir.join("remote.json"), &json)?;

        let portable_dir = Path::new("dist-portable/config");
        if portable_dir.exists() {
            let _ = std::fs::write(portable_dir.join("remote.json"), &json);
        }
        Ok(())
    }
}

/// État partagé du serveur Axum
#[derive(Clone)]
pub struct RemoteServerState {
    pub db: Database,
    pub launcher: Launcher,
    pub config_dir: PathBuf,
}

#[derive(Serialize)]
pub struct StatusResponse {
    pub is_running: bool,
    pub current_game_id: Option<String>,
    pub current_game_title: Option<String>,
    pub current_system_id: Option<String>,
    pub current_game_cover: Option<String>,
    pub elapsed_seconds: Option<u64>,
    pub kiosk_mode: bool,
    pub port: u16,
    pub local_ip: String,
    pub version: &'static str,
}

#[derive(Serialize)]
pub struct SystemInfoResponse {
    pub local_ip: String,
    pub port: u16,
    pub version: &'static str,
    pub install_dir: String,
    pub kiosk_mode: bool,
    pub total_games: usize,
}

#[derive(Deserialize)]
pub struct LaunchRequest {
    pub game_id: String,
}

#[derive(Deserialize)]
pub struct AddGameRequest {
    pub path: String,
    pub system_id: String,
    pub title: Option<String>,
}

#[derive(Deserialize)]
pub struct UnlockRequest {
    pub pin: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub pin: String,
}

#[derive(Deserialize)]
pub struct GamepadInputRequest {
    pub player_index: u8,
    pub button: String,
    pub is_down: bool,
}

#[derive(Deserialize)]
pub struct CoverQuery {
    pub path: String,
}

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[cfg(windows)]
pub fn simulate_key_event(vk_code: u16, is_down: bool) {
    use windows_sys::Win32::UI::Input::KeyboardAndMouse::{
        SendInput, INPUT, INPUT_0, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP,
    };
    use std::mem::size_of;

    let flags = if is_down { 0 } else { KEYEVENTF_KEYUP };
    let input = INPUT {
        r#type: INPUT_KEYBOARD,
        Anonymous: INPUT_0 {
            ki: KEYBDINPUT {
                wVk: vk_code,
                wScan: 0,
                dwFlags: flags,
                time: 0,
                dwExtraInfo: 0,
            },
        },
    };

    unsafe {
        SendInput(1, &input, size_of::<INPUT>() as i32);
    }
}

#[cfg(not(windows))]
pub fn simulate_key_event(_vk_code: u16, _is_down: bool) {}

fn map_player_button_to_vk(player: u8, button: &str) -> Option<u16> {
    let btn = button.to_lowercase();
    match player {
        0 => match btn.as_str() {
            "up" => Some(0x26),       // VK_UP
            "down" => Some(0x28),     // VK_DOWN
            "left" => Some(0x25),     // VK_LEFT
            "right" => Some(0x27),    // VK_RIGHT
            "a" => Some(0x58),        // 'X'
            "b" => Some(0x5A),        // 'Z'
            "x" => Some(0x53),        // 'S'
            "y" => Some(0x41),        // 'A'
            "l1" => Some(0x51),       // 'Q'
            "r1" => Some(0x57),       // 'W'
            "l2" => Some(0x45),       // 'E'
            "r2" => Some(0x52),       // 'R'
            "start" => Some(0x0D),    // VK_RETURN
            "select" | "coin" => Some(0x20), // VK_SPACE
            _ => None,
        },
        1 => match btn.as_str() {
            "up" => Some(0x68),       // VK_NUMPAD8
            "down" => Some(0x62),     // VK_NUMPAD2
            "left" => Some(0x64),     // VK_NUMPAD4
            "right" => Some(0x66),    // VK_NUMPAD6
            "a" => Some(0x61),        // VK_NUMPAD1
            "b" => Some(0x63),        // VK_NUMPAD3
            "x" => Some(0x65),        // VK_NUMPAD5
            "y" => Some(0x67),        // VK_NUMPAD7
            "l1" => Some(0x69),       // VK_NUMPAD9
            "r1" => Some(0x60),       // VK_NUMPAD0
            "l2" => Some(0x6A),       // VK_MULTIPLY
            "r2" => Some(0x6B),       // VK_ADD
            "start" => Some(0x6D),    // VK_SUBTRACT
            "select" | "coin" => Some(0x6E), // VK_DECIMAL
            _ => None,
        },
        2 => match btn.as_str() {
            "up" => Some(0x49),       // 'I'
            "down" => Some(0x4B),     // 'K'
            "left" => Some(0x4A),     // 'J'
            "right" => Some(0x4C),    // 'L'
            "a" => Some(0x55),        // 'U'
            "b" => Some(0x4F),        // 'O'
            "x" => Some(0x50),        // 'P'
            "y" => Some(0x59),        // 'Y'
            "l1" => Some(0x54),       // 'T'
            "r1" => Some(0x47),       // 'G'
            "start" => Some(0x48),    // 'H'
            "select" | "coin" => Some(0x42), // 'B'
            _ => None,
        },
        _ => match btn.as_str() {
            "up" => Some(0x26),
            "down" => Some(0x28),
            "left" => Some(0x25),
            "right" => Some(0x27),
            "a" => Some(0x58),
            "b" => Some(0x5A),
            "x" => Some(0x53),
            "y" => Some(0x41),
            "start" => Some(0x0D),
            "select" | "coin" => Some(0x20),
            _ => None,
        },
    }
}

/// Détecte l'adresse IP locale principale (ex: 192.168.1.30)
fn get_local_ip() -> String {
    use std::net::UdpSocket;
    if let Ok(socket) = UdpSocket::bind("0.0.0.0:0") {
        if socket.connect("8.8.8.8:80").is_ok() {
            if let Ok(local_addr) = socket.local_addr() {
                return local_addr.ip().to_string();
            }
        }
    }
    "127.0.0.1".to_string()
}

/// Vérifie le code PIN via le header X-Kairo-Pin
fn verify_pin(headers: &HeaderMap, required_pin: &str) -> bool {
    if let Some(val) = headers.get("X-Kairo-Pin") {
        if let Ok(pin_str) = val.to_str() {
            return pin_str.trim() == required_pin.trim();
        }
    }
    false
}

/// Démarre le serveur Axum en tâche de fond dans son propre runtime Tokio
pub fn start_remote_server(db: Database, launcher: Launcher) -> std::thread::JoinHandle<()> {
    std::thread::spawn(move || {
        let rt = match tokio::runtime::Builder::new_multi_thread()
            .worker_threads(2)
            .enable_all()
            .build()
        {
            Ok(rt) => rt,
            Err(e) => {
                eprintln!("❌ Impossible d'initialiser le runtime Tokio pour le serveur distant: {}", e);
                return;
            }
        };

        rt.block_on(async move {
            let config = RemoteConfig::load();
            if !config.enabled {
                println!("ℹ️ Serveur distant KaïroOS désactivé dans config/remote.json");
                return;
            }

            let port = config.port;
            let addr = SocketAddr::from(([0, 0, 0, 0], port));

            let state = RemoteServerState {
                db,
                launcher,
                config_dir: PathBuf::from("config"),
            };

            // Recherche du dossier statique PWA (kairo-remote/dist ou ./remote_dist)
            let mut pwa_dir = PathBuf::from("kairo-remote/dist");
            if !pwa_dir.exists() {
                if PathBuf::from("../kairo-remote/dist").exists() {
                    pwa_dir = PathBuf::from("../kairo-remote/dist");
                } else if PathBuf::from("dist-portable/kairo-remote").exists() {
                    pwa_dir = PathBuf::from("dist-portable/kairo-remote");
                }
            }

            let cors = CorsLayer::new()
                .allow_origin(Any)
                .allow_methods(Any)
                .allow_headers(Any);

            let api_routes = Router::new()
                .route("/api/auth/login", post(login_auth))
                .route("/api/gamepad/input", post(gamepad_input))
                .route("/api/status", get(get_status))
                .route("/api/system/info", get(get_system_info))
                .route("/api/games", get(get_games))
                .route("/api/games/recent", get(get_recent_games))
                .route("/api/games/:id", get(get_game_by_id))
                .route("/api/games/:id/favorite", post(toggle_game_favorite))
                .route("/api/games/launch", post(launch_game))
                .route("/api/games/stop", post(stop_game))
                .route("/api/games/add", post(add_game))
                .route("/api/systems", get(get_systems))
                .route("/api/emulators", get(get_emulators).post(save_emulators))
                .route("/api/settings", get(get_settings).post(save_settings))
                .route("/api/remote/config", get(get_remote_cfg).post(save_remote_cfg))
                .route("/api/kiosk/lock", post(lock_kiosk))
                .route("/api/kiosk/unlock", post(unlock_kiosk))
                .route("/api/media/cover", get(get_cover_image))
                .with_state(state.clone());

            let app = if pwa_dir.exists() {
                let index_file = pwa_dir.join("index.html");
                Router::new()
                    .merge(api_routes)
                    .fallback_service(ServeDir::new(&pwa_dir).fallback(ServeFile::new(index_file)))
                    .layer(cors)
            } else {
                Router::new().merge(api_routes).layer(cors)
            };

            let local_ip = get_local_ip();
            println!("🌐 Serveur distant KaïroOS démarré sur http://{}:{} (Accès PWA Mobile)", local_ip, port);

            match tokio::net::TcpListener::bind(addr).await {
                Ok(listener) => {
                    if let Err(err) = axum::serve(listener, app).await {
                        eprintln!("❌ Erreur d'exécution du serveur distant: {}", err);
                    }
                }
                Err(err) => {
                    eprintln!("❌ Impossible de lier le port {} pour le serveur distant: {}", port, err);
                }
            }
        });
    })
}

// ==================== HANDLERS REST ====================

async fn get_status(State(state): State<RemoteServerState>) -> impl IntoResponse {
    let launch_status = state.launcher.get_status();
    let settings = state.db.get_app_settings().unwrap_or_default();
    let config = RemoteConfig::load();
    let local_ip = get_local_ip();

    let mut current_game_cover: Option<String> = None;
    if let Some(ref gid) = launch_status.current_game_id {
        if let Ok(Some(g)) = state.db.get_game_by_id(gid) {
            current_game_cover = g.cover_url;
        }
    }

    Json(StatusResponse {
        is_running: launch_status.is_running,
        current_game_id: launch_status.current_game_id,
        current_game_title: launch_status.current_game_title,
        current_system_id: launch_status.current_system_id,
        current_game_cover,
        elapsed_seconds: launch_status.elapsed_seconds,
        kiosk_mode: settings.kiosk_mode,
        port: config.port,
        local_ip,
        version: "0.1.0",
    })
}

async fn get_system_info(State(state): State<RemoteServerState>) -> impl IntoResponse {
    let settings = state.db.get_app_settings().unwrap_or_default();
    let config = RemoteConfig::load();
    let local_ip = get_local_ip();
    let total_games = state.db.get_all_games().map(|g| g.len()).unwrap_or(0);
    let install_dir = std::env::current_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|_| ".".into());

    Json(SystemInfoResponse {
        local_ip,
        port: config.port,
        version: "0.1.0",
        install_dir,
        kiosk_mode: settings.kiosk_mode,
        total_games,
    })
}

async fn get_games(State(state): State<RemoteServerState>) -> impl IntoResponse {
    match state.db.get_all_games() {
        Ok(games) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(games), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn get_recent_games(State(state): State<RemoteServerState>) -> impl IntoResponse {
    match state.db.get_recently_played_games(5) {
        Ok(games) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(games), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn get_game_by_id(
    AxumPath(id): AxumPath<String>,
    State(state): State<RemoteServerState>,
) -> impl IntoResponse {
    match state.db.get_game_by_id(&id) {
        Ok(Some(game)) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(game), error: None })),
        Ok(None) => (
            StatusCode::NOT_FOUND,
            Json(ApiResponse { success: false, data: None, error: Some("Jeu introuvable".into()) }),
        ),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn toggle_game_favorite(
    AxumPath(id): AxumPath<String>,
    headers: HeaderMap,
    State(state): State<RemoteServerState>,
) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if !verify_pin(&headers, &config.pin) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse { success: false, data: None, error: Some("Code PIN non valide".into()) }),
        );
    }

    match state.db.toggle_favorite(&id) {
        Ok(fav) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(fav), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn launch_game(
    headers: HeaderMap,
    State(state): State<RemoteServerState>,
    Json(req): Json<LaunchRequest>,
) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if !verify_pin(&headers, &config.pin) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse { success: false, data: None, error: Some("Code PIN non valide".into()) }),
        );
    }

    match state.launcher.launch_game_by_id(&req.game_id) {
        Ok(status) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(status), error: None })),
        Err(err) => (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn stop_game(
    headers: HeaderMap,
    State(state): State<RemoteServerState>,
) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if !verify_pin(&headers, &config.pin) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse { success: false, data: None, error: Some("Code PIN non valide".into()) }),
        );
    }

    match state.launcher.kill_current_game() {
        Ok(()) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some("Jeu arrêté"), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn add_game(
    headers: HeaderMap,
    State(state): State<RemoteServerState>,
    Json(req): Json<AddGameRequest>,
) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if !verify_pin(&headers, &config.pin) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse { success: false, data: None, error: Some("Code PIN non valide".into()) }),
        );
    }

    let p = PathBuf::from(&req.path);
    let file_name = p.file_name().and_then(|n| n.to_str()).unwrap_or("unknown").to_string();
    let title = req.title.unwrap_or_else(|| {
        crate::scanner::RomScanner::clean_game_title(&file_name)
    });

    let now = chrono::Utc::now();
    let new_game = Game {
        id: uuid::Uuid::new_v4().to_string(),
        system_id: req.system_id,
        title,
        original_title: Some(file_name.clone()),
        file_path: req.path,
        file_name,
        file_size: 0,
        file_hash: None,
        franchise: None,
        cover_url: None,
        backdrop_url: None,
        logo_url: None,
        release_date: None,
        publisher: None,
        developer: None,
        genre: None,
        players: Some(1),
        rating: None,
        synopsis: None,
        favorite: false,
        hidden: false,
        play_count: 0,
        play_time_seconds: 0,
        last_played: None,
        created_at: now,
        updated_at: now,
    };

    match state.db.insert_game(&new_game) {
        Ok(()) => (StatusCode::CREATED, Json(ApiResponse { success: true, data: Some(new_game), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn get_systems(State(state): State<RemoteServerState>) -> impl IntoResponse {
    match state.db.get_systems() {
        Ok(systems) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(systems), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn get_emulators(State(state): State<RemoteServerState>) -> impl IntoResponse {
    match state.db.get_emulators() {
        Ok(emus) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(emus), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn save_emulators(
    headers: HeaderMap,
    State(state): State<RemoteServerState>,
    Json(emulators): Json<Vec<Emulator>>,
) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if !verify_pin(&headers, &config.pin) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse { success: false, data: None, error: Some("Code PIN non valide".into()) }),
        );
    }

    for emu in &emulators {
        if let Err(e) = state.db.upsert_emulator(emu) {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(ApiResponse { success: false, data: None, error: Some(e.to_string()) }),
            );
        }
    }

    // Écrire également config/emulators.json
    let config_dir = Path::new("config");
    if let Ok(pretty) = serde_json::to_string_pretty(&emulators) {
        let _ = std::fs::write(config_dir.join("emulators.json"), &pretty);
        let portable_dir = Path::new("dist-portable/config");
        if portable_dir.exists() {
            let _ = std::fs::write(portable_dir.join("emulators.json"), &pretty);
        }
    }

    (StatusCode::OK, Json(ApiResponse { success: true, data: Some(emulators), error: None }))
}

async fn get_settings(State(state): State<RemoteServerState>) -> impl IntoResponse {
    match state.db.get_app_settings() {
        Ok(settings) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(settings), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn save_settings(
    headers: HeaderMap,
    State(state): State<RemoteServerState>,
    Json(new_settings): Json<AppSettings>,
) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if !verify_pin(&headers, &config.pin) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse { success: false, data: None, error: Some("Code PIN non valide".into()) }),
        );
    }

    match state.db.save_app_settings(&new_settings) {
        Ok(()) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(new_settings), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn get_remote_cfg() -> impl IntoResponse {
    let config = RemoteConfig::load();
    Json(ApiResponse { success: true, data: Some(config), error: None })
}

async fn save_remote_cfg(
    headers: HeaderMap,
    Json(cfg): Json<RemoteConfig>,
) -> impl IntoResponse {
    let current_cfg = RemoteConfig::load();
    if !verify_pin(&headers, &current_cfg.pin) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse { success: false, data: None, error: Some("Code PIN non valide".into()) }),
        );
    }

    match RemoteConfig::save(&cfg) {
        Ok(()) => (StatusCode::OK, Json(ApiResponse { success: true, data: Some(cfg), error: None })),
        Err(err) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(ApiResponse { success: false, data: None, error: Some(err.to_string()) }),
        ),
    }
}

async fn lock_kiosk(
    headers: HeaderMap,
    State(state): State<RemoteServerState>,
) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if !verify_pin(&headers, &config.pin) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse { success: false, data: None, error: Some("Code PIN non valide".into()) }),
        );
    }

    let mut settings = state.db.get_app_settings().unwrap_or_default();
    settings.kiosk_mode = true;
    let _ = state.db.save_app_settings(&settings);

    (StatusCode::OK, Json(ApiResponse { success: true, data: Some("Mode Kiosk activé"), error: None }))
}

async fn unlock_kiosk(
    State(state): State<RemoteServerState>,
    Json(req): Json<UnlockRequest>,
) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if req.pin.trim() != config.pin.trim() {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse { success: false, data: None, error: Some("Code PIN incorrect".into()) }),
        );
    }

    let mut settings = state.db.get_app_settings().unwrap_or_default();
    settings.kiosk_mode = false;
    let _ = state.db.save_app_settings(&settings);

    (StatusCode::OK, Json(ApiResponse { success: true, data: Some("Mode Admin déverrouillé"), error: None }))
}

async fn get_cover_image(Query(query): Query<CoverQuery>) -> impl IntoResponse {
    let path = PathBuf::from(&query.path);
    if !path.exists() {
        return (StatusCode::NOT_FOUND, "Image non trouvée").into_response();
    }

    let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
    let content_type = match ext.as_str() {
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "gif" => "image/gif",
        _ => "application/octet-stream",
    };

    match std::fs::read(&path) {
        Ok(bytes) => (
            StatusCode::OK,
            [(header::CONTENT_TYPE, content_type)],
            bytes,
        ).into_response(),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Erreur lecture image").into_response(),
    }
}

async fn login_auth(Json(req): Json<LoginRequest>) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if req.pin.trim() == config.pin.trim() {
        (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: Some("Authentification réussie"),
                error: None,
            }),
        )
    } else {
        (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse {
                success: false,
                data: None,
                error: Some("Code PIN non valide".into()),
            }),
        )
    }
}

async fn gamepad_input(
    headers: HeaderMap,
    Json(req): Json<GamepadInputRequest>,
) -> impl IntoResponse {
    let config = RemoteConfig::load();
    if !verify_pin(&headers, &config.pin) {
        return (
            StatusCode::UNAUTHORIZED,
            Json(ApiResponse {
                success: false,
                data: None,
                error: Some("Code PIN non valide".into()),
            }),
        );
    }

    if let Some(vk) = map_player_button_to_vk(req.player_index, &req.button) {
        simulate_key_event(vk, req.is_down);
        (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: Some(format!("Input {} player {} (down={})", req.button, req.player_index + 1, req.is_down)),
                error: None,
            }),
        )
    } else {
        (
            StatusCode::BAD_REQUEST,
            Json(ApiResponse {
                success: false,
                data: None,
                error: Some(format!("Bouton inconnu: {}", req.button)),
            }),
        )
    }
}

