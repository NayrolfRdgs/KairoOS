import React from 'react';
import { Star, Gamepad2, Play, Clock, Award } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  isFocused: boolean;
  onSelect: (game: Game) => void;
  onLaunch: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isFocused,
  onSelect,
  onLaunch,
  onToggleFavorite,
}) => {
  const formatPlayTime = (seconds: number) => {
    if (seconds === 0) return null;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const playTimeStr = formatPlayTime(game.play_time_seconds);

  return (
    <div
      onClick={() => onSelect(game)}
      onDoubleClick={() => onLaunch(game)}
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-arcade-card border transition-all duration-200 cursor-pointer ${
        isFocused
          ? 'gamepad-focused border-arcade-accent scale-105 z-20'
          : 'border-arcade-border/80 hover:border-arcade-accent/60 hover:scale-[1.02]'
      }`}
    >
      <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-arcade-surface to-arcade-bg flex items-center justify-center overflow-hidden">
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-arcade-border/30 border border-arcade-border/50 flex items-center justify-center mb-3 shadow-inner">
              <Gamepad2 className="w-8 h-8 text-arcade-accent/70" />
            </div>
            <span className="text-xs font-black text-arcade-text line-clamp-3 uppercase tracking-wider font-display">
              {game.title}
            </span>
            <span className="text-[10px] text-arcade-muted mt-1 uppercase font-semibold">
              {game.system_id}
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all ${
            game.favorite
              ? 'bg-arcade-gold/20 text-arcade-gold border border-arcade-gold/40'
              : 'bg-black/40 text-white/40 hover:text-white border border-white/10'
          }`}
        >
          <Star className={`w-4 h-4 ${game.favorite ? 'fill-arcade-gold' : ''}`} />
        </button>

        {game.rating && game.rating > 0 && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1 text-[10px] font-bold text-arcade-gold">
            <Award className="w-3 h-3" />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        )}

        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
            isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLaunch(game);
            }}
            className="w-12 h-12 rounded-full bg-arcade-accent text-arcade-bg flex items-center justify-center shadow-lg shadow-arcade-accent/50 hover:scale-110 active:scale-95 transition-all"
          >
            <Play className="w-6 h-6 fill-arcade-bg ml-1" />
          </button>
        </div>
      </div>

      <div className="p-3.5 flex flex-col justify-between flex-1 bg-arcade-card/90">
        <div>
          <h3 className="text-xs font-bold text-arcade-text truncate font-display tracking-wide" title={game.title}>
            {game.title}
          </h3>
          <div className="flex items-center justify-between mt-1 text-[10px] text-arcade-muted">
            <span className="truncate uppercase font-medium">{game.developer || game.publisher || game.system_id}</span>
            {game.release_date && <span>{game.release_date.slice(0, 4)}</span>}
          </div>
        </div>

        {playTimeStr && (
          <div className="mt-2 pt-2 border-t border-arcade-border/40 flex items-center gap-1.5 text-[10px] text-arcade-muted">
            <Clock className="w-3 h-3 text-arcade-accent" />
            <span>Joué: {playTimeStr}</span>
          </div>
        )}
      </div>
    </div>
  );
};
