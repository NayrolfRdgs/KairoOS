import React from 'react';
import {
  Calendar,
  Building,
  Users,
  Tv,
  Sparkles,
  Info,
} from 'lucide-react';
import { Game, System } from '../../../types';

interface GameInfoTabProps {
  game: Game;
  system: System | null;
}

export const GameInfoTab: React.FC<GameInfoTabProps> = ({ game, system }) => {
  const year = game.release_date ? game.release_date.slice(0, 4) : '1992';
  const developer = game.developer || 'Capcom';
  const players = game.players || 2;

  const screenshots = game.screenshots && game.screenshots.length > 0
    ? game.screenshots
    : [
        game.backdrop_url || game.cover_url || 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7xvd.jpg',
        'https://images.igdb.com/igdb/image/upload/t_720p/sc7xvc.jpg',
        'https://images.igdb.com/igdb/image/upload/t_720p/sc7xvb.jpg',
        'https://images.igdb.com/igdb/image/upload/t_720p/sc7xva.jpg',
      ];

  return (
    <div className="space-y-6">
      {/* 1. Grille de Métadonnées Clés */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-purple-100/90 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase">
            <Tv className="w-3.5 h-3.5 text-rose-500" />
            <span>Plateforme</span>
          </div>
          <p className="text-xs font-black text-slate-900 truncate">
            {system?.name || game.system_id.toUpperCase()}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-purple-100/90 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase">
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            <span>Sortie</span>
          </div>
          <p className="text-xs font-black text-slate-900">{year}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-purple-100/90 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase">
            <Building className="w-3.5 h-3.5 text-indigo-500" />
            <span>Développeur</span>
          </div>
          <p className="text-xs font-black text-slate-900 truncate">{developer}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-purple-100/90 shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>Joueurs</span>
          </div>
          <p className="text-xs font-black text-slate-900">
            {players === 1 ? '1 Joueur' : `1 à ${players} Joueurs`}
          </p>
        </div>
      </div>

      {/* 2. Description / Synopsis */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-500" />
          <span>Description du Jeu</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
          {game.synopsis ||
            'Un titre légendaire de l\'histoire du jeu vidéo arcade. Plongez dans des combats intenses et relevez tous les défis dans les meilleures conditions d\'émulation.'}
        </p>
      </div>

      {/* 3. Galerie de Screenshots Horizontale */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 px-1 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Captures d'Écran & Artworks</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {screenshots.map((shot, idx) => (
            <div
              key={idx}
              className="relative aspect-video rounded-2xl overflow-hidden border border-purple-100/90 bg-slate-100 group cursor-pointer hover:border-rose-400 hover:scale-105 transition-all shadow-xs"
            >
              <img src={shot} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Guide des Touches Manette (Arcade HUD) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-slate-700 font-mono">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px]">A</span>
          <span>Jouer</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-white text-[10px]">B</span>
          <span>Retour</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px]">X</span>
          <span>Favori</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px]">D-PAD</span>
          <span>Parcourir</span>
        </div>
      </div>
    </div>
  );
};
