import React from 'react';
import { ThemeUIProps } from './types';
import { Theme } from '../types';
import { ClassicArcadeTheme } from './ClassicArcadeTheme';
import { HubShelfTheme } from './HubShelfTheme';
import { CustomCodeTheme } from './CustomCodeTheme';

export * from './types';
export { ClassicArcadeTheme } from './ClassicArcadeTheme';
export { HubShelfTheme } from './HubShelfTheme';
export { CustomCodeTheme } from './CustomCodeTheme';

/**
 * Registre des UIs / Thèmes modulaires de KaïroOS.
 * Chaque thème possède son propre composant racine et son propre code React/HTML/CSS totalement séparé.
 */
export const THEME_UI_REGISTRY: Record<string, React.FC<ThemeUIProps>> = {
  'kairo-default': ClassicArcadeTheme,
  'kairo-hub': HubShelfTheme,
};

/**
 * Récupère le composant UI associé à un identifiant ou objet de thème.
 * - Si le thème possède du code custom (entry_path ou theme_type === 'custom-code'), utilise CustomCodeTheme.
 * - Si le thème est un thème interne connu ('kairo-default', 'kairo-hub'), utilise son composant dédié.
 * - Sinon, retombe sur l'UI par défaut.
 */
export function getThemeUIComponent(themeOrId?: Theme | string): React.FC<ThemeUIProps> {
  if (!themeOrId) return ClassicArcadeTheme;

  if (typeof themeOrId === 'object') {
    if (themeOrId.theme_type === 'custom-code' || themeOrId.entry_path) {
      return CustomCodeTheme;
    }
    return THEME_UI_REGISTRY[themeOrId.id] || ClassicArcadeTheme;
  }

  return THEME_UI_REGISTRY[themeOrId] || ClassicArcadeTheme;
}
