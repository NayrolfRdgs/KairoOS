import React from 'react';
import { CustomFranchise, System, FranchiseCollection, AppMode } from '../../../types';
import { SidebarNav } from './SidebarNav';
import { SidebarSystems } from './SidebarSystems';
import { SidebarFranchises } from './SidebarFranchises';
import { SidebarFooter } from './SidebarFooter';

interface SidebarProps {
  systems: System[];
  popularFranchises: FranchiseCollection[];
  customFranchises: CustomFranchise[];
  enabledFranchises: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  gamesCountBySystem: Record<string, number>;
  gamesCountByFranchise: Record<string, number>;
  totalAllGames: number;
  totalFavorites: number;
  totalRecent: number;
  total2Players?: number;
  totalFightGames?: number;
  totalPlatformGames?: number;
  enabledSystems?: string[];
  enabledModes?: string[];
  gamepadConnected: boolean;
  gamepadName: string | null;
  appMode?: AppMode;
  onOpenScanner: () => void;
  onOpenSettings: () => void;
  onOpenGamepadSettings?: () => void;
  onOpenKioskUnlock?: () => void;
  onOpenAddGame?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  systems,
  popularFranchises = [],
  customFranchises = [],
  enabledFranchises = [],
  selectedCategory,
  onSelectCategory,
  gamesCountBySystem,
  gamesCountByFranchise = {},
  totalAllGames,
  totalFavorites,
  totalRecent,
  total2Players,
  totalFightGames,
  totalPlatformGames,
  enabledSystems,
  enabledModes,
  gamepadConnected,
  gamepadName,
  appMode = 'admin',
  onOpenSettings,
  onOpenGamepadSettings,
  onOpenKioskUnlock,
  onOpenAddGame,
}) => {
  return (
    <aside
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
        width: 'var(--sidebar-width, 288px)',
      }}
      className="backdrop-blur-md border-r flex flex-col h-full select-none shrink-0 shadow-sm z-20"
    >
      {/* 1. Corps Déroulant : Bibliothèque + Consoles + Franchises */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
        <SidebarNav
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          totalAllGames={totalAllGames}
          totalFavorites={totalFavorites}
          totalRecent={totalRecent}
          total2Players={total2Players}
          totalFightGames={totalFightGames}
          totalPlatformGames={totalPlatformGames}
          enabledModes={enabledModes}
        />

        <SidebarSystems
          systems={systems}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          gamesCountBySystem={gamesCountBySystem}
          enabledSystems={enabledSystems}
        />

        <SidebarFranchises
          popularFranchises={popularFranchises}
          customFranchises={customFranchises}
          enabledFranchises={enabledFranchises}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          gamesCountByFranchise={gamesCountByFranchise}
        />
      </div>

      {/* 2. Footer Déplacé en Bas avec Logo, Statut et Boutons Paramètres */}
      <SidebarFooter
        gamepadConnected={gamepadConnected}
        gamepadName={gamepadName}
        appMode={appMode}
        onOpenSettings={onOpenSettings}
        onOpenGamepadSettings={onOpenGamepadSettings}
        onOpenKioskUnlock={onOpenKioskUnlock}
        onOpenAddGame={onOpenAddGame}
      />
    </aside>
  );
};
