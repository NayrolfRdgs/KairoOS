import React from 'react';
import { ThemeUIProps } from './types';
import { ClassicArcadeTheme } from './ClassicArcadeTheme';
import { HubShelfTheme } from './HubShelfTheme';

export * from './types';
export { ClassicArcadeTheme } from './ClassicArcadeTheme';
export { HubShelfTheme } from './HubShelfTheme';

/**
 * Registre des UIs / Thèmes modulaires de KaïroOS.
 * Chaque thème possède son propre composant racine et son propre code React/HTML/CSS totalement séparé.
 * Pour ajouter une nouvelle UI codée sur mesure, il suffit de créer son dossier dans `src/themes/<MonTheme>/`
 * et de l'enregistrer dans ce registre.
 */
export const THEME_UI_REGISTRY: Record<string, React.FC<ThemeUIProps>> = {
  'kairo-default': ClassicArcadeTheme,
  'kairo-hub': HubShelfTheme,
};

/**
 * Récupère le composant UI associé à un identifiant de thème.
 * Si le thème n'est pas spécifié ou introuvable, utilise l'UI Classic Arcade par défaut.
 */
export function getThemeUIComponent(themeId?: string): React.FC<ThemeUIProps> {
  if (!themeId) return ClassicArcadeTheme;
  return THEME_UI_REGISTRY[themeId] || ClassicArcadeTheme;
}
