export interface Game {
  id: string;
  system_id: string;
  title: string;
  original_title?: string;
  file_path: string;
  file_name: string;
  file_size: number;
  file_hash?: string;
  franchise?: string;
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

export interface LocalGameMetadata {
  title: string;
  franchise?: string;
  system_id?: string;
  release_date?: string;
  developer?: string;
  publisher?: string;
  genre?: string;
  players?: number;
  rating?: number;
  synopsis?: string;
  cover_file?: string;
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
