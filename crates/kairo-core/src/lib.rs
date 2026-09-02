pub mod db;
pub mod launcher;
pub mod models;
pub mod scanner;

pub use db::{Database, DbError};
pub use launcher::{Launcher, LauncherError};
pub use models::*;
pub use scanner::RomScanner;

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::{self, File};
    use std::io::Write;
    use tempfile::tempdir;

    #[test]
    fn test_db_init_and_seed() {
        let db = Database::open_in_memory().expect("Échec ouverture DB en mémoire");
        let systems = db.get_systems().expect("Échec récupération systèmes");
        assert!(!systems.is_empty(), "Les systèmes par défaut doivent être injectés");

        let snes = db.get_system_by_id("snes").expect("Erreur query").expect("SNES non trouvée");
        assert_eq!(snes.name, "Super Nintendo Entertainment System");
        assert!(snes.extensions.contains(&"sfc".to_string()));

        let emulators = db.get_emulators().expect("Échec récupération émulateurs");
        assert!(!emulators.is_empty(), "Les émulateurs par défaut doivent être injectés");

        let retroarch = db.get_emulator_by_id("retroarch").expect("Erreur").expect("RetroArch non trouvé");
        assert_eq!(retroarch.name, "RetroArch");
    }

    #[test]
    fn test_game_crud_and_sessions() {
        let db = Database::open_in_memory().expect("Échec DB");
        let now = chrono::Utc::now();
        let game = Game {
            id: "game-1".into(),
            system_id: "snes".into(),
            title: "Super Mario World".into(),
            original_title: Some("Super Mario World (USA)".into()),
            file_path: "C:\\Roms\\snes\\Super Mario World.sfc".into(),
            file_name: "Super Mario World.sfc".into(),
            file_size: 1048576,
            file_hash: Some("abcdef123456".into()),
            cover_url: None,
            backdrop_url: None,
            logo_url: None,
            release_date: Some("1990-11-21".into()),
            publisher: Some("Nintendo".into()),
            developer: Some("Nintendo EAD".into()),
            genre: Some("Platformer".into()),
            players: Some(2),
            rating: Some(4.9),
            synopsis: Some("Mario et Yoshi sauvent Dinosaur Land.".into()),
            favorite: false,
            hidden: false,
            play_count: 0,
            play_time_seconds: 0,
            last_played: None,
            created_at: now,
            updated_at: now,
        };

        db.insert_game(&game).expect("Échec insertion jeu");

        let fetched = db.get_game_by_id("game-1").expect("Erreur").expect("Jeu non trouvé");
        assert_eq!(fetched.title, "Super Mario World");
        assert_eq!(fetched.favorite, false);

        let is_fav = db.toggle_favorite("game-1").expect("Échec toggle");
        assert_eq!(is_fav, true);

        let favs = db.get_favorite_games().expect("Échec get favs");
        assert_eq!(favs.len(), 1);
        assert_eq!(favs[0].id, "game-1");

        let start = now;
        let end = now + chrono::Duration::seconds(120);
        db.record_play_session("game-1", 120, start, end).expect("Échec record session");

        let updated_game = db.get_game_by_id("game-1").expect("Erreur").unwrap();
        assert_eq!(updated_game.play_count, 1);
        assert_eq!(updated_game.play_time_seconds, 120);
        assert!(updated_game.last_played.is_some());
    }

    #[test]
    fn test_title_cleaning() {
        assert_eq!(
            RomScanner::clean_game_title("Super Mario World (USA) [!].sfc"),
            "Super Mario World"
        );
        assert_eq!(
            RomScanner::clean_game_title("Legend of Zelda, The - A Link to the Past (Europe) (En,Fr,De) (Rev 1).zip"),
            "Legend of Zelda, The - A Link to the Past"
        );
        assert_eq!(
            RomScanner::clean_game_title("Pokemon - Emerald Version (USA, Europe).gba"),
            "Pokemon - Emerald Version"
        );
        assert_eq!(
            RomScanner::clean_game_title("Tekken 3 [Track 1] (USA).bin"),
            "Tekken 3"
        );
    }

    #[test]
    fn test_scanner_with_temp_folder() {
        let db = Database::open_in_memory().expect("Échec DB");
        let scanner = RomScanner::new(db.clone());

        let temp = tempdir().expect("Échec création temp dir");
        let snes_folder = temp.path().join("snes");
        fs::create_dir_all(&snes_folder).expect("Échec mkdir");

        let rom_file = snes_folder.join("Chrono Trigger (USA).sfc");
        let mut f = File::create(&rom_file).expect("Échec create file");
        f.write_all(b"ROM DUMMY DATA FOR TESTING").expect("Échec write");

        let stats = scanner.scan_directory(temp.path()).expect("Échec scan");
        assert_eq!(stats.games_added, 1);
        assert!(stats.systems_detected.contains(&"snes".to_string()));

        let games = db.get_games_by_system("snes").expect("Échec get games");
        assert_eq!(games.len(), 1);
        assert_eq!(games[0].title, "Chrono Trigger");
    }

    #[test]
    fn test_cli_tokenization_and_formatting() {
        let template = "-L \"{core_path}\" -f \"{rom_path}\" --title \"{title}\"";
        let formatted = Launcher::format_cli_arguments(
            template,
            "C:\\Roms\\snes\\Super Mario World.sfc",
            "Super Mario World",
            "C:\\RetroArch\\cores\\snes9x_libretro.dll",
        );

        let tokens = Launcher::tokenize_arguments(&formatted);
        assert_eq!(tokens[0], "-L");
        assert_eq!(tokens[1], "C:\\RetroArch\\cores\\snes9x_libretro.dll");
        assert_eq!(tokens[2], "-f");
        assert_eq!(tokens[3], "C:\\Roms\\snes\\Super Mario World.sfc");
        assert_eq!(tokens[4], "--title");
        assert_eq!(tokens[5], "Super Mario World");
    }
}
