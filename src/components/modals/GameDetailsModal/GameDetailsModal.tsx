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

  const backdrop = game.backdrop_url || game.cover_url || 'https://images.igdb.com/igdb/image/upload/t_1080p/sc7xvd.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/40 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white border border-purple-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* 1. Hero Banner Top */}
        <div className="relative h-48 sm:h-60 w-full overflow-hidden shrink-0">
          <img
            src={backdrop}
            alt={game.title}
            className="w-full h-full object-cover object-center filter brightness-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-black/30" />

          {/* Top Bar Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider font-mono border border-white/10 shadow-sm">
                {system?.name || game.system_id.toUpperCase()}
              </span>
              {game.franchise && (
                <span className="px-3 py-1 rounded-full bg-rose-500/90 text-white text-[11px] font-black uppercase tracking-wider font-mono shadow-sm">
                  {game.franchise}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all shadow-md active:scale-90"
              title="Fermer (Échap / B)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Banner Info */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4 z-10">
            <div className="space-y-0.5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-sans tracking-tight text-slate-900 leading-tight">
                {game.title}
              </h1>
              {game.original_title && (
                <p className="text-xs sm:text-sm font-black text-rose-600 uppercase tracking-wider">
                  {game.original_title}
                </p>
              )}
            </div>

            {/* Quick Actions (JOUER + FAVORIS) */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onToggleFavorite(game)}
                title={game.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                className={`p-3 rounded-2xl border transition-all active:scale-95 ${
                  game.favorite
                    ? 'bg-rose-50 border-rose-300 text-rose-500 shadow-xs'
                    : 'bg-white border-purple-100 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                }`}
              >
                <Heart className={`w-4 h-4 ${game.favorite ? 'fill-current text-rose-500' : ''}`} />
              </button>

              <button
                onClick={() => onLaunch(game)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-500/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>LANCER LE JEU</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Navigation des Onglets */}
        <div className="px-6 border-b border-purple-100 flex items-center justify-between gap-4 bg-white select-none shrink-0">
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
              <span>Éditer Métadonnées</span>
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
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-gradient-to-b from-white to-purple-50/20">
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
    </div>
  );
};
