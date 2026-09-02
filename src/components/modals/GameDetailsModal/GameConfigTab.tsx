import React, { useState } from 'react';
import { Check, Terminal } from 'lucide-react';
import { Emulator, Game, GameConfig, System } from '../../../types';

interface GameConfigTabProps {
  game: Game;
  system: System | null;
  config: GameConfig | null;
  emulators: Emulator[];
  onSaveConfig: (config: GameConfig) => void;
}

export const GameConfigTab: React.FC<GameConfigTabProps> = ({
  game,
  system,
  config,
  emulators,
  onSaveConfig,
}) => {
  const [customArgs, setCustomArgs] = useState<string>(config?.custom_cli_args || '');
  const [overrideEmulator, setOverrideEmulator] = useState<string>(config?.emulator_id_override || '');
  const [customCore, setCustomCore] = useState<string>(config?.custom_core || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
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
          onClick={handleSave}
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
  );
};
