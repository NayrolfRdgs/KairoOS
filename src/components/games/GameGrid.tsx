import React, { useRef, useEffect } from 'react';
import { Ghost, FolderSearch, SearchX } from 'lucide-react';
import { Game } from '../../types';
import { GameCard } from './GameCard';

interface GameGridProps {
  games: Game[];
  focusedIndex: number;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onOpenScanner: () => void;
  isSearching: boolean;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  focusedIndex,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  onOpenScanner,
  isSearching,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && games.length > 0) {
      const cards = containerRef.current.querySelectorAll('.game-card-wrapper');
      const targetCard = cards[focusedIndex] as HTMLElement;
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
  }, [focusedIndex, games.length]);

  if (games.length === 0) {
    if (isSearching) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
          <div className="w-16 h-16 rounded-3xl bg-white border border-retro-border flex items-center justify-center mb-4 text-retro-textMuted shadow-retro">
            <SearchX className="w-8 h-8 text-retro-primary" />
          </div>
          <h2 className="text-lg font-black uppercase font-display tracking-wider text-retro-text mb-1">
            Aucun jeu correspondant
          </h2>
          <p className="text-xs text-retro-textMuted max-w-sm">
            Aucun résultat trouvé pour votre recherche ou les filtres sélectionnés.
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-white border border-retro-border flex items-center justify-center mb-4 text-retro-textMuted shadow-retro-md">
          <Ghost className="w-10 h-10 text-retro-primary animate-bounce" />
        </div>
        <h2 className="text-xl font-black uppercase font-display tracking-wider text-retro-text mb-2">
          Aucun jeu dans cette sélection
        </h2>
        <p className="text-xs text-retro-textMuted max-w-md mb-6 leading-relaxed">
          Placez vos ROMs dans un dossier et lancez le scanner pour les indexer automatiquement.
        </p>
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-retro-primary to-retro-purple text-white font-extrabold text-xs uppercase tracking-wider shadow-retro-neon hover:scale-105 active:scale-95 transition-all"
        >
          <FolderSearch className="w-4 h-4 fill-white" />
          <span>Scanner un dossier de ROMs</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5 select-none"
    >
      {games.map((game, idx) => (
        <div key={game.id} className="game-card-wrapper">
          <GameCard
            game={game}
            isFocused={idx === focusedIndex}
            onSelect={onSelectGame}
            onLaunch={onLaunchGame}
            onToggleFavorite={onToggleFavorite}
          />
        </div>
      ))}
    </div>
  );
};
