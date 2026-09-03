export type AppMode = 'admin' | 'kiosk';

export type GameSelectAction = 'launch' | 'details';

export interface AppSettings {
  fullscreen: boolean;
  always_on_top: boolean;
  kiosk_mode: boolean;
  game_select_action?: GameSelectAction;
  enabled_franchises: string[];
  custom_franchises: import('./system').CustomFranchise[];
  roms_path?: string;
  theme: string;
  enabled_systems?: string[];
  enabled_modes?: string[];
  default_sort?: import('../utils/sort').SortOption;
  auto_kiosk?: boolean;
}

export interface RemoteConfig {
  enabled: boolean;
  port: number;
  pin: string;
  allowed_origins: string[];
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
