import { Game, System, FranchiseCollection, CustomFranchise, AppMode, AppSettings, Theme, GamepadMapping } from '../types';

/**
 * Contrat d'interface pour toutes les UIs / Thèmes de KaïroOS.
 * Tout développeur voulant coder sa propre interface utilisateur implémente ce composant.
 */
export interface ThemeUIProps {
  // Données de la bibliothèque
  systems: System[];
  allGames: Game[];
  filteredAndSortedGames: Game[];
  allFranchises: (FranchiseCollection | string)[];
  customFranchises?: CustomFranchise[];

  // Filtres et catégories sélectionnées
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  categoryTitle: string;
  categoryList: string[];

  // Catégories configurées dans les paramètres
  enabledSystems?: string[];
  enabledModes?: string[];
  enabledFranchises?: string[];

  // Collections prédécoupées
  favoriteGames: Game[];
  twoPlayerGames: Game[];
  recentGames: Game[];
  fightGames: Game[];
  platformGames: Game[];

  // Statistiques et compteurs
  gamesCountBySystem: Record<string, number>;
  gamesCountByFranchise: Record<string, number>;
  totalAllGames: number;
  totalFavorites: number;
  totalRecent: number;
  total2Players: number;
  totalFightGames: number;
  totalPlatformGames: number;

  // Jeu sélectionné / focus
  focusedGame: Game | null;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;

  // Déclencheurs de modales système
  onOpenSettings: () => void;
  onOpenGamepadSettings: () => void;
  onOpenScanner?: () => void;
  onOpenAddGame?: () => void;
  onOpenKioskUnlock?: () => void;

  // État manette et système
  gamepadConnected: boolean;
  gamepadName: string | null;
  isGameRunning: boolean;
  appMode: AppMode;
  settings: AppSettings;
  theme: Theme;
  primaryPlayerIndex?: number;
  gamepadMapping?: GamepadMapping;
}
