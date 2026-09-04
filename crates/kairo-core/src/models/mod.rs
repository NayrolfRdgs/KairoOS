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
    pub cover_url: Option<String>,
    pub backdrop_url: Option<String>,
    pub screenshots: Option<Vec<String>>,
    pub video_url: Option<String>,
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
    #[serde(default)]
    pub forced_fullscreen: Option<String>, // "always", "never", "per_game"
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
    #[serde(default)]
    pub physical_joypad_index: Option<usize>, // Index matériel USB DirectInput (Port 0, 1...)
    pub deadzone: f32,
}

impl Default for GamepadMapping {
    fn default() -> Self {
        Self {
            player_index: 0,
            physical_joypad_index: Some(0),
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
    #[serde(default)]
    pub enabled_systems: Option<Vec<String>>,
    #[serde(default)]
    pub enabled_modes: Option<Vec<String>>,
    #[serde(default)]
    pub default_sort: Option<String>,
    #[serde(default)]
    pub auto_kiosk: bool,
    #[serde(default)]
    pub game_select_action: Option<String>,
    #[serde(default)]
    pub arcade_ui_scale: Option<String>,
    // RetroBat Advanced Settings
    #[serde(default)]
    pub retroarch_shader: Option<String>, // "none", "scanlines_light", "scanlines_strong", "crt_curved"
    #[serde(default)]
    pub aspect_ratio: Option<String>, // "4:3", "16:9", "pixel_perfect", "stretch"
    #[serde(default)]
    pub brightness: Option<u8>,
    #[serde(default)]
    pub contrast: Option<u8>,
    #[serde(default)]
    pub metadata_language: Option<String>, // "fr", "en"
    #[serde(default)]
    pub launch_resolution: Option<String>, // "native", "720p", "1080p", "4k"
    #[serde(default)]
    pub forced_fullscreen: Option<String>, // "always", "never", "per_game"
    #[serde(default)]
    pub autosave_enabled: Option<bool>,
    #[serde(default)]
    pub rewind_enabled: Option<bool>,
    #[serde(default)]
    pub cheats_dir: Option<String>,
    #[serde(default)]
    pub saves_dir: Option<String>,
    #[serde(default)]
    pub screenshots_dir: Option<String>,
    #[serde(default)]
    pub scraping_delay_seconds: Option<u32>,
    #[serde(default)]
    pub screenscraper_ssid: Option<String>,
    #[serde(default)]
    pub screenscraper_sspassword: Option<String>,
    // Jalon 5 - Paramètres enrichis
    #[serde(default)]
    pub hide_mouse_cursor: Option<bool>,
    #[serde(default)]
    pub ui_resolution: Option<String>,
    #[serde(default)]
    pub ui_language: Option<String>,
    #[serde(default)]
    pub cores_dir: Option<String>,
    #[serde(default)]
    pub startup_sound_enabled: Option<bool>,
    #[serde(default)]
    pub ui_navigation_player: Option<usize>,
    #[serde(default)]
    pub stick_sensitivity: Option<u8>,
    #[serde(default)]
    pub navigation_repeat_rate_ms: Option<u32>,
    #[serde(default)]
    pub auto_scan_on_startup: Option<bool>,
    #[serde(default)]
    pub default_view: Option<String>,
    #[serde(default)]
    pub show_games_without_cover: Option<bool>,
    #[serde(default)]
    pub recent_games_limit: Option<u32>,
    #[serde(default)]
    pub media_download_types: Option<Vec<String>>,
    #[serde(default)]
    pub auto_scrape_after_scan: Option<bool>,
    #[serde(default)]
    pub remote_autostart: Option<bool>,
    #[serde(default)]
    pub extra_cli_args: Option<String>,
    #[serde(default)]
    pub debug_logs: Option<bool>,
    #[serde(default)]
    pub button_prompt_style: Option<String>,
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
            theme: "arcade-light".into(),
            enabled_systems: None,
            enabled_modes: None,
            default_sort: Some("title_asc".into()),
            auto_kiosk: false,
            game_select_action: Some("details".into()),
            arcade_ui_scale: Some("normal".into()),
            retroarch_shader: Some("none".into()),
            aspect_ratio: Some("4:3".into()),
            brightness: Some(50),
            contrast: Some(50),
            metadata_language: Some("fr".into()),
            launch_resolution: Some("native".into()),
            forced_fullscreen: Some("per_game".into()),
            autosave_enabled: Some(true),
            rewind_enabled: Some(false),
            cheats_dir: None,
            saves_dir: None,
            screenshots_dir: None,
            scraping_delay_seconds: Some(1),
            screenscraper_ssid: None,
            screenscraper_sspassword: None,
            hide_mouse_cursor: Some(false),
            ui_resolution: Some("auto".into()),
            ui_language: Some("fr".into()),
            cores_dir: None,
            startup_sound_enabled: Some(true),
            ui_navigation_player: Some(0),
            stick_sensitivity: Some(50),
            navigation_repeat_rate_ms: Some(180),
            auto_scan_on_startup: Some(false),
            default_view: Some("grid".into()),
            show_games_without_cover: Some(true),
            recent_games_limit: Some(10),
            media_download_types: Some(vec!["cover".into(), "backdrop".into()]),
            auto_scrape_after_scan: Some(false),
            remote_autostart: Some(true),
            extra_cli_args: None,
            debug_logs: Some(false),
            button_prompt_style: Some("xbox".into()),
        }
    }
}

/// Modèles pour le système de Thèmes (Jalon 5)
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ThemeColors {
    pub bg_primary: String,
    pub bg_secondary: String,
    pub bg_card: String,
    pub sidebar_bg: String,
    pub accent_primary: String,
    pub accent_secondary: String,
    pub text_primary: String,
    pub text_secondary: String,
    pub text_muted: String,
    pub border: String,
    pub success: String,
    pub warning: String,
    pub danger: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ThemeFonts {
    pub primary: String,
    pub arcade: String,
    pub size_base: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ThemeLayout {
    pub card_radius: String,
    pub sidebar_width: String,
    pub card_gap: String,
    #[serde(default)]
    pub card_aspect: Option<String>,
    #[serde(default)]
    pub card_glow: Option<String>,
    #[serde(default)]
    pub scanlines: Option<String>,
    #[serde(default)]
    pub card_shadow: Option<String>,
    #[serde(default)]
    pub card_scale: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct ThemeAssets {
    pub background_image: Option<String>,
    pub logo_override: Option<String>,
    pub startup_sound: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct Theme {
    pub id: String,
    pub name: String,
    pub author: String,
    pub version: String,
    pub description: String,
    pub colors: ThemeColors,
    pub fonts: ThemeFonts,
    pub layout: ThemeLayout,
    pub assets: ThemeAssets,
    #[serde(default)]
    pub preview_url: Option<String>,
    #[serde(default)]
    pub is_active: bool,
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
