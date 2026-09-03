export type ThemeMode = 'dark' | 'light';

export interface StatusResponse {
  is_running: boolean;
  current_game_id?: string;
  current_game_title?: string;
  current_system_id?: string;
  current_game_cover?: string;
  elapsed_seconds?: number;
  kiosk_mode: boolean;
  port: number;
  local_ip: string;
  version: string;
}

export interface SystemInfoResponse {
  local_ip: string;
  port: number;
  version: string;
  install_dir: string;
  kiosk_mode: boolean;
  total_games: number;
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

export interface RemoteConfig {
  enabled: boolean;
  port: number;
  pin: string;
  allowed_origins: string[];
}

export interface AppSettings {
  fullscreen: boolean;
  always_on_top: boolean;
  kiosk_mode: boolean;
  enabled_franchises: string[];
  custom_franchises: any[];
  roms_path?: string;
  theme: string;
}
