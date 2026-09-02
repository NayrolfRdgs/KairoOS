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

export interface CustomFranchise {
  id: string;
  name: string;
  color: string;
  keywords: string[];
  is_enabled: boolean;
}

export interface AppSettings {
  fullscreen: boolean;
  always_on_top: boolean;
  kiosk_mode: boolean;
  enabled_franchises: string[];
  custom_franchises: CustomFranchise[];
  roms_path?: string;
  theme: string;
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
  franchises_detected: string[];
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

export interface GamepadMapping {
  player_index: number; // 0 to 9
  device_name: string;
  device_id: string;
  controller_type: 'arcade_stick' | 'standard' | 'retro_snes' | 'retro_sega' | 'wheel';
  btn_up?: string;
  btn_down?: string;
  btn_left?: string;
  btn_right?: string;
  btn_a?: string; // Button 1
  btn_b?: string; // Button 2
  btn_x?: string; // Button 3
  btn_y?: string; // Button 4
  btn_l1?: string; // Button 5
  btn_r1?: string; // Button 6
  btn_l2?: string; // Button 7
  btn_r2?: string; // Button 8
  btn_select?: string; // Coin / Crédit 🪙
  btn_start?: string; // 1P / 2P Start 🕹️
  btn_hotkey?: string; // Quitter / Hotkey
  deadzone: number;
}

