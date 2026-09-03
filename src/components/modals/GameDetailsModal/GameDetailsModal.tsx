import React, { useState } from 'react';
import {
  ChevronLeft,
  Play,
  Heart,
  Star,
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
import { ConsoleLogo } from '../../common/ConsoleLogo';

interface GameDetailsModalProps {
  game: Game;
  system: System | null;
  config: GameConfig | null;
  emulators: Emulator[];
  activeTab?: 'overview' | 'screenshots' | 'media' | 'history' | 'emulator';
  onTabChange?: (tab: 'overview' | 'screenshots' | 'media' | 'history' | 'emulator') => void;
  onClose: () => void;
  onLaunch: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onSaveConfig: (config: GameConfig) => void;
  onSaveMetadata: (gameId: string, metadata: LocalGameMetadata) => Promise<void>;
  onOpenFranchiseOrganizer: (game: Game) => void;
}

const TABS = [
  { id: 'overview', label: 'Aperçu' },
  { id: 'screenshots', label: 'Captures d\'écran' },
  { id: 'media', label: 'Médias' },
  { id: 'history', label: 'Données & Histoire' },
  { id: 'emulator', label: 'Émulateur & Shader' },
] as const;

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
  game,
  system,
  config,
  emulators,
  activeTab: controlledActiveTab,
  onTabChange,
  onClose,
  onLaunch,
  onToggleFavorite,
  onSaveConfig,
  onSaveMetadata,
  onOpenFranchiseOrganizer,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState<'overview' | 'screenshots' | 'media' | 'history' | 'emulator'>('overview');
  const activeTab = controlledActiveTab || internalActiveTab;
  const setActiveTab = (tab: 'overview' | 'screenshots' | 'media' | 'history' | 'emulator') => {
    if (onTabChange) onTabChange(tab);
    else setInternalActiveTab(tab);
  };

  // Clavier & Raccourcis Manette pour la navigation dans la fiche de jeu
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        const idx = TABS.findIndex((t) => t.id === activeTab);
        const prevIdx = (idx - 1 + TABS.length) % TABS.length;
        setActiveTab(TABS[prevIdx].id as any);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        const idx = TABS.findIndex((t) => t.id === activeTab);
        const nextIdx = (idx + 1) % TABS.length;
        setActiveTab(TABS[nextIdx].id as any);
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        onLaunch(game);
      } else if (e.key === 'f' || e.key === 'F') {
        onToggleFavorite(game);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, game, onClose, onLaunch, onToggleFavorite]);

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
    <div className="fixed inset-y-0 right-0 left-72 z-30 flex flex-col bg-[#f8f7ff] border-l border-purple-100/80 select-none animate-fadeInScale overflow-hidden shadow-2xl">
      {/* 1. TOP ACTION ROW : Retour + Favori + Lancer la partie */}
      <div className="px-6 py-2.5 flex items-center justify-between z-20 shrink-0 bg-[#f8f7ff]/90 backdrop-blur-md border-b border-purple-100/50">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-purple-100/90 text-slate-700 hover:text-slate-900 text-xs font-bold hover:bg-purple-50 shadow-2xs transition-all active:scale-95 hover:scale-105"
          title="Retour au catalogue (Touche B / Échap)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Bouton Ajouter aux favoris */}
          <button
            onClick={() => onToggleFavorite(game)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold transition-all shadow-2xs active:scale-95 hover:scale-105 ${
              game.favorite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-purple-100/90 text-slate-700 hover:text-rose-600 hover:border-pink-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${game.favorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            <span>{game.favorite ? 'Favori' : 'Ajouter aux favoris'}</span>
          </button>

          {/* Bouton Principal : Lancer la partie */}
          <button
            onClick={() => onLaunch(game)}
            className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <span className="w-4 h-4 rounded-full bg-white text-rose-600 flex items-center justify-center text-[10px] font-mono font-black">
              A
            </span>
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Lancer la partie</span>
          </button>
        </div>
      </div>

      {/* ZONE CENTRALE : HERO + ONGLETS + CONTENU (Formaté pour écran 16:9 sans défilement forcé) */}
      <div className="flex-1 overflow-y-auto px-6 py-3.5 space-y-3.5 scrollbar-thin pb-20">
        {/* 2. GRAND HERO SECTION DU JEU (Compact & logique pour 16:9) */}
        <div className="relative rounded-3xl border border-purple-100/90 bg-white/95 shadow-xs overflow-hidden p-4 sm:p-5 flex items-center justify-between gap-5 transition-all duration-300">
          {/* Background Artwork Layer avec dégradé doux vers la gauche */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {backdrop ? (
              <img
                src={backdrop}
                alt={game.title}
                className="w-full h-full object-cover object-right filter brightness-105 transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-white via-purple-50/40 to-pink-50/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent w-full lg:w-2/3 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent z-10" />
          </div>

          {/* Contenu du Hero (Z-10) */}
          <div className="relative z-10 flex flex-row items-center gap-5 flex-1">
            {/* Jaquette du jeu à gauche */}
            <div className="w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-white/60 bg-white shrink-0 hover:scale-105 transition-transform duration-300">
              {game.cover_url ? (
                <img
                  src={getImageUrl(game.cover_url)}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 text-slate-400 text-center">
                  <Gamepad2 className="w-8 h-8 text-rose-400 mb-1" />
                  <span className="text-[9px] font-bold text-slate-600 line-clamp-2">{game.title}</span>
                </div>
              )}
            </div>

            {/* Titre, Métadonnées, Synopsis & NOTE DÉPLACÉE SOUS LA DESCRIPTION */}
            <div className="space-y-2 flex-1 text-left min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-slate-900 leading-tight break-words">
                {game.title}
              </h1>

              {/* Ligne Métadonnées avec logo authentique de la console */}
              <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5 shrink-0">
                  <ConsoleLogo systemId={game.system_id} size="sm" />
                  <span className="text-slate-800">{system?.name || game.system_id.toUpperCase()}</span>
                  <span className="text-slate-400 font-normal">Plateforme</span>
                </div>

                <span>·</span>

                <div className="flex items-center gap-1 shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-800">{year}</span>
                  <span className="text-slate-400 font-normal">Sortie</span>
                </div>

                <span>·</span>

                <div className="flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-800">{developer}</span>
                  <span className="text-slate-400 font-normal">Développeur</span>
                </div>

                <span>·</span>

                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-800">{players === 1 ? '1 joueur' : `1 à ${players} joueurs`}</span>
                  <span className="text-slate-400 font-normal">Joueurs</span>
                </div>

                <span>·</span>

                <div className="flex items-center gap-1">
                  <Gamepad2 className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-slate-800">{genre}</span>
                  <span className="text-slate-400 font-normal">Genre</span>
                </div>
              </div>

              {/* Synopsis */}
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl line-clamp-2">
                {game.synopsis ||
                  "Un titre légendaire de l'histoire du jeu vidéo arcade. Plongez dans des combats intenses et relevez tous les défis dans les meilleures conditions d'émulation."}
              </p>

              {/* NOTE DÉPLACÉE À GAUCHE SOUS LA DESCRIPTION (Conforme à la demande) */}
              <div className="flex items-center gap-3 pt-0.5">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-emerald-50 border border-emerald-200/80 shadow-2xs">
                  <span className="px-1.5 py-0.5 rounded-lg bg-emerald-500 text-white font-mono font-black text-xs shadow-2xs">
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-xs font-black text-emerald-800">Excellent</span>
                </div>

                <div className="flex items-center text-rose-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current text-rose-500" />
                  ))}
                </div>

                <span className="text-[11px] text-slate-400 font-bold">Basé sur 124 avis</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. NAVIGATION PAR ONGLETS AVEC INDICATEURS MANETTE LB / RB */}
        <div className="flex items-center justify-between border-b border-purple-100 pb-px">
          <div className="flex items-center gap-2 sm:gap-6">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-mono font-black shadow-2xs">
              LB ◄
            </span>

            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2.5 text-xs font-extrabold transition-all relative duration-200 ${
                  activeTab === tab.id
                    ? 'text-rose-600 scale-105'
                    : 'text-slate-400 hover:text-slate-700 hover:scale-102'
                }`}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full animate-fadeIn" />
                )}
              </button>
            ))}

            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-mono font-black shadow-2xs">
              ► RB
            </span>
          </div>

          <button
            onClick={() => onOpenFranchiseOrganizer(game)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-purple-100 hover:border-purple-200 text-slate-500 hover:text-purple-700 text-xs font-bold transition-all mb-1 hover:scale-105 active:scale-95"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Organiser Franchise</span>
          </button>
        </div>

        {/* 4. CONTENU DES ONGLETS AVEC ANIMATIONS */}
        <div className="animate-fadeIn">
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
