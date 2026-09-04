import React from 'react';
import { Play, Zap, X, ChevronDown } from 'lucide-react';
import { ControllerType, GamepadMapping } from '../../../types';

interface GamepadVisualizerProps {
  controllerType: ControllerType;
  currentMapping: GamepadMapping;
  activeButtons: Set<number>;
  activeAxes: { x: number; y: number; rx: number; ry: number };
  editingKey: string | null;
  onSelectKeyToEdit: (key: string | null) => void;
  onUpdateKey: (key: string, value: string) => void;
  onStartWizard: () => void;
}

const QUICK_SIGNALS = [
  { label: 'Bouton 1 (Signal 0)', value: '0' },
  { label: 'Bouton 2 (Signal 1)', value: '1' },
  { label: 'Bouton 3 (Signal 2)', value: '2' },
  { label: 'Bouton 4 (Signal 3)', value: '3' },
  { label: 'Bouton 5 (Signal 4)', value: '4' },
  { label: 'Bouton 6 (Signal 5)', value: '5' },
  { label: 'Bouton 7 (Signal 6)', value: '6' },
  { label: 'Bouton 8 (Signal 7)', value: '7' },
  { label: 'Bouton 9 (Signal 8 / Coin)', value: '8' },
  { label: 'Bouton 10 (Signal 9 / Start)', value: '9' },
  { label: 'Bouton 11 (Signal 10)', value: '10' },
  { label: 'Bouton 12 (Signal 11)', value: '11' },
  { label: 'Joystick Haut (h0up)', value: 'h0up' },
  { label: 'Joystick Bas (h0down)', value: 'h0down' },
  { label: 'Joystick Gauche (h0left)', value: 'h0left' },
  { label: 'Joystick Droite (h0right)', value: 'h0right' },
  { label: 'Non assigné', value: '' },
];

