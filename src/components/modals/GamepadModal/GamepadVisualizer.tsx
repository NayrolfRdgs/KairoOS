import React from 'react';
import { Play } from 'lucide-react';
import { ControllerType } from '../../../types';

interface GamepadVisualizerProps {
  controllerType: ControllerType;
  activeButtons: Set<number>;
  activeAxes: { x: number; y: number; rx: number; ry: number };
  onStartWizard: () => void;
}

export const GamepadVisualizer: React.FC<GamepadVisualizerProps> = ({
  controllerType,
  activeButtons,
  activeAxes,
  onStartWizard,
}) => {
  return (
    <div className="lg:col-span-5 bg-retro-dark text-retro-cream rounded-3xl p-6 shadow-inner flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-arcade text-xs tracking-wider text-arcade-yellow">
            TEST VISUEL — {controllerType.toUpperCase().replace('_', ' ')}
          </h3>
          <span className="text-[10px] text-white/50">Temps Réel</span>
        </div>

        {/* 1. Disposition Borne Arcade */}
        {controllerType === 'arcade_stick' && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 relative min-h-[190px] flex items-center justify-between">
            {/* Joystick */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-2 border-white/20 bg-black/60 flex items-center justify-center">
                <div
                  className="w-10 h-10 rounded-full bg-arcade-red shadow-lg transition-transform duration-75 border-2 border-white/40"
                  style={{
                    transform: `translate(${activeAxes.x * 20}px, ${activeAxes.y * 20}px)`,
                  }}
                />
              </div>
            </div>

            {/* 8 Boutons d'Arcade */}
            <div className="grid grid-cols-4 gap-2.5">
              {[
                { name: '1 (A)', color: 'bg-arcade-red', num: 0 },
                { name: '3 (X)', color: 'bg-arcade-yellow', num: 2 },
                { name: '5 (L1)', color: 'bg-arcade-purple', num: 4 },
                { name: '7 (L2)', color: 'bg-white/40', num: 6 },
                { name: '2 (B)', color: 'bg-arcade-blue', num: 1 },
                { name: '4 (Y)', color: 'bg-arcade-green', num: 3 },
                { name: '6 (R1)', color: 'bg-arcade-orange', num: 5 },
                { name: '8 (R2)', color: 'bg-white/40', num: 7 },
              ].map((b, i) => {
                const isPressed = activeButtons.has(b.num);
                return (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${
                      isPressed
                        ? `${b.color} text-white scale-110 shadow-lg shadow-white/40 border-white`
                        : 'bg-black/60 text-white/40 border-white/20'
                    }`}
                  >
                    {b.name.split(' ')[0]}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Disposition Manette Moderne (Xbox / PS) */}
        {controllerType === 'standard' && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 relative min-h-[190px] flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <div
                  className={`px-2 py-1 rounded text-[10px] border ${
                    activeButtons.has(4)
                      ? 'bg-arcade-purple text-white border-white'
                      : 'bg-black/60 text-white/40 border-white/10'
                  }`}
                >
                  LB
                </div>
                <div
                  className={`px-2 py-1 rounded text-[10px] border ${
                    activeButtons.has(6)
                      ? 'bg-arcade-purple text-white border-white'
                      : 'bg-black/60 text-white/40 border-white/10'
                  }`}
                >
                  LT
                </div>
              </div>
              <div className="flex gap-2">
                <div
                  className={`px-2 py-1 rounded text-[10px] border ${
                    activeButtons.has(7)
                      ? 'bg-arcade-orange text-white border-white'
                      : 'bg-black/60 text-white/40 border-white/10'
                  }`}
                >
                  RT
                </div>
                <div
                  className={`px-2 py-1 rounded text-[10px] border ${
                    activeButtons.has(5)
                      ? 'bg-arcade-orange text-white border-white'
                      : 'bg-black/60 text-white/40 border-white/10'
                  }`}
                >
                  RB
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Stick Gauche */}
              <div className="w-14 h-14 rounded-full border-2 border-white/20 bg-black/60 flex items-center justify-center">
                <div
                  className="w-7 h-7 rounded-full bg-arcade-blue border border-white/40 shadow-md"
                  style={{ transform: `translate(${activeAxes.x * 12}px, ${activeAxes.y * 12}px)` }}
                />
              </div>

              {/* Diamant ABXY */}
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div
                  className={`absolute top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeButtons.has(3) ? 'bg-arcade-yellow text-retro-dark shadow-md' : 'bg-black/60 text-white/40'
                  }`}
                >
                  Y
                </div>
                <div
                  className={`absolute bottom-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeButtons.has(0) ? 'bg-arcade-green text-white shadow-md' : 'bg-black/60 text-white/40'
                  }`}
                >
                  A
                </div>
                <div
                  className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeButtons.has(2) ? 'bg-arcade-blue text-white shadow-md' : 'bg-black/60 text-white/40'
                  }`}
                >
                  X
                </div>
                <div
                  className={`absolute right-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeButtons.has(1) ? 'bg-arcade-red text-white shadow-md' : 'bg-black/60 text-white/40'
                  }`}
                >
                  B
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Disposition Rétro SNES / Mega Drive */}
        {(controllerType === 'retro_snes' || controllerType === 'retro_sega') && (
          <div className="bg-black/40 border border-white/10 rounded-2xl p-5 min-h-[190px] flex items-center justify-between">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div
                className={`absolute top-0 w-6 h-6 rounded ${
                  activeButtons.has(12) ? 'bg-arcade-green text-white' : 'bg-black/60 text-white/40'
                }`}
              >
                ⬆️
              </div>
              <div
                className={`absolute bottom-0 w-6 h-6 rounded ${
                  activeButtons.has(13) ? 'bg-arcade-green text-white' : 'bg-black/60 text-white/40'
                }`}
              >
                ⬇️
              </div>
              <div
                className={`absolute left-0 w-6 h-6 rounded ${
                  activeButtons.has(14) ? 'bg-arcade-green text-white' : 'bg-black/60 text-white/40'
                }`}
              >
                ⬅️
              </div>
              <div
                className={`absolute right-0 w-6 h-6 rounded ${
                  activeButtons.has(15) ? 'bg-arcade-green text-white' : 'bg-black/60 text-white/40'
                }`}
              >
                ➡️
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['A', 'B', 'X', 'Y', 'L', 'R'].map((btn, i) => (
                <div
                  key={btn}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeButtons.has(i) ? 'bg-arcade-purple text-white shadow-md' : 'bg-black/60 text-white/40'
                  }`}
                >
                  {btn}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Boutons Start & Coin */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              activeButtons.has(8)
                ? 'bg-arcade-yellow text-retro-dark border-white scale-105'
                : 'bg-black/40 text-white/40 border-white/10'
            }`}
          >
            🪙 COIN / SELECT
          </div>
          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              activeButtons.has(9)
                ? 'bg-arcade-green text-white border-white scale-105'
                : 'bg-black/40 text-white/40 border-white/10'
            }`}
          >
            🕹️ 1P START
          </div>
        </div>
      </div>

      <button
        onClick={onStartWizard}
        className="w-full mt-4 py-3 rounded-2xl bg-arcade-orange hover:bg-arcade-orange/90 text-white font-bold font-arcade text-xs shadow-md transition-all flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>LANCER L'ASSISTANT DE REMAPPING COMPLET</span>
      </button>
    </div>
  );
};
