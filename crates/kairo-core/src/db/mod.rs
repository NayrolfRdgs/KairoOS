use std::path::Path;
use std::sync::{Arc, Mutex};
use chrono::{DateTime, Utc};
use rusqlite::{params, Connection};
use thiserror::Error;

use crate::models::{AppSettings, Collection, Emulator, Game, GameConfig, System};

#[derive(Error, Debug)]
pub enum DbError {
    #[error("Erreur SQLite: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("Erreur JSON: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Entité non trouvée: {0}")]
    NotFound(String),
}

#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn open<P: AsRef<Path>>(path: P) -> std::result::Result<Self, DbError> {
        let conn = Connection::open(path)?;
        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.init()?;
        Ok(db)
    }

    pub fn open_in_memory() -> std::result::Result<Self, DbError> {
        let conn = Connection::open_in_memory()?;
        let db = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        db.init()?;
        Ok(db)
    }

    pub fn init(&self) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();

        conn.execute_batch(
            "
            PRAGMA journal_mode = WAL;
            PRAGMA synchronous = NORMAL;
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS systems (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                short_name TEXT NOT NULL,
                manufacturer TEXT NOT NULL,
                generation INTEGER,
                release_year INTEGER,
                extensions TEXT NOT NULL,
                icon TEXT NOT NULL,
                default_emulator_id TEXT NOT NULL,
                default_core TEXT,
                folder_names TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS emulators (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                exe_path TEXT,
                default_args TEXT NOT NULL,
                is_builtin INTEGER NOT NULL DEFAULT 1,
                website_url TEXT
            );

            CREATE TABLE IF NOT EXISTS games (
                id TEXT PRIMARY KEY,
                system_id TEXT NOT NULL,
                title TEXT NOT NULL,
                original_title TEXT,
                file_path TEXT NOT NULL UNIQUE,
                file_name TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                file_hash TEXT,
                franchise TEXT,
                cover_url TEXT,
                backdrop_url TEXT,
                logo_url TEXT,
                release_date TEXT,
                publisher TEXT,
                developer TEXT,
                genre TEXT,
                players INTEGER,
                rating REAL,
                synopsis TEXT,
                favorite INTEGER NOT NULL DEFAULT 0,
                hidden INTEGER NOT NULL DEFAULT 0,
                play_count INTEGER NOT NULL DEFAULT 0,
                play_time_seconds INTEGER NOT NULL DEFAULT 0,
                last_played TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (system_id) REFERENCES systems(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS game_configs (
                id TEXT PRIMARY KEY,
                game_id TEXT NOT NULL UNIQUE,
                emulator_id_override TEXT,
                custom_cli_args TEXT,
                custom_core TEXT,
                screen_ratio TEXT,
                shader TEXT,
                auto_save_state INTEGER NOT NULL DEFAULT 1,
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS collections (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                icon TEXT,
                is_system INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS game_collections (
                game_id TEXT NOT NULL,
                collection_id TEXT NOT NULL,
                PRIMARY KEY (game_id, collection_id),
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
                FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS play_sessions (
                id TEXT PRIMARY KEY,
                game_id TEXT NOT NULL,
                start_time TEXT NOT NULL,
                end_time TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL,
                FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS app_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_games_system ON games(system_id);
            CREATE INDEX IF NOT EXISTS idx_games_favorite ON games(favorite);
            CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
            CREATE INDEX IF NOT EXISTS idx_games_franchise ON games(franchise);
            CREATE INDEX IF NOT EXISTS idx_games_play_time ON games(play_time_seconds DESC);
            CREATE INDEX IF NOT EXISTS idx_games_last_played ON games(last_played DESC);
            ",
        )?;

        // Migration douce si colonne franchise manquante
        let _ = conn.execute("ALTER TABLE games ADD COLUMN franchise TEXT;", []);

        drop(conn);
        self.seed_defaults()?;
        Ok(())
    }

    fn seed_defaults(&self) -> std::result::Result<(), DbError> {
        let systems = self.get_systems()?;
        if systems.is_empty() {
            let default_systems = vec![
                System {
                    id: "nes".into(),
                    name: "Nintendo Entertainment System".into(),
                    short_name: "NES".into(),
                    manufacturer: "Nintendo".into(),
                    generation: Some(3),
                    release_year: Some(1983),
                    extensions: vec!["nes".into(), "fds".into(), "unif".into(), "zip".into(), "7z".into()],
                    icon: "gamepad-2".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("fceumm_libretro.dll".into()),
                    folder_names: vec!["nes".into(), "famicom".into(), "nintendo".into()],
                },
                System {
                    id: "snes".into(),
                    name: "Super Nintendo Entertainment System".into(),
                    short_name: "SNES".into(),
                    manufacturer: "Nintendo".into(),
                    generation: Some(4),
                    release_year: Some(1990),
                    extensions: vec!["sfc".into(), "smc".into(), "fig".into(), "zip".into(), "7z".into()],
                    icon: "gamepad-2".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("snes9x_libretro.dll".into()),
                    folder_names: vec!["snes".into(), "sfc".into(), "super nintendo".into()],
                },
                System {
                    id: "n64".into(),
                    name: "Nintendo 64".into(),
                    short_name: "N64".into(),
                    manufacturer: "Nintendo".into(),
                    generation: Some(5),
                    release_year: Some(1996),
                    extensions: vec!["z64".into(), "n64".into(), "v64".into(), "zip".into(), "7z".into()],
                    icon: "box".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("mupen64plus_next_libretro.dll".into()),
                    folder_names: vec!["n64".into(), "nintendo64".into(), "nintendo 64".into()],
                },
                System {
                    id: "gb".into(),
                    name: "Game Boy".into(),
                    short_name: "GB".into(),
                    manufacturer: "Nintendo".into(),
                    generation: Some(4),
                    release_year: Some(1989),
                    extensions: vec!["gb".into(), "zip".into(), "7z".into()],
                    icon: "smartphone".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("gambatte_libretro.dll".into()),
                    folder_names: vec!["gb".into(), "gameboy".into(), "game boy".into()],
                },
                System {
                    id: "gbc".into(),
                    name: "Game Boy Color".into(),
                    short_name: "GBC".into(),
                    manufacturer: "Nintendo".into(),
                    generation: Some(5),
                    release_year: Some(1998),
                    extensions: vec!["gbc".into(), "zip".into(), "7z".into()],
                    icon: "smartphone".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("gambatte_libretro.dll".into()),
                    folder_names: vec!["gbc".into(), "gameboy color".into(), "game boy color".into()],
                },
                System {
                    id: "gba".into(),
                    name: "Game Boy Advance".into(),
                    short_name: "GBA".into(),
                    manufacturer: "Nintendo".into(),
                    generation: Some(6),
                    release_year: Some(2001),
                    extensions: vec!["gba".into(), "zip".into(), "7z".into()],
                    icon: "smartphone".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("mgba_libretro.dll".into()),
                    folder_names: vec!["gba".into(), "gameboy advance".into(), "game boy advance".into()],
                },
                System {
                    id: "gamecube".into(),
                    name: "Nintendo GameCube".into(),
                    short_name: "GameCube".into(),
                    manufacturer: "Nintendo".into(),
                    generation: Some(6),
                    release_year: Some(2001),
                    extensions: vec!["iso".into(), "gcm".into(), "gcz".into(), "rvz".into(), "ciso".into()],
                    icon: "disc".into(),
                    default_emulator_id: "dolphin".into(),
                    default_core: None,
                    folder_names: vec!["gamecube".into(), "gc".into(), "ngc".into()],
                },
                System {
                    id: "wii".into(),
                    name: "Nintendo Wii".into(),
                    short_name: "Wii".into(),
                    manufacturer: "Nintendo".into(),
                    generation: Some(7),
                    release_year: Some(2006),
                    extensions: vec!["iso".into(), "wbfs".into(), "rvz".into(), "gcz".into()],
                    icon: "disc".into(),
                    default_emulator_id: "dolphin".into(),
                    default_core: None,
                    folder_names: vec!["wii".into()],
                },
                System {
                    id: "switch".into(),
                    name: "Nintendo Switch".into(),
                    short_name: "Switch".into(),
                    manufacturer: "Nintendo".into(),
                    generation: Some(8),
                    release_year: Some(2017),
                    extensions: vec!["nsp".into(), "xci".into(), "nsz".into(), "xcz".into()],
                    icon: "toggle-right".into(),
                    default_emulator_id: "ryujinx".into(),
                    default_core: None,
                    folder_names: vec!["switch".into(), "nsw".into()],
                },
                System {
                    id: "ps1".into(),
                    name: "Sony PlayStation".into(),
                    short_name: "PS1".into(),
                    manufacturer: "Sony".into(),
                    generation: Some(5),
                    release_year: Some(1994),
                    extensions: vec!["cue".into(), "bin".into(), "chd".into(), "pbp".into(), "iso".into(), "m3u".into()],
                    icon: "disc".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("swanstation_libretro.dll".into()),
                    folder_names: vec!["ps1".into(), "psx".into(), "playstation".into()],
                },
                System {
                    id: "ps2".into(),
                    name: "Sony PlayStation 2".into(),
                    short_name: "PS2".into(),
                    manufacturer: "Sony".into(),
                    generation: Some(6),
                    release_year: Some(2000),
                    extensions: vec!["iso".into(), "chd".into(), "bin".into(), "gz".into(), "elf".into()],
                    icon: "disc".into(),
                    default_emulator_id: "pcsx2".into(),
                    default_core: None,
                    folder_names: vec!["ps2".into(), "playstation2".into(), "playstation 2".into()],
                },
                System {
                    id: "ps3".into(),
                    name: "Sony PlayStation 3".into(),
                    short_name: "PS3".into(),
                    manufacturer: "Sony".into(),
                    generation: Some(7),
                    release_year: Some(2006),
                    extensions: vec!["bin".into(), "iso".into()],
                    icon: "disc".into(),
                    default_emulator_id: "rpcs3".into(),
                    default_core: None,
                    folder_names: vec!["ps3".into(), "playstation3".into(), "playstation 3".into(), "ps3_games".into()],
                },
                System {
                    id: "megadrive".into(),
                    name: "Sega Mega Drive / Genesis".into(),
                    short_name: "Mega Drive".into(),
                    manufacturer: "Sega".into(),
                    generation: Some(4),
                    release_year: Some(1988),
                    extensions: vec!["md".into(), "gen".into(), "smd".into(), "bin".into(), "zip".into(), "7z".into()],
                    icon: "gamepad".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("genesis_plus_gx_libretro.dll".into()),
                    folder_names: vec!["megadrive".into(), "genesis".into(), "md".into(), "sega".into()],
                },
                System {
                    id: "dreamcast".into(),
                    name: "Sega Dreamcast".into(),
                    short_name: "Dreamcast".into(),
                    manufacturer: "Sega".into(),
                    generation: Some(6),
                    release_year: Some(1998),
                    extensions: vec!["cdi".into(), "gdi".into(), "chd".into(), "cue".into()],
                    icon: "disc".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("flycast_libretro.dll".into()),
                    folder_names: vec!["dreamcast".into(), "dc".into()],
                },
                System {
                    id: "arcade".into(),
                    name: "Arcade (MAME / FBNeo)".into(),
                    short_name: "Arcade".into(),
                    manufacturer: "Arcade".into(),
                    generation: None,
                    release_year: Some(1980),
                    extensions: vec!["zip".into(), "7z".into()],
                    icon: "joystick".into(),
                    default_emulator_id: "retroarch".into(),
                    default_core: Some("fbneo_libretro.dll".into()),
                    folder_names: vec!["arcade".into(), "mame".into(), "fbneo".into(), "neogeo".into()],
                },
                System {
                    id: "windows".into(),
                    name: "Windows PC Games".into(),
                    short_name: "PC Games".into(),
                    manufacturer: "Microsoft".into(),
                    generation: None,
                    release_year: None,
                    extensions: vec!["exe".into(), "lnk".into(), "url".into()],
                    icon: "monitor".into(),
                    default_emulator_id: "native".into(),
                    default_core: None,
                    folder_names: vec!["windows".into(), "pc".into(), "pcgames".into(), "games".into()],
                },
            ];

            for sys in default_systems {
                self.upsert_system(&sys)?;
            }
        }

        let emulators = self.get_emulators()?;
        if emulators.is_empty() {
            let default_emulators = vec![
                Emulator {
                    id: "retroarch".into(),
                    name: "RetroArch".into(),
                    exe_path: None,
                    default_args: "-L \"{core_path}\" \"{rom_path}\"".into(),
                    is_builtin: true,
                    website_url: Some("https://www.retroarch.com/".into()),
                },
                Emulator {
                    id: "ryujinx".into(),
                    name: "Ryujinx / Ryubing (Nintendo Switch)".into(),
                    exe_path: None,
                    default_args: "-f -g \"{rom_path}\"".into(),
                    is_builtin: true,
                    website_url: Some("https://ryujinx.org/".into()),
                },
                Emulator {
                    id: "pcsx2".into(),
                    name: "PCSX2 (PlayStation 2)".into(),
                    exe_path: None,
                    default_args: "--nogui -batch \"{rom_path}\"".into(),
                    is_builtin: true,
                    website_url: Some("https://pcsx2.net/".into()),
                },
                Emulator {
                    id: "dolphin".into(),
                    name: "Dolphin (GameCube / Wii)".into(),
                    exe_path: None,
                    default_args: "-b -e \"{rom_path}\"".into(),
                    is_builtin: true,
                    website_url: Some("https://dolphin-emu.org/".into()),
                },
                Emulator {
                    id: "rpcs3".into(),
                    name: "RPCS3 (PlayStation 3)".into(),
                    exe_path: None,
                    default_args: "--no-gui \"{rom_path}\"".into(),
                    is_builtin: true,
                    website_url: Some("https://rpcs3.net/".into()),
                },
                Emulator {
                    id: "native".into(),
                    name: "Windows Native Process".into(),
                    exe_path: None,
                    default_args: "\"{rom_path}\"".into(),
                    is_builtin: true,
                    website_url: None,
                },
            ];

            for emu in default_emulators {
                self.upsert_emulator(&emu)?;
            }
        }

        Ok(())
    }

    pub fn get_app_settings(&self) -> std::result::Result<AppSettings, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT value FROM app_settings WHERE key = 'general'")?;
        let mut rows = stmt.query_map([], |row| row.get::<_, String>(0))?;

        if let Some(res) = rows.next() {
            let json_str = res?;
            let settings: AppSettings = serde_json::from_str(&json_str)?;
            Ok(settings)
        } else {
            Ok(AppSettings::default())
        }
    }

    pub fn save_app_settings(&self, settings: &AppSettings) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        let json_str = serde_json::to_string(settings)?;
        conn.execute(
            "INSERT INTO app_settings (key, value) VALUES ('general', ?1)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value;",
            params![json_str],
        )?;
        Ok(())
    }

    pub fn upsert_system(&self, sys: &System) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        let exts_json = serde_json::to_string(&sys.extensions)?;
        let folders_json = serde_json::to_string(&sys.folder_names)?;

        conn.execute(
            "INSERT INTO systems (
                id, name, short_name, manufacturer, generation, release_year,
                extensions, icon, default_emulator_id, default_core, folder_names
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                short_name = excluded.short_name,
                manufacturer = excluded.manufacturer,
                generation = excluded.generation,
                release_year = excluded.release_year,
                extensions = excluded.extensions,
                icon = excluded.icon,
                default_emulator_id = excluded.default_emulator_id,
                default_core = excluded.default_core,
                folder_names = excluded.folder_names;",
            params![
                sys.id,
                sys.name,
                sys.short_name,
                sys.manufacturer,
                sys.generation,
                sys.release_year,
                exts_json,
                sys.icon,
                sys.default_emulator_id,
                sys.default_core,
                folders_json
            ],
        )?;
        Ok(())
    }

    pub fn get_systems(&self) -> std::result::Result<Vec<System>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, short_name, manufacturer, generation, release_year,
                    extensions, icon, default_emulator_id, default_core, folder_names
             FROM systems ORDER BY release_year ASC, name ASC",
        )?;

        let rows = stmt.query_map([], |row| {
            let exts_str: String = row.get(6)?;
            let folders_str: String = row.get(10)?;
            let extensions: Vec<String> = serde_json::from_str(&exts_str).unwrap_or_default();
            let folder_names: Vec<String> = serde_json::from_str(&folders_str).unwrap_or_default();

            Ok(System {
                id: row.get(0)?,
                name: row.get(1)?,
                short_name: row.get(2)?,
                manufacturer: row.get(3)?,
                generation: row.get(4)?,
                release_year: row.get(5)?,
                extensions,
                icon: row.get(7)?,
                default_emulator_id: row.get(8)?,
                default_core: row.get(9)?,
                folder_names,
            })
        })?;

        let mut systems = Vec::new();
        for r in rows {
            systems.push(r?);
        }
        Ok(systems)
    }

    pub fn get_system_by_id(&self, id: &str) -> std::result::Result<Option<System>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, short_name, manufacturer, generation, release_year,
                    extensions, icon, default_emulator_id, default_core, folder_names
             FROM systems WHERE id = ?1",
        )?;

        let mut rows = stmt.query_map(params![id], |row| {
            let exts_str: String = row.get(6)?;
            let folders_str: String = row.get(10)?;
            let extensions: Vec<String> = serde_json::from_str(&exts_str).unwrap_or_default();
            let folder_names: Vec<String> = serde_json::from_str(&folders_str).unwrap_or_default();

            Ok(System {
                id: row.get(0)?,
                name: row.get(1)?,
                short_name: row.get(2)?,
                manufacturer: row.get(3)?,
                generation: row.get(4)?,
                release_year: row.get(5)?,
                extensions,
                icon: row.get(7)?,
                default_emulator_id: row.get(8)?,
                default_core: row.get(9)?,
                folder_names,
            })
        })?;

        match rows.next() {
            Some(res) => Ok(Some(res?)),
            None => Ok(None),
        }
    }

    pub fn upsert_emulator(&self, emu: &Emulator) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO emulators (id, name, exe_path, default_args, is_builtin, website_url)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)
             ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                exe_path = excluded.exe_path,
                default_args = excluded.default_args,
                website_url = excluded.website_url;",
            params![
                emu.id,
                emu.name,
                emu.exe_path,
                emu.default_args,
                emu.is_builtin as i32,
                emu.website_url
            ],
        )?;
        Ok(())
    }

    pub fn get_emulators(&self) -> std::result::Result<Vec<Emulator>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, exe_path, default_args, is_builtin, website_url
             FROM emulators ORDER BY name ASC",
        )?;

        let rows = stmt.query_map([], |row| {
            let is_builtin_int: i32 = row.get(4)?;
            Ok(Emulator {
                id: row.get(0)?,
                name: row.get(1)?,
                exe_path: row.get(2)?,
                default_args: row.get(3)?,
                is_builtin: is_builtin_int != 0,
                website_url: row.get(5)?,
            })
        })?;

        let mut emulators = Vec::new();
        for r in rows {
            emulators.push(r?);
        }
        Ok(emulators)
    }

    pub fn get_emulator_by_id(&self, id: &str) -> std::result::Result<Option<Emulator>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, exe_path, default_args, is_builtin, website_url
             FROM emulators WHERE id = ?1",
        )?;

        let mut rows = stmt.query_map(params![id], |row| {
            let is_builtin_int: i32 = row.get(4)?;
            Ok(Emulator {
                id: row.get(0)?,
                name: row.get(1)?,
                exe_path: row.get(2)?,
                default_args: row.get(3)?,
                is_builtin: is_builtin_int != 0,
                website_url: row.get(5)?,
            })
        })?;

        match rows.next() {
            Some(res) => Ok(Some(res?)),
            None => Ok(None),
        }
    }

    pub fn update_emulator_path(&self, id: &str, exe_path: Option<&str>) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE emulators SET exe_path = ?1 WHERE id = ?2",
            params![exe_path, id],
        )?;
        Ok(())
    }

    pub fn insert_game(&self, game: &Game) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        let last_played_str = game.last_played.map(|dt| dt.to_rfc3339());
        let created_at_str = game.created_at.to_rfc3339();
        let updated_at_str = game.updated_at.to_rfc3339();

        conn.execute(
            "INSERT INTO games (
                id, system_id, title, original_title, file_path, file_name, file_size,
                file_hash, franchise, cover_url, backdrop_url, logo_url, release_date, publisher,
                developer, genre, players, rating, synopsis, favorite, hidden,
                play_count, play_time_seconds, last_played, created_at, updated_at
            ) VALUES (
                ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15,
                ?16, ?17, ?18, ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26
            )",
            params![
                game.id,
                game.system_id,
                game.title,
                game.original_title,
                game.file_path,
                game.file_name,
                game.file_size as i64,
                game.file_hash,
                game.franchise,
                game.cover_url,
                game.backdrop_url,
                game.logo_url,
                game.release_date,
                game.publisher,
                game.developer,
                game.genre,
                game.players,
                game.rating,
                game.synopsis,
                game.favorite as i32,
                game.hidden as i32,
                game.play_count as i64,
                game.play_time_seconds as i64,
                last_played_str,
                created_at_str,
                updated_at_str
            ],
        )?;
        Ok(())
    }

    pub fn update_game(&self, game: &Game) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        let last_played_str = game.last_played.map(|dt| dt.to_rfc3339());
        let updated_at_str = Utc::now().to_rfc3339();

        conn.execute(
            "UPDATE games SET
                system_id = ?1,
                title = ?2,
                original_title = ?3,
                file_path = ?4,
                file_name = ?5,
                file_size = ?6,
                file_hash = ?7,
                franchise = ?8,
                cover_url = ?9,
                backdrop_url = ?10,
                logo_url = ?11,
                release_date = ?12,
                publisher = ?13,
                developer = ?14,
                genre = ?15,
                players = ?16,
                rating = ?17,
                synopsis = ?18,
                favorite = ?19,
                hidden = ?20,
                play_count = ?21,
                play_time_seconds = ?22,
                last_played = ?23,
                updated_at = ?24
            WHERE id = ?25",
            params![
                game.system_id,
                game.title,
                game.original_title,
                game.file_path,
                game.file_name,
                game.file_size as i64,
                game.file_hash,
                game.franchise,
                game.cover_url,
                game.backdrop_url,
                game.logo_url,
                game.release_date,
                game.publisher,
                game.developer,
                game.genre,
                game.players,
                game.rating,
                game.synopsis,
                game.favorite as i32,
                game.hidden as i32,
                game.play_count as i64,
                game.play_time_seconds as i64,
                last_played_str,
                updated_at_str,
                game.id
            ],
        )?;
        Ok(())
    }

    pub fn get_game_by_id(&self, id: &str) -> std::result::Result<Option<Game>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, system_id, title, original_title, file_path, file_name, file_size,
                    file_hash, franchise, cover_url, backdrop_url, logo_url, release_date, publisher,
                    developer, genre, players, rating, synopsis, favorite, hidden,
                    play_count, play_time_seconds, last_played, created_at, updated_at
             FROM games WHERE id = ?1",
        )?;

        let mut rows = stmt.query_map(params![id], Self::map_game_row)?;
        match rows.next() {
            Some(res) => Ok(Some(res?)),
            None => Ok(None),
        }
    }

    pub fn get_game_by_path(&self, file_path: &str) -> std::result::Result<Option<Game>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, system_id, title, original_title, file_path, file_name, file_size,
                    file_hash, franchise, cover_url, backdrop_url, logo_url, release_date, publisher,
                    developer, genre, players, rating, synopsis, favorite, hidden,
                    play_count, play_time_seconds, last_played, created_at, updated_at
             FROM games WHERE file_path = ?1",
        )?;

        let mut rows = stmt.query_map(params![file_path], Self::map_game_row)?;
        match rows.next() {
            Some(res) => Ok(Some(res?)),
            None => Ok(None),
        }
    }

    pub fn get_games_by_system(&self, system_id: &str) -> std::result::Result<Vec<Game>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, system_id, title, original_title, file_path, file_name, file_size,
                    file_hash, franchise, cover_url, backdrop_url, logo_url, release_date, publisher,
                    developer, genre, players, rating, synopsis, favorite, hidden,
                    play_count, play_time_seconds, last_played, created_at, updated_at
             FROM games WHERE system_id = ?1 AND hidden = 0 ORDER BY title ASC",
        )?;

        let rows = stmt.query_map(params![system_id], Self::map_game_row)?;
        let mut games = Vec::new();
        for r in rows {
            games.push(r?);
        }
        Ok(games)
    }

    pub fn get_all_games(&self) -> std::result::Result<Vec<Game>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, system_id, title, original_title, file_path, file_name, file_size,
                    file_hash, franchise, cover_url, backdrop_url, logo_url, release_date, publisher,
                    developer, genre, players, rating, synopsis, favorite, hidden,
                    play_count, play_time_seconds, last_played, created_at, updated_at
             FROM games WHERE hidden = 0 ORDER BY title ASC",
        )?;

        let rows = stmt.query_map([], Self::map_game_row)?;
        let mut games = Vec::new();
        for r in rows {
            games.push(r?);
        }
        Ok(games)
    }

    pub fn get_favorite_games(&self) -> std::result::Result<Vec<Game>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, system_id, title, original_title, file_path, file_name, file_size,
                    file_hash, franchise, cover_url, backdrop_url, logo_url, release_date, publisher,
                    developer, genre, players, rating, synopsis, favorite, hidden,
                    play_count, play_time_seconds, last_played, created_at, updated_at
             FROM games WHERE favorite = 1 AND hidden = 0 ORDER BY title ASC",
        )?;

        let rows = stmt.query_map([], Self::map_game_row)?;
        let mut games = Vec::new();
        for r in rows {
            games.push(r?);
        }
        Ok(games)
    }

    pub fn get_recently_played_games(&self, limit: usize) -> std::result::Result<Vec<Game>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, system_id, title, original_title, file_path, file_name, file_size,
                    file_hash, franchise, cover_url, backdrop_url, logo_url, release_date, publisher,
                    developer, genre, players, rating, synopsis, favorite, hidden,
                    play_count, play_time_seconds, last_played, created_at, updated_at
             FROM games WHERE last_played IS NOT NULL AND hidden = 0
             ORDER BY last_played DESC LIMIT ?1",
        )?;

        let rows = stmt.query_map(params![limit as i64], Self::map_game_row)?;
        let mut games = Vec::new();
        for r in rows {
            games.push(r?);
        }
        Ok(games)
    }

    pub fn toggle_favorite(&self, game_id: &str) -> std::result::Result<bool, DbError> {
        let conn = self.conn.lock().unwrap();
        let current_fav: i32 = conn.query_row(
            "SELECT favorite FROM games WHERE id = ?1",
            params![game_id],
            |row| row.get(0),
        )?;

        let new_fav = if current_fav == 0 { 1 } else { 0 };
        conn.execute(
            "UPDATE games SET favorite = ?1 WHERE id = ?2",
            params![new_fav, game_id],
        )?;

        Ok(new_fav == 1)
    }

    pub fn delete_game(&self, game_id: &str) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM games WHERE id = ?1", params![game_id])?;
        Ok(())
    }

    pub fn record_play_session(
        &self,
        game_id: &str,
        duration_seconds: u64,
        start_time: DateTime<Utc>,
        end_time: DateTime<Utc>,
    ) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        let session_id = uuid::Uuid::new_v4().to_string();

        conn.execute(
            "INSERT INTO play_sessions (id, game_id, start_time, end_time, duration_seconds)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                session_id,
                game_id,
                start_time.to_rfc3339(),
                end_time.to_rfc3339(),
                duration_seconds as i64
            ],
        )?;

        conn.execute(
            "UPDATE games SET
                play_count = play_count + 1,
                play_time_seconds = play_time_seconds + ?1,
                last_played = ?2
             WHERE id = ?3",
            params![
                duration_seconds as i64,
                end_time.to_rfc3339(),
                game_id
            ],
        )?;

        Ok(())
    }

    pub fn get_game_config(&self, game_id: &str) -> std::result::Result<Option<GameConfig>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, game_id, emulator_id_override, custom_cli_args, custom_core,
                    screen_ratio, shader, auto_save_state
             FROM game_configs WHERE game_id = ?1",
        )?;

        let mut rows = stmt.query_map(params![game_id], |row| {
            let auto_save_int: i32 = row.get(7)?;
            Ok(GameConfig {
                id: row.get(0)?,
                game_id: row.get(1)?,
                emulator_id_override: row.get(2)?,
                custom_cli_args: row.get(3)?,
                custom_core: row.get(4)?,
                screen_ratio: row.get(5)?,
                shader: row.get(6)?,
                auto_save_state: auto_save_int != 0,
            })
        })?;

        match rows.next() {
            Some(res) => Ok(Some(res?)),
            None => Ok(None),
        }
    }

    pub fn upsert_game_config(&self, config: &GameConfig) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO game_configs (
                id, game_id, emulator_id_override, custom_cli_args, custom_core,
                screen_ratio, shader, auto_save_state
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            ON CONFLICT(game_id) DO UPDATE SET
                emulator_id_override = excluded.emulator_id_override,
                custom_cli_args = excluded.custom_cli_args,
                custom_core = excluded.custom_core,
                screen_ratio = excluded.screen_ratio,
                shader = excluded.shader,
                auto_save_state = excluded.auto_save_state;",
            params![
                config.id,
                config.game_id,
                config.emulator_id_override,
                config.custom_cli_args,
                config.custom_core,
                config.screen_ratio,
                config.shader,
                config.auto_save_state as i32
            ],
        )?;
        Ok(())
    }

    pub fn get_collections(&self) -> std::result::Result<Vec<Collection>, DbError> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, description, icon, is_system FROM collections ORDER BY name ASC",
        )?;

        let rows = stmt.query_map([], |row| {
            let is_sys_int: i32 = row.get(4)?;
            Ok(Collection {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                icon: row.get(3)?,
                is_system: is_sys_int != 0,
            })
        })?;

        let mut colls = Vec::new();
        for r in rows {
            colls.push(r?);
        }
        Ok(colls)
    }

    pub fn create_collection(&self, coll: &Collection) -> std::result::Result<(), DbError> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO collections (id, name, description, icon, is_system)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(name) DO UPDATE SET
                description = excluded.description,
                icon = excluded.icon;",
            params![
                coll.id,
                coll.name,
                coll.description,
                coll.icon,
                coll.is_system as i32
            ],
        )?;
        Ok(())
    }

    fn map_game_row(row: &rusqlite::Row) -> rusqlite::Result<Game> {
        let fav_int: i32 = row.get(19)?;
        let hidden_int: i32 = row.get(20)?;
        let play_count_int: i64 = row.get(21)?;
        let play_time_int: i64 = row.get(22)?;
        let last_played_str: Option<String> = row.get(23)?;
        let created_at_str: String = row.get(24)?;
        let updated_at_str: String = row.get(25)?;

        let last_played = last_played_str.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|dt| dt.with_timezone(&Utc)));
        let created_at = DateTime::parse_from_rfc3339(&created_at_str)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|_| Utc::now());
        let updated_at = DateTime::parse_from_rfc3339(&updated_at_str)
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(|_| Utc::now());

        Ok(Game {
            id: row.get(0)?,
            system_id: row.get(1)?,
            title: row.get(2)?,
            original_title: row.get(3)?,
            file_path: row.get(4)?,
            file_name: row.get(5)?,
            file_size: row.get::<_, i64>(6)? as u64,
            file_hash: row.get(7)?,
            franchise: row.get(8)?,
            cover_url: row.get(9)?,
            backdrop_url: row.get(10)?,
            logo_url: row.get(11)?,
            release_date: row.get(12)?,
            publisher: row.get(13)?,
            developer: row.get(14)?,
            genre: row.get(15)?,
            players: row.get(16)?,
            rating: row.get(17)?,
            synopsis: row.get(18)?,
            favorite: fav_int != 0,
            hidden: hidden_int != 0,
            play_count: play_count_int as u32,
            play_time_seconds: play_time_int as u64,
            last_played,
            created_at,
            updated_at,
        })
    }
}
