use std::path::Path;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex, RwLock};
use std::thread;
use chrono::Utc;
use thiserror::Error;

use crate::db::{Database, DbError};
use crate::models::{Emulator, Game, GameConfig, LaunchStatus, System};

#[derive(Error, Debug)]
pub enum LauncherError {
    #[error("Erreur de base de données: {0}")]
    Db(#[from] DbError),
    #[error("Émulateur non configuré ou introuvable: {0}")]
    EmulatorNotFound(String),
    #[error("Exécutable introuvable au chemin: {0}")]
    ExecutableNotFound(String),
    #[error("Fichier ROM/Jeu introuvable: {0}")]
    RomNotFound(String),
    #[error("Un jeu est déjà en cours d'exécution (PID: {0})")]
    AlreadyRunning(u32),
    #[error("Erreur système d'exécution (I/O): {0}")]
    Io(#[from] std::io::Error),
    #[error("Erreur de formatage des arguments CLI: {0}")]
    ArgFormat(String),
}

#[derive(Clone)]
pub struct Launcher {
    db: Database,
    status: Arc<RwLock<LaunchStatus>>,
    current_child: Arc<Mutex<Option<Child>>>,
}

impl Launcher {
    pub fn new(db: Database) -> Self {
        Self {
            db,
            status: Arc::new(RwLock::new(LaunchStatus::default())),
            current_child: Arc::new(Mutex::new(None)),
        }
    }

    pub fn get_status(&self) -> LaunchStatus {
        let status = self.status.read().unwrap();
        let mut copy = status.clone();

        if copy.is_running {
            if let Some(start) = copy.start_time {
                let elapsed = Utc::now().signed_duration_since(start).num_seconds();
                if elapsed >= 0 {
                    copy.elapsed_seconds = Some(elapsed as u64);
                }
            }
        }

        copy
    }

    pub fn build_command(
        &self,
        game: &Game,
        system: &System,
        emulator: &Emulator,
        config: Option<&GameConfig>,
    ) -> Result<Command, LauncherError> {
        let rom_path = Path::new(&game.file_path);
        if !rom_path.exists() {
            return Err(LauncherError::RomNotFound(game.file_path.clone()));
        }

        let is_native = emulator.id == "native" || system.id == "windows";

        let (exe_str, args_template) = if is_native {
            let exe = game.file_path.clone();
            let args = config
                .and_then(|c| c.custom_cli_args.clone())
                .unwrap_or_default();
            (exe, args)
        } else {
            let exe = match &emulator.exe_path {
                Some(p) if !p.trim().is_empty() => p.clone(),
                _ => return Err(LauncherError::ExecutableNotFound(emulator.name.clone())),
            };

            let args = config
                .and_then(|c| c.custom_cli_args.clone())
                .unwrap_or_else(|| emulator.default_args.clone());

            (exe, args)
        };

        let mut cmd = Command::new(&exe_str);

        if is_native {
            if let Some(parent) = rom_path.parent() {
                cmd.current_dir(parent);
            }
        } else if let Some(parent) = Path::new(&exe_str).parent() {
            cmd.current_dir(parent);
        }

        let core_name = config
            .and_then(|c| c.custom_core.clone())
            .or_else(|| system.default_core.clone())
            .unwrap_or_default();

        let core_path = if let Some(emu_dir) = Path::new(&exe_str).parent() {
            emu_dir.join("cores").join(&core_name).to_string_lossy().to_string()
        } else {
            core_name.clone()
        };

        let processed_args = Self::format_cli_arguments(
            &args_template,
            &game.file_path,
            &game.title,
            &core_path,
        );

        let parsed_tokens = Self::tokenize_arguments(&processed_args);
        for arg in parsed_tokens {
            cmd.arg(arg);
        }

        cmd.stdin(Stdio::null());
        Ok(cmd)
    }

    pub fn launch_game_by_id(&self, game_id: &str) -> Result<LaunchStatus, LauncherError> {
        {
            let status = self.status.read().unwrap();
            if status.is_running {
                if let Some(pid) = status.pid {
                    return Err(LauncherError::AlreadyRunning(pid));
                }
            }
        }

        let game = self
            .db
            .get_game_by_id(game_id)?
            .ok_or_else(|| LauncherError::RomNotFound(format!("Jeu ID {}", game_id)))?;

        let system = self
            .db
            .get_system_by_id(&game.system_id)?
            .ok_or_else(|| LauncherError::EmulatorNotFound(format!("Système {}", game.system_id)))?;

        let config = self.db.get_game_config(game_id)?;

        let emulator_id = config
            .as_ref()
            .and_then(|c| c.emulator_id_override.as_ref())
            .unwrap_or(&system.default_emulator_id);

        let emulator = self
            .db
            .get_emulator_by_id(emulator_id)?
            .ok_or_else(|| LauncherError::EmulatorNotFound(emulator_id.clone()))?;

        let mut cmd = self.build_command(&game, &system, &emulator, config.as_ref())?;

        let start_time = Utc::now();
        let child = cmd.spawn()?;
        let pid = child.id();

        {
            let mut status = self.status.write().unwrap();
            status.is_running = true;
            status.current_game_id = Some(game.id.clone());
            status.current_game_title = Some(game.title.clone());
            status.current_system_id = Some(system.id.clone());
            status.pid = Some(pid);
            status.start_time = Some(start_time);
            status.elapsed_seconds = Some(0);
        }

        let status_arc = Arc::clone(&self.status);
        let current_child_arc = Arc::clone(&self.current_child);
        let db_clone = self.db.clone();
        let game_id_owned = game.id.clone();

        {
            let mut current = current_child_arc.lock().unwrap();
            *current = Some(child);
        }

        thread::spawn(move || {
            let _wait_res = {
                let mut guard = current_child_arc.lock().unwrap();
                if let Some(mut child) = guard.take() {
                    child.wait()
                } else {
                    return;
                }
            };

            let end_time = Utc::now();
            let duration = end_time.signed_duration_since(start_time).num_seconds().max(0) as u64;

            let _ = db_clone.record_play_session(&game_id_owned, duration, start_time, end_time);

            {
                let mut status = status_arc.write().unwrap();
                status.is_running = false;
                status.current_game_id = None;
                status.current_game_title = None;
                status.current_system_id = None;
                status.pid = None;
                status.start_time = None;
                status.elapsed_seconds = None;
            }
        });

        Ok(self.get_status())
    }

    pub fn kill_current_game(&self) -> Result<(), LauncherError> {
        let mut guard = self.current_child.lock().unwrap();
        if let Some(child) = guard.as_mut() {
            let _ = child.kill();
        }

        let mut status = self.status.write().unwrap();
        status.is_running = false;
        status.current_game_id = None;
        status.current_game_title = None;
        status.current_system_id = None;
        status.pid = None;
        status.start_time = None;
        status.elapsed_seconds = None;

        Ok(())
    }

    pub fn format_cli_arguments(
        template: &str,
        rom_path: &str,
        rom_title: &str,
        core_path: &str,
    ) -> String {
        let parent_dir = Path::new(rom_path)
            .parent()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_default();

        template
            .replace("{rom_path}", rom_path)
            .replace("{rom}", rom_path)
            .replace("%ROM%", rom_path)
            .replace("{core_path}", core_path)
            .replace("{core}", core_path)
            .replace("%CORE%", core_path)
            .replace("{title}", rom_title)
            .replace("{game_dir}", &parent_dir)
    }

    pub fn tokenize_arguments(raw_args: &str) -> Vec<String> {
        let mut tokens = Vec::new();
        let mut current_token = String::new();
        let mut in_quotes = false;
        let mut quote_char = ' ';

        for c in raw_args.chars() {
            match c {
                '"' | '\'' if !in_quotes => {
                    in_quotes = true;
                    quote_char = c;
                }
                c if in_quotes && c == quote_char => {
                    in_quotes = false;
                }
                ' ' | '\t' if !in_quotes => {
                    if !current_token.is_empty() {
                        tokens.push(current_token);
                        current_token = String::new();
                    }
                }
                _ => {
                    current_token.push(c);
                }
            }
        }

        if !current_token.is_empty() {
            tokens.push(current_token);
        }

        tokens
    }
}
