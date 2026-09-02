import React, { useRef, useEffect } from 'react';
import { Ghost, FolderSearch } from 'lucide-react';
import { Game } from '../types';
import { GameCard } from './GameCard';

interface GameGridProps {
  games: Game[];
  focusedIndex: number;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onOpenScanner: () => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  focusedIndex,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  onOpenScanner,
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
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-arcade-surface border border-arcade-border/80 flex items-center justify-center mb-5 text-arcade-muted shadow-xl shadow-black/40">
          <Ghost className="w-10 h-10 text-arcade-accent/50 animate-bounce" />
        </div>
        <h2 className="text-xl font-black uppercase font-display tracking-wider text-arcade-text mb-2">
          Aucun jeu détecté
        </h2>
        <p className="text-xs text-arcade-muted max-w-md mb-6 leading-relaxed">
          Votre bibliothèque est vide pour cette console. Placez vos ROMs dans un dossier et lancez le scanner pour les indexer automatiquement.
        </p>
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-arcade-accent to-arcade-neon text-arcade-bg font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-arcade-accent/20 hover:scale-105 active:scale-95 transition-all"
        >
          <FolderSearch className="w-4 h-4 fill-arcade-bg" />
          <span>Scanner un dossier de ROMs</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-6 md:p-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-5 select-none"
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
