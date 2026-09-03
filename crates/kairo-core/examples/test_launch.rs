use std::path::PathBuf;
use kairo_core::{Database, Launcher};

fn main() {
    println!("=== TEST DU LAUNCHER KAIRO-CORE ===");
    let appdata = std::env::var("APPDATA").unwrap();
    let db_path = PathBuf::from(&appdata).join("com.kairo.os").join("kairo.db");
    println!("DB Path: {:?}", db_path);

    let db = Database::open(&db_path).expect("Impossible d'ouvrir la DB");
    let games = db.get_all_games().expect("get_all_games");
    println!("Nombre de jeux en base: {}", games.len());
    for g in &games {
        println!("- ID: {}, Titre: {}, Système: {}, ROM: {}", g.id, g.title, g.system_id, g.file_path);
    }

    if let Some(game) = games.first() {
        println!("\nTest de build_command pour le jeu '{}'...", game.title);
        let launcher = Launcher::new(db.clone());
        let system = db.get_system_by_id(&game.system_id).unwrap().unwrap();
        let config = db.get_game_config(&game.id).unwrap();
        let emulator_id = config
            .as_ref()
            .and_then(|c| c.emulator_id_override.as_ref())
            .unwrap_or(&system.default_emulator_id);
        let emulator = db.get_emulator_by_id(emulator_id).unwrap().unwrap();

        match launcher.build_command(game, &system, &emulator, config.as_ref()) {
            Ok(cmd) => {
                println!("COMMANDE CONSTRUITE AVEC SUCCES :");
                println!("{:?}", cmd);
                println!("\nLancement du processus...");
                let status = launcher.launch_game_by_id(&game.id);
                match status {
                    Ok(st) => {
                        println!("SUCCES: Jeu lance ! Status: {:?}", st);
                        std::thread::sleep(std::time::Duration::from_secs(4));
                        let current_st = launcher.get_status();
                        println!("Status apres 4s: {:?}", current_st);
                    }
                    Err(e) => println!("ERREUR DE LANCEMENT: {:?}", e),
                }
            }
            Err(e) => {
                println!("ERREUR BUILD_COMMAND: {:?}", e);
            }
        }
    }
}
