export interface System {
  id: string;
  name: string;
  short_name: string;
  manufacturer: string;
  generation?: number;
  release_year?: number;
  extensions: string[];
  icon: string;
  default_emulator_id: string;
  default_core?: string;
  folder_names: string[];
}

export interface Emulator {
  id: string;
  name: string;
  exe_path?: string;
  default_args: string;
  is_builtin: boolean;
  website_url?: string;
}

export interface Game {
  id: string;
  system_id: string;
  title: string;
  original_title?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_hash?: string;
  cover_url?: string;
  backdrop_url?: string;
  logo_url?: string;
  release_date?: string;
  publisher?: string;
  developer?: string;
  genre?: string;
  players?: number;
  rating?: number;
  synopsis?: string;
  favorite: boolean;
  hidden: boolean;
  play_count: number;
  play_time_seconds: number;
  last_played?: string;
  created_at: string;
  updated_at: string;
}

export interface GameConfig {
  id: string;
  game_id: string;
  emulator_id_override?: string;
  custom_cli_args?: string;
  custom_core?: string;
  screen_ratio?: string;
  shader?: string;
  auto_save_state: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_system: boolean;
}

export interface ScanStats {
  total_files_scanned: number;
  games_added: number;
  games_updated: number;
  games_skipped: number;
  systems_detected: string[];
  errors: string[];
}

export interface LaunchStatus {
  is_running: boolean;
  current_game_id?: string;
  current_game_title?: string;
  current_system_id?: string;
  pid?: number;
  start_time?: string;
  elapsed_seconds?: number;
}
