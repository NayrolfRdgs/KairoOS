import React from 'react';
import { CustomFranchise, System, FranchiseCollection, AppMode } from '../../../types';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarSystems } from './SidebarSystems';
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
  selectedCategory,
  onSelectCategory,
  gamesCountBySystem,
  totalAllGames,
  totalFavorites,
  totalRecent,
  total2Players,
  totalFightGames,
  totalPlatformGames,
  enabledSystems,
  gamepadConnected,
  gamepadName,
  appMode = 'admin',
  onOpenSettings,
  onOpenGamepadSettings,
  onOpenKioskUnlock,
  onOpenAddGame,
}) => {
  return (
    <aside className="w-72 bg-white/95 backdrop-blur-md border-r border-purple-100/80 flex flex-col h-full select-none shrink-0 shadow-sm z-20">
      {/* 1. Header avec Branding Arcade */}
      <SidebarHeader
        gamepadConnected={gamepadConnected}
        gamepadName={gamepadName}
        appMode={appMode}
        onOpenSettings={onOpenSettings}
        onOpenGamepadSettings={onOpenGamepadSettings}
        onOpenKioskUnlock={onOpenKioskUnlock}
        onOpenAddGame={onOpenAddGame}
      />

      {/* 2. Corps Déroulant : Bibliothèque + Consoles */}
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
        />

        <SidebarSystems
          systems={systems}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          gamesCountBySystem={gamesCountBySystem}
          enabledSystems={enabledSystems}
        />
      </div>

      {/* 3. Footer Carte v2.0 */}
      <SidebarFooter />
    </aside>
  );
};
