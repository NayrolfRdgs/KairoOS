use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};
use chrono::Utc;
use sha1::{Digest, Sha1};
use walkdir::WalkDir;

use crate::db::{Database, DbError};
use crate::models::{Game, GameConfig, LocalGameMetadata, ScanStats, System};

pub struct RomScanner {
    db: Database,
    calculate_hashes: bool,
}

impl RomScanner {
    pub fn new(db: Database) -> Self {
        Self {
            db,
            calculate_hashes: false,
        }
    }

    pub fn with_hash_calculation(mut self, calculate: bool) -> Self {
        self.calculate_hashes = calculate;
        self
    }

    pub fn scan_directory<P: AsRef<Path>>(&self, root_path: P) -> Result<ScanStats, DbError> {
        let root = root_path.as_ref();
        let mut stats = ScanStats::default();

        if !root.exists() {
            stats.errors.push(format!("Le dossier {} n'existe pas", root.display()));
            return Ok(stats);
        }

        let systems = self.db.get_systems()?;
        let mut systems_detected = std::collections::HashSet::new();
        let mut franchises_detected = std::collections::HashSet::new();

        for entry in WalkDir::new(root)
            .follow_links(true)
            .into_iter()
            .filter_map(|e| e.ok())
        {
            if !entry.file_type().is_file() {
                continue;
            }

            let path = entry.path();
            stats.total_files_scanned += 1;

            let file_name = match path.file_name().and_then(|n| n.to_str()) {
                Some(name) => {
                    if name.starts_with('.') || name.eq_ignore_ascii_case("desktop.ini") || name.eq_ignore_ascii_case("thumbs.db") {
                        continue;
                    }
                    name
                }
                None => continue,
            };

            let ext = path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("")
                .to_lowercase();

            if ext.is_empty() || ext == "json" || ext == "png" || ext == "jpg" || ext == "jpeg" || ext == "webp" || ext == "txt" {
                continue;
            }

            if let Some(system) = self.detect_system(path, &ext, &systems) {
                if ext == "bin" && file_name.to_lowercase().contains("track ") {
                    stats.games_skipped += 1;
                    continue;
                }

                systems_detected.insert(system.id.clone());

                let raw_title = Path::new(file_name)
                    .file_stem()
                    .and_then(|s| s.to_str())
                    .unwrap_or(file_name)
                    .to_string();

                let temp_clean = Self::clean_game_title(file_name);
                let safe_title = temp_clean.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");

                let mut actual_path = path.to_path_buf();
                
                if let Some(parent) = path.parent() {
                    let parent_name = parent.file_name().and_then(|n| n.to_str()).unwrap_or("");
                    if parent_name != safe_title && parent_name != raw_title {
                        let new_dir = parent.join(&safe_title);
                        let _ = fs::create_dir_all(&new_dir);
                        let new_path = new_dir.join(file_name);
                        if fs::rename(path, &new_path).is_ok() {
                            actual_path = new_path;
                        }
                    }
                }
                
                let path_to_use = actual_path.as_path();
                let file_path_str = path_to_use.to_string_lossy().to_string();
                let file_size = actual_path.metadata().map(|m| m.len()).unwrap_or(0);
                
                // 1. Lire les métadonnées locales adjacentes (.json / metadata.json / kairo.json)
                // Filtrer si le JSON appartient manifestement à une autre console (anti-collision)
                let local_meta = Self::read_adjacent_metadata(path_to_use).filter(|m| {
                    if let Some(ref sys_id) = m.system_id {
                        sys_id.eq_ignore_ascii_case(&system.id)
                    } else {
                        true
                    }
                });

                // 2. Détecter l'image jaquette locale adjacente (.png/.jpg / cover.png)
                let local_cover = Self::find_adjacent_cover(path_to_use);

                let clean_title = local_meta
                    .as_ref()
                    .map(|m| m.title.clone())
                    .unwrap_or_else(|| temp_clean);

                let franchise = local_meta
                    .as_ref()
                    .and_then(|m| m.franchise.clone())
                    .or_else(|| Self::detect_franchise_from_path_or_title(path, &clean_title));

                if let Some(ref f) = franchise {
                    franchises_detected.insert(f.clone());
                }

                let system_id = local_meta
                    .as_ref()
                    .and_then(|m| m.system_id.clone())
                    .unwrap_or_else(|| system.id.clone());

                let file_hash = if self.calculate_hashes {
                    Self::compute_file_sha1(path).ok()
                } else {
                    None
                };

                let existing = self.db.get_game_by_path(&file_path_str)?;

                match existing {
                    Some(mut existing_game) => {
                        let mut changed = false;
                        if existing_game.file_size != file_size {
                            existing_game.file_size = file_size;
                            changed = true;
                        }
                        if file_hash.is_some() && existing_game.file_hash != file_hash {
                            existing_game.file_hash = file_hash;
                            changed = true;
                        }
                        if franchise.is_some() && existing_game.franchise != franchise {
                            existing_game.franchise = franchise;
                            changed = true;
                        }
                        if local_cover.is_some() && existing_game.cover_url.as_ref() != local_cover.as_ref() {
                            existing_game.cover_url = local_cover;
                            changed = true;
                        }
                        if let Some(ref meta) = local_meta {
                            if meta.synopsis.is_some() && existing_game.synopsis != meta.synopsis {
                                existing_game.synopsis = meta.synopsis.clone();
                                changed = true;
                            }
                            if meta.genre.is_some() && existing_game.genre != meta.genre {
                                existing_game.genre = meta.genre.clone();
                                changed = true;
                            }
                            if meta.developer.is_some() && existing_game.developer != meta.developer {
                                existing_game.developer = meta.developer.clone();
                                changed = true;
                            }
                            if meta.release_date.is_some() && existing_game.release_date != meta.release_date {
                                existing_game.release_date = meta.release_date.clone();
                                changed = true;
                            }
                        }

                        if changed {
                            existing_game.updated_at = Utc::now();
                            self.db.update_game(&existing_game)?;
                            stats.games_updated += 1;
                        } else {
                            stats.games_skipped += 1;
                        }
                    }
                    None => {
                        let now = Utc::now();
                        let new_game = Game {
                            id: uuid::Uuid::new_v4().to_string(),
                            system_id,
                            title: clean_title,
                            original_title: Some(raw_title),
                            file_path: file_path_str,
                            file_name: file_name.to_string(),
                            file_size,
                            file_hash,
                            franchise,
                            cover_url: local_cover,
                            backdrop_url: None,
                            logo_url: None,
                            release_date: local_meta.as_ref().and_then(|m| m.release_date.clone()),
                            publisher: local_meta.as_ref().and_then(|m| m.publisher.clone()),
                            developer: local_meta.as_ref().and_then(|m| m.developer.clone()),
                            genre: local_meta.as_ref().and_then(|m| m.genre.clone()),
                            players: local_meta.as_ref().and_then(|m| m.players),
                            rating: local_meta.as_ref().and_then(|m| m.rating),
                            synopsis: local_meta.as_ref().and_then(|m| m.synopsis.clone()),
                            favorite: false,
                            hidden: false,
                            play_count: 0,
                            play_time_seconds: 0,
                            last_played: None,
                            created_at: now,
                            updated_at: now,
                        };

                        if let Some(parent) = path_to_use.parent() {
                            let _ = fs::create_dir_all(parent.join("media"));
                        }

                        self.db.insert_game(&new_game)?;
                        stats.games_added += 1;
                    }
                }
            } else {
                stats.games_skipped += 1;
            }
        }

        stats.systems_detected = systems_detected.into_iter().collect();
        stats.systems_detected.sort();

        stats.franchises_detected = franchises_detected.into_iter().collect();
        stats.franchises_detected.sort();

        Ok(stats)
    }

