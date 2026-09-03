import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Game } from '../../../types';
import { GameCard } from '../GameCard';

interface GameShelfProps {
  title: string;
  games: Game[];
  focusedGameId?: string | null;
  onSelectGame: (game: Game) => void;
  onLaunchGame: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
}

export const GameShelf: React.FC<GameShelfProps> = ({
  title,
  games,
  focusedGameId,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  if (games.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Shelf Header */}
      <div className="flex items-center justify-between px-1 select-none">
        <div className="flex items-center gap-2">
          {/* Vertical Magenta Bar */}
          <span className="w-1.5 h-4 rounded-full bg-rose-500" />
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">
            {title}
          </h2>
        </div>

        {/* Carousel Arrow Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full bg-white border border-purple-100 hover:border-rose-300 text-slate-400 hover:text-rose-500 shadow-xs transition-all active:scale-90"
            title="Précédent"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full bg-white border border-purple-100 hover:border-rose-300 text-slate-400 hover:text-rose-500 shadow-xs transition-all active:scale-90"
            title="Suivant"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Scroller */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-2 px-1 scrollbar-none scroll-smooth"
      >
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