export const GamepadVisualizer: React.FC<GamepadVisualizerProps> = ({
  controllerType,
  currentMapping,
  activeButtons,
  activeAxes,
  editingKey,
  onSelectKeyToEdit,
  onUpdateKey,
  onStartWizard,
}) => {
  // Test dynamique de l'état physique selon le mapping actuel
  const isKeyActive = (keyStr: string | undefined): boolean => {
    if (!keyStr) return false;
    const num = parseInt(keyStr, 10);
    if (!isNaN(num)) {
      return activeButtons.has(num);
    }
    if (keyStr === 'h0up' || keyStr === 'up' || keyStr === '-1') return activeAxes.y < -0.55;
    if (keyStr === 'h0down' || keyStr === 'down' || keyStr === '+1') return activeAxes.y > 0.55;
    if (keyStr === 'h0left' || keyStr === 'left' || keyStr === '-0') return activeAxes.x < -0.55;
    if (keyStr === 'h0right' || keyStr === 'right' || keyStr === '+0') return activeAxes.x > 0.55;
    return false;
  };

  const formatShortSignal = (val: string | undefined): string => {
    if (!val) return '—';
    const num = parseInt(val, 10);
    if (!isNaN(num)) return `B${num + 1}`;
    if (val === 'h0up' || val === 'up' || val === '-1') return 'Haut';
    if (val === 'h0down' || val === 'down' || val === '+1') return 'Bas';
    if (val === 'h0left' || val === 'left' || val === '-0') return 'Gauch';
    if (val === 'h0right' || val === 'right' || val === '+0') return 'Droit';
    return val;
  };

  const currentEditingVal = editingKey ? (currentMapping as any)[editingKey] || '' : '';

  return (
    <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-purple-900/30 flex flex-col justify-between">
      <div>
        {/* En-tête */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <span>TEST VISUEL INTERACTIF</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <span className="text-[10px] text-slate-400">
              Cliquez sur un bouton ci-dessous pour le remapper
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
            Temps Réel
          </span>
        </div>

        {/* Barre de réassignation active quand un bouton est cliqué */}
        {editingKey && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-400 text-white flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <Zap className="w-4 h-4 animate-bounce text-amber-400" />
                <span>RECONFIGURATION : {editingKey.toUpperCase().replace('_', ' ')}</span>
              </div>
              <button
                onClick={() => onSelectKeyToEdit(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                title="Annuler (Échap)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-amber-100 leading-tight">
              Appuyez sur un bouton de la borne OU choisissez dans la liste :
            </p>
            <div className="relative">
              <select
                value={currentEditingVal}
                onChange={(e) => {
                  onUpdateKey(editingKey, e.target.value);
                  onSelectKeyToEdit(null);
                }}
                className="w-full appearance-none pl-3 pr-8 py-1.5 rounded-xl bg-slate-800 border border-amber-400/50 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                {currentEditingVal && !QUICK_SIGNALS.some((s) => s.value === currentEditingVal) && (
                  <option value={currentEditingVal}>Signal actuel: {currentEditingVal}</option>
                )}
                {QUICK_SIGNALS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* 1. Disposition Borne Arcade */}
        {controllerType === 'arcade_stick' && (
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 relative min-h-[220px] flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between gap-4">
              {/* Joystick avec cibles directionnelles cliquables */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                {/* 4 Cibles directionnelles Haut / Bas / Gauche / Droite */}
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_up')}
                  title={`Haut (${formatShortSignal(currentMapping.btn_up)})`}
                  className={`absolute top-0 w-7 h-5 rounded text-[10px] font-bold flex items-center justify-center border transition-all ${
                    editingKey === 'btn_up'
                      ? 'bg-amber-500 text-white border-white ring-2 ring-amber-400 animate-pulse'
                      : isKeyActive(currentMapping.btn_up)
                      ? 'bg-emerald-500 text-white border-white shadow-md shadow-emerald-500/50 scale-110'
                      : 'bg-black/60 text-white/50 border-white/20 hover:border-rose-400'
                  }`}
                >
                  ⬆️
                </button>
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_down')}
                  title={`Bas (${formatShortSignal(currentMapping.btn_down)})`}
                  className={`absolute bottom-0 w-7 h-5 rounded text-[10px] font-bold flex items-center justify-center border transition-all ${
                    editingKey === 'btn_down'
                      ? 'bg-amber-500 text-white border-white ring-2 ring-amber-400 animate-pulse'
                      : isKeyActive(currentMapping.btn_down)
                      ? 'bg-emerald-500 text-white border-white shadow-md shadow-emerald-500/50 scale-110'
                      : 'bg-black/60 text-white/50 border-white/20 hover:border-rose-400'
                  }`}
                >
                  ⬇️
                </button>
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_left')}
                  title={`Gauche (${formatShortSignal(currentMapping.btn_left)})`}
                  className={`absolute left-0 w-5 h-7 rounded text-[10px] font-bold flex items-center justify-center border transition-all ${
                    editingKey === 'btn_left'
                      ? 'bg-amber-500 text-white border-white ring-2 ring-amber-400 animate-pulse'
                      : isKeyActive(currentMapping.btn_left)
                      ? 'bg-emerald-500 text-white border-white shadow-md shadow-emerald-500/50 scale-110'
                      : 'bg-black/60 text-white/50 border-white/20 hover:border-rose-400'
                  }`}
                >
                  ⬅️
                </button>
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_right')}
                  title={`Droite (${formatShortSignal(currentMapping.btn_right)})`}
                  className={`absolute right-0 w-5 h-7 rounded text-[10px] font-bold flex items-center justify-center border transition-all ${
                    editingKey === 'btn_right'
                      ? 'bg-amber-500 text-white border-white ring-2 ring-amber-400 animate-pulse'
                      : isKeyActive(currentMapping.btn_right)
                      ? 'bg-emerald-500 text-white border-white shadow-md shadow-emerald-500/50 scale-110'
                      : 'bg-black/60 text-white/50 border-white/20 hover:border-rose-400'
                  }`}
                >
                  ➡️
                </button>

                {/* Cercle joystick & stick mobile */}
                <div className="w-16 h-16 rounded-full border-2 border-white/20 bg-black/80 flex items-center justify-center">
                  <div
                    className="w-8 h-8 rounded-full bg-rose-500 shadow-lg transition-transform duration-75 border-2 border-white/60"
                    style={{
                      transform: `translate(${activeAxes.x * 16}px, ${activeAxes.y * 16}px)`,
                    }}
                  />
                </div>
              </div>

              {/* 8 Boutons d'Arcade (2 rangées de 4) */}
              <div className="grid grid-cols-4 gap-2 flex-1 justify-items-center">
                {[
                  { key: 'btn_a', name: '1 (A)', ring: 'border-rose-500', color: 'bg-rose-500' },
                  { key: 'btn_x', name: '3 (X)', ring: 'border-amber-400', color: 'bg-amber-500' },
                  { key: 'btn_l1', name: '5 (L1)', ring: 'border-purple-500', color: 'bg-purple-500' },
                  { key: 'btn_l2', name: '7 (L2)', ring: 'border-slate-300', color: 'bg-slate-400' },
                  { key: 'btn_b', name: '2 (B)', ring: 'border-blue-500', color: 'bg-blue-500' },
                  { key: 'btn_y', name: '4 (Y)', ring: 'border-emerald-500', color: 'bg-emerald-500' },
                  { key: 'btn_r1', name: '6 (R1)', ring: 'border-orange-500', color: 'bg-orange-500' },
                  { key: 'btn_r2', name: '8 (R2)', ring: 'border-slate-300', color: 'bg-slate-400' },
                ].map((b) => {
                  const val = (currentMapping as any)[b.key];
                  const active = isKeyActive(val);
                  const isEditing = editingKey === b.key;

                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => onSelectKeyToEdit(b.key)}
                      title={`Bouton ${b.name} : cliquer pour remapper`}
                      className={`relative w-11 h-11 rounded-full flex flex-col items-center justify-center transition-all border-2 cursor-pointer ${
                        isEditing
                          ? 'bg-amber-500 text-white border-white ring-4 ring-amber-400/80 scale-110 shadow-lg shadow-amber-500/50 animate-pulse'
                          : active
                          ? `${b.color} text-white border-white scale-110 shadow-lg shadow-white/40 ring-2 ring-emerald-400`
                          : `bg-black/70 text-white/80 ${b.ring} hover:scale-105 hover:border-white`
                      }`}
                    >
                      <span className="text-[9px] font-black leading-none">{b.name.split(' ')[0]}</span>
                      <span className="text-[8px] font-mono text-white/70 leading-none mt-0.5">
                        {formatShortSignal(val)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boutons Système Start & Coin & Hotkey */}
            <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => onSelectKeyToEdit('btn_select')}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editingKey === 'btn_select'
                    ? 'bg-amber-500 text-white border-white ring-2 ring-amber-400 animate-pulse'
                    : isKeyActive(currentMapping.btn_select)
                    ? 'bg-amber-500 text-white border-white shadow-md shadow-amber-500/50 scale-105'
                    : 'bg-black/60 text-white/70 border-white/20 hover:border-amber-400'
                }`}
              >
                <span>🪙 COIN</span>
                <span className="text-[9px] font-mono opacity-80">
                  ({formatShortSignal(currentMapping.btn_select)})
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectKeyToEdit('btn_start')}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editingKey === 'btn_start'
                    ? 'bg-amber-500 text-white border-white ring-2 ring-amber-400 animate-pulse'
                    : isKeyActive(currentMapping.btn_start)
                    ? 'bg-emerald-500 text-white border-white shadow-md shadow-emerald-500/50 scale-105'
                    : 'bg-black/60 text-white/70 border-white/20 hover:border-emerald-400'
                }`}
              >
                <span>🕹️ 1P START</span>
                <span className="text-[9px] font-mono opacity-80">
                  ({formatShortSignal(currentMapping.btn_start)})
                </span>
              </button>

              <button
                type="button"
                onClick={() => onSelectKeyToEdit('btn_hotkey')}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  editingKey === 'btn_hotkey'
                    ? 'bg-amber-500 text-white border-white ring-2 ring-amber-400 animate-pulse'
                    : isKeyActive(currentMapping.btn_hotkey)
                    ? 'bg-rose-500 text-white border-white shadow-md shadow-rose-500/50 scale-105'
                    : 'bg-black/60 text-white/70 border-white/20 hover:border-rose-400'
                }`}
              >
                <span>⚙️ MENU</span>
                <span className="text-[9px] font-mono opacity-80">
                  ({formatShortSignal(currentMapping.btn_hotkey)})
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 2. Disposition Manette Moderne */}
        {controllerType === 'standard' && (
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 relative min-h-[220px] flex flex-col justify-between gap-3">
            {/* Gâchettes LB / LT / RB / RT */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_l1')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    editingKey === 'btn_l1'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_l1)
                      ? 'bg-purple-600 text-white border-white'
                      : 'bg-black/60 text-white/60 border-white/20 hover:border-purple-400'
                  }`}
                >
                  LB ({formatShortSignal(currentMapping.btn_l1)})
                </button>
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_l2')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    editingKey === 'btn_l2'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_l2)
                      ? 'bg-purple-600 text-white border-white'
                      : 'bg-black/60 text-white/60 border-white/20 hover:border-purple-400'
                  }`}
                >
                  LT ({formatShortSignal(currentMapping.btn_l2)})
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_r2')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    editingKey === 'btn_r2'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_r2)
                      ? 'bg-orange-600 text-white border-white'
                      : 'bg-black/60 text-white/60 border-white/20 hover:border-orange-400'
                  }`}
                >
                  RT ({formatShortSignal(currentMapping.btn_r2)})
                </button>
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_r1')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                    editingKey === 'btn_r1'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_r1)
                      ? 'bg-orange-600 text-white border-white'
                      : 'bg-black/60 text-white/60 border-white/20 hover:border-orange-400'
                  }`}
                >
                  RB ({formatShortSignal(currentMapping.btn_r1)})
                </button>
              </div>
            </div>

            {/* Centre : D-Pad + Stick + ABXY */}
            <div className="flex items-center justify-between px-2">
              {/* D-Pad cliquable */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_up')}
                  className={`absolute top-0 w-6 h-6 rounded text-[9px] font-bold flex items-center justify-center border ${
                    editingKey === 'btn_up'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_up)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/60 text-white/60 border-white/20'
                  }`}
                >
                  ⬆️
                </button>
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_down')}
                  className={`absolute bottom-0 w-6 h-6 rounded text-[9px] font-bold flex items-center justify-center border ${
                    editingKey === 'btn_down'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_down)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/60 text-white/60 border-white/20'
                  }`}
                >
                  ⬇️
                </button>
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_left')}
                  className={`absolute left-0 w-6 h-6 rounded text-[9px] font-bold flex items-center justify-center border ${
                    editingKey === 'btn_left'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_left)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/60 text-white/60 border-white/20'
                  }`}
                >
                  ⬅️
                </button>
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_right')}
                  className={`absolute right-0 w-6 h-6 rounded text-[9px] font-bold flex items-center justify-center border ${
                    editingKey === 'btn_right'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_right)
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/60 text-white/60 border-white/20'
                  }`}
                >
                  ➡️
                </button>
              </div>

              {/* Diamant ABXY cliquable */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_y')}
                  className={`absolute top-0 w-8 h-8 rounded-full flex flex-col items-center justify-center border text-[9px] font-black ${
                    editingKey === 'btn_y'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_y)
                      ? 'bg-amber-400 text-black border-white'
                      : 'bg-black/60 text-amber-400 border-amber-400/40'
                  }`}
                >
                  <span>Y</span>
                  <span className="text-[7px] font-mono">{formatShortSignal(currentMapping.btn_y)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_a')}
                  className={`absolute bottom-0 w-8 h-8 rounded-full flex flex-col items-center justify-center border text-[9px] font-black ${
                    editingKey === 'btn_a'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_a)
                      ? 'bg-emerald-500 text-white border-white'
                      : 'bg-black/60 text-emerald-400 border-emerald-400/40'
                  }`}
                >
                  <span>A</span>
                  <span className="text-[7px] font-mono">{formatShortSignal(currentMapping.btn_a)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_x')}
                  className={`absolute left-0 w-8 h-8 rounded-full flex flex-col items-center justify-center border text-[9px] font-black ${
                    editingKey === 'btn_x'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_x)
                      ? 'bg-blue-500 text-white border-white'
                      : 'bg-black/60 text-blue-400 border-blue-400/40'
                  }`}
                >
                  <span>X</span>
                  <span className="text-[7px] font-mono">{formatShortSignal(currentMapping.btn_x)}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectKeyToEdit('btn_b')}
                  className={`absolute right-0 w-8 h-8 rounded-full flex flex-col items-center justify-center border text-[9px] font-black ${
                    editingKey === 'btn_b'
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive(currentMapping.btn_b)
                      ? 'bg-rose-500 text-white border-white'
                      : 'bg-black/60 text-rose-400 border-rose-400/40'
                  }`}
                >
                  <span>B</span>
                  <span className="text-[7px] font-mono">{formatShortSignal(currentMapping.btn_b)}</span>
                </button>
              </div>
            </div>

            {/* Select / Start */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => onSelectKeyToEdit('btn_select')}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold ${
                  isKeyActive(currentMapping.btn_select) ? 'bg-amber-500 text-white' : 'bg-black/60 text-white/70'
                }`}
              >
                SELECT ({formatShortSignal(currentMapping.btn_select)})
              </button>
              <button
                type="button"
                onClick={() => onSelectKeyToEdit('btn_start')}
                className={`px-3 py-1 rounded-lg border text-[10px] font-bold ${
                  isKeyActive(currentMapping.btn_start) ? 'bg-emerald-500 text-white' : 'bg-black/60 text-white/70'
                }`}
              >
                START ({formatShortSignal(currentMapping.btn_start)})
              </button>
            </div>
          </div>
        )}

        {/* 3. Disposition Rétro SNES / Mega Drive */}
        {(controllerType === 'retro_snes' || controllerType === 'retro_sega') && (
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 min-h-[220px] flex items-center justify-between">
            {/* D-Pad */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <button
                type="button"
                onClick={() => onSelectKeyToEdit('btn_up')}
                className={`absolute top-0 w-7 h-7 rounded text-[10px] border ${
                  isKeyActive(currentMapping.btn_up) ? 'bg-emerald-500 text-white' : 'bg-black/60 text-white/60'
                }`}
              >
                ⬆️
              </button>
              <button
                type="button"
                onClick={() => onSelectKeyToEdit('btn_down')}
                className={`absolute bottom-0 w-7 h-7 rounded text-[10px] border ${
                  isKeyActive(currentMapping.btn_down) ? 'bg-emerald-500 text-white' : 'bg-black/60 text-white/60'
                }`}
              >
                ⬇️
              </button>
              <button
                type="button"
                onClick={() => onSelectKeyToEdit('btn_left')}
                className={`absolute left-0 w-7 h-7 rounded text-[10px] border ${
                  isKeyActive(currentMapping.btn_left) ? 'bg-emerald-500 text-white' : 'bg-black/60 text-white/60'
                }`}
              >
                ⬅️
              </button>
              <button
                type="button"
                onClick={() => onSelectKeyToEdit('btn_right')}
                className={`absolute right-0 w-7 h-7 rounded text-[10px] border ${
                  isKeyActive(currentMapping.btn_right) ? 'bg-emerald-500 text-white' : 'bg-black/60 text-white/60'
                }`}
              >
                ➡️
              </button>
            </div>

            {/* Boutons Rétro */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'btn_a', label: 'A' },
                { key: 'btn_b', label: 'B' },
                { key: 'btn_x', label: 'X' },
                { key: 'btn_y', label: 'Y' },
                { key: 'btn_l1', label: 'L' },
                { key: 'btn_r1', label: 'R' },
              ].map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => onSelectKeyToEdit(b.key)}
                  className={`w-9 h-9 rounded-full flex flex-col items-center justify-center text-[10px] font-bold border ${
                    editingKey === b.key
                      ? 'bg-amber-500 text-white ring-2 ring-amber-400'
                      : isKeyActive((currentMapping as any)[b.key])
                      ? 'bg-purple-600 text-white border-white scale-105'
                      : 'bg-black/60 text-white/60 border-white/20'
                  }`}
                >
                  <span>{b.label}</span>
                  <span className="text-[7px] font-mono opacity-80">
                    {formatShortSignal((currentMapping as any)[b.key])}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Assistant complet button */}
      <button
        type="button"
        onClick={onStartWizard}
        className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-500/30 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>LANCER L'ASSISTANT DE REMAPPING COMPLET</span>
      </button>
    </div>
  );
};
