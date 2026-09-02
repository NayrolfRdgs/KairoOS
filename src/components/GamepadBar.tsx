import React from 'react';

export const GamepadBar: React.FC = () => {
  return (
    <footer className="h-12 px-6 bg-arcade-surface/90 border-t border-arcade-border/60 flex items-center justify-between text-xs text-arcade-muted select-none z-30">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-arcade-success/20 border border-arcade-success text-arcade-success flex items-center justify-center text-[10px] font-black">
            A
          </span>
          <span className="font-semibold text-arcade-text">Lancer</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-red-500/20 border border-red-400 text-red-400 flex items-center justify-center text-[10px] font-black">
            B
          </span>
          <span className="font-semibold text-arcade-text">Retour</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-arcade-accent/20 border border-arcade-accent text-arcade-accent flex items-center justify-center text-[10px] font-black">
            X
          </span>
          <span className="font-semibold text-arcade-text">Favori</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-arcade-gold/20 border border-arcade-gold text-arcade-gold flex items-center justify-center text-[10px] font-black">
            Y
          </span>
          <span className="font-semibold text-arcade-text">Détails / Config</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-arcade-card border border-arcade-border text-[10px] font-bold text-arcade-text">
            LB / RB
          </span>
          <span className="font-semibold text-arcade-text">Changer de Console</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-arcade-card border border-arcade-border text-[10px] font-bold text-arcade-text">
            Start / M
          </span>
          <span>Scanner</span>
        </div>
        <span className="text-arcade-border">|</span>
        <span className="text-arcade-muted font-mono">KaïroOS v0.1.0</span>
      </div>
    </footer>
  );
};
