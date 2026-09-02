import React, { useState } from 'react';
import { X, Play, Star, Clock, Users, HardDrive, Terminal, Sliders, Check, Folder } from 'lucide-react';
import { Emulator, Game, GameConfig, System } from '../types';

interface GameDetailsModalProps {
  game: Game;
  system: System | null;
  config: GameConfig | null;
  emulators: Emulator[];
  onClose: () => void;
  onLaunch: (game: Game) => void;
  onToggleFavorite: (game: Game) => void;
  onSaveConfig: (config: GameConfig) => void;
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
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'config'>('info');
  const [customArgs, setCustomArgs] = useState<string>(config?.custom_cli_args || '');
  const [overrideEmulator, setOverrideEmulator] = useState<string>(config?.emulator_id_override || '');
  const [customCore, setCustomCore] = useState<string>(config?.custom_core || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const formatPlayTime = (seconds: number) => {
    if (seconds === 0) return '0 min';
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours} h ${mins} min`;
    return `${mins} min`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSaveConfig = () => {
    const updated: GameConfig = {
      id: config?.id || `cfg-${game.id}`,
      game_id: game.id,
      emulator_id_override: overrideEmulator.trim() ? overrideEmulator : undefined,
      custom_cli_args: customArgs.trim() ? customArgs : undefined,
      custom_core: customCore.trim() ? customCore : undefined,
      screen_ratio: config?.screen_ratio,
      shader: config?.shader,
      auto_save_state: config?.auto_save_state ?? true,
    };

    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-retro-text/40 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-retro-border rounded-3xl shadow-retro-lg overflow-hidden flex flex-col">
        {/* Banner Header */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-retro-primary via-retro-purple to-retro-cyan p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-black uppercase tracking-widest text-white/90 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
              {system?.name || game.system_id}
            </span>

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

            <div className="flex items-center gap-3">
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
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-retro-primary text-retro-primary'
                : 'border-transparent text-retro-textMuted hover:text-retro-text'
            }`}
          >
            Informations & Fiche Jeu
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-retro-primary text-retro-primary'
                : 'border-transparent text-retro-textMuted hover:text-retro-text'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Options d'Émulation & CLI</span>
          </button>
        </div>

        {/* Modal Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 text-xs">
          {activeTab === 'info' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-44 aspect-[3/4] rounded-2xl overflow-hidden bg-retro-bg border border-retro-border shadow-retro-md flex items-center justify-center">
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-retro-textMuted">
                      <span className="font-bold text-retro-text">{game.title}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-5">
                <div>
                  <h3 className="text-xs font-black uppercase text-retro-textLight tracking-wider mb-1.5">
                    Synopsis / Histoire
                  </h3>
                  <p className="text-retro-text leading-relaxed text-xs">
                    {game.synopsis || "Aucun résumé disponible pour ce jeu. Vous pouvez scraper les métadonnées pour enrichir la fiche."}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
                    <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Temps Joué</span>
                    <div className="flex items-center gap-1.5 font-bold text-retro-text">
                      <Clock className="w-4 h-4 text-retro-cyan" />
                      <span>{formatPlayTime(game.play_time_seconds)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
                    <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Lancements</span>
                    <div className="flex items-center gap-1.5 font-bold text-retro-text">
                      <Play className="w-4 h-4 text-retro-primary" />
                      <span>{game.play_count} fois</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
                    <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Taille Fichier</span>
                    <div className="flex items-center gap-1.5 font-bold text-retro-text">
                      <HardDrive className="w-4 h-4 text-retro-yellow" />
                      <span>{formatFileSize(game.file_size)}</span>
                    </div>
                  </div>

                  {game.developer && (
                    <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
                      <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Développeur</span>
                      <span className="font-bold text-retro-text truncate block">{game.developer}</span>
                    </div>
                  )}

                  {game.genre && (
                    <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
                      <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Genre</span>
                      <span className="font-bold text-retro-text truncate block">{game.genre}</span>
                    </div>
                  )}

                  {game.players && (
                    <div className="p-3 rounded-xl bg-retro-bg border border-retro-border">
                      <span className="text-[10px] uppercase text-retro-textMuted font-bold block mb-1">Joueurs</span>
                      <div className="flex items-center gap-1.5 font-bold text-retro-text">
                        <Users className="w-4 h-4 text-retro-purple" />
                        <span>{game.players} Joueur(s)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-retro-bg border border-retro-border text-[11px] font-mono text-retro-textMuted truncate flex items-center gap-2">
                  <Folder className="w-4 h-4 text-retro-primary shrink-0" />
                  <span className="truncate">{game.file_path}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-retro-text mb-2">
                  Émulateur Assigné
                </label>
                <select
                  value={overrideEmulator}
                  onChange={(e) => setOverrideEmulator(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-retro-bg border border-retro-border text-retro-text text-xs focus:border-retro-primary focus:outline-none"
                >
                  <option value="">Par défaut ({system?.default_emulator_id})</option>
                  {emulators.map((emu) => (
                    <option key={emu.id} value={emu.id}>
                      {emu.name} ({emu.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-retro-text mb-2">
                  Arguments CLI Personnalisés
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-retro-bg border border-retro-border focus-within:border-retro-primary">
                  <Terminal className="w-4 h-4 text-retro-primary shrink-0" />
                  <input
                    type="text"
                    value={customArgs}
                    onChange={(e) => setCustomArgs(e.target.value)}
                    placeholder='ex: -L "{core_path}" -f "{rom_path}"'
                    className="w-full bg-transparent text-retro-text font-mono text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-retro-text mb-2">
                  Cœur Libretro Spécifique (RetroArch)
                </label>
                <input
                  type="text"
                  value={customCore}
                  onChange={(e) => setCustomCore(e.target.value)}
                  placeholder="ex: snes9x_libretro.dll"
                  className="w-full px-4 py-2.5 rounded-xl bg-retro-bg border border-retro-border text-retro-text text-xs font-mono focus:border-retro-primary focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center gap-4">
                <button
                  onClick={handleSaveConfig}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-retro-primary text-white font-bold text-xs uppercase tracking-wider shadow-retro-neon hover:scale-105 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer la Configuration</span>
                </button>

                {savedSuccess && (
                  <span className="text-emerald-600 font-bold text-xs animate-fadeIn">
                    ✓ Configuration enregistrée !
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
