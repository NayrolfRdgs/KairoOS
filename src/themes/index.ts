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
 * - Les deux thèmes officiels intégrés de KaïroOS possèdent leur propre implémentation React native hautement performante :
 *     * 'kairo-default' -> ClassicArcadeTheme (Navigation latérale avec liste consoles/systèmes + catalogue + Hero)
 *     * 'kairo-hub'     -> HubShelfTheme (Expérience plein écran moderne par rayons/catégories horizontales)
 * - Les thèmes personnalisés tiers ou créés par l'utilisateur (theme_type === 'custom-code' ou entry_path)
 *   sont exécutés dans le conteneur CustomCodeTheme (iframe HTML5/CSS/JS/Vite avec pont Kaïro API).
 * - Sinon, retombe sur l'UI par défaut.
 */
export function getThemeUIComponent(themeOrId?: Theme | string): React.FC<ThemeUIProps> {
  if (!themeOrId) return ClassicArcadeTheme;

  const id = typeof themeOrId === 'object' ? themeOrId.id : themeOrId;

  // Thèmes officiels natifs de KaïroOS
  if (id === 'kairo-default') return ClassicArcadeTheme;
  if (id === 'kairo-hub') return HubShelfTheme;

  if (typeof themeOrId === 'object') {
    if (themeOrId.theme_type === 'custom-code' || themeOrId.entry_path) {
      return CustomCodeTheme;
    }
    return THEME_UI_REGISTRY[themeOrId.id] || ClassicArcadeTheme;
  }

  return THEME_UI_REGISTRY[themeOrId] || ClassicArcadeTheme;
}

