import React from 'react';
import { Star, Gamepad2, Award } from 'lucide-react';
import { Game } from '../../../types';
import { convertFileSrc } from '@tauri-apps/api/core';

interface GameCardCoverProps {
  game: Game;
  onToggleFavorite: (game: Game) => void;
}

export const GameCardCover: React.FC<GameCardCoverProps> = ({ game, onToggleFavorite }) => {
  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return convertFileSrc(url);
  };

  return (
    <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-retro-bg to-white flex items-center justify-center overflow-hidden border-b border-retro-border">
      {game.cover_url ? (
        <img
          src={getImageUrl(game.cover_url)}
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

      {/* Bouton Favoris */}
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

      {/* Note / Score */}
      {game.rating !== undefined && game.rating > 0 && (
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md border border-retro-border flex items-center gap-1 text-[10px] font-bold text-amber-600 shadow-sm">
          <Award className="w-3 h-3 text-amber-500" />
          <span>{game.rating.toFixed(1)}</span>
        </div>
      )}
    </div>
  );
};
