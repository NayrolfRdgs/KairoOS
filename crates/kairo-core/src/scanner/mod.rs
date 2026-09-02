use std::fs::File;
use std::io::Read;
use std::path::Path;
use chrono::Utc;
use sha1::{Digest, Sha1};
use walkdir::WalkDir;

use crate::db::{Database, DbError};
use crate::models::{Game, ScanStats, System};

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

            if ext.is_empty() {
                continue;
            }

            if let Some(system) = self.detect_system(path, &ext, &systems) {
                if ext == "bin" && file_name.to_lowercase().contains("track ") {
                    stats.games_skipped += 1;
                    continue;
                }

                systems_detected.insert(system.id.clone());

                let file_path_str = path.to_string_lossy().to_string();
                let file_size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                let clean_title = Self::clean_game_title(file_name);
                let raw_title = Path::new(file_name)
                    .file_stem()
                    .and_then(|s| s.to_str())
                    .unwrap_or(file_name)
                    .to_string();

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
                            system_id: system.id.clone(),
                            title: clean_title,
                            original_title: Some(raw_title),
                            file_path: file_path_str,
                            file_name: file_name.to_string(),
                            file_size,
                            file_hash,
                            cover_url: None,
                            backdrop_url: None,
                            logo_url: None,
                            release_date: None,
                            publisher: None,
                            developer: None,
                            genre: None,
                            players: None,
                            rating: None,
                            synopsis: None,
                            favorite: false,
                            hidden: false,
                            play_count: 0,
                            play_time_seconds: 0,
                            last_played: None,
                            created_at: now,
                            updated_at: now,
                        };

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

        Ok(stats)
    }

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
        }

        None
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
