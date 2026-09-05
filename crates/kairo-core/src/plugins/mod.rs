use std::collections::HashMap;
use std::io::{BufRead, BufReader, Write};
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::paths::AppPaths;
use crate::db::Database;
use crate::launcher::Launcher;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum PluginType {
    Builtin,
    Official,
    Community,
}

impl Default for PluginType {
    fn default() -> Self {
        PluginType::Community
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginSettingField {
    #[serde(rename = "type")]
    pub field_type: String, // "string" | "number" | "boolean"
    pub label: String,
    pub default: Value,
    #[serde(default)]
    pub secret: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginManifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    #[serde(default, rename = "type")]
    pub plugin_type: PluginType,
    pub description: String,
    #[serde(default)]
    pub min_kairo_version: Option<String>,
    #[serde(default)]
    pub permissions: Vec<String>,
    #[serde(default)]
    pub entry: Option<String>,
    #[serde(default)]
    pub ui: Option<String>,
    #[serde(default)]
    pub commands: Vec<String>,
    #[serde(default)]
    pub settings_schema: HashMap<String, PluginSettingField>,
    #[serde(default)]
    pub sandbox: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginConfigRecord {
    pub enabled: bool,
    #[serde(default)]
    pub settings: HashMap<String, Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginInfo {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: String,
    pub plugin_type: PluginType,
    pub description: String,
    pub enabled: bool,
    pub running: bool,
    pub permissions: Vec<String>,
    pub commands: Vec<String>,
    pub ui: Option<String>,
    pub has_settings: bool,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PluginDetail {
    pub manifest: PluginManifest,
    pub enabled: bool,
    pub running: bool,
    pub settings: HashMap<String, Value>,
    pub path: String,
}

struct RunningProcess {
    child: Child,
    stdin: std::process::ChildStdin,
}

/// Gestionnaire centralisé des plugins KaïroOS
#[derive(Clone)]
pub struct PluginManager {
    db: Option<Database>,
    launcher: Option<Launcher>,
    processes: Arc<Mutex<HashMap<String, RunningProcess>>>,
    builtin_running: Arc<Mutex<HashMap<String, bool>>>,
}

impl PluginManager {
    pub fn new(db: Option<Database>, launcher: Option<Launcher>) -> Self {
        Self {
            db,
            launcher,
            processes: Arc::new(Mutex::new(HashMap::new())),
            builtin_running: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Chemin vers le fichier `config/plugins.json`
    pub fn get_config_file_path() -> PathBuf {
        AppPaths::get_config_dir().join("plugins.json")
    }

    /// Charge la configuration de persistance des plugins
    pub fn load_plugins_config() -> HashMap<String, PluginConfigRecord> {
        let path = Self::get_config_file_path();
        if path.exists() {
            if let Ok(content) = std::fs::read_to_string(&path) {
                if let Ok(records) = serde_json::from_str::<HashMap<String, PluginConfigRecord>>(&content) {
                    return records;
                }
            }
        }

        // Configuration initiale par défaut
        let mut defaults = HashMap::new();
        defaults.insert(
            "kairo-remote".to_string(),
            PluginConfigRecord {
                enabled: true,
                settings: {
                    let mut s = HashMap::new();
                    s.insert("port".into(), Value::from(8080));
                    s.insert("pin".into(), Value::from("1234"));
                    s.insert("enabled".into(), Value::from(true));
                    s
                },
            },
        );
        let _ = Self::save_plugins_config(&defaults);
        defaults
    }

    /// Sauvegarde la configuration de persistance
    pub fn save_plugins_config(config: &HashMap<String, PluginConfigRecord>) -> Result<(), String> {
        let path = Self::get_config_file_path();
        let json_str = serde_json::to_string_pretty(config).map_err(|e| e.to_string())?;
        std::fs::write(&path, json_str).map_err(|e| e.to_string())?;
        Ok(())
    }

    /// Trouve tous les manifests de plugins installés
    pub fn discover_manifests() -> Vec<(PluginManifest, PathBuf)> {
        let mut results = Vec::new();
        let mut seen_ids = std::collections::HashSet::new();

        for search_dir in AppPaths::get_plugins_search_dirs() {
            if let Ok(entries) = std::fs::read_dir(&search_dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.is_dir() {
                        let manifest_path = path.join("plugin.json");
                        if manifest_path.exists() {
                            if let Ok(content) = std::fs::read_to_string(&manifest_path) {
                                if let Ok(manifest) = serde_json::from_str::<PluginManifest>(&content) {
                                    if !seen_ids.contains(&manifest.id) {
                                        seen_ids.insert(manifest.id.clone());
                                        results.push((manifest, path));
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        results
    }

    /// Liste tous les plugins avec leur statut
    pub fn list_plugins(&self) -> Vec<PluginInfo> {
        let manifests = Self::discover_manifests();
        let config = Self::load_plugins_config();
        let processes = self.processes.lock().unwrap();
        let builtin = self.builtin_running.lock().unwrap();

        manifests
            .into_iter()
            .map(|(manifest, path)| {
                let rec = config.get(&manifest.id);
                let enabled = rec.map(|r| r.enabled).unwrap_or(true);
                let is_running = if manifest.plugin_type == PluginType::Builtin {
                    *builtin.get(&manifest.id).unwrap_or(&enabled)
                } else {
                    processes.contains_key(&manifest.id)
                };

                PluginInfo {
                    id: manifest.id.clone(),
                    name: manifest.name,
                    version: manifest.version,
                    author: manifest.author,
                    plugin_type: manifest.plugin_type,
                    description: manifest.description,
                    enabled,
                    running: is_running,
                    permissions: manifest.permissions,
                    commands: manifest.commands,
                    ui: manifest.ui,
                    has_settings: !manifest.settings_schema.is_empty(),
                    path: path.to_string_lossy().to_string(),
                }
            })
            .collect()
    }

    /// Récupère les détails d'un plugin
    pub fn get_plugin(&self, id: &str) -> Option<PluginDetail> {
        let manifests = Self::discover_manifests();
        let (manifest, path) = manifests.into_iter().find(|(m, _)| m.id == id)?;
        let config = Self::load_plugins_config();
        let rec = config.get(id);

        let enabled = rec.map(|r| r.enabled).unwrap_or(true);
        let settings = rec.map(|r| r.settings.clone()).unwrap_or_else(|| {
            manifest
                .settings_schema
                .iter()
                .map(|(k, v)| (k.clone(), v.default.clone()))
                .collect()
        });

        let is_running = if manifest.plugin_type == PluginType::Builtin {
            *self.builtin_running.lock().unwrap().get(id).unwrap_or(&enabled)
        } else {
            self.processes.lock().unwrap().contains_key(id)
        };

        Some(PluginDetail {
            manifest,
            enabled,
            running: is_running,
            settings,
            path: path.to_string_lossy().to_string(),
        })
    }

    /// Démarre un plugin
    pub fn start_plugin(&self, id: &str) -> Result<(), String> {
        let manifests = Self::discover_manifests();
        let (manifest, path) = manifests
            .into_iter()
            .find(|(m, _)| m.id == id)
            .ok_or_else(|| format!("Plugin '{}' introuvable", id))?;

        // 1. Cas du plugin Builtin (ex: kairo-remote)
        if manifest.plugin_type == PluginType::Builtin {
            if manifest.id == "kairo-remote" {
                if let (Some(db), Some(launcher)) = (&self.db, &self.launcher) {
                    crate::remote::start_remote_server(db.clone(), launcher.clone());
                }
            }
            self.builtin_running.lock().unwrap().insert(id.to_string(), true);
            println!("✅ [PluginManager] Plugin builtin '{}' démarré.", id);
            return Ok(());
        }

        // 2. Cas d'un processus externe supervisé
        let entry_rel = match &manifest.entry {
            Some(e) if !e.trim().is_empty() => e.trim(),
            _ => return Ok(()), // Plugin purement déclaratif ou UI
        };

        let entry_path = path.join(entry_rel);
        if !entry_path.exists() {
            return Err(format!("Point d'entrée introuvable: {}", entry_path.display()));
        }

        let mut cmd = if entry_rel.ends_with(".js") {
            let mut c = Command::new("node");
            c.arg(&entry_path);
            c
        } else if entry_rel.ends_with(".py") {
            let mut c = Command::new("python");
            c.arg(&entry_path);
            c
        } else {
            Command::new(&entry_path)
        };

        cmd.current_dir(&path);
        cmd.stdin(Stdio::piped());
        cmd.stdout(Stdio::piped());
        cmd.stderr(Stdio::inherit());

        let mut child = cmd.spawn().map_err(|e| format!("Échec du lancement du plugin {}: {}", id, e))?;
        let stdin = child.stdin.take().ok_or("Impossible d'attacher stdin au plugin")?;
        let stdout = child.stdout.take().ok_or("Impossible d'attacher stdout au plugin")?;

        // Enregistre le processus supervisé
        self.processes.lock().unwrap().insert(
            id.to_string(),
            RunningProcess { child, stdin },
        );

        // Thread de lecture des messages JSON stdout émis par le plugin (IPC)
        let plugin_id = id.to_string();
        let permissions = manifest.permissions.clone();
        let launcher_opt = self.launcher.clone();

        std::thread::spawn(move || {
            let reader = BufReader::new(stdout);
            for line in reader.lines().flatten() {
                let trimmed = line.trim();
                if trimmed.is_empty() {
                    continue;
                }

                if let Ok(val) = serde_json::from_str::<Value>(trimmed) {
                    if let Some(action) = val.get("action").and_then(|a| a.as_str()) {
                        match action {
                            "launch_game" => {
                                if !permissions.contains(&"launch_games".to_string()) {
                                    eprintln!(
                                        "⚠️ [PluginManager] Refus: le plugin '{}' a tenté 'launch_game' sans permission 'launch_games'",
                                        plugin_id
                                    );
                                    continue;
                                }
                                if let Some(game_id) = val.get("game_id").and_then(|g| g.as_str()) {
                                    if let Some(launcher) = &launcher_opt {
                                        let _ = launcher.launch_game_by_id(game_id);
                                    }
                                }
                            }
                            "notify" => {
                                if !permissions.contains(&"notifications".to_string()) {
                                    eprintln!(
                                        "⚠️ [PluginManager] Refus: le plugin '{}' a tenté 'notify' sans permission 'notifications'",
                                        plugin_id
                                    );
                                    continue;
                                }
                                println!("📢 [Plugin Notification - {}] {:?}", plugin_id, val.get("message"));
                            }
                            _ => {}
                        }
                    }
                }
            }
        });

        println!("✅ [PluginManager] Plugin '{}' lancé avec succès (processus enfant).", id);
        Ok(())
    }

    /// Stoppe un plugin en cours d'exécution
    pub fn stop_plugin(&self, id: &str) -> Result<(), String> {
        let mut processes = self.processes.lock().unwrap();
        if let Some(mut proc) = processes.remove(id) {
            let _ = proc.child.kill();
            println!("🛑 [PluginManager] Processus enfant du plugin '{}' terminé.", id);
        }

        let mut builtin = self.builtin_running.lock().unwrap();
        builtin.insert(id.to_string(), false);
        println!("🛑 [PluginManager] Plugin '{}' arrêté.", id);
        Ok(())
    }

    /// Redémarre un plugin
    pub fn restart_plugin(&self, id: &str) -> Result<(), String> {
        self.stop_plugin(id)?;
        std::thread::sleep(std::time::Duration::from_millis(150));
        self.start_plugin(id)?;
        Ok(())
    }

    /// Active un plugin et enregistre son activation
    pub fn enable_plugin(&self, id: &str) -> Result<(), String> {
        let mut config = Self::load_plugins_config();
        let entry = config.entry(id.to_string()).or_insert_with(|| PluginConfigRecord {
            enabled: true,
            settings: HashMap::new(),
        });
        entry.enabled = true;
        Self::save_plugins_config(&config)?;
        self.start_plugin(id)?;
        Ok(())
    }

    /// Désactive un plugin et enregistre son état inactif
    pub fn disable_plugin(&self, id: &str) -> Result<(), String> {
        let mut config = Self::load_plugins_config();
        if let Some(entry) = config.get_mut(id) {
            entry.enabled = false;
        } else {
            config.insert(
                id.to_string(),
                PluginConfigRecord {
                    enabled: false,
                    settings: HashMap::new(),
                },
            );
        }
        Self::save_plugins_config(&config)?;
        self.stop_plugin(id)?;
        Ok(())
    }

    /// Met à jour les paramètres de configuration d'un plugin
    pub fn update_plugin_settings(&self, id: &str, new_settings: HashMap<String, Value>) -> Result<(), String> {
        let mut config = Self::load_plugins_config();
        let entry = config.entry(id.to_string()).or_insert_with(|| PluginConfigRecord {
            enabled: true,
            settings: HashMap::new(),
        });
        entry.settings = new_settings;
        Self::save_plugins_config(&config)?;
        // Redémarre si actuellement en cours
        let _ = self.restart_plugin(id);
        Ok(())
    }

    /// Désinstalle un plugin (supprime son dossier et ses données)
    pub fn uninstall_plugin(&self, id: &str) -> Result<(), String> {
        let manifests = Self::discover_manifests();
        let (manifest, path) = manifests
            .into_iter()
            .find(|(m, _)| m.id == id)
            .ok_or_else(|| format!("Plugin '{}' introuvable", id))?;

        if manifest.plugin_type == PluginType::Builtin {
            return Err("Impossible de désinstaller un plugin système builtin.".into());
        }

        // 1. Arrêter le plugin
        let _ = self.stop_plugin(id);

        // 2. Supprimer de la config
        let mut config = Self::load_plugins_config();
        config.remove(id);
        let _ = Self::save_plugins_config(&config);

        // 3. Supprimer le dossier sur le disque
        std::fs::remove_dir_all(&path).map_err(|e| format!("Échec de suppression du dossier: {}", e))?;
        println!("🗑️ [PluginManager] Plugin '{}' désinstallé avec succès.", id);
        Ok(())
    }

    /// Exécute une commande exposée par un plugin
    pub fn run_plugin_command(&self, id: &str, command: &str) -> Result<String, String> {
        match command {
            "start" => {
                self.start_plugin(id)?;
                Ok("Plugin démarré avec succès".into())
            }
            "stop" => {
                self.stop_plugin(id)?;
                Ok("Plugin arrêté avec succès".into())
            }
            "restart" => {
                self.restart_plugin(id)?;
                Ok("Plugin redémarré avec succès".into())
            }
            "status" => {
                let detail = self.get_plugin(id).ok_or_else(|| format!("Plugin '{}' introuvable", id))?;
                let status_str = if detail.running { "Actif (running)" } else { "Arrêté (stopped)" };
                Ok(status_str.into())
            }
            custom => {
                // Envoie la commande au processus supervisé via stdin JSON
                let mut processes = self.processes.lock().unwrap();
                if let Some(proc) = processes.get_mut(id) {
                    let msg = serde_json::json!({ "command": custom });
                    let msg_str = format!("{}\n", msg);
                    proc.stdin.write_all(msg_str.as_bytes()).map_err(|e| e.to_string())?;
                    proc.stdin.flush().map_err(|e| e.to_string())?;
                    Ok(format!("Commande '{}' transmise au plugin", custom))
                } else {
                    Err(format!("Le plugin '{}' n'est pas en cours d'exécution", id))
                }
            }
        }
    }

    /// Extrait un ZIP de plugin dans un dossier temporaire et lit son manifest
    pub fn stage_plugin_zip(zip_path: &str) -> Result<PluginManifest, String> {
        let zip = std::path::Path::new(zip_path);
        if !zip.exists() {
            return Err(format!("Fichier ZIP introuvable: {}", zip_path));
        }
        let plugins_dir = AppPaths::get_plugins_dir();
        let staging_dir = plugins_dir.join("_temp_staging");
        let _ = std::fs::remove_dir_all(&staging_dir);
        let _ = std::fs::create_dir_all(&staging_dir);

        #[cfg(windows)]
        {
            let cmd = format!("Expand-Archive -Path '{}' -DestinationPath '{}' -Force", zip_path, staging_dir.display());
            let status = std::process::Command::new("powershell")
                .args(["-Command", &cmd])
                .status()
                .map_err(|e| e.to_string())?;
            if !status.success() {
                return Err("Échec de l'extraction de l'archive du plugin".into());
            }
        }

        for entry in walkdir::WalkDir::new(&staging_dir).into_iter().flatten() {
            if entry.file_name() == "plugin.json" {
                let content = std::fs::read_to_string(entry.path()).map_err(|e| e.to_string())?;
                let manifest: PluginManifest = serde_json::from_str(&content).map_err(|e| e.to_string())?;
                return Ok(manifest);
            }
        }

        Err("Aucun fichier plugin.json trouvé dans l'archive".into())
    }

    /// Confirme l'installation du plugin depuis le dossier temporaire
    pub fn confirm_install(&self, plugin_id: &str) -> Result<(), String> {
        let plugins_dir = AppPaths::get_plugins_dir();
        let staging_dir = plugins_dir.join("_temp_staging");
        let target_dir = plugins_dir.join(plugin_id);

        let mut found_dir = None;
        for entry in walkdir::WalkDir::new(&staging_dir).into_iter().flatten() {
            if entry.file_name() == "plugin.json" {
                found_dir = entry.path().parent().map(|p| p.to_path_buf());
                break;
            }
        }

        let src = found_dir.ok_or_else(|| "Fichiers de plugin non trouvés en staging".to_string())?;
        let _ = std::fs::remove_dir_all(&target_dir);
        AppPaths::copy_dir_recursive(&src, &target_dir).map_err(|e| e.to_string())?;
        let _ = std::fs::remove_dir_all(&staging_dir);

        self.enable_plugin(plugin_id)?;
        Ok(())
    }

    /// Initialise et démarre automatiquement tous les plugins configurés comme actifs
    pub fn auto_start_enabled_plugins(&self) {
        let config = Self::load_plugins_config();
        let manifests = Self::discover_manifests();

        for (manifest, _) in manifests {
            let is_enabled = config.get(&manifest.id).map(|r| r.enabled).unwrap_or(true);
            if is_enabled {
                if let Err(e) = self.start_plugin(&manifest.id) {
                    eprintln!("⚠️ [PluginManager] Erreur au démarrage de '{}': {}", manifest.id, e);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_manifest_parsing() {
        let raw = r#"{
            "id": "test-plugin",
            "name": "Test Plugin",
            "version": "1.0.0",
            "author": "Tester",
            "type": "community",
            "description": "Un plugin de test",
            "permissions": ["read_games", "network"],
            "entry": "index.js",
            "commands": ["start", "stop", "ping"],
            "settings_schema": {
                "port": {
                    "type": "number",
                    "label": "Port réseau",
                    "default": 9000
                }
            },
            "sandbox": true
        }"#;

        let manifest: PluginManifest = serde_json::from_str(raw).expect("Parsing valid plugin.json");
        assert_eq!(manifest.id, "test-plugin");
        assert_eq!(manifest.plugin_type, PluginType::Community);
        assert_eq!(manifest.permissions.len(), 2);
        assert!(manifest.permissions.contains(&"read_games".to_string()));
        assert_eq!(manifest.settings_schema.len(), 1);
        assert_eq!(manifest.commands, vec!["start", "stop", "ping"]);
    }

    #[test]
    fn test_builtin_config_records() {
        let mut map = HashMap::new();
        map.insert(
            "kairo-remote".to_string(),
            PluginConfigRecord {
                enabled: true,
                settings: HashMap::new(),
            },
        );

        let json = serde_json::to_string(&map).unwrap();
        let parsed: HashMap<String, PluginConfigRecord> = serde_json::from_str(&json).unwrap();
        assert!(parsed.get("kairo-remote").unwrap().enabled);
    }
}
