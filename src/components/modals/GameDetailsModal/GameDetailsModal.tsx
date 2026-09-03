import React, { useState } from 'react';
import {
  ChevronLeft,
  Play,
  Heart,
  Star,
  Tv,
  Calendar,
  Building,
  Users,
  Gamepad2,
  FolderPlus,
  MoreHorizontal,
  FileText,
  Camera,
} from 'lucide-react';
import { Emulator, Game, GameConfig, LocalGameMetadata, System } from '../../../types';
import { GameInfoTab } from './GameInfoTab';
import { GameMetadataTab } from './GameMetadataTab';
import { GameConfigTab } from './GameConfigTab';
import { convertFileSrc } from '@tauri-apps/api/core';

interface GameDetailsModalProps {
  game: Game;
  system: System | null;
  config: GameConfig | null;
  emulators: Emulator[];
  onClose: () => void;
  onLaunch: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onSaveConfig: (config: GameConfig) => void;
  onSaveMetadata: (gameId: string, metadata: LocalGameMetadata) => Promise<void>;
  onOpenFranchiseOrganizer: (game: Game) => void;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  system,
  config,
  emulators,
  onClose,
  onLaunch,
  onToggleFavorite,
  onSaveConfig,
  onSaveMetadata,
  onOpenFranchiseOrganizer,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'screenshots' | 'media' | 'history' | 'emulator'>('overview');

  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
    return convertFileSrc(url);
  };

  const backdropRaw = game.backdrop_url || game.cover_url || '';
  const backdrop = getImageUrl(backdropRaw);

  const year = game.release_date ? game.release_date.slice(0, 4) : '1992';
  const developer = game.developer || 'Capcom';
  const players = game.players || 2;
  const genre = game.genre || 'Action / Aventure';
  const rating = game.rating ? (game.rating > 5 ? game.rating : game.rating * 2) : 8.7;

  return (
    <div className="fixed inset-y-0 right-0 left-72 z-30 flex flex-col bg-[#f8f7ff] border-l border-purple-100/80 select-none animate-fadeIn overflow-hidden shadow-2xl">
      {/* 1. TOP ACTION ROW : Retour + Favori + Lancer la partie */}
      <div className="px-8 py-3.5 flex items-center justify-between z-20 shrink-0 bg-[#f8f7ff]/90 backdrop-blur-md border-b border-purple-100/50">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-purple-100/90 text-slate-700 hover:text-slate-900 text-xs font-bold hover:bg-purple-50 shadow-2xs transition-all active:scale-95"
          title="Retour au catalogue (Touche B / Échap)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Bouton Ajouter aux favoris */}
          <button
            onClick={() => onToggleFavorite(game)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-2xs active:scale-95 ${
              game.favorite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-purple-100/90 text-slate-700 hover:text-rose-600 hover:border-pink-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${game.favorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span>{game.favorite ? 'Favori' : 'Ajouter aux favoris'}</span>
          </button>

          {/* Bouton Principal : Lancer la partie */}
          <button
            onClick={() => onLaunch(game)}
            className="flex items-center gap-2.5 px-6 py-2 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <span className="w-4 h-4 rounded-full bg-white text-rose-600 flex items-center justify-center text-[10px] font-mono font-black">
              A
            </span>
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Lancer la partie</span>
          </button>
        </div>
      </div>

      {/* ZONE DÉROULANTE : HERO + ONGLETS + CONTENU */}
      <div className="flex-1 overflow-y-auto px-8 py-5 space-y-6 scrollbar-thin pb-24">
        {/* 2. GRAND HERO SECTION DU JEU */}
        <div className="relative rounded-3xl border border-purple-100/90 bg-white/95 shadow-sm overflow-hidden p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 min-h-[220px]">
          {/* Background Artwork Layer avec dégradé doux vers la gauche */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {backdrop ? (
              <img
                src={backdrop}
                alt={game.title}
                className="w-full h-full object-cover object-right filter brightness-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-white via-purple-50/40 to-pink-50/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent w-full lg:w-3/4 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent z-10" />
          </div>

          {/* Contenu du Hero (Z-10) */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1">
            {/* Jaquette du jeu à gauche */}
            <div className="w-40 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-white/60 bg-white shrink-0">
              {game.cover_url ? (
                <img
                  src={getImageUrl(game.cover_url)}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 text-slate-400 text-center">
                  <Gamepad2 className="w-10 h-10 text-rose-400 mb-2" />
                  <span className="text-[10px] font-bold text-slate-600 line-clamp-2">{game.title}</span>
                </div>
              )}
            </div>

            {/* Titre & Métadonnées au centre */}
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-black font-sans tracking-tight text-slate-900 leading-none">
                {game.title}
              </h1>

              {/* Ligne Métadonnées avec icônes */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-[11px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-800">{system?.name || game.system_id.toUpperCase()}</span>
                  <span className="text-slate-400 font-normal">Plateforme</span>
                </div>

                <span>·</span>

                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-800">{year}</span>
                  <span className="text-slate-400 font-normal">Sortie</span>
                </div>

                <span>·</span>

                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-800">{developer}</span>
                  <span className="text-slate-400 font-normal">Développeur</span>
                </div>

                <span>·</span>

                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-800">{players === 1 ? '1 joueur' : `1 à ${players} joueurs`}</span>
                  <span className="text-slate-400 font-normal">Joueurs</span>
                </div>

                <span>·</span>

                <div className="flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-800">{genre}</span>
                  <span className="text-slate-400 font-normal">Genre</span>
                </div>
              </div>

              {/* Synopsis */}
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl line-clamp-3">
                {game.synopsis ||
                  "Un titre légendaire de l'histoire du jeu vidéo arcade. Plongez dans des combats intenses et relevez tous les défis dans les meilleures conditions d'émulation."}
              </p>
            </div>
          </div>

          {/* Carte de Notation à droite du Hero */}
          <div className="relative z-10 shrink-0 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 shadow-sm flex items-center gap-3">
            <div className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white font-mono font-black text-sm shadow-xs">
              {rating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">Excellent</span>
              </div>
              <div className="text-[10px] text-slate-400">Basé sur 124 avis</div>
              <div className="flex items-center text-rose-500 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current text-rose-500" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. NAVIGATION PAR ONGLETS MODERNE */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-px">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-xs font-extrabold transition-all relative ${
                activeTab === 'overview'
                  ? 'text-rose-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>Aperçu</span>
              {activeTab === 'overview' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('screenshots')}
              className={`pb-3 text-xs font-extrabold transition-all relative ${
                activeTab === 'screenshots'
                  ? 'text-rose-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>Captures d'écran</span>
              {activeTab === 'screenshots' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('media')}
              className={`pb-3 text-xs font-extrabold transition-all relative ${
                activeTab === 'media'
                  ? 'text-rose-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>Médias</span>
              {activeTab === 'media' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 text-xs font-extrabold transition-all relative ${
                activeTab === 'history'
                  ? 'text-rose-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>Données & Histoire</span>
              {activeTab === 'history' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('emulator')}
              className={`pb-3 text-xs font-extrabold transition-all relative ${
                activeTab === 'emulator'
                  ? 'text-rose-600'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>Émulateur & Shader</span>
              {activeTab === 'emulator' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full" />
              )}
            </button>
          </div>

          <button
            onClick={() => onOpenFranchiseOrganizer(game)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-100 hover:border-purple-200 text-slate-500 hover:text-purple-700 text-xs font-bold transition-all mb-2"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Organiser Franchise</span>
          </button>
        </div>

        {/* 4. CONTENU DES ONGLETS */}
        <div>
          {activeTab === 'overview' && (
            <GameInfoTab
              game={game}
              system={system}
              onSwitchTab={(t) => setActiveTab(t as any)}
            />
          )}

          {activeTab === 'screenshots' && (
            <div className="rounded-3xl bg-white border border-purple-100 p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-600" />
                  <span>Galerie de Captures d'Écran</span>
                </h3>
              </div>

              {game.screenshots && game.screenshots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {game.screenshots.map((shot, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl overflow-hidden aspect-video border border-purple-100 shadow-xs hover:border-rose-400 hover:scale-105 transition-all bg-slate-900"
                    >
                      <img src={getImageUrl(shot)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-400 bg-purple-50/30 rounded-2xl border border-dashed border-purple-200">
                  <Camera className="w-12 h-12 text-purple-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Aucune capture d'écran téléchargée</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Allez dans l'onglet "Médias" pour rechercher et télécharger les captures officielles.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'media' && (
            <GameMetadataTab
              game={game}
              onSaveMetadata={onSaveMetadata}
            />
          )}

          {activeTab === 'history' && (
            <div className="rounded-3xl bg-white border border-purple-100 p-6 space-y-4 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Données Techniques & Emplacement ROM</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-mono text-[11px] break-all">
                  <div className="text-slate-400 text-[10px] uppercase font-sans font-bold mb-1">Chemin du fichier ROM</div>
                  {game.file_path}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Identifiant Unique</div>
                    <div className="font-mono text-xs font-extrabold text-slate-900 truncate mt-0.5">{game.id}</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Hash SHA1 / MD5</div>
                    <div className="font-mono text-xs font-extrabold text-slate-900 truncate mt-0.5">
                      {game.file_hash || 'Non calculé'}
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Parties Jouées</div>
                    <div className="font-mono text-xs font-extrabold text-slate-900 mt-0.5">{game.play_count} fois</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Ajouté le</div>
                    <div className="font-mono text-xs font-extrabold text-slate-900 mt-0.5">
                      {new Date(game.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emulator' && (
            <GameConfigTab
              game={game}
              system={system}
              config={config}
              emulators={emulators}
              onSaveConfig={onSaveConfig}
            />
          )}
        </div>
      </div>

      {/* 5. BARRE FIXE EN BAS STYLE CONSOLE ARCADE */}
      <div className="fixed bottom-0 right-0 left-72 z-40 bg-white/95 backdrop-blur-md border-t border-purple-100/90 py-3 px-8 flex items-center justify-center gap-3 sm:gap-6 shadow-md select-none">
        {/* A : Lancer la partie */}
        <button
          onClick={() => onLaunch(game)}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-extrabold shadow-sm transition-all active:scale-95"
        >
          <span className="w-4 h-4 rounded-full bg-white text-rose-600 flex items-center justify-center text-[10px] font-mono font-black">
            A
          </span>
          <span>Lancer la partie</span>
        </button>

        {/* B : Retour */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95"
        >
          <span className="w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-mono font-black">
            B
          </span>
          <span>Retour</span>
        </button>

        {/* X : Favori */}
        <button
          onClick={() => onToggleFavorite(game)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all active:scale-95"
        >
          <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px] font-mono font-black">
            X
          </span>
          <span>Favori</span>
        </button>

        {/* Y : Options */}
        <button
          onClick={() => setActiveTab('emulator')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
        >
          <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center text-[10px] font-mono font-black">
            Y
          </span>
          <span>Options</span>
        </button>

        {/* ... : Plus d'actions */}
        <button
          onClick={() => onOpenFranchiseOrganizer(game)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
          <span>Plus d'actions</span>
        </button>
      </div>
    </div>
  );
};
