import React, { useState } from 'react';
import { X, Play, Star, Clock, Users, HardDrive, Terminal, Sliders, Check } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-arcade-surface border border-arcade-border rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="relative h-48 sm:h-60 w-full overflow-hidden bg-gradient-to-b from-arcade-card to-arcade-surface border-b border-arcade-border/60">
          {game.backdrop_url ? (
            <img
              src={game.backdrop_url}
              alt={game.title}
              className="w-full h-full object-cover opacity-30"
            />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-arcade-accent/20 via-arcade-card to-arcade-surface" />
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 border border-white/10 text-arcade-muted hover:text-white hover:bg-black/80 transition-all z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4 z-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-arcade-accent">
                {system?.name || game.system_id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-arcade-text tracking-wide drop-shadow-md">
                {game.title}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggleFavorite(game)}
                className={`p-3 rounded-2xl border transition-all ${
                  game.favorite
                    ? 'bg-arcade-gold/20 text-arcade-gold border-arcade-gold/50'
                    : 'bg-black/50 text-arcade-muted border-white/10 hover:text-white'
                }`}
              >
                <Star className={`w-5 h-5 ${game.favorite ? 'fill-arcade-gold' : ''}`} />
              </button>

              <button
                onClick={() => onLaunch(game)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-arcade-accent to-arcade-neon text-arcade-bg font-black text-sm uppercase tracking-wider shadow-lg shadow-arcade-accent/30 hover:scale-105 active:scale-95 transition-all"
              >
                <Play className="w-5 h-5 fill-arcade-bg ml-0.5" />
                <span>Lancer le Jeu</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 px-8 border-b border-arcade-border/60 bg-arcade-card/40">
          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-arcade-accent text-arcade-accent'
                : 'border-transparent text-arcade-muted hover:text-arcade-text'
            }`}
          >
            Informations & Métadonnées
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-arcade-accent text-arcade-accent'
                : 'border-transparent text-arcade-muted hover:text-arcade-text'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configuration CLI & Émulateur</span>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 text-xs">
          {activeTab === 'info' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-48 aspect-[3/4] rounded-2xl overflow-hidden bg-arcade-card border border-arcade-border shadow-xl flex items-center justify-center">
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-arcade-muted">
                      <span className="font-bold text-arcade-text">{game.title}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase text-arcade-accent tracking-wider mb-2">
                    Synopsis
                  </h3>
                  <p className="text-arcade-muted leading-relaxed text-xs">
                    {game.synopsis || "Aucun résumé disponible pour ce jeu. Lancez le scraper de métadonnées pour enrichir la fiche."}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-arcade-card border border-arcade-border">
                    <span className="text-[10px] uppercase text-arcade-muted font-semibold block mb-1">Temps Joué</span>
                    <div className="flex items-center gap-1.5 font-bold text-arcade-text">
                      <Clock className="w-4 h-4 text-arcade-accent" />
                      <span>{formatPlayTime(game.play_time_seconds)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-arcade-card border border-arcade-border">
                    <span className="text-[10px] uppercase text-arcade-muted font-semibold block mb-1">Lancements</span>
                    <div className="flex items-center gap-1.5 font-bold text-arcade-text">
                      <Play className="w-4 h-4 text-arcade-neon" />
                      <span>{game.play_count} fois</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-arcade-card border border-arcade-border">
                    <span className="text-[10px] uppercase text-arcade-muted font-semibold block mb-1">Taille Fichier</span>
                    <div className="flex items-center gap-1.5 font-bold text-arcade-text">
                      <HardDrive className="w-4 h-4 text-arcade-gold" />
                      <span>{formatFileSize(game.file_size)}</span>
                    </div>
                  </div>

                  {game.developer && (
                    <div className="p-3 rounded-xl bg-arcade-card border border-arcade-border">
                      <span className="text-[10px] uppercase text-arcade-muted font-semibold block mb-1">Développeur</span>
                      <span className="font-bold text-arcade-text truncate block">{game.developer}</span>
                    </div>
                  )}

                  {game.genre && (
                    <div className="p-3 rounded-xl bg-arcade-card border border-arcade-border">
                      <span className="text-[10px] uppercase text-arcade-muted font-semibold block mb-1">Genre</span>
                      <span className="font-bold text-arcade-text truncate block">{game.genre}</span>
                    </div>
                  )}

                  {game.players && (
                    <div className="p-3 rounded-xl bg-arcade-card border border-arcade-border">
                      <span className="text-[10px] uppercase text-arcade-muted font-semibold block mb-1">Joueurs</span>
                      <div className="flex items-center gap-1.5 font-bold text-arcade-text">
                        <Users className="w-4 h-4 text-arcade-accent" />
                        <span>{game.players} Joueur(s)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-arcade-border/50 text-[11px] font-mono text-arcade-muted truncate">
                  <span className="text-arcade-accent font-semibold">ROM: </span>
                  {game.file_path}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-arcade-text mb-2">
                  Override de l'Émulateur Cible
                </label>
                <select
                  value={overrideEmulator}
                  onChange={(e) => setOverrideEmulator(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-arcade-card border border-arcade-border text-arcade-text text-xs focus:border-arcade-accent focus:outline-none"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-arcade-text mb-2">
                  Arguments CLI Personnalisés (Template)
                </label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-arcade-card border border-arcade-border focus-within:border-arcade-accent">
                  <Terminal className="w-4 h-4 text-arcade-accent shrink-0" />
                  <input
                    type="text"
                    value={customArgs}
                    onChange={(e) => setCustomArgs(e.target.value)}
                    placeholder='ex: -L "{core_path}" -f "{rom_path}"'
                    className="w-full bg-transparent text-arcade-text font-mono text-xs focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-arcade-muted mt-1.5">
                  Variables supportées: <code className="text-arcade-accent font-mono">{'{rom_path}'}</code>, <code className="text-arcade-accent font-mono">{'{core_path}'}</code>, <code className="text-arcade-accent font-mono">{'{title}'}</code>, <code className="text-arcade-accent font-mono">{'{game_dir}'}</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-arcade-text mb-2">
                  Cœur Libretro Spécifique (pour RetroArch)
                </label>
                <input
                  type="text"
                  value={customCore}
                  onChange={(e) => setCustomCore(e.target.value)}
                  placeholder="ex: snes9x_libretro.dll"
                  className="w-full px-4 py-2.5 rounded-xl bg-arcade-card border border-arcade-border text-arcade-text text-xs font-mono focus:border-arcade-accent focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={handleSaveConfig}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-arcade-accent text-arcade-bg font-black text-xs uppercase tracking-wider shadow-lg shadow-arcade-accent/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Sauvegarder la Configuration</span>
                </button>

                {savedSuccess && (
                  <span className="text-arcade-success font-bold text-xs animate-fadeIn">
                    ✓ Configuration enregistrée avec succès !
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
