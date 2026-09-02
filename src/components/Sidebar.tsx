import React from 'react';
import {
  Gamepad2,
  Star,
  Clock,
  LayoutGrid,
  FolderSearch,
  Flame,
  Disc,
  Smartphone,
  Tv,
  Box,
  Sparkles,
  Trophy,
  Tag,
  Settings as SettingsIcon,
} from 'lucide-react';
import { CustomFranchise, System } from '../types';

export interface FranchiseCollection {
  id: string;
  name: string;
  icon?: string;
  color: string;
  keywords: string[];
}

export const POPULAR_FRANCHISES: FranchiseCollection[] = [
  { id: 'mario', name: 'Super Mario', color: 'bg-red-50 text-red-600 border-red-200', keywords: ['mario', 'luigi', 'wario', 'yoshi', 'kart', 'donkey kong'] },
  { id: 'zelda', name: 'The Legend of Zelda', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', keywords: ['zelda', 'link'] },
  { id: 'pokemon', name: 'Pokémon', color: 'bg-amber-50 text-amber-600 border-amber-200', keywords: ['pokemon', 'pokémon'] },
  { id: 'sonic', name: 'Sonic The Hedgehog', color: 'bg-blue-50 text-blue-600 border-blue-200', keywords: ['sonic'] },
  { id: 'versus', name: 'Street Fighter & Tekken', color: 'bg-purple-50 text-purple-600 border-purple-200', keywords: ['street fighter', 'tekken', 'mortal kombat', 'king of fighters', 'guilty gear'] },
  { id: 'rpg', name: 'Final Fantasy & RPG', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', keywords: ['final fantasy', 'dragon quest', 'chrono', 'persona', 'tales of'] },
];

interface SidebarProps {
  systems: System[];
  selectedCategory: string; // 'all' | 'favorites' | 'recent' | 'system:xxx' | 'franchise:xxx'
  onSelectCategory: (category: string) => void;
  gamesCountBySystem: Record<string, number>;
  gamesCountByFranchise: Record<string, number>;
  totalAllGames: number;
  totalFavorites: number;
  totalRecent: number;
  enabledFranchises: string[];
  customFranchises: CustomFranchise[];
  gamepadConnected: boolean;
  gamepadName: string | null;
  onOpenScanner: () => void;
  onOpenSettings: () => void;
  onOpenGamepadSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  systems,
  selectedCategory,
  onSelectCategory,
  gamesCountBySystem,
  gamesCountByFranchise,
  totalAllGames,
  totalFavorites,
  totalRecent,
  enabledFranchises,
  customFranchises,
  gamepadConnected,
  gamepadName,
  onOpenScanner,
  onOpenSettings,
  onOpenGamepadSettings,
}) => {
  const getSystemIcon = (iconType: string) => {
    switch (iconType) {
      case 'disc':
        return <Disc className="w-4 h-4" />;
      case 'smartphone':
        return <Smartphone className="w-4 h-4" />;
      case 'box':
        return <Box className="w-4 h-4" />;
      case 'monitor':
        return <Tv className="w-4 h-4" />;
      case 'joystick':
        return <Flame className="w-4 h-4 text-retro-primary" />;
      default:
        return <Gamepad2 className="w-4 h-4" />;
    }
  };

  const visiblePopularFranchises = POPULAR_FRANCHISES.filter((f) =>
    enabledFranchises.includes(f.id)
  );

  const visibleCustomFranchises = customFranchises.filter((f) =>
    enabledFranchises.includes(f.id)
  );

  return (
    <aside className="w-72 bg-retro-sidebar border-r border-retro-border flex flex-col h-full select-none shrink-0 shadow-sm z-20">
      {/* Brand & Logo Header */}
      <div className="p-5 border-b border-retro-border flex items-center justify-between bg-gradient-to-br from-retro-sidebar to-retro-bg/40">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="KaïroOS"
            className="w-10 h-10 rounded-xl object-cover shadow-md border-2 border-retro-primary/20"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black tracking-wider uppercase font-display bg-gradient-to-r from-retro-primary via-retro-purple to-retro-cyan bg-clip-text text-transparent">
                Kaïro
              </span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-retro-primary text-white tracking-widest font-arcade">
                OS
              </span>
            </div>
            <span className="text-[10px] text-retro-textMuted uppercase tracking-widest font-bold block -mt-0.5">
              Arcade Station 80s
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenGamepadSettings}
            title={gamepadConnected ? `${gamepadName || 'Manette connectée'} (Cliquez pour configurer)` : 'Configurer les Manettes & Arcade Sticks'}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
              gamepadConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 animate-pulse'
                : 'bg-retro-bg border-retro-border text-retro-textMuted hover:text-retro-primary hover:bg-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            title="Paramètres & Mode Borne"
            className="p-2 rounded-xl border border-retro-border bg-retro-bg hover:bg-white text-retro-textMuted hover:text-retro-primary transition-all shadow-sm"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Navigation Principale */}
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-retro-textLight px-3 mb-2 flex items-center justify-between">
            <span>Bibliothèque</span>
            <Sparkles className="w-3 h-3 text-retro-yellow" />
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-retro-primary text-white shadow-retro-neon font-black scale-[1.02]'
                  : 'text-retro-text hover:bg-retro-bg hover:text-retro-primary'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                <span>Tous les Jeux</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-retro-bg text-retro-textMuted'
                }`}
              >
                {totalAllGames}
              </span>
            </button>

            <button
              onClick={() => onSelectCategory('favorites')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'favorites'
                  ? 'bg-retro-yellow text-white shadow-retro-md font-black scale-[1.02]'
                  : 'text-retro-text hover:bg-retro-bg hover:text-retro-yellow'
              }`}
            >
              <div className="flex items-center gap-3">
                <Star className={`w-4 h-4 ${selectedCategory === 'favorites' ? 'fill-white' : 'text-retro-yellow fill-retro-yellow'}`} />
                <span>Favoris</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  selectedCategory === 'favorites' ? 'bg-white/20 text-white' : 'bg-retro-bg text-retro-textMuted'
                }`}
              >
                {totalFavorites}
              </span>
            </button>

            <button
              onClick={() => onSelectCategory('recent')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'recent'
                  ? 'bg-retro-cyan text-white shadow-retro-cyan font-black scale-[1.02]'
                  : 'text-retro-text hover:bg-retro-bg hover:text-retro-cyan'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4" />
                <span>Récemment Joués</span>
              </div>
              {totalRecent > 0 && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    selectedCategory === 'recent' ? 'bg-white/20 text-white' : 'bg-retro-bg text-retro-textMuted'
                  }`}
                >
                  {totalRecent}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Section Franchises / Licences */}
        {(visiblePopularFranchises.length > 0 || visibleCustomFranchises.length > 0) && (
          <div>
            <div className="text-[11px] font-black uppercase tracking-wider text-retro-textLight px-3 mb-2 flex items-center justify-between">
              <span>Franchises Cultes</span>
              <Trophy className="w-3 h-3 text-retro-primary" />
            </div>

            <div className="space-y-1">
              {visiblePopularFranchises.map((franchise) => {
                const count = gamesCountByFranchise[franchise.id] || 0;
                const isSelected = selectedCategory === `franchise:${franchise.id}`;

                return (
                  <button
                    key={franchise.id}
                    onClick={() => onSelectCategory(`franchise:${franchise.id}`)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-retro-purple text-white shadow-retro-md font-bold scale-[1.02]'
                        : 'text-retro-text hover:bg-retro-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Tag className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-retro-primary'}`} />
                      <span className="truncate">{franchise.name}</span>
                    </div>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-retro-bg text-retro-textMuted'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}

              {visibleCustomFranchises.map((custom) => {
                const count = gamesCountByFranchise[custom.id] || 0;
                const isSelected = selectedCategory === `franchise:${custom.id}`;

                return (
                  <button
                    key={custom.id}
                    onClick={() => onSelectCategory(`franchise:${custom.id}`)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-retro-cyan text-white shadow-retro-cyan font-bold scale-[1.02]'
                        : 'text-retro-text hover:bg-retro-bg'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Tag className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-retro-cyan'}`} />
                      <span className="truncate">{custom.name}</span>
                    </div>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-retro-bg text-retro-textMuted'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Section Consoles & Systèmes */}
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-retro-textLight px-3 mb-2">
            Consoles & Systèmes
          </div>

          <div className="space-y-1">
            {systems.map((sys) => {
              const count = gamesCountBySystem[sys.id] || 0;
              const isSelected = selectedCategory === `system:${sys.id}`;

              return (
                <button
                  key={sys.id}
                  onClick={() => onSelectCategory(`system:${sys.id}`)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-retro-cyan text-white shadow-retro-cyan font-bold scale-[1.02]'
                      : 'text-retro-text hover:bg-retro-bg'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getSystemIcon(sys.icon)}
                    <span className="truncate">{sys.name}</span>
                  </div>
                  {count > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-retro-bg text-retro-textMuted'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-retro-border bg-retro-bg/40 space-y-2">
        <button
          onClick={onOpenScanner}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-retro-primary hover:text-white text-retro-text border border-retro-border hover:border-retro-primary text-xs font-bold shadow-retro hover:shadow-retro-neon transition-all"
        >
          <FolderSearch className="w-4 h-4 text-retro-primary group-hover:text-white" />
          <span>Scanner Dossier de ROMs</span>
        </button>
      </div>
    </aside>
  );
};
