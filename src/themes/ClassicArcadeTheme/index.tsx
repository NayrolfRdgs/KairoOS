import React from 'react';
import { ThemeUIProps } from '../types';
import { Sidebar } from '../../components/layout/Sidebar';
import { ArcadeCatalog } from '../../components/games/ArcadeCatalog';
import { GamepadFooterBar } from '../../components/layout/GamepadFooterBar';
import { FranchiseCollection } from '../../types';

/**
 * =========================================================================
 * UI Thème 1 : Kaïro Classic Arcade
 * =========================================================================
 * Architecture classique avec :
 * - Une barre latérale gauche (Sidebar) pour naviguer entre consoles, modes et sagas
 * - Un catalogue central en grille avec Hero Showcase en vedette
 * - Une barre d'aide manette en bas
 *
 * Tout le code de cette UI est isolé ici.
 */
export const ClassicArcadeTheme: React.FC<ThemeUIProps> = ({
  systems,
  filteredAndSortedGames,
  allFranchises,
  customFranchises = [],
  selectedCategory,
  onSelectCategory,
  categoryTitle,
  enabledSystems,
  enabledModes,
  enabledFranchises = [],
  gamesCountBySystem,
  gamesCountByFranchise,
  totalAllGames,
  totalFavorites,
  totalRecent,
  total2Players,
  totalFightGames,
  totalPlatformGames,
  focusedGame,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  onOpenSettings,
  onOpenGamepadSettings,
  onOpenScanner,
  onOpenAddGame,
  onOpenKioskUnlock,
  gamepadConnected,
  gamepadName,
  isGameRunning,
  appMode,
  settings,
}) => {
  // Conversion en FranchiseCollection[] pour la Sidebar
  const normalizedFranchises: FranchiseCollection[] = React.useMemo(() => {
    return allFranchises.map((item) => {
      if (typeof item === 'string') {
        return {
          id: item.toLowerCase(),
          name: item,
          color: 'var(--accent-primary)',
          keywords: [item.toLowerCase()],
        };
      }
      return {
        ...item,
        color: item.color || 'var(--accent-primary)',
        keywords: item.keywords || [item.name.toLowerCase()],
      };
    });
  }, [allFranchises]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 1. Navigation Latérale Gauche (Sidebar) */}
      <Sidebar
        systems={systems}
        popularFranchises={normalizedFranchises}
        customFranchises={customFranchises}
        enabledFranchises={enabledFranchises}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
        gamesCountBySystem={gamesCountBySystem}
        gamesCountByFranchise={gamesCountByFranchise}
        totalAllGames={totalAllGames}
        totalFavorites={totalFavorites}
        totalRecent={totalRecent}
        total2Players={total2Players}
        totalFightGames={totalFightGames}
        totalPlatformGames={totalPlatformGames}
        enabledSystems={enabledSystems}
        enabledModes={enabledModes}
        gamepadConnected={gamepadConnected}
        gamepadName={gamepadName}
        appMode={appMode}
        onOpenScanner={onOpenScanner || (() => {})}
        onOpenSettings={onOpenSettings}
        onOpenGamepadSettings={onOpenGamepadSettings}
        onOpenKioskUnlock={onOpenKioskUnlock}
        onOpenAddGame={onOpenAddGame}
      />

      {/* 2. Panneau Principal (Catalogue Plein Écran) */}
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
        }}
        className="flex-1 flex flex-col h-full overflow-hidden"
      >
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <ArcadeCatalog
            games={filteredAndSortedGames}
            focusedGameId={focusedGame?.id || null}
            onSelectGame={onSelectGame}
            onLaunchGame={onLaunchGame}
            onToggleFavorite={onToggleFavorite}
            onOpenGamepadConfig={onOpenGamepadSettings}
            selectedCategory={selectedCategory}
            isSearching={false}
            categoryTitle={categoryTitle}
          />
        </main>

        {/* 2.1 Barre d'Aide Manette (Xbox / PlayStation) */}
        <GamepadFooterBar
          buttonStyle={settings.button_prompt_style || 'xbox'}
          isGameRunning={isGameRunning}
          isDetailsModalOpen={false}
          isOtherModalOpen={false}
          gameSelectAction={settings.game_select_action || 'details'}
          isConnected={gamepadConnected}
          gamepadName={gamepadName}
        />
      </div>
    </div>
  );
};