    /// Détecte la console par dossier OU par extension (support dossiers de franchise multi-consoles)
    pub fn detect_system<'a>(
        &self,
        file_path: &Path,
        ext: &str,
        systems: &'a [System],
    ) -> Option<&'a System> {
        let parent_dirs: Vec<String> = file_path
            .ancestors()
            .filter_map(|p| p.file_name().and_then(|n| n.to_str()))
            .map(|s| s.to_lowercase())
            .collect();

        // 1. Recherche par nom de dossier de console
        for sys in systems {
            for folder in &sys.folder_names {
                let folder_lower = folder.to_lowercase();
                if parent_dirs.iter().any(|p| p == &folder_lower) {
                    if sys.extensions.iter().any(|e| e.eq_ignore_ascii_case(ext)) {
                        return Some(sys);
                    }
                }
            }
        }

        // 2. Recherche par extension unique (idéal pour dossier de franchise multi-consoles ex: roms/Mario/mario.sfc)
        let matching_systems: Vec<&System> = systems
            .iter()
            .filter(|sys| sys.extensions.iter().any(|e| e.eq_ignore_ascii_case(ext)))
            .collect();

        if matching_systems.len() == 1 {
            return Some(matching_systems[0]);
        }

        if !matching_systems.is_empty() {
            for sys in &matching_systems {
                if parent_dirs.iter().any(|p| p.contains(&sys.id) || p.contains(&sys.short_name.to_lowercase())) {
                    return Some(sys);
                }
            }
            // Fallback sur le premier système compatible si ambiguïté (ex: zip/7z sur arcade)
            return Some(matching_systems[0]);
        }

        None
    }

    /// Lit un fichier JSON de métadonnées local adjacent à la ROM
    pub fn read_adjacent_metadata(rom_path: &Path) -> Option<LocalGameMetadata> {
        // Test 1: <rom_name>.json
        let json_path = rom_path.with_extension("json");
        if json_path.exists() {
            if let Ok(content) = fs::read_to_string(&json_path) {
                if let Ok(meta) = serde_json::from_str::<LocalGameMetadata>(&content) {
                    return Some(meta);
                }
            }
        }

        // Test 2: metadata.json ou kairo.json dans le même sous-dossier
        if let Some(parent) = rom_path.parent() {
            for filename in &["metadata.json", "kairo.json", "info.json"] {
                let folder_meta = parent.join(filename);
                if folder_meta.exists() {
                    if let Ok(content) = fs::read_to_string(&folder_meta) {
                        if let Ok(meta) = serde_json::from_str::<LocalGameMetadata>(&content) {
                            return Some(meta);
                        }
                    }
                }
            }
        }

        None
    }

    /// Détecte une jaquette locale adjacente (.png, .jpg, .webp ou cover.png)
    pub fn find_adjacent_cover(rom_path: &Path) -> Option<String> {
        let extensions = ["png", "jpg", "jpeg", "webp"];

        for ext in &extensions {
            let cover_path = rom_path.with_extension(ext);
            if cover_path.exists() {
                return Some(cover_path.to_string_lossy().to_string());
            }
        }

        if let Some(parent) = rom_path.parent() {
            let media_dir = parent.join("media");
            for ext in &extensions {
                for base in &["cover", "folder", "front", "boxart"] {
                    let cover_in_media = media_dir.join(format!("{}.{}", base, ext));
                    if cover_in_media.exists() {
                        return Some(cover_in_media.to_string_lossy().to_string());
                    }
                    let cover_in_folder = parent.join(format!("{}.{}", base, ext));
                    if cover_in_folder.exists() {
                        return Some(cover_in_folder.to_string_lossy().to_string());
                    }
                }
            }
        }

        None
    }

    /// Détecte la franchise depuis le dossier parent ou le titre du jeu
    pub fn detect_franchise_from_path_or_title(path: &Path, title: &str) -> Option<String> {
        let parent_name = path
            .parent()
            .and_then(|p| p.file_name())
            .and_then(|n| n.to_str())
            .unwrap_or("")
            .to_lowercase();

        let title_lower = title.to_lowercase();

        if parent_name.contains("mario") || title_lower.contains("mario") || title_lower.contains("luigi") || title_lower.contains("wario") || title_lower.contains("yoshi") {
            return Some("Super Mario".into());
        }
        if parent_name.contains("zelda") || title_lower.contains("zelda") || title_lower.contains("link") {
            return Some("The Legend of Zelda".into());
        }
        if parent_name.contains("pokemon") || parent_name.contains("pokémon") || title_lower.contains("pokemon") || title_lower.contains("pokémon") {
            return Some("Pokémon".into());
        }
        if parent_name.contains("sonic") || title_lower.contains("sonic") {
            return Some("Sonic The Hedgehog".into());
        }
        if title_lower.contains("street fighter") || title_lower.contains("tekken") || title_lower.contains("mortal kombat") {
            return Some("Jeux de Combat / Versus".into());
        }
        if title_lower.contains("final fantasy") || title_lower.contains("dragon quest") || title_lower.contains("chrono") {
            return Some("Grands RPGs".into());
        }

        None
    }

    /// Organise et déplace une ROM dans un sous-dossier structuré avec son JSON de métadonnées et sa config
    pub fn organize_game_into_franchise(
        &self,
        game_id: &str,
        franchise_name: &str,
        target_base_dir: &Path,
    ) -> Result<PathBuf, DbError> {
        let mut game = self
            .db
            .get_game_by_id(game_id)?
            .ok_or_else(|| DbError::NotFound(format!("Jeu ID {}", game_id)))?;

        let source_path = PathBuf::from(&game.file_path);
        if !source_path.exists() {
            return Err(DbError::NotFound(format!("Fichier ROM introuvable: {}", game.file_path)));
        }

        let franchise_safe_name = franchise_name.replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
        let game_folder_name = Self::clean_game_title(&game.file_name).replace(['/', '\\', ':', '*', '?', '"', '<', '>', '|'], "_");
        
        // Structure : roms/<Franchise>/<NomDuJeu>/
        let target_game_dir = target_base_dir.join(&franchise_safe_name).join(&game_folder_name);
        fs::create_dir_all(&target_game_dir).map_err(|e| DbError::Sqlite(rusqlite::Error::InvalidPath(e.to_string().into())))?;

        let new_rom_path = target_game_dir.join(&game.file_name);
        fs::copy(&source_path, &new_rom_path).map_err(|e| DbError::Sqlite(rusqlite::Error::InvalidPath(e.to_string().into())))?;

        // 1. Écrire le fichier metadata.json dans le sous-dossier
        let json_meta = LocalGameMetadata {
            title: game.title.clone(),
            franchise: Some(franchise_name.to_string()),
            system_id: Some(game.system_id.clone()),
            release_date: game.release_date.clone(),
            developer: game.developer.clone(),
            publisher: game.publisher.clone(),
            genre: game.genre.clone(),
            players: game.players,
            rating: game.rating,
            synopsis: game.synopsis.clone(),
            cover_file: Some("cover.png".into()),
            cover_url: game.cover_url.clone(),
            backdrop_url: game.backdrop_url.clone(),
            screenshots: None,
            video_url: None,
        };

        let meta_path = target_game_dir.join("metadata.json");
        let meta_json_str = serde_json::to_string_pretty(&json_meta)?;
        let _ = fs::write(&meta_path, meta_json_str);

        // 2. Écrire le fichier config.json dans le sous-dossier
        let cfg = self.db.get_game_config(game_id)?.unwrap_or_else(|| GameConfig {
            id: format!("cfg-{}", game.id),
            game_id: game.id.clone(),
            emulator_id_override: None,
            custom_cli_args: None,
            custom_core: None,
            screen_ratio: None,
            shader: None,
            auto_save_state: true,
            forced_fullscreen: None,
        });
        let config_path = target_game_dir.join("config.json");
        if let Ok(cfg_json_str) = serde_json::to_string_pretty(&cfg) {
            let _ = fs::write(&config_path, cfg_json_str);
        }

        // Mettre à jour en base SQLite
        game.file_path = new_rom_path.to_string_lossy().to_string();
        game.franchise = Some(franchise_name.to_string());
        self.db.update_game(&game)?;

        Ok(new_rom_path)
    }

    pub fn clean_game_title(file_name: &str) -> String {
        let stem = Path::new(file_name)
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or(file_name);

        let mut title = stem.to_string();

        while let Some(start) = title.find('[') {
            if let Some(end) = title[start..].find(']') {
                title.replace_range(start..start + end + 1, "");
            } else {
                break;
            }
        }

        let known_tags = [
            "usa", "europe", "japan", "world", "france", "germany", "spain", "italy",
            "en", "fr", "de", "es", "it", "ja", "rev", "v1.", "v2.", "beta", "proto",
            "unl", "promo", "demo", "sample", "alt", "track"
        ];

        while let Some(start) = title.find('(') {
            if let Some(end) = title[start..].find(')') {
                let tag_inside = &title[start + 1..start + end].to_lowercase();
                let is_known = known_tags.iter().any(|k| tag_inside.contains(k));
                
                if is_known || tag_inside.contains(',') || tag_inside.contains("disc") {
                    title.replace_range(start..start + end + 1, "");
                } else {
                    let after = start + end + 1;
                    if after >= title.len() {
                        break;
                    }
                    break;
                }
            } else {
                break;
            }
        }

        let cleaned = title
            .replace('_', " ")
            .split_whitespace()
            .collect::<Vec<&str>>()
            .join(" ");

        let trimmed = cleaned.trim_end_matches([' ', '-', '_', ',']).trim();
        if trimmed.is_empty() {
            stem.to_string()
        } else {
            trimmed.to_string()
        }
    }

    pub fn compute_file_sha1<P: AsRef<Path>>(path: P) -> std::io::Result<String> {
        let mut file = File::open(path)?;
        let mut hasher = Sha1::new();
        let mut buffer = [0; 65536];

        loop {
            let bytes_read = file.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }
            hasher.update(&buffer[..bytes_read]);
        }

        Ok(format!("{:x}", hasher.finalize()))
    }
}
