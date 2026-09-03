import React from 'react';
import { CircleDot } from 'lucide-react';

interface PlayerSelectorProps {
  selectedPlayer: number;
  onSelectPlayer: (idx: number) => void;
  primaryPlayer: number;
  connectedPads: Gamepad[];
  assignedPadIndices: Record<number, number>;
}

export const PlayerSelector: React.FC<PlayerSelectorProps> = ({
  selectedPlayer,
  onSelectPlayer,
  primaryPlayer,
  connectedPads,
  assignedPadIndices,
}) => {
  return (
    <div className="px-6 py-3 bg-slate-50 border-b border-purple-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
      {Array.from({ length: 10 }).map((_, idx) => {
        const assignedPad = connectedPads[assignedPadIndices[idx] ?? idx];
        const isConnected = !!assignedPad;
        const isSelected = selectedPlayer === idx;
        const isPrimary = primaryPlayer === idx;

        return (
          <button
            key={idx}
            onClick={() => onSelectPlayer(idx)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative shadow-xs ${
              isSelected
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 scale-105 ring-2 ring-rose-500/40'
                : 'bg-white border border-purple-100 text-slate-700 hover:border-rose-300 hover:text-rose-600'
            }`}
          >
            <CircleDot
              className={`w-3.5 h-3.5 ${
                isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-300'
              }`}
            />
            <span>J{idx + 1}</span>
            {isPrimary && (
              <span title="Joueur prioritaire sur l'interface" className="text-amber-400 text-[11px]">
                ⭐
              </span>
            )}
            {isConnected && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold font-mono">
                ON
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
