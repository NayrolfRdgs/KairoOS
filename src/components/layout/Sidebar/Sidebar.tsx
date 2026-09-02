import React from 'react';
import { FolderSearch } from 'lucide-react';
import { CustomFranchise, System, FranchiseCollection, AppMode } from '../../../types';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNav } from './SidebarNav';
import { SidebarFranchises } from './SidebarFranchises';
import { SidebarSystems } from './SidebarSystems';

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
  gamepadConnected: boolean;
  gamepadName: string | null;
  appMode?: AppMode;
  onOpenScanner: () => void;
  onOpenSettings: () => void;
  onOpenGamepadSettings?: () => void;
  onOpenKioskUnlock?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  systems,
  popularFranchises,
  customFranchises,
  enabledFranchises,
  selectedCategory,
  onSelectCategory,
  gamesCountBySystem,
  gamesCountByFranchise,
  totalAllGames,
  totalFavorites,
  totalRecent,
  gamepadConnected,
  gamepadName,
  appMode = 'admin',
  onOpenScanner,
  onOpenSettings,
  onOpenGamepadSettings,
  onOpenKioskUnlock,
}) => {
  const isKiosk = appMode === 'kiosk';

  return (
    <aside className="w-72 bg-retro-sidebar border-r border-retro-border flex flex-col h-full select-none shrink-0 shadow-sm z-20">
      <SidebarHeader
        gamepadConnected={gamepadConnected}
        gamepadName={gamepadName}
        appMode={appMode}
        onOpenSettings={onOpenSettings}
        onOpenGamepadSettings={onOpenGamepadSettings}
        onOpenKioskUnlock={onOpenKioskUnlock}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <SidebarNav
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          totalAllGames={totalAllGames}
          totalFavorites={totalFavorites}
          totalRecent={totalRecent}
        />

        <SidebarFranchises
          popularFranchises={popularFranchises}
          customFranchises={customFranchises}
          enabledFranchises={enabledFranchises}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          gamesCountByFranchise={gamesCountByFranchise}
        />

        <SidebarSystems
          systems={systems}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          gamesCountBySystem={gamesCountBySystem}
        />
      </div>

      {!isKiosk && (
        <div className="p-4 border-t border-retro-border bg-retro-bg/40">
          <button
            onClick={onOpenScanner}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-retro-primary hover:text-white text-retro-text border border-retro-border hover:border-retro-primary text-xs font-bold shadow-retro hover:shadow-retro-neon transition-all"
          >
            <FolderSearch className="w-4 h-4 text-retro-primary group-hover:text-white" />
            <span>Scanner Dossier de ROMs</span>
          </button>
        </div>
      )}
    </aside>
  );
};
