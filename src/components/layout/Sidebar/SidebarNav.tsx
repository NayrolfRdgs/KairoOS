import React from 'react';
import { LayoutGrid, Star, Clock, Sparkles } from 'lucide-react';

interface SidebarNavProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  totalAllGames: number;
  totalFavorites: number;
  totalRecent: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  selectedCategory,
  onSelectCategory,
  totalAllGames,
  totalFavorites,
  totalRecent,
}) => {
  return (
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
            <Star
              className={`w-4 h-4 ${
                selectedCategory === 'favorites' ? 'fill-white' : 'text-retro-yellow fill-retro-yellow'
              }`}
            />
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
  );
};
