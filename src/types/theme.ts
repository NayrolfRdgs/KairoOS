export interface ThemeColors {
  bg_primary: string;
  bg_secondary: string;
  bg_card: string;
  sidebar_bg: string;
  accent_primary: string;
  accent_secondary: string;
  text_primary: string;
  text_secondary: string;
  text_muted: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeFonts {
  primary: string;
  arcade: string;
  size_base: string;
}

export interface ThemeLayout {
  card_radius: string;
  sidebar_width: string;
  card_gap: string;
  card_aspect?: 'poster' | 'square' | 'landscape';
  card_glow?: 'none' | 'subtle' | 'neon';
  scanlines?: 'none' | 'light' | 'retro' | 'intense';
  card_shadow?: 'flat' | 'soft' | 'arcade' | 'glow';
  card_scale?: 'none' | 'subtle' | 'dynamic';
}

export interface ThemeAssets {
  background_image?: string | null;
  logo_override?: string | null;
  startup_sound?: string | null;
}

export interface Theme {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  layout: ThemeLayout;
  assets: ThemeAssets;
  preview_url?: string;
  is_active?: boolean;
}

export interface CommunityThemeItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url?: string;
  type: string;
}