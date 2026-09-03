import React, { useState, useEffect } from 'react';
import {
  Play,
  Heart,
  MoreHorizontal,
  Sliders,
  Calendar,
  Building,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Game } from '../../../types';
import { convertFileSrc } from '@tauri-apps/api/core';

interface HeroShowcaseProps {
  games: Game[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onLaunch: (game: Game) => void;
  onOpenDetails: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onOpenGamepadConfig?: () => void;
  isFocused?: boolean;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  games,
  currentIndex,
  onIndexChange,
  onLaunch,
  onOpenDetails,
  onToggleFavorite,
  onOpenGamepadConfig,
  isFocused = false,
}) => {
  const [selectedScreenshotIdx, setSelectedScreenshotIdx] = useState(0);

  const game = games[currentIndex] || games[0];

  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return convertFileSrc(url);
  };

  const hasRealScreenshots = !!(game?.screenshots && game.screenshots.length > 0);
  const screenshots = hasRealScreenshots ? game.screenshots! : [];

  const activeBackdrop = (hasRealScreenshots && screenshots[selectedScreenshotIdx])
    ? screenshots[selectedScreenshotIdx]
    : (game?.backdrop_url || game?.cover_url);

  useEffect(() => {
    setSelectedScreenshotIdx(0);
  }, [game?.id]);

  if (!game) return null;

  const year = game.release_date ? game.release_date.slice(0, 4) : '1995';
  const developer = game.developer || game.publisher || 'KAÏRO';
  const players = game.players || 1;
  const rating = game.rating || 4.8;
  const originalTitle = game.original_title || game.franchise || '';

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (games.length <= 1) return;
    onIndexChange((currentIndex - 1 + games.length) % games.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (games.length <= 1) return;
    onIndexChange((currentIndex + 1) % games.length);
  };

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border transition-all duration-300 select-none ${
        isFocused
          ? 'ring-4 ring-rose-500/40 border-rose-400 shadow-kairo-glow scale-[1.003]'
          : 'border-purple-100/90 bg-white/90 shadow-sm'
      }`}
    >
      {/* Background Artwork Layer with Smooth Fade to White on the Left */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {activeBackdrop ? (
          <img
            src={getImageUrl(activeBackdrop)}
            alt={game.title}
            className="w-full h-full object-cover object-right md:object-center transition-all duration-700 filter brightness-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-50 via-pink-50/40 to-white" />
        )}
        {/* Soft Multi-Stop Gradient Overlays for High Contrast Typography */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/40 w-full md:w-3/4 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent z-10" />
      </div>

      {/* Navigation Arrows (Prev / Next) for Carousel */}
      {games.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-purple-100/80 shadow-md flex items-center justify-center text-slate-600 hover:text-rose-600 transition-all active:scale-90"
            title="Jeu précédent (LB)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-white/80 hover:bg-white border border-purple-100/80 shadow-md flex items-center justify-center text-slate-600 hover:text-rose-600 transition-all active:scale-90"
            title="Jeu suivant (RB)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Content Container */}
      <div className="relative z-20 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[340px] md:min-h-[380px]">
        {/* Left Side: Game Info, Badges, Meta, CTAs */}
        <div className="flex-1 max-w-xl space-y-3.5 pl-6 sm:pl-4">
          {/* System Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/90 border border-pink-200 text-rose-600 text-[10px] font-black uppercase tracking-wider font-mono shadow-xs">
            <span>{game.system_id.toUpperCase()}</span>
            <span>•</span>
            <span>ARCADE</span>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-sans tracking-tight text-slate-900 leading-none">
              {game.title}
            </h1>
            {originalTitle && (
              <p className="text-xs sm:text-sm font-black text-rose-600 tracking-widest uppercase">
                {originalTitle}
              </p>
            )}
          </div>

          {/* Star Rating & Count */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'fill-current text-amber-400'
                      : 'text-slate-200 fill-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="font-mono text-slate-800 font-black">{rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({game.play_count || 126})</span>
          </div>

          {/* Tags Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {game.genre && (
              <span className="px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-rose-600 text-[10px] font-black uppercase font-mono">
                {game.genre.split('/')[0]}
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-black uppercase font-mono">
              ARCADE
            </span>
            {players >= 2 && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase font-mono">
                {players} JOUEURS
              </span>
            )}
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-sans max-w-lg">
            {game.synopsis ||
              'Découvrez ce titre d\'exception optimisé pour votre borne d\'arcade KaïroOS.'}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{developer}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{players} {players > 1 ? 'JOUEURS' : 'JOUEUR'}</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 pt-2">
            {/* Big Magenta CTA: JOUER */}
            <button
              onClick={() => onLaunch(game)}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-black font-sans text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>JOUER</span>
            </button>

            {/* Favorite Button */}
            <button
              onClick={() => onToggleFavorite(game)}
              title={game.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={`p-3 rounded-2xl border transition-all active:scale-95 ${
                game.favorite
                  ? 'bg-pink-50 border-pink-300 text-rose-500 shadow-xs'
                  : 'bg-white border-purple-100 text-slate-400 hover:text-rose-500 hover:border-pink-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${game.favorite ? 'fill-current text-rose-500' : ''}`} />
            </button>

            {/* Details Button */}
            <button
              onClick={() => onOpenDetails(game)}
              title="Voir la fiche détaillée du jeu"
              className="p-3 rounded-2xl border border-purple-100 bg-white hover:bg-purple-50 text-slate-500 hover:text-slate-800 shadow-xs transition-all active:scale-95"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Controller Setup Button */}
            {onOpenGamepadConfig && (
              <button
                onClick={onOpenGamepadConfig}
                title="Configurer les boutons arcade pour ce jeu"
                className="p-3 rounded-2xl border border-purple-100 bg-white hover:bg-purple-50 text-slate-500 hover:text-slate-800 shadow-xs transition-all active:scale-95"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Clean Game Media (Cover or Real Screenshots) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0 z-20 pr-4">
          {hasRealScreenshots ? (
            <div className="flex flex-col gap-2">
              {screenshots.slice(0, 3).map((shot, idx) => {
                const isSelected = selectedScreenshotIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedScreenshotIdx(idx)}
                    className={`w-28 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 relative group shadow-sm ${
                      isSelected
                        ? 'border-rose-500 ring-2 ring-rose-400/50 scale-105 shadow-md'
                        : 'border-white/80 hover:border-purple-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(shot)} alt="" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          ) : game.cover_url ? (
            <div className="w-36 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white rotate-1 hover:rotate-0 transition-transform">
              <img
                src={getImageUrl(game.cover_url)}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Carousel Dots Indicator at Bottom Center */}
      {games.length > 1 && (
        <div className="relative z-20 pb-3 flex items-center justify-center gap-2">
          {games.map((_, idx) => (
            <button
              key={idx}
              onClick={() => onIndexChange(idx)}
              className={`transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 h-1.5 rounded-full bg-rose-500'
                  : 'w-2 h-1.5 rounded-full bg-purple-200 hover:bg-purple-300'
              }`}
              title={`Passer au jeu ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
