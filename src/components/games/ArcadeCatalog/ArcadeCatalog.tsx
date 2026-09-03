import React from 'react';
import { Game } from '../../../types';
import { GameCard } from '../GameCard';
import { Gamepad2 } from 'lucide-react';

interface ArcadeCatalogProps {
  games: Game[];
  focusedGameId: string | null;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onOpenGamepadConfig?: () => void;
  selectedCategory: string;
  isSearching: boolean;
  categoryTitle?: string;
}

export const ArcadeCatalog: React.FC<ArcadeCatalogProps> = ({
  games,
  focusedGameId,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  categoryTitle,
}) => {
  if (games.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 select-none">
        <div className="w-16 h-16 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center text-rose-500 mb-3 shadow-xs">
          <Gamepad2 className="w-8 h-8" />
        </div>
        <p className="text-base font-black text-slate-700">Aucun jeu dans cette sélection</p>
        <p className="text-xs text-slate-400 mt-1">Ajoutez des ROMs ou modifiez les filtres dans les paramètres.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
      {/* En-tête de catégorie discret */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-purple-100/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs animate-pulse" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono">
            {categoryTitle || 'CATALOGUE DE JEUX'}
          </h2>
        </div>
        <span className="text-[11px] font-mono font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
          {games.length} {games.length > 1 ? 'JEUX' : 'JEU'}
        </span>
      </div>

      {/* Grille Plein Écran de tous les jeux */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 sm:gap-5 justify-items-center">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            isFocused={focusedGameId === game.id}
            onSelect={onSelectGame}
            onLaunch={onLaunchGame}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
