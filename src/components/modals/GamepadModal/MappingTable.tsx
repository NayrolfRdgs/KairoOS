import React from 'react';
import { RotateCcw } from 'lucide-react';
import { GamepadMapping, RemapStep } from '../../../types';

interface MappingTableProps {
  currentMapping: GamepadMapping;
  remapSteps: RemapStep[];
  selectedPlayer: number;
  onResetPlayer: () => void;
}

export const MappingTable: React.FC<MappingTableProps> = ({
  currentMapping,
  remapSteps,
  selectedPlayer,
  onResetPlayer,
}) => {
  return (
    <div className="lg:col-span-7 bg-white/80 rounded-3xl p-5 border border-retro-dark/10 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="font-arcade text-xs tracking-wider text-retro-dark mb-3">
          TABLEAU DE CORRESPONDANCE (SYNCHRONISÉ ÉMULATEURS)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {remapSteps.map((step) => {
            const val = (currentMapping as any)[step.key] || 'Non assigné';

            return (
              <div
                key={step.key}
                className="bg-white p-2.5 rounded-xl border border-retro-dark/10 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-retro-dark truncate">
                    {step.label.split(' ')[0]} {step.label.split(' ')[1]}
                  </div>
                  <div className="text-[10px] text-retro-dark/50">{step.icon}</div>
                </div>
                <span className="px-2 py-1 rounded bg-retro-warm font-mono text-xs font-bold text-retro-dark">
                  {val}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-retro-dark/10">
        <button
          onClick={onResetPlayer}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-retro-dark/70 hover:bg-black/5 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Réinitialiser J{selectedPlayer + 1}</span>
        </button>
        <span className="text-[11px] text-retro-dark/50">
          Sauvegardé dans <code className="font-mono">config/gamepads.json</code>
        </span>
      </div>
    </div>
  );
};
