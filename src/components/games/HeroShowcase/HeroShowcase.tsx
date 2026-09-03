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
  ChevronDown,
} from 'lucide-react';
import { Game } from '../../../types';
import { convertFileSrc } from '@tauri-apps/api/core';

interface HeroShowcaseProps {
  game: Game;
  onLaunch: (game: Game) => void;
  onOpenDetails: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onOpenGamepadConfig?: () => void;
  isFocused?: boolean;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  game,
  onLaunch,
  onOpenDetails,
  onToggleFavorite,
  onOpenGamepadConfig,
  isFocused = false,
}) => {
  const [selectedScreenshotIdx, setSelectedScreenshotIdx] = useState(0);

  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return convertFileSrc(url);
  };

  const screenshots = game.screenshots && game.screenshots.length > 0
    ? game.screenshots
    : [
        game.backdrop_url || game.cover_url || 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7xvd.jpg',
        'https://images.igdb.com/igdb/image/upload/t_720p/sc7xvc.jpg',
        'https://images.igdb.com/igdb/image/upload/t_720p/sc7xvb.jpg',
        'https://images.igdb.com/igdb/image/upload/t_720p/sc7xva.jpg',
      ];

  const activeBackdrop = screenshots[selectedScreenshotIdx] || game.backdrop_url || game.cover_url;

  useEffect(() => {
    setSelectedScreenshotIdx(0);
  }, [game.id]);

  const year = game.release_date ? game.release_date.slice(0, 4) : '1992';
  const developer = game.developer || game.publisher || 'CAPCOM';
  const players = game.players || 2;
  const rating = game.rating || 4.8;
  const originalTitle = game.original_title || 'CHAMPION EDITION';

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border transition-all duration-300 shadow-md ${
        isFocused
          ? 'ring-4 ring-rose-500/40 border-rose-400 shadow-kairo-glow scale-[1.005]'
          : 'border-purple-100/90 bg-white/90 shadow-sm'
      }`}
    >
      {/* Background Artwork Layer with Smooth Fade to White on the Left */}
      <div className="absolute inset-0 z-0">
        <img
          src={getImageUrl(activeBackdrop)}
          alt={game.title}
          className="w-full h-full object-cover object-right md:object-center transition-all duration-700 filter brightness-105"
        />
        {/* Soft Multi-Stop Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent w-full md:w-3/4 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent z-10" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 min-h-[360px] md:min-h-[400px]">
        {/* Left Side: Game Info, Badges, Meta, CTAs */}
        <div className="flex-1 max-w-xl space-y-4">
          {/* System Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100/90 border border-pink-200 text-rose-600 text-[10px] font-black uppercase tracking-wider font-mono shadow-xs">
            <span>{game.system_id.toUpperCase()}</span>
            <span>•</span>
            <span>ARCADE</span>
          </div>

          {/* Title & Subtitle */}
          <div className="space-y-0.5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans tracking-tight text-slate-900 leading-none">
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
            <span className="px-2.5 py-0.5 rounded-full bg-pink-50 border border-pink-200 text-rose-600 text-[10px] font-black uppercase font-mono">
              {game.genre?.split('/')[0] || 'COMBAT'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-black uppercase font-mono">
              ARCADE
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase font-mono">
              {players} JOUEURS
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-sans max-w-lg">
            {game.synopsis ||
              'Le jeu de combat légendaire qui a révolutionné l\'arcade. Choisissez votre combattant et devenez le champion du monde !'}
          </p>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
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
              <span>{players} JOUEURS</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 pt-3">
            {/* Big Magenta CTA: JOUER */}
            <button
              onClick={() => onLaunch(game)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-black font-sans text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
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
              className="p-3 rounded-2xl border border-purple-100 bg-white hover:bg-purple-50 text-slate-400 hover:text-slate-800 shadow-xs transition-all active:scale-95"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Controller Setup Button */}
            {onOpenGamepadConfig && (
              <button
                onClick={onOpenGamepadConfig}
                title="Configurer les boutons arcade pour ce jeu"
                className="p-3 rounded-2xl border border-purple-100 bg-white hover:bg-purple-50 text-slate-400 hover:text-slate-800 shadow-xs transition-all active:scale-95"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Vertical Screenshot Gallery Carousel */}
        <div className="hidden lg:flex flex-col gap-2.5 shrink-0 z-20">
          {screenshots.slice(0, 4).map((shot, idx) => {
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
                {isSelected && (
                  <div className="absolute inset-0 bg-rose-500/10 pointer-events-none" />
                )}
              </button>
            );
          })}

          <div className="flex justify-center pt-1">
            <button
              onClick={() => setSelectedScreenshotIdx((prev) => (prev + 1) % screenshots.length)}
              className="p-1 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 shadow-xs transition-all"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Dots Indicator at Bottom Center */}
      <div className="relative z-20 pb-3 flex items-center justify-center gap-1.5">
        <span className="w-6 h-1.5 rounded-full bg-rose-500" />
        <span className="w-2 h-1.5 rounded-full bg-purple-200" />
        <span className="w-2 h-1.5 rounded-full bg-purple-200" />
        <span className="w-2 h-1.5 rounded-full bg-purple-200" />
      </div>
    </div>
  );
};
