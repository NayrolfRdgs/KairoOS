import { useState, useEffect, useCallback, useRef } from 'react';
import { Theme } from '../types';
import { getThemes, setTheme as apiSetTheme } from '../api';

const DEFAULT_THEME: Theme = {
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
    card_radius: '12px',
    sidebar_width: '260px',
    card_gap: '16px',
  },
  assets: {
    background_image: null,
    logo_override: null,
    startup_sound: null,
  },
  is_active: true,
};

export function useTheme() {
  const [themes, setThemes] = useState<Theme[]>([DEFAULT_THEME]);
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
      const updated = await apiSetTheme(themeId);
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
  }, [injectThemeVariables]);

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