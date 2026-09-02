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
    pub franchise: Option<String>,     // ex: "Super Mario", "The Legend of Zelda", "Sonic", "Pokémon"
    pub cover_url: Option<String>,     // Jaquette frontale (URL ou chemin absolu d'image locale)
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

/// Structure pour fichier JSON de métadonnées local stocké à côté d'une ROM
#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct LocalGameMetadata {
    pub title: String,
    pub franchise: Option<String>,
    pub system_id: Option<String>,
    pub release_date: Option<String>,
    pub developer: Option<String>,
    pub publisher: Option<String>,
    pub genre: Option<String>,
    pub players: Option<u32>,
    pub rating: Option<f32>,
    pub synopsis: Option<String>,
    pub cover_file: Option<String>,
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

/// Configuration & Remapping d'une manette / joystick d'arcade pour un joueur
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct GamepadMapping {
    pub player_index: usize,          // 0 à 9 (Joueur 1 à Joueur 10)
    pub device_name: String,          // ex: "DragonRise Inc. Generic USB Joystick", "Xbox Controller"
    pub device_id: String,
    pub controller_type: String,      // "arcade_stick", "standard", "retro_snes", "retro_sega", "wheel"
    pub btn_up: Option<String>,       // ex: "h0up" ou "btn_12"
    pub btn_down: Option<String>,
    pub btn_left: Option<String>,
    pub btn_right: Option<String>,
    pub btn_a: Option<String>,        // Bouton A / 1
    pub btn_b: Option<String>,        // Bouton B / 2
    pub btn_x: Option<String>,        // Bouton X / 3
    pub btn_y: Option<String>,        // Bouton Y / 4
    pub btn_l1: Option<String>,       // Bouton L1 / 5
    pub btn_r1: Option<String>,       // Bouton R1 / 6
    pub btn_l2: Option<String>,       // Bouton L2 / 7
    pub btn_r2: Option<String>,       // Bouton R2 / 8
    pub btn_select: Option<String>,   // Select / Coin / Crédit 🪙
    pub btn_start: Option<String>,    // Start / 1P Start 🕹️
    pub btn_hotkey: Option<String>,   // Quitter / Menu Hotkey
    pub deadzone: f32,
}

impl Default for GamepadMapping {
    fn default() -> Self {
        Self {
            player_index: 0,
            device_name: "Arcade Stick / Gamepad 1".into(),
            device_id: "default_pad_0".into(),
            controller_type: "arcade_stick".into(),
            btn_up: Some("up".into()),
            btn_down: Some("down".into()),
            btn_left: Some("left".into()),
            btn_right: Some("right".into()),
            btn_a: Some("0".into()),
            btn_b: Some("1".into()),
            btn_x: Some("2".into()),
            btn_y: Some("3".into()),
            btn_l1: Some("4".into()),
            btn_r1: Some("5".into()),
            btn_l2: Some("6".into()),
            btn_r2: Some("7".into()),
            btn_select: Some("8".into()),
            btn_start: Some("9".into()),
            btn_hotkey: Some("8".into()),
            deadzone: 0.15,
        }
    }
}

/// Franchise personnalisée ou configurable
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct CustomFranchise {
    pub id: String,
    pub name: String,
    pub color: String,
    pub keywords: Vec<String>,
    pub is_enabled: bool,
}

/// Paramètres de l'application & Mode Borne
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct AppSettings {
    pub fullscreen: bool,
    pub always_on_top: bool,
    pub kiosk_mode: bool,
    pub enabled_franchises: Vec<String>,
    pub custom_franchises: Vec<CustomFranchise>,
    pub roms_path: Option<String>,
    pub theme: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            fullscreen: false,
            always_on_top: false,
            kiosk_mode: false,
            enabled_franchises: vec![
                "mario".into(),
                "zelda".into(),
                "pokemon".into(),
                "sonic".into(),
                "versus".into(),
                "rpg".into(),
            ],
            custom_franchises: Vec::new(),
            roms_path: Some("./roms".into()),
            theme: "retro-80s-light".into(),
        }
    }
}

/// Configuration pour le serveur d'accès distant (PWA / Mobile / WebSocket)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct RemoteSettings {
    pub enabled: bool,
    pub port: u16,
    pub bind_address: String,
    pub require_pin: bool,
    pub pin_code: String,
    pub allow_game_install: bool,
    pub allow_remote_control: bool,
}

impl Default for RemoteSettings {
    fn default() -> Self {
        Self {
            enabled: false,
            port: 8080,
            bind_address: "0.0.0.0".into(),
            require_pin: true,
            pin_code: "1980".into(),
            allow_game_install: true,
            allow_remote_control: true,
        }
    }
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
    pub franchises_detected: Vec<String>,
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
