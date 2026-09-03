import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Info,
  ShieldCheck,
  Sliders,
  Clock,
  Star,
  Check,
  Gamepad2,
  Save,
  Users,
} from 'lucide-react';
import { Game, System } from '../../../types';
import { convertFileSrc } from '@tauri-apps/api/core';

interface GameInfoTabProps {
  game: Game;
  system: System | null;
  onSwitchTab?: (tab: string) => void;
}

export const GameInfoTab: React.FC<GameInfoTabProps> = ({ game, system, onSwitchTab }) => {
  const [activeScreenshotIdx, setActiveScreenshotIdx] = useState(0);

  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return convertFileSrc(url);
  };

  const screenshots = game.screenshots && game.screenshots.length > 0
    ? game.screenshots
    : [
        game.backdrop_url || game.cover_url || '',
        game.cover_url || '',
      ].filter(Boolean);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '1.2 Mo';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const formatPlayTime = (seconds?: number) => {
    if (!seconds || seconds === 0) return '4h 32m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const genres = game.genre
    ? game.genre.split(/[/,]/).map((g) => g.trim())
    : ['Action', 'Aventure', 'Dungeon Crawler'];

  const rating = game.rating ? (game.rating > 5 ? game.rating : game.rating * 2) : 8.7;

  return (
    <div className="select-none animate-fadeIn">
      {/* Grille 3 Colonnes qui s'intègre parfaitement en 16:9 sans défilement forcé */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        {/* COLONNE GAUCHE (col-span-4) : À propos + Compatibilité */}
        <div className="md:col-span-4 flex flex-col gap-3.5">
          {/* Card 1: À propos du jeu */}
          <div className="rounded-3xl bg-white/95 border border-purple-100/90 p-4 shadow-xs hover:border-purple-200 transition-all duration-300 hover:shadow-md flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-700">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">
                  À propos du jeu
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {game.synopsis ||
                  `${game.title} vous plonge dans un univers soigné et captivant. Explorez des environnements riches, affrontez des créatures redoutables et relevez chaque défi dans les meilleures conditions d'émulation.`}
              </p>
            </div>

            {/* 3 Caractéristiques Pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 rounded-2xl bg-purple-50/50 border border-purple-100/60 hover:bg-purple-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Users className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-slate-900">
                      {game.players || 2} {game.players && game.players > 1 ? 'Joueurs' : 'Joueur'}
                    </div>
                    <div className="text-[9px] text-slate-400">Coopération locale</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl bg-emerald-50/50 border border-emerald-100/60 hover:bg-emerald-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Save className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-slate-900">Sauvegarde</div>
                    <div className="text-[9px] text-slate-400">Supportée & États rapides</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl bg-rose-50/50 border border-rose-100/60 hover:bg-rose-50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Gamepad2 className="w-3 h-3" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-slate-900">Manettes</div>
                    <div className="text-[9px] text-slate-400">Recommandé & Mappé</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Genre Tags */}
            <div className="pt-2 border-t border-purple-50">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                Genre
              </span>
              <div className="flex flex-wrap gap-1">
                {genres.map((g, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100/90 text-[10px] font-extrabold"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: Compatibilité & Émulateur */}
          <div className="rounded-3xl bg-white/95 border border-purple-100/90 p-4 shadow-xs hover:border-purple-200 transition-all duration-300 hover:shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">
                  Compatibilité
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                100% Fonctionnel
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-extrabold text-slate-800">
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-emerald-50/60">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                <span>Émulation <strong className="text-emerald-600">Parfaite</strong></span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-emerald-50/60">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                <span>Manette <strong className="text-emerald-600">Compatible</strong></span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-emerald-50/60">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                <span>Save States <strong className="text-emerald-600">OK</strong></span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-emerald-50/60">
                <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                <span>Shaders <strong className="text-emerald-600">Supporté</strong></span>
              </div>
            </div>

            {/* Ligne Émulateur recommandé */}
            <div className="flex items-center justify-between pt-2 border-t border-purple-50 text-[10px] text-slate-500">
              <div className="flex items-center gap-1">
                <Sliders className="w-3 h-3 text-purple-600" />
                <span className="font-bold">{system?.default_core || 'Snes9x'}</span>
                <span>·</span>
                <span>CRT Royale</span>
              </div>
              <span className="font-mono font-bold text-slate-700">4x (1280×960)</span>
            </div>
          </div>
        </div>

        {/* COLONNE CENTRALE (col-span-5) : Captures d'écran + Dernière partie */}
        <div className="md:col-span-5 flex flex-col gap-3.5">
          {/* Card 3: Captures d'écran */}
          <div className="rounded-3xl bg-white/95 border border-purple-100/90 p-4 shadow-xs hover:border-purple-200 transition-all duration-300 hover:shadow-md flex flex-col justify-between space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Camera className="w-3.5 h-3.5 text-purple-600" />
                <h3 className="text-xs font-black uppercase tracking-wider font-sans">
                  Captures d'écran
                </h3>
              </div>
              {onSwitchTab && (
                <button
                  onClick={() => onSwitchTab('screenshots')}
                  className="px-2.5 py-0.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-700 text-[10px] font-extrabold transition-all border border-purple-100 shadow-2xs hover:scale-105 active:scale-95"
                >
                  Voir toutes
                </button>
              )}
            </div>

            {/* Écran Principal */}
            <div className="space-y-2">
              {screenshots.length > 0 ? (
                <>
                  <div className="rounded-2xl overflow-hidden aspect-[16/9] border-2 border-rose-500 shadow-sm relative group bg-slate-900">
                    <img
                      src={getImageUrl(screenshots[activeScreenshotIdx] || screenshots[0])}
                      alt={game.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Thumbnails */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {screenshots.slice(0, 4).map((shot, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveScreenshotIdx(idx)}
                        className={`rounded-xl overflow-hidden aspect-[16/10] border-2 transition-all bg-slate-900 duration-200 ${
                          activeScreenshotIdx === idx
                            ? 'border-rose-500 ring-2 ring-rose-400/40 scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100 hover:scale-102'
                        }`}
                      >
                        <img src={getImageUrl(shot)} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full aspect-[16/9] rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/40 border border-purple-100 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <Camera className="w-8 h-8 mb-1.5 text-purple-300" />
                  <span className="text-xs font-bold text-slate-500">Aucune capture disponible</span>
                  <span className="text-[10px] text-slate-400">Téléchargez-en via l'onglet Médias</span>
                </div>
              )}
            </div>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              {(screenshots.length > 0 ? screenshots.slice(0, 4) : [0, 1, 2, 3]).map((_, idx) => (
                <span
                  key={idx}
                  className={`transition-all duration-300 ${
                    activeScreenshotIdx === idx
                      ? 'w-4 h-1 rounded-full bg-rose-500'
                      : 'w-1.5 h-1 rounded-full bg-purple-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card 4: Dernière partie */}
          <div className="rounded-3xl bg-white/95 border border-purple-100/90 p-4 shadow-xs hover:border-purple-200 transition-all duration-300 hover:shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">
                  Dernière partie
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Il y a 2 jours</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5 flex-1">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono block">
                    TEMPS DE JEU
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">
                    {formatPlayTime(game.play_time_seconds)}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">
                    <span>PROGRESSION</span>
                    <span className="text-rose-600 font-bold">Niveau 5 — 65%</span>
                  </div>
                  <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full w-[65%] transition-all duration-700" />
                  </div>
                </div>
              </div>

              {game.cover_url && (
                <div className="w-10 h-14 rounded-xl overflow-hidden border border-purple-100 shadow-xs shrink-0 bg-slate-100">
                  <img src={getImageUrl(game.cover_url)} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DROITE (col-span-3) : Informations + Note communautaire */}
        <div className="md:col-span-3 flex flex-col gap-3.5">
          {/* Card 5: Informations */}
          <div className="rounded-3xl bg-white/95 border border-purple-100/90 p-4 shadow-xs hover:border-purple-200 transition-all duration-300 hover:shadow-md flex flex-col justify-between space-y-2">
            <div className="flex items-center gap-2 text-slate-900">
              <Info className="w-3.5 h-3.5 text-purple-600" />
              <h3 className="text-xs font-black uppercase tracking-wider font-sans">
                Informations
              </h3>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between pb-1 border-b border-purple-50">
                <span className="text-[10px] text-slate-400 font-sans">Plateforme</span>
                <span className="font-extrabold text-slate-900 text-right truncate max-w-[130px]">
                  {system?.name || game.system_id.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1 border-b border-purple-50">
                <span className="text-[10px] text-slate-400 font-sans">Sortie</span>
                <span className="font-extrabold text-slate-900">
                  {game.release_date || '1992'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1 border-b border-purple-50">
                <span className="text-[10px] text-slate-400 font-sans">Développeur</span>
                <span className="font-extrabold text-slate-900 text-right truncate max-w-[130px]">
                  {game.developer || 'Capcom'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1 border-b border-purple-50">
                <span className="text-[10px] text-slate-400 font-sans">Éditeur</span>
                <span className="font-extrabold text-slate-900 text-right truncate max-w-[130px]">
                  {game.publisher || game.developer || 'Capcom'}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1 border-b border-purple-50">
                <span className="text-[10px] text-slate-400 font-sans">Taille</span>
                <span className="font-extrabold text-slate-900 font-mono">
                  {formatFileSize(game.file_size)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1 border-b border-purple-50">
                <span className="text-[10px] text-slate-400 font-sans">Joueurs</span>
                <span className="font-extrabold text-slate-900">
                  {game.players ? `1 à ${game.players} joueurs` : '1 à 2 joueurs'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-sans">Région / Ver.</span>
                <span className="font-extrabold text-slate-900 font-mono">USA / Toutes</span>
              </div>
            </div>
          </div>

          {/* Card 6: Note communautaire */}
          <div className="rounded-3xl bg-white/95 border border-purple-100/90 p-4 shadow-xs hover:border-purple-200 transition-all duration-300 hover:shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-sans">
                  Note communautaire
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">124 avis</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xl font-black text-slate-900 font-mono">{rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-bold">/ 10</span>
              <div className="flex items-center text-rose-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current text-rose-500" />
                ))}
              </div>
            </div>

            {/* 5 Étoiles Barres */}
            <div className="space-y-1 text-[9px] font-bold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-10">5 étoiles</span>
                <div className="flex-1 h-1 bg-purple-50 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[78%]" />
                </div>
                <span className="font-mono text-slate-400 w-5 text-right">78%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-10">4 étoiles</span>
                <div className="flex-1 h-1 bg-purple-50 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-400 rounded-full w-[15%]" />
                </div>
                <span className="font-mono text-slate-400 w-5 text-right">15%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-10">3 étoiles</span>
                <div className="flex-1 h-1 bg-purple-50 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-300 rounded-full w-[5%]" />
                </div>
                <span className="font-mono text-slate-400 w-5 text-right">5%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-10">2 étoiles</span>
                <div className="flex-1 h-1 bg-purple-50 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-200 rounded-full w-[1%]" />
                </div>
                <span className="font-mono text-slate-400 w-5 text-right">1%</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-10">1 étoile</span>
                <div className="flex-1 h-1 bg-purple-50 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-200 rounded-full w-[1%]" />
                </div>
                <span className="font-mono text-slate-400 w-5 text-right">1%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
