import React, { useState } from 'react';
import { X, Play, Star, FolderPlus, Info, FileJson, Sliders } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-retro-text/40 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-retro-border rounded-3xl shadow-retro-lg overflow-hidden flex flex-col">
        {/* Banner Header */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-retro-primary via-retro-purple to-retro-cyan p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-white/90 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                {system?.name || game.system_id}
              </span>
              {game.franchise && (
                <span className="text-xs font-black uppercase tracking-widest text-white px-3 py-1 rounded-full bg-purple-900/40 backdrop-blur-md border border-white/20">
                  {game.franchise}
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all z-20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-end justify-between gap-4 z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-wide drop-shadow-md">
                {game.title}
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenFranchiseOrganizer(game)}
                title="Déplacer dans un dossier de franchise"
                className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all shadow-md"
              >
                <FolderPlus className="w-5 h-5" />
              </button>

              <button
                onClick={() => onToggleFavorite(game)}
                className={`p-3 rounded-2xl border transition-all ${
                  game.favorite
                    ? 'bg-amber-400 text-white border-amber-300 shadow-md'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <Star className={`w-5 h-5 ${game.favorite ? 'fill-white' : ''}`} />
              </button>

              <button
                onClick={() => onLaunch(game)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white hover:bg-retro-bg text-retro-primary font-black text-sm uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-retro-primary ml-0.5" />
                <span>Lancer le Jeu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-8 border-b border-retro-border bg-retro-bg/50">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'info'
                ? 'border-retro-primary text-retro-primary'
                : 'border-transparent text-retro-textMuted hover:text-retro-text'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Fiche Jeu</span>
          </button>

          <button
            onClick={() => setActiveTab('metadata')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'metadata'
                ? 'border-retro-primary text-retro-primary'
                : 'border-transparent text-retro-textMuted hover:text-retro-text'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Métadonnées Locales (.JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-all ${
              activeTab === 'config'
                ? 'border-retro-primary text-retro-primary'
                : 'border-transparent text-retro-textMuted hover:text-retro-text'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Émulateur & CLI</span>
          </button>
        </div>

        {/* Modal Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 text-xs">
          {activeTab === 'info' && <GameInfoTab game={game} />}
          {activeTab === 'metadata' && (
            <GameMetadataTab game={game} onSaveMetadata={onSaveMetadata} />
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
