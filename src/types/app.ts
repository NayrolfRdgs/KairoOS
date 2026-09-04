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
  arcade_ui_scale?: 'normal' | 'large' | 'xl';
  // RetroBat Advanced Settings
  retroarch_shader?: 'none' | 'scanlines_light' | 'scanlines_strong' | 'crt_curved';
  aspect_ratio?: '4:3' | '16:9' | 'pixel_perfect' | 'stretch';
  brightness?: number;
  contrast?: number;
  metadata_language?: 'fr' | 'en';
  launch_resolution?: 'native' | '720p' | '1080p' | '4k';
  forced_fullscreen?: 'always' | 'never' | 'per_game';
  autosave_enabled?: boolean;
  rewind_enabled?: boolean;
  cheats_dir?: string;
  saves_dir?: string;
  screenshots_dir?: string;
  scraping_delay_seconds?: number;
  screenscraper_ssid?: string;
  screenscraper_sspassword?: string;
  // Jalon 5 - Thèmes et Paramètres Enrichis
  hide_mouse_cursor?: boolean;
  ui_resolution?: 'auto' | '720p' | '1080p' | '4k';
  ui_language?: 'fr' | 'en';
  cores_dir?: string;
  startup_sound_enabled?: boolean;
  ui_navigation_player?: number;
  stick_sensitivity?: number;
  navigation_repeat_rate_ms?: number;
  auto_scan_on_startup?: boolean;
  default_view?: 'grid' | 'list';
  show_games_without_cover?: boolean;
  recent_games_limit?: number;
  media_download_types?: string[];
  auto_scrape_after_scan?: boolean;
  remote_autostart?: boolean;
  extra_cli_args?: string;
  debug_logs?: boolean;
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
