import React, { useState } from 'react';
import {
  X,
  Play,
  FolderPlus,
  Info,
  FileJson,
  Sliders,
  Heart,
} from 'lucide-react';
import { Emulator, Game, GameConfig, LocalGameMetadata, System } from '../../../types';
import { GameInfoTab } from './GameInfoTab';
import { GameMetadataTab } from './GameMetadataTab';
import { GameConfigTab } from './GameConfigTab';

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

import { convertFileSrc } from '@tauri-apps/api/core';

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
  const [activeTab, setActiveTab] = useState<'info' | 'metadata' | 'config'>('info');

  const getImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return convertFileSrc(url);
  };

  const backdropRaw = game.backdrop_url || game.cover_url || 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7xvd.jpg';
  const backdrop = getImageUrl(backdropRaw);

  return (
    <div className="fixed inset-y-0 right-0 left-72 z-30 flex flex-col bg-[#f8f7ff] border-l border-purple-100/80 select-none animate-fadeIn overflow-hidden shadow-2xl">
      {/* 1. Hero Banner Top */}
      <div className="relative h-64 sm:h-72 w-full overflow-hidden shrink-0">
        <img
          src={backdrop}
          alt={game.title}
          className="w-full h-full object-cover object-center filter brightness-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f7ff] via-[#f8f7ff]/50 to-black/40" />

        {/* Top Bar Actions */}
        <div className="absolute top-4 left-6 right-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider font-mono border border-white/10 shadow-sm">
              {system?.name || game.system_id.toUpperCase()}
            </span>
            {game.franchise && (
              <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider font-mono shadow-sm">
                {game.franchise}
              </span>
            )}
            {game.players && game.players >= 2 && (
              <span className="px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] font-black uppercase tracking-wider font-mono shadow-sm">
                {game.players} JOUEURS (VERSUS & CO-OP)
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            title="Retour au catalogue (Bouton B / Échap)"
          >
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-mono font-black">B</span>
            <span>RETOUR</span>
            <X className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* Bottom Banner Title & Big Prompts */}
        <div className="absolute bottom-4 left-8 right-8 flex items-end justify-between gap-6 z-10">
          <div className="space-y-1 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans tracking-tight text-slate-900 leading-tight">
              {game.title}
            </h1>
            {game.original_title && (
              <p className="text-sm font-black text-rose-600 uppercase tracking-wider">
                {game.original_title}
              </p>
            )}
          </div>

          {/* Controller-First Action Buttons (A: JOUER, Y: FAVORIS) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onToggleFavorite(game)}
              title={game.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all active:scale-95 shadow-sm ${
                game.favorite
                  ? 'bg-rose-50 border-rose-300 text-rose-500'
                  : 'bg-white border-purple-100 text-slate-500 hover:text-rose-500 hover:border-rose-200'
              }`}
            >
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 text-[10px] font-mono font-black">Y</span>
              <Heart className={`w-4 h-4 ${game.favorite ? 'fill-current text-rose-500' : ''}`} />
              <span className="text-xs font-bold hidden sm:inline">{game.favorite ? 'FAVORI' : 'AJOUTER AUX FAVORIS'}</span>
            </button>

            <button
              onClick={() => onLaunch(game)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-500/30 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all ring-4 ring-rose-500/20"
            >
              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-xs font-mono font-black shadow-xs">A</span>
              <Play className="w-5 h-5 fill-white" />
              <span>LANCER LA PARTIE</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Navigation des Onglets & Actions Complémentaires */}
      <div className="px-8 border-b border-purple-100 flex items-center justify-between gap-4 bg-white select-none shrink-0 shadow-xs">
        <div className="flex items-center gap-2 py-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'info'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-purple-50/50'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Fiche du Jeu</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'metadata'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-purple-50/50'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Métadonnées & Médias</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'config'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-purple-50/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Émulateur & Shader</span>
          </button>
        </div>

        <button
          onClick={() => onOpenFranchiseOrganizer(game)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-100 hover:border-rose-300 text-slate-500 hover:text-rose-600 text-xs font-bold transition-all"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Organiser Franchise</span>
        </button>
      </div>

      {/* 3. Contenu de l'Onglet */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin bg-gradient-to-b from-[#f8f7ff] to-purple-50/30">
          {activeTab === 'info' && <GameInfoTab game={game} system={system} />}

          {activeTab === 'metadata' && (
            <GameMetadataTab
              game={game}
              onSaveMetadata={onSaveMetadata}
            />
          )}

          {activeTab === 'config' && (
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
  );
};
