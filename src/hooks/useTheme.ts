import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Theme, ThemeColors, ThemeLayout, ThemeFonts, ThemeAssets } from '../types';
import { getThemes, setTheme as apiSetTheme, saveTheme as apiSaveTheme } from '../api';

export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  colors: ThemeColors;
}

export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'kairo-dark',
    name: 'Kaïro Sombre (OLED)',
    description: "Thème sombre profond idéal pour bornes d'arcade et écrans OLED",
    isDark: true,
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
  },
  {
    id: 'kairo-light',
    name: 'Kaïro Clair (Original)',
    description: 'Thème clair épuré avec blanc pur et accents framboise & violet',
    isDark: false,
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
  },
  {
    id: 'cyber-purple',
    name: 'Cyber Violet (Synthwave)',
    description: 'Ambiance arcade synthwave violette profonde et néons roses',
    isDark: true,
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
  },
  {
    id: 'arcade-emerald',
    name: 'Arcade Matrix (Émeraude)',
    description: 'Style terminal arcade aux reflets verts néon et cyan',
    isDark: true,
    colors: {
      bg_primary: '#09140f',
      bg_secondary: '#0f241a',
      bg_card: '#143324',
      sidebar_bg: '#0c1b13',
      accent_primary: '#10b981',
      accent_secondary: '#06b6d4',
      text_primary: '#ecfdf5',
      text_secondary: '#a7f3d0',
      text_muted: '#059669',
      border: '#1f4d36',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  {
    id: 'retro-amber',
    name: 'Ambre 80s (Sunset Arcade)',
    description: 'Chaleur vintage des bornes 80s aux teintes orangées et ambrées',
    isDark: true,
    colors: {
      bg_primary: '#18110b',
      bg_secondary: '#251a11',
      bg_card: '#352518',
      sidebar_bg: '#1e140d',
      accent_primary: '#f97316',
      accent_secondary: '#eab308',
      text_primary: '#fffbeb',
      text_secondary: '#fde68a',
      text_muted: '#d97706',
      border: '#4a331f',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  {
    id: 'deep-navy',
    name: 'Océan Profond (Midnight Navy)',
    description: 'Élégance bleu marine profond avec accents cyan électrique',
    isDark: true,
    colors: {
      bg_primary: '#0a1128',
      bg_secondary: '#101d42',
      bg_card: '#1c2d5a',
      sidebar_bg: '#0d1736',
      accent_primary: '#00b4d8',
      accent_secondary: '#5bc0be',
      text_primary: '#f0f8ff',
      text_secondary: '#90e0ef',
      text_muted: '#0077b6',
      border: '#283e75',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  },
  {
    id: 'neo-red',
    name: 'Rouge Arcade (Neo-Geo)',
    description: 'Passion arcade classique aux contrastes rouge vif et noir',
    isDark: true,
    colors: {
      bg_primary: '#140909',
      bg_secondary: '#201010',
      bg_card: '#2c1414',
      sidebar_bg: '#180a0a',
      accent_primary: '#ef4444',
      accent_secondary: '#f59e0b',
      text_primary: '#fef2f2',
      text_secondary: '#fca5a5',
      text_muted: '#b91c1c',
      border: '#451a1a',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#dc2626',
    },
  },
  {
    id: 'gameboy-retro',
    name: 'GameBoy Classic (Gris Rétro)',
    description: 'Nostalgie des premières consoles aux teintes gris clair et olive',
    isDark: false,
    colors: {
      bg_primary: '#e3e8de',
      bg_secondary: '#d2dacb',
      bg_card: '#f0f4eb',
      sidebar_bg: '#dce3d6',
      accent_primary: '#4d6824',
      accent_secondary: '#738a39',
      text_primary: '#1e2810',
      text_secondary: '#3d4d23',
      text_muted: '#6a7e4b',
      border: '#c3cdc0',
      success: '#4d6824',
      warning: '#b45309',
      danger: '#991b1b',
    },
  },
];

export const DEFAULT_THEME: Theme = {
  id: 'kairo-default',
  name: 'Kaïro OS',
  author: 'KaïroOS Team',
  version: '1.0.0',
  description: 'Thème officiel unifié avec personnalisation complète des couleurs et du style.',
  colors: { ...COLOR_PRESETS[0].colors },
  fonts: {
    primary: 'Outfit, Inter, system-ui, sans-serif',
    arcade: 'Press Start 2P, monospace',
    size_base: '14px',
  },
  layout: {
    card_radius: '16px',
    sidebar_width: '280px',
    card_gap: '16px',
    card_aspect: 'poster',
    card_glow: 'subtle',
    scanlines: 'none',
    card_shadow: 'soft',
    card_scale: 'dynamic',
  },
  assets: {
    background_image: null,
    logo_override: null,
    startup_sound: null,
  },
  is_active: true,
};

const LOCAL_STORAGE_THEME_KEY = 'kairo_active_theme_custom';

export function useTheme() {
  const [themes, setThemes] = useState<Theme[]>([DEFAULT_THEME]);
  const [activeTheme, setActiveTheme] = useState<Theme>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return DEFAULT_THEME;
  });
  const [previewThemeItem, setPreviewThemeItem] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(false);
  const appliedThemeRef = useRef<Theme>(activeTheme);

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
      root.style.setProperty('--card-radius', layout.card_radius || '16px');
      root.style.setProperty('--sidebar-width', layout.sidebar_width || '280px');
      root.style.setProperty('--card-gap', layout.card_gap || '16px');

      // Aspect ratio
      if (layout.card_aspect === 'square') {
        root.style.setProperty('--card-aspect', '1/1');
      } else if (layout.card_aspect === 'landscape') {
        root.style.setProperty('--card-aspect', '16/9');
      } else {
        root.style.setProperty('--card-aspect', '3/4');
      }

      // Card scale
      if (layout.card_scale === 'none') {
        root.style.setProperty('--card-focus-scale', '1');
      } else if (layout.card_scale === 'subtle') {
        root.style.setProperty('--card-focus-scale', '1.025');
      } else {
        root.style.setProperty('--card-focus-scale', '1.05');
      }

      // CRT Scanlines
      root.classList.remove('crt-scanlines-light', 'crt-scanlines-retro', 'crt-scanlines-intense');
      if (layout.scanlines === 'light') root.classList.add('crt-scanlines-light');
      else if (layout.scanlines === 'retro') root.classList.add('crt-scanlines-retro');
      else if (layout.scanlines === 'intense') root.classList.add('crt-scanlines-intense');
    }

    if (assets?.background_image) {
      root.style.setProperty('--theme-bg-image', `url("${assets.background_image}")`);
    } else {
      root.style.removeProperty('--theme-bg-image');
    }
  }, []);

  // Détecter si les couleurs actuelles correspondent à un preset connu
  const activePresetId = useMemo(() => {
    if (!activeTheme?.colors) return 'custom';
    for (const p of COLOR_PRESETS) {
      const keys = Object.keys(p.colors) as (keyof ThemeColors)[];
      const match = keys.every(
        (k) => activeTheme.colors[k]?.toLowerCase() === p.colors[k]?.toLowerCase()
      );
      if (match) return p.id;
    }
    return 'custom';
  }, [activeTheme?.colors]);

  // Chargement initial des thèmes
  const reloadThemes = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getThemes();
      if (list && list.length > 0) {
        setThemes(list);
        const active = list.find((t) => t.is_active) || list[0];

        // Si l'utilisateur avait une personnalisation sauvegardée localement pour le même thème, on la priorise
        let merged = active;
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.id === active.id) {
              merged = { ...active, ...parsed };
            }
          }
        } catch {
          // ignore
        }

        setActiveTheme(merged);
        appliedThemeRef.current = merged;
        injectThemeVariables(merged);
      } else {
        injectThemeVariables(activeTheme);
      }
    } catch (err) {
      console.warn('[useTheme] Impossible de charger les thèmes:', err);
      injectThemeVariables(activeTheme);
    } finally {
      setLoading(false);
    }
  }, [injectThemeVariables, activeTheme]);

  useEffect(() => {
    injectThemeVariables(activeTheme);
    reloadThemes();
  }, []);

  // Aperçu instantané sans sauvegarde
  const preview = useCallback(
    (theme: Theme) => {
      setPreviewThemeItem(theme);
      injectThemeVariables(theme);
    },
    [injectThemeVariables]
  );

  // Annuler l'aperçu et rétablir le thème sauvegardé
  const cancelPreview = useCallback(() => {
    setPreviewThemeItem(null);
    injectThemeVariables(appliedThemeRef.current);
  }, [injectThemeVariables]);

  // Appliquer et sauvegarder un thème existant par son ID
  const applyTheme = useCallback(
    async (themeId: string): Promise<Theme> => {
      try {
        let updated: Theme;
        try {
          updated = await apiSetTheme(themeId);
        } catch (ipcErr) {
          console.warn('[useTheme] apiSetTheme IPC error, fallbacking:', ipcErr);
          const found = themes.find((t) => t.id === themeId);
          if (found) {
            updated = { ...found, is_active: true };
          } else {
            updated = { ...DEFAULT_THEME, is_active: true };
          }
        }

        setActiveTheme(updated);
        appliedThemeRef.current = updated;
        setPreviewThemeItem(null);
        injectThemeVariables(updated);

        try {
          localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }

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
    },
    [injectThemeVariables, themes]
  );

  // Modification en direct d'une couleur (réactivité immédiate CSS)
  const updateThemeColor = useCallback(
    (key: keyof ThemeColors, value: string) => {
      setActiveTheme((prev) => {
        const updatedColors = { ...prev.colors, [key]: value };
        const updated = { ...prev, colors: updatedColors };
        injectThemeVariables(updated);
        try {
          localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [injectThemeVariables]
  );

  // Modification en direct d'un paramètre de disposition / style (card_radius, card_gap, etc.)
  const updateThemeLayout = useCallback(
    (key: keyof ThemeLayout, value: string) => {
      setActiveTheme((prev) => {
        const updatedLayout = { ...prev.layout, [key]: value };
        const updated = { ...prev, layout: updatedLayout };
        injectThemeVariables(updated);
        try {
          localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [injectThemeVariables]
  );

  // Modification en direct d'une police
  const updateThemeFont = useCallback(
    (key: keyof ThemeFonts, value: string) => {
      setActiveTheme((prev) => {
        const updatedFonts = { ...prev.fonts, [key]: value };
        const updated = { ...prev, fonts: updatedFonts };
        injectThemeVariables(updated);
        try {
          localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [injectThemeVariables]
  );

  // Modification d'un asset (wallpaper)
  const updateThemeAsset = useCallback(
    (key: keyof ThemeAssets, value: string | null) => {
      setActiveTheme((prev) => {
        const updatedAssets = { ...prev.assets, [key]: value };
        const updated = { ...prev, assets: updatedAssets };
        injectThemeVariables(updated);
        try {
          localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [injectThemeVariables]
  );

  // Appliquer un preset de couleurs complet
  const applyColorPreset = useCallback(
    (presetId: string) => {
      const preset = COLOR_PRESETS.find((p) => p.id === presetId);
      if (!preset) return;

      setActiveTheme((prev) => {
        const updated = {
          ...prev,
          colors: { ...preset.colors },
        };
        injectThemeVariables(updated);
        try {
          localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [injectThemeVariables]
  );

  // Sauvegarder définitivement le thème actuel
  const saveCurrentTheme = useCallback(async (): Promise<Theme> => {
    try {
      let saved: Theme;
      try {
        saved = await apiSaveTheme(activeTheme);
      } catch (ipcErr) {
        console.warn('[useTheme] apiSaveTheme IPC error, fallback local:', ipcErr);
        saved = { ...activeTheme };
      }

      appliedThemeRef.current = saved;
      try {
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(saved));
      } catch {
        // ignore
      }

      setThemes((prev) => {
        const exists = prev.some((t) => t.id === saved.id);
        if (exists) {
          return prev.map((t) => (t.id === saved.id ? saved : t));
        }
        return [...prev, saved];
      });

      return saved;
    } catch (err) {
      console.error('[useTheme] Erreur sauvegarde thème:', err);
      throw err;
    }
  }, [activeTheme]);

  // Réinitialiser les réglages de couleur et style au preset par défaut
  const resetThemeToDefault = useCallback(() => {
    const reset = { ...DEFAULT_THEME };
    setActiveTheme(reset);
    appliedThemeRef.current = reset;
    injectThemeVariables(reset);
    try {
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(reset));
    } catch {
      // ignore
    }
  }, [injectThemeVariables]);

  return {
    themes,
    activeTheme,
    previewThemeItem,
    loading,
    colorPresets: COLOR_PRESETS,
    activePresetId,
    reloadThemes,
    preview,
    cancelPreview,
    applyTheme,
    updateThemeColor,
    updateThemeLayout,
    updateThemeFont,
    updateThemeAsset,
    applyColorPreset,
    saveCurrentTheme,
    resetThemeToDefault,
  };
}