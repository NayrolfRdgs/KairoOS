use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use axum::{
    extract::{Path as AxumPath, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::{ServeDir, ServeFile};

use crate::db::Database;
use crate::launcher::Launcher;
use crate::models::{AppSettings, Game};

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
        std::fs::write(dir.join("remote.json"), json)?;
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
    pub elapsed_seconds: Option<u64>,
    pub kiosk_mode: bool,
    pub port: u16,
    pub version: &'static str,
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

#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
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

/// Démarre le serveur Axum en tâche de fond Tokio
pub fn start_remote_server(db: Database, launcher: Launcher) -> tokio::task::JoinHandle<()> {
    tokio::spawn(async move {
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
            .route("/api/status", get(get_status))
            .route("/api/games", get(get_games))
            .route("/api/games/:id", get(get_game_by_id))
            .route("/api/games/launch", post(launch_game))
            .route("/api/games/stop", post(stop_game))
            .route("/api/games/add", post(add_game))
            .route("/api/systems", get(get_systems))
            .route("/api/settings", get(get_settings).post(save_settings))
            .route("/api/kiosk/lock", post(lock_kiosk))
            .route("/api/kiosk/unlock", post(unlock_kiosk))
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

        println!("🌐 Serveur distant KaïroOS démarré sur http://localhost:{} (Accès PWA Mobile)", port);

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
    })
}

// ==================== HANDLERS REST ====================

async fn get_status(State(state): State<RemoteServerState>) -> impl IntoResponse {
    let launch_status = state.launcher.get_status();
    let settings = state.db.get_app_settings().unwrap_or_default();
    let config = RemoteConfig::load();

    Json(StatusResponse {
        is_running: launch_status.is_running,
        current_game_id: launch_status.current_game_id,
        current_game_title: launch_status.current_game_title,
        current_system_id: launch_status.current_system_id,
        elapsed_seconds: launch_status.elapsed_seconds,
        kiosk_mode: settings.kiosk_mode,
        port: config.port,
        version: "0.1.0",
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
