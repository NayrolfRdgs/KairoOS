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
    <div className="px-6 py-3 bg-white/60 border-b border-retro-dark/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
      {Array.from({ length: 10 }).map((_, idx) => {
        const assignedPad = connectedPads[assignedPadIndices[idx] ?? idx];
        const isConnected = !!assignedPad;
        const isSelected = selectedPlayer === idx;
        const isPrimary = primaryPlayer === idx;

        return (
          <button
            key={idx}
            onClick={() => onSelectPlayer(idx)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold font-arcade transition-all whitespace-nowrap relative ${
              isSelected
                ? 'bg-retro-dark text-retro-cream shadow-md scale-105 ring-2 ring-arcade-orange'
                : 'bg-white/80 text-retro-dark/70 hover:bg-white hover:text-retro-dark'
            }`}
          >
            <CircleDot
              className={`w-3.5 h-3.5 ${
                isConnected ? 'text-arcade-green animate-pulse' : 'text-retro-dark/30'
              }`}
            />
            <span>J{idx + 1}</span>
            {isPrimary && (
              <span title="Joueur prioritaire sur l'interface" className="text-arcade-yellow text-[11px]">
                ⭐
              </span>
            )}
            {isConnected && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-arcade-green/20 text-arcade-green">
                ON
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
