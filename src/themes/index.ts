import React from 'react';
import { ThemeUIProps } from './types';
import { Theme } from '../types';
import { ClassicArcadeTheme } from './ClassicArcadeTheme';
import { HubShelfTheme } from './HubShelfTheme';
import { ConsoleLauncherTheme } from './ConsoleLauncherTheme';
import { CustomCodeTheme } from './CustomCodeTheme';

export * from './types';
export { ClassicArcadeTheme } from './ClassicArcadeTheme';
export { HubShelfTheme } from './HubShelfTheme';
export { ConsoleLauncherTheme } from './ConsoleLauncherTheme';
export { CustomCodeTheme } from './CustomCodeTheme';

/**
 * Registre des UIs / Thèmes modulaires de KaïroOS.
 * Chaque thème possède son propre composant racine et son propre code React/HTML/CSS totalement séparé.
 */
export const THEME_UI_REGISTRY: Record<string, React.FC<ThemeUIProps>> = {
  'kairo-default': ClassicArcadeTheme,
  'kairo-hub': HubShelfTheme,
  'kairo-console': ConsoleLauncherTheme,
};

/**
 * Récupère le composant UI associé à un identifiant ou objet de thème.
 * - 'kairo-console' ou layout_type === 'console_launcher' | 'hero_carousel' -> ConsoleLauncherTheme
 * - 'kairo-hub' ou layout_type === 'single_page_categories' -> HubShelfTheme
 * - 'kairo-default' -> ClassicArcadeTheme
 * - Thèmes personnalisés en code complet (theme_type === 'custom-code' ou entry_path) -> CustomCodeTheme
 * - Sinon, retombe sur THEME_UI_REGISTRY[id] ou ClassicArcadeTheme.
 */
export function getThemeUIComponent(themeOrId?: Theme | string): React.FC<ThemeUIProps> {
  if (!themeOrId) return ClassicArcadeTheme;

  if (typeof themeOrId === 'object') {
    // 1. Détection prioritaire du mode Console Launcher (Hero + Carrousel)
    if (
      themeOrId.layout_type === 'console_launcher' ||
      themeOrId.layout_type === 'hero_carousel' ||
      themeOrId.id === 'kairo-console'
    ) {
      return ConsoleLauncherTheme;
    }

    // 2. Détection du mode Plein Écran par Catégories
    if (
      themeOrId.id === 'kairo-hub' ||
      themeOrId.layout_type === 'single_page_categories'
    ) {
      return HubShelfTheme;
    }

    // 3. Thème Classic Arcade
    if (themeOrId.id === 'kairo-default') {
      return ClassicArcadeTheme;
    }

    // 4. Code personnalisé iframe (HTML5/Vite/JS)
    if (themeOrId.theme_type === 'custom-code' || themeOrId.entry_path) {
      return CustomCodeTheme;
    }

    return THEME_UI_REGISTRY[themeOrId.id] || ClassicArcadeTheme;
  }

  if (themeOrId === 'kairo-console') return ConsoleLauncherTheme;
  if (themeOrId === 'kairo-hub') return HubShelfTheme;
  if (themeOrId === 'kairo-default') return ClassicArcadeTheme;

  return THEME_UI_REGISTRY[themeOrId] || ClassicArcadeTheme;
}

