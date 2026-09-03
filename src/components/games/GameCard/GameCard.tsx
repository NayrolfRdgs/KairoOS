import React, { useState } from 'react';
import { Star, Play, Heart, AlertCircle } from 'lucide-react';
import { Game } from '../../../types';
import { convertFileSrc } from '@tauri-apps/api/core';

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
  const [hasImgError, setHasImgError] = useState(false);

  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return convertFileSrc(url);
  };

  const year = game.release_date ? game.release_date.slice(0, 4) : '1995';
  const rating = game.rating || 4.7;

  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [isFocused]);

  return (
    <div
      ref={cardRef}
      data-game-id={game.id}
      onClick={() => onSelect(game)}
      className={`group relative flex flex-col shrink-0 w-44 sm:w-48 md:w-52 select-none cursor-pointer transition-all duration-200 ${
        isFocused ? 'scale-105 z-20' : 'hover:scale-[1.02] z-10'
      }`}
    >
      {/* 3:4 Vertical Portrait Arcade Container */}
      <div
        className={`relative w-full aspect-[3/4] rounded-2xl overflow-hidden border bg-white transition-all duration-300 shadow-sm ${
          isFocused
            ? 'border-rose-500 ring-4 ring-rose-500/40 shadow-kairo-glow'
            : 'border-purple-100/90 group-hover:border-purple-300'
        }`}
      >
        {/* Cover Image or White Placeholder with Exclamation */}
        {game.cover_url && !hasImgError ? (
          <img
            src={getImageUrl(game.cover_url)}
            alt={game.title}
            onError={() => setHasImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-white border-2 border-dashed border-rose-200/80 text-slate-400 select-none">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mb-2.5 shadow-2xs animate-pulse">
              <AlertCircle className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-xs font-black uppercase text-slate-800 line-clamp-2 px-1 font-sans">
              {game.title}
            </span>
            <span className="text-[10px] font-mono text-rose-500 mt-1 font-bold uppercase tracking-wider">
              ! Jaquette Manquante
            </span>
          </div>
        )}

        {/* Top Overlay Badge : Année, 2P & Note */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold border border-white/10 shadow-xs">
              {year}
            </span>
            {game.players && game.players >= 2 && (
              <span className="px-1.5 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-mono font-black border border-white/10 shadow-xs">
                {game.players}P
              </span>
            )}
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold border border-white/10 shadow-xs">
            <Star className="w-3 h-3 text-amber-400 fill-current" />
            <span>{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Favorite overlay button */}
        {game.favorite && (
          <div className="absolute bottom-2.5 right-2.5 z-10">
            <div className="p-1 rounded-full bg-rose-500 text-white shadow-xs">
              <Heart className="w-3 h-3 fill-current" />
            </div>
          </div>
        )}

        {/* Hover / Focus Overlay with Play & Favorite buttons */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-2.5 gap-2 transition-opacity duration-200 ${
            isFocused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLaunch(game);
            }}
            className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>JOUER</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(game);
            }}
            className="p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all active:scale-95"
            title="Favori"
          >
            <Heart className={`w-3.5 h-3.5 ${game.favorite ? 'fill-rose-400 text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Card Info Below Cover */}
      <div className="pt-2 px-0.5 space-y-0.5">
        <h3 className="font-extrabold text-xs text-slate-900 line-clamp-1 font-sans tracking-tight">
          {game.title}
        </h3>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans truncate">
          {game.system_id.toUpperCase()}
        </p>
      </div>
    </div>
  );
};
