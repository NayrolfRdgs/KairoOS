import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Theme, ThemeColors, ThemeLayout, ThemeFonts, ThemeAssets } from '../types';
import {
  getThemes,
  setTheme as apiSetTheme,
  saveTheme as apiSaveTheme,
  createTheme as apiCreateTheme,
  deleteTheme as apiDeleteTheme,
} from '../api';

export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  colors: ThemeColors;
}

/**
 * Thème de secours minimaliste utilisé uniquement si le backend est inaccessible
 * et qu'aucun thème n'est mis en cache localement.
 * En conditions normales, tous les thèmes proviennent de themes/<id>/theme.json sur le disque.
 */
const FALLBACK_THEME: Theme = {
  id: 'kairo-default',
  name: 'Kaïro OS',
  author: 'KaïroOS Team',
  version: '1.0.0',
  description: 'Thème officiel KaïroOS (chargé depuis themes/kairo-default/theme.json)',
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

// Alias pour compatibilité ascendante (certains composants l'importent encore)
export const DEFAULT_THEME = FALLBACK_THEME;

const LOCAL_STORAGE_THEME_KEY = 'kairo_active_theme_custom';

export function useTheme() {
  const [themes, setThemes] = useState<Theme[]>([FALLBACK_THEME]);
  const [activeTheme, setActiveTheme] = useState<Theme>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return FALLBACK_THEME;
  });
  const [previewThemeItem, setPreviewThemeItem] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(false);
  const appliedThemeRef = useRef<Theme>(activeTheme);

  /**
   * Dérive des présets de couleurs à partir des thèmes chargés depuis le disque.
   * Chaque thème installé devient automatiquement un preset de couleur 1-clic.
   * Aucune palette n'est codée en dur ici — tout vient de themes/<id>/theme.json.
   */
  const colorPresets: ColorPreset[] = useMemo(() => {
    return themes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description || '',
      isDark: (t.colors.bg_primary || '#000').toLowerCase() < '#888',
      colors: t.colors,
    }));
  }, [themes]);

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

    // Injection CSS personnalisé codé par l'utilisateur ou le créateur de thème
    let styleTag = document.getElementById('kairo-theme-custom-css');
    if (theme.custom_css && theme.custom_css.trim()) {
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'kairo-theme-custom-css';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = theme.custom_css;
    } else if (styleTag) {
      styleTag.remove();
    }
  }, []);

  // Détecter si les couleurs actuelles correspondent à un thème connu
  const activePresetId = useMemo(() => {
    if (!activeTheme?.colors) return 'custom';
    for (const t of themes) {
      if (!t.colors) continue;
      const keys = Object.keys(t.colors) as (keyof ThemeColors)[];
      const match = keys.every(
        (k) => activeTheme.colors[k]?.toLowerCase() === t.colors[k]?.toLowerCase()
      );
      if (match) return t.id;
    }
    return 'custom';
  }, [activeTheme?.colors, themes]);

  // Chargement initial des thèmes depuis le dossier themes/ via le backend Tauri
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
      console.warn('[useTheme] Impossible de charger les thèmes depuis le dossier themes/ :', err);
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
            updated = { ...FALLBACK_THEME, is_active: true };
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

  // Modification en direct d'un paramètre de disposition / style
  const updateThemeLayout = useCallback(
    (key: keyof ThemeLayout, value: any) => {
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

  // Modification du mode d'agencement global de la page
  const updateThemeLayoutType = useCallback(
    (layoutType: 'sidebar_grid' | 'single_page_categories') => {
      setActiveTheme((prev) => {
        const updated = { ...prev, layout_type: layoutType };
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

  // Modification du code CSS personnalisé injecté en live
  const updateThemeCustomCss = useCallback(
    (customCss: string) => {
      setActiveTheme((prev) => {
        const updated = { ...prev, custom_css: customCss };
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

  // Modification d'un asset (wallpaper, logo)
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

  // Appliquer les couleurs d'un preset (= les couleurs d'un thème existant sur le disque)
  const applyColorPreset = useCallback(
    (presetId: string) => {
      const preset = colorPresets.find((p) => p.id === presetId);
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
    [injectThemeVariables, colorPresets]
  );

  // Sauvegarder définitivement le thème actuel → écrit themes/<id>/theme.json
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

  // Réinitialiser les réglages au thème kairo-default stocké sur le disque
  const resetThemeToDefault = useCallback(async () => {
    try {
      // Essayer de recharger depuis le fichier themes/kairo-default/theme.json
      const list = await getThemes();
      const defaultTheme = list.find((t) => t.id === 'kairo-default') || FALLBACK_THEME;
      setActiveTheme(defaultTheme);
      appliedThemeRef.current = defaultTheme;
      injectThemeVariables(defaultTheme);
      try {
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(defaultTheme));
      } catch {
        // ignore
      }
    } catch {
      // Fallback en-ligne si le backend est inaccessible
      setActiveTheme(FALLBACK_THEME);
      appliedThemeRef.current = FALLBACK_THEME;
      injectThemeVariables(FALLBACK_THEME);
      try {
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, JSON.stringify(FALLBACK_THEME));
      } catch {
        // ignore
      }
    }
  }, [injectThemeVariables]);

  const createNewTheme = useCallback(async (id: string, name: string): Promise<Theme> => {
    try {
      const created = await apiCreateTheme(id, name);
      await reloadThemes();
      await applyTheme(created.id);
      return created;
    } catch (err) {
      console.error('[useTheme] Erreur création thème:', err);
      throw err;
    }
  }, [reloadThemes, applyTheme]);

  const removeTheme = useCallback(async (id: string): Promise<void> => {
    try {
      await apiDeleteTheme(id);
      await reloadThemes();
      if (activeTheme.id === id) {
        await applyTheme('kairo-default');
      }
    } catch (err) {
      console.error('[useTheme] Erreur suppression thème:', err);
      throw err;
    }
  }, [reloadThemes, activeTheme.id, applyTheme]);

  return {
    themes,
    activeTheme,
    previewThemeItem,
    loading,
    colorPresets,
    activePresetId,
    reloadThemes,
    preview,
    cancelPreview,
    applyTheme,
    updateThemeColor,
    updateThemeLayout,
    updateThemeLayoutType,
    updateThemeCustomCss,
    updateThemeFont,
    updateThemeAsset,
    applyColorPreset,
    saveCurrentTheme,
    resetThemeToDefault,
    createNewTheme,
    removeTheme,
  };
}