use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

/// Représente une console / système de jeu supporté par KaïroOS
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct System {
    pub id: String,                    // ex: "nes", "snes", "ps1", "ps2", "ps3", "switch", "gamecube", "wii", "n64", "gba", "arcade", "windows"
    pub name: String,                  // ex: "Super Nintendo", "Nintendo Switch", "PlayStation 2"
    pub short_name: String,            // ex: "SNES", "Switch", "PS2"
    pub manufacturer: String,          // ex: "Nintendo", "Sony", "Sega", "Microsoft"
    pub generation: Option<u32>,       // ex: 3, 4, 5, 6, 7, 8, 9
    pub release_year: Option<u32>,     // ex: 1990
    pub extensions: Vec<String>,       // ex: ["sfc", "smc", "zip"]
    pub icon: String,                  // Identifiant d'icône ou nom de fichier SVG
    pub default_emulator_id: String,   // ex: "retroarch", "ryujinx", "pcsx2", "dolphin", "rpcs3", "native"
    pub default_core: Option<String>,  // ex: "snes9x_libretro.dll" pour RetroArch
    pub folder_names: Vec<String>,     // ex: ["snes", "sfc", "super nintendo"] pour auto-détection par dossier
}

/// Représente un émulateur ou moteur d'exécution CLI
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Emulator {
    pub id: String,                    // ex: "retroarch", "ryujinx", "pcsx2", "dolphin", "rpcs3", "native"
    pub name: String,                  // ex: "RetroArch", "Ryujinx / Ryubing", "PCSX2", "Dolphin", "RPCS3", "Windows Native"
    pub exe_path: Option<String>,      // Chemin absolu vers l'exécutable (ex: "C:\\Emulators\\RetroArch\\retroarch.exe")
    pub default_args: String,          // Template CLI (ex: "-L {core_path} \"{rom_path}\"")
    pub is_builtin: bool,              // True si configuré par défaut dans KaïroOS
    pub website_url: Option<String>,   // URL officielle pour téléchargement
}

/// Représente un jeu indexé dans la bibliothèque locale
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Game {
    pub id: String,
    pub system_id: String,
    pub title: String,
    pub original_title: Option<String>,
    pub file_path: String,
    pub file_name: String,
    pub file_size: u64,
    pub file_hash: Option<String>,     // Hash SHA1 / MD5 pour scraping ScreenScraper
    pub cover_url: Option<String>,     // Jaquette frontale
    pub backdrop_url: Option<String>,  // Fond d'écran / fanart
    pub logo_url: Option<String>,      // Logo PNG transparent / Wheel
    pub release_date: Option<String>,  // Date YYYY-MM-DD
    pub publisher: Option<String>,
    pub developer: Option<String>,
    pub genre: Option<String>,
    pub players: Option<u32>,          // 1, 2, 4 joueurs
    pub rating: Option<f32>,           // 0.0 - 5.0 ou 0 - 100
    pub synopsis: Option<String>,
    pub favorite: bool,
    pub hidden: bool,
    pub play_count: u32,
    pub play_time_seconds: u64,
    pub last_played: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Configuration spécifique ou personnalisation par jeu
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GameConfig {
    pub id: String,
    pub game_id: String,
    pub emulator_id_override: Option<String>,
    pub custom_cli_args: Option<String>,
    pub custom_core: Option<String>,
    pub screen_ratio: Option<String>,  // ex: "4:3", "16:9", "pixel_perfect"
    pub shader: Option<String>,        // ex: "crt-easymode", "bilinear"
    pub auto_save_state: bool,
}

/// Collection thématique ou franchise
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Collection {
    pub id: String,
    pub name: String,                  // ex: "Mario", "Zelda", "Street Fighter", "Favoris d'Arcade"
    pub description: Option<String>,
    pub icon: Option<String>,
    pub is_system: bool,               // True pour collections générées auto (ex: "Récents", "Favoris")
}

/// Résultat d'un scan de répertoire de ROMs
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ScanStats {
    pub total_files_scanned: usize,
    pub games_added: usize,
    pub games_updated: usize,
    pub games_skipped: usize,
    pub systems_detected: Vec<String>,
    pub errors: Vec<String>,
}

/// Statut d'exécution du jeu en cours
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct LaunchStatus {
    pub is_running: bool,
    pub current_game_id: Option<String>,
    pub current_game_title: Option<String>,
    pub current_system_id: Option<String>,
    pub pid: Option<u32>,
    pub start_time: Option<DateTime<Utc>>,
    pub elapsed_seconds: Option<u64>,
}
