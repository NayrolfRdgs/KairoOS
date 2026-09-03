use std::path::{Path, PathBuf};
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

    pub fn resolve_emulator_exe(
        emulator_id: &str,
        configured_path: Option<&str>,
    ) -> Result<PathBuf, LauncherError> {
        let exe_dir = std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|p| p.to_path_buf()))
            .unwrap_or_else(|| PathBuf::from("."));

        let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));

        // 1. Si un chemin est explicitement configuré et existe
        if let Some(p_str) = configured_path {
            if !p_str.trim().is_empty() {
                let p = PathBuf::from(p_str);
                if p.exists() {
                    return Ok(p);
                }
                let relative_to_current = current_dir.join(&p);
                if relative_to_current.exists() {
                    return Ok(relative_to_current);
                }
                let relative_to_exe = exe_dir.join(&p);
                if relative_to_exe.exists() {
                    return Ok(relative_to_exe);
                }
            }
        }

        let appdata_dir = std::env::var("APPDATA")
            .ok()
            .map(|a| PathBuf::from(a).join("com.kairo.os"));

        // 2. Détection automatique selon le nom de l'émulateur (multiples dossiers et casses)
        let candidates: Vec<PathBuf> = match emulator_id {
            "retroarch" => {
                let mut v = vec![
                    PathBuf::from("emulators/RetroArch/retroarch.exe"),
                    PathBuf::from("emulators/retroarch/retroarch.exe"),
                    PathBuf::from("dist-portable/emulators/RetroArch/retroarch.exe"),
                    PathBuf::from("dist-portable/emulators/retroarch/retroarch.exe"),
                    PathBuf::from("../emulators/RetroArch/retroarch.exe"),
                    PathBuf::from("../../emulators/RetroArch/retroarch.exe"),
                    exe_dir.join("emulators/RetroArch/retroarch.exe"),
                    exe_dir.join("emulators/retroarch/retroarch.exe"),
                    current_dir.join("emulators/RetroArch/retroarch.exe"),
                    current_dir.join("emulators/retroarch/retroarch.exe"),
                    PathBuf::from("C:\\Users\\propo\\Music\\Kairo\\emulators\\RetroArch\\retroarch.exe"),
                    PathBuf::from("C:\\Emulators\\RetroArch\\retroarch.exe"),
                ];
                if let Some(ref ad) = appdata_dir {
                    v.push(ad.join("emulators/RetroArch/retroarch.exe"));
                    v.push(ad.join("emulators/retroarch/retroarch.exe"));
                }
                v
            }
            "pcsx2" => {
                let mut v = vec![
                    PathBuf::from("emulators/PCSX2/pcsx2-qt.exe"),
                    PathBuf::from("emulators/PCSX2/pcsx2.exe"),
                    PathBuf::from("dist-portable/emulators/PCSX2/pcsx2-qt.exe"),
                    PathBuf::from("../emulators/PCSX2/pcsx2-qt.exe"),
                    exe_dir.join("emulators/PCSX2/pcsx2-qt.exe"),
                    exe_dir.join("emulators/PCSX2/pcsx2.exe"),
                    current_dir.join("emulators/PCSX2/pcsx2-qt.exe"),
                    current_dir.join("emulators/PCSX2/pcsx2.exe"),
                    PathBuf::from("C:\\Emulators\\PCSX2\\pcsx2-qt.exe"),
                ];
                if let Some(ref ad) = appdata_dir {
                    v.push(ad.join("emulators/PCSX2/pcsx2-qt.exe"));
                }
                v
            }
            "dolphin" => {
                let mut v = vec![
                    PathBuf::from("emulators/Dolphin/Dolphin.exe"),
                    PathBuf::from("dist-portable/emulators/Dolphin/Dolphin.exe"),
                    PathBuf::from("../emulators/Dolphin/Dolphin.exe"),
                    exe_dir.join("emulators/Dolphin/Dolphin.exe"),
                    current_dir.join("emulators/Dolphin/Dolphin.exe"),
                    PathBuf::from("C:\\Emulators\\Dolphin\\Dolphin.exe"),
                ];
                if let Some(ref ad) = appdata_dir {
                    v.push(ad.join("emulators/Dolphin/Dolphin.exe"));
                }
                v
            }
            "ryujinx" => {
                let mut v = vec![
                    PathBuf::from("emulators/Ryujinx/Ryujinx.exe"),
                    PathBuf::from("emulators/Ryujinx/Ryubing.exe"),
                    PathBuf::from("dist-portable/emulators/Ryujinx/Ryujinx.exe"),
                    PathBuf::from("../emulators/Ryujinx/Ryujinx.exe"),
                    exe_dir.join("emulators/Ryujinx/Ryujinx.exe"),
                    exe_dir.join("emulators/Ryujinx/Ryubing.exe"),
                    current_dir.join("emulators/Ryujinx/Ryujinx.exe"),
                    current_dir.join("emulators/Ryujinx/Ryubing.exe"),
                    PathBuf::from("C:\\Users\\propo\\Music\\Kairo\\emulators\\Ryujinx\\Ryujinx.exe"),
                    PathBuf::from("C:\\Emulators\\Ryujinx\\Ryujinx.exe"),
                ];
                if let Some(ref ad) = appdata_dir {
                    v.push(ad.join("emulators/Ryujinx/Ryujinx.exe"));
                }
                v
            }
            "rpcs3" => {
                let mut v = vec![
                    PathBuf::from("emulators/RPCS3/rpcs3.exe"),
                    PathBuf::from("dist-portable/emulators/RPCS3/rpcs3.exe"),
                    PathBuf::from("../emulators/RPCS3/rpcs3.exe"),
                    exe_dir.join("emulators/RPCS3/rpcs3.exe"),
                    current_dir.join("emulators/RPCS3/rpcs3.exe"),
                    PathBuf::from("C:\\Emulators\\RPCS3\\rpcs3.exe"),
                ];
                if let Some(ref ad) = appdata_dir {
                    v.push(ad.join("emulators/RPCS3/rpcs3.exe"));
                }
                v
            }
            _ => vec![],
        };

        for candidate in candidates {
            if candidate.exists() {
                return Ok(candidate);
            }
        }

        Err(LauncherError::ExecutableNotFound(format!(
            "Émulateur '{}' introuvable (vérifiez que le dossier emulators/ contient l'exécutable)",
            emulator_id
        )))
    }

    pub fn build_command(
        &self,
        game: &Game,
        system: &System,
        emulator: &Emulator,
        config: Option<&GameConfig>,
    ) -> Result<Command, LauncherError> {
        // Résoudre le chemin de la ROM : absolu, ou relatif à current_dir / exe_dir
        let rom_path_raw = Path::new(&game.file_path);
        let rom_path: std::borrow::Cow<Path> = if rom_path_raw.is_absolute() {
            std::borrow::Cow::Borrowed(rom_path_raw)
        } else {
            let current_dir = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
            let candidate_cwd = current_dir.join(rom_path_raw);
            if candidate_cwd.exists() {
                std::borrow::Cow::Owned(candidate_cwd)
            } else {
                let exe_dir = std::env::current_exe()
                    .ok()
                    .and_then(|p| p.parent().map(|p| p.to_path_buf()))
                    .unwrap_or_else(|| PathBuf::from("."));
                let candidate_exe = exe_dir.join(rom_path_raw);
                if candidate_exe.exists() {
                    std::borrow::Cow::Owned(candidate_exe)
                } else {
                    std::borrow::Cow::Borrowed(rom_path_raw)
                }
            }
        };

        if !rom_path.exists() {
            return Err(LauncherError::RomNotFound(game.file_path.clone()));
        }

        let is_native = emulator.id == "native" || system.id == "windows";

        let (exe_path_buf, args_template) = if is_native {
            let exe = PathBuf::from(&game.file_path);
            let args = config
                .and_then(|c| c.custom_cli_args.clone())
                .unwrap_or_default();
            (exe, args)
        } else {
            let exe = Self::resolve_emulator_exe(&emulator.id, emulator.exe_path.as_deref())?;
            let args = config
                .and_then(|c| c.custom_cli_args.clone())
                .unwrap_or_else(|| emulator.default_args.clone());
            (exe, args)
        };

        let mut cmd = Command::new(&exe_path_buf);

        if is_native {
            if let Some(parent) = rom_path.parent() {
                cmd.current_dir(parent);
            }
        } else if let Some(parent) = exe_path_buf.parent() {
            cmd.current_dir(parent);
        }

        // Résolution du core RetroArch
        let core_name = config
            .and_then(|c| c.custom_core.clone())
            .or_else(|| system.default_core.clone())
            .unwrap_or_default();

        let core_path = if !core_name.is_empty() {
            let mut resolved = core_name.clone();
            if let Some(emu_parent) = exe_path_buf.parent() {
                let candidate1 = emu_parent.join("cores").join(&core_name);
                if candidate1.exists() {
                    resolved = candidate1.to_string_lossy().to_string();
                } else {
                    let candidate2 = emu_parent.join(&core_name);
                    if candidate2.exists() {
                        resolved = candidate2.to_string_lossy().to_string();
                    }
                }
            }
            resolved
        } else {
            String::new()
        };

        // Formater le chemin de la ROM en chemin propre (sans préfixe UNC \\?\ si Windows)
        let clean_rom_path = if let Ok(canonical) = std::fs::canonicalize(rom_path) {
            let s = canonical.to_string_lossy().to_string();
            if let Some(stripped) = s.strip_prefix(r"\\?\") {
                stripped.to_string()
            } else {
                s
            }
        } else {
            game.file_path.clone()
        };

        let processed_args = Self::format_cli_arguments(
            &args_template,
            &clean_rom_path,
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
