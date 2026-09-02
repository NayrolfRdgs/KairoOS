import React from 'react';
import { Star, Gamepad2, Play, Clock, Award, Info } from 'lucide-react';
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
      className={`group relative flex flex-col rounded-2xl overflow-hidden bg-white border transition-all duration-200 cursor-pointer shadow-retro hover:shadow-retro-md ${
        isFocused
          ? 'gamepad-focused border-retro-primary z-20'
          : 'border-retro-border hover:border-retro-primary/60 hover:-translate-y-1'
      }`}
    >
      {/* Game Cover Art Container */}
      <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-retro-bg to-white flex items-center justify-center overflow-hidden border-b border-retro-border">
        {game.cover_url ? (
          <img
            src={game.cover_url}
            alt={game.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-5 text-center">
            <div className="w-14 h-14 rounded-2xl bg-retro-bg border border-retro-border flex items-center justify-center mb-2 shadow-inner">
              <Gamepad2 className="w-7 h-7 text-retro-primary" />
            </div>
            <span className="text-xs font-black text-retro-text line-clamp-3 uppercase tracking-wider font-display">
              {game.title}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-retro-bg text-retro-textMuted mt-1.5 uppercase font-bold border border-retro-border">
              {game.system_id}
            </span>
          </div>
        )}

        {/* Favorite Star Button (Souris cliquable) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(game);
          }}
          title={game.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
            game.favorite
              ? 'bg-amber-100 text-amber-500 border border-amber-300 hover:scale-110'
              : 'bg-white/80 text-retro-textLight hover:text-amber-500 hover:bg-white border border-retro-border'
          }`}
        >
          <Star className={`w-4 h-4 ${game.favorite ? 'fill-amber-400' : ''}`} />
        </button>

        {/* Rating Badge */}
        {game.rating && game.rating > 0 && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-retro-border flex items-center gap-1 text-[10px] font-bold text-amber-600 shadow-sm">
            <Award className="w-3 h-3 text-amber-500" />
            <span>{game.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Hover / Focused Action Overlay */}
        <div
          className={`absolute inset-0 bg-retro-text/40 backdrop-blur-[2px] flex items-center justify-center gap-3 transition-opacity duration-200 ${
            isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLaunch(game);
            }}
            title="Lancer le jeu (Entrée ou Double-clic)"
            className="w-12 h-12 rounded-full bg-retro-primary text-white flex items-center justify-center shadow-retro-neon hover:scale-110 active:scale-95 transition-all"
          >
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(game);
            }}
            title="Détails & Config"
            className="w-10 h-10 rounded-full bg-white text-retro-text flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
          >
            <Info className="w-5 h-5 text-retro-text" />
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h3 className="text-xs font-bold text-retro-text truncate font-display tracking-wide" title={game.title}>
            {game.title}
          </h3>
          <div className="flex items-center justify-between mt-1 text-[10px] text-retro-textMuted">
            <span className="truncate uppercase font-semibold text-retro-primary">{game.system_id}</span>
            {game.release_date && <span className="font-medium">{game.release_date.slice(0, 4)}</span>}
          </div>
        </div>

        {playTimeStr && (
          <div className="mt-2 pt-2 border-t border-retro-border flex items-center gap-1.5 text-[10px] text-retro-textMuted font-medium">
            <Clock className="w-3 h-3 text-retro-cyan" />
            <span>{playTimeStr}</span>
          </div>
        )}
      </div>
    </div>
  );
};
