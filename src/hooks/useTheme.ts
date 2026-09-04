import { useState, useEffect, useCallback, useRef } from 'react';
import { Theme } from '../types';
import { getThemes, setTheme as apiSetTheme } from '../api';

const BUILTIN_THEMES: Theme[] = [
  {
    id: 'arcade-light',
    name: 'Kaïro Clair (Original)',
    author: 'KaïroOS Team',
    version: '1.0.0',
    description: 'Thème clair épuré original avec blanc pur et accents framboise & violet',
    colors: {
      bg_primary: '#f8f7ff',
      bg_secondary: '#f3e8ff',
      bg_card: '#ffffff',
      sidebar_bg: '#ffffff',
      accent_primary: '#e11d48',
      accent_secondary: '#7c3aed',
      text_primary: '#0f172a',
      text_secondary: '#475569',
      text_muted: '#94a3b8',
      border: '#ede9fe',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
    fonts: {
      primary: 'Inter',
      arcade: 'Press Start 2P',
      size_base: '14px',
    },
    layout: {
      card_radius: '16px',
      sidebar_width: '280px',
      card_gap: '16px',
    },
    assets: {
      background_image: null,
      logo_override: null,
      startup_sound: null,
    },
    is_active: true,
  },
  {
    id: 'neon-dark',
    name: 'Kaïro Sombre (OLED)',
    author: 'KaïroOS Team',
    version: '1.0.0',
    description: "Thème sombre profond idéal pour bornes d'arcade et écrans OLED",
    colors: {
      bg_primary: '#0b0f19',
      bg_secondary: '#111827',
      bg_card: '#1e293b',
      sidebar_bg: '#0f172a',
      accent_primary: '#f43f5e',
      accent_secondary: '#38bdf8',
      text_primary: '#f8fafc',
      text_secondary: '#94a1b2',
      text_muted: '#64748b',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
    fonts: {
      primary: 'Inter',
      arcade: 'Press Start 2P',
      size_base: '14px',
    },
    layout: {
      card_radius: '16px',
      sidebar_width: '280px',
      card_gap: '16px',
    },
    assets: {
      background_image: null,
      logo_override: null,
      startup_sound: null,
    },
    is_active: false,
  },
  {
    id: 'cyber-purple',
    name: 'Cyber Violet Rétro',
    author: 'KaïroOS Team',
    version: '1.0.0',
    description: 'Ambiance arcade synthwave violette profonde et néons roses',
    colors: {
      bg_primary: '#13091f',
      bg_secondary: '#1d0e30',
      bg_card: '#26133f',
      sidebar_bg: '#180c28',
      accent_primary: '#ec4899',
      accent_secondary: '#a855f7',
      text_primary: '#faf5ff',
      text_secondary: '#d8b4fe',
      text_muted: '#9333ea',
      border: '#3b1d61',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f43f5e',
    },
    fonts: {
      primary: 'Inter',
      arcade: 'Press Start 2P',
      size_base: '14px',
    },
    layout: {
      card_radius: '16px',
      sidebar_width: '280px',
      card_gap: '16px',
    },
    assets: {
      background_image: null,
      logo_override: null,
      startup_sound: null,
    },
    is_active: false,
  },
];

const DEFAULT_THEME = BUILTIN_THEMES[0];

export function useTheme() {
  const [themes, setThemes] = useState<Theme[]>(BUILTIN_THEMES);
  const [activeTheme, setActiveTheme] = useState<Theme>(DEFAULT_THEME);
  const [previewThemeItem, setPreviewThemeItem] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(false);
  const appliedThemeRef = useRef<Theme>(DEFAULT_THEME);

  const injectThemeVariables = useCallback((theme: Theme) => {
    const root = document.documentElement;
    const { colors, fonts, layout, assets } = theme;

    if (colors) {
      root.style.setProperty('--bg-primary', colors.bg_primary);
      root.style.setProperty('--bg-secondary', colors.bg_secondary);
      root.style.setProperty('--bg-card', colors.bg_card);
      root.style.setProperty('--sidebar-bg', colors.sidebar_bg);
      root.style.setProperty('--accent-primary', colors.accent_primary);
      root.style.setProperty('--accent-secondary', colors.accent_secondary);
      root.style.setProperty('--text-primary', colors.text_primary);
      root.style.setProperty('--text-secondary', colors.text_secondary);
      root.style.setProperty('--text-muted', colors.text_muted);
      root.style.setProperty('--border-color', colors.border);
      root.style.setProperty('--color-success', colors.success);
      root.style.setProperty('--color-warning', colors.warning);
      root.style.setProperty('--color-danger', colors.danger);
    }

    if (fonts) {
      root.style.setProperty('--font-primary', fonts.primary);
      root.style.setProperty('--font-arcade', fonts.arcade);
      root.style.setProperty('--font-size-base', fonts.size_base);
    }

    if (layout) {
      root.style.setProperty('--card-radius', layout.card_radius);
      root.style.setProperty('--sidebar-width', layout.sidebar_width);
      root.style.setProperty('--card-gap', layout.card_gap);
    }

    if (assets?.background_image) {
      root.style.setProperty('--theme-bg-image', `url("${assets.background_image}")`);
    } else {
      root.style.removeProperty('--theme-bg-image');
    }
  }, []);

  // Chargement initial des thèmes
  const reloadThemes = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getThemes();
      if (list && list.length > 0) {
        setThemes(list);
        const active = list.find((t) => t.is_active) || list[0];
        setActiveTheme(active);
        appliedThemeRef.current = active;
        injectThemeVariables(active);
      }
    } catch (err) {
      console.warn('[useTheme] Impossible de charger les thèmes:', err);
      injectThemeVariables(DEFAULT_THEME);
    } finally {
      setLoading(false);
    }
  }, [injectThemeVariables]);

  useEffect(() => {
    reloadThemes();
  }, [reloadThemes]);

  // Aperçu instantané sans sauvegarde
  const preview = useCallback((theme: Theme) => {
    setPreviewThemeItem(theme);
    injectThemeVariables(theme);
  }, [injectThemeVariables]);

  // Annuler l'aperçu et rétablir le thème sauvegardé
  const cancelPreview = useCallback(() => {
    setPreviewThemeItem(null);
    injectThemeVariables(appliedThemeRef.current);
  }, [injectThemeVariables]);

  // Appliquer et sauvegarder définitivement
  const applyTheme = useCallback(async (themeId: string): Promise<Theme> => {
    try {
      let updated: Theme;
      try {
        updated = await apiSetTheme(themeId);
      } catch (ipcErr) {
        console.warn('[useTheme] apiSetTheme IPC error, fallbacking to local theme list:', ipcErr);
        const found = themes.find((t) => t.id === themeId) || BUILTIN_THEMES.find((t) => t.id === themeId);
        if (found) {
          updated = { ...found, is_active: true };
        } else {
          throw ipcErr;
        }
      }

      setActiveTheme(updated);
      appliedThemeRef.current = updated;
      setPreviewThemeItem(null);
      injectThemeVariables(updated);

      setThemes((prev) =>
        prev.map((t) => ({
          ...t,
          is_active: t.id === themeId,
        }))
      );
      return updated;
    } catch (err) {
      console.error('[useTheme] Erreur application du thème:', err);
      throw err;
    }
  }, [injectThemeVariables, themes]);

  return {
    themes,
    activeTheme,
    previewThemeItem,
    loading,
    reloadThemes,
    preview,
    cancelPreview,
    applyTheme,
  };
}