import React, { useEffect, useState } from 'react';
import { Gamepad2, Square, Clock, Activity } from 'lucide-react';
import { LaunchStatus } from '../../types';
import { formatElapsedSeconds } from '../../utils';

interface LaunchOverlayProps {
  status: LaunchStatus;
  onKillGame: () => void;
}

export const LaunchOverlay: React.FC<LaunchOverlayProps> = ({ status, onKillGame }) => {
  const [elapsed, setElapsed] = useState<number>(status.elapsed_seconds || 0);

  useEffect(() => {
    setElapsed(status.elapsed_seconds || 0);
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status.start_time, status.elapsed_seconds]);

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-3xl bg-retro-bg border-2 border-retro-primary flex items-center justify-center shadow-retro-neon animate-pulse">
          <Gamepad2 className="w-14 h-14 text-retro-primary" />
        </div>
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-retro-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-md">
          <Activity className="w-3 h-3 animate-spin" />
          <span>EN COURS</span>
        </div>
      </div>

      <div className="max-w-md space-y-2 mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-retro-cyan">
          {status.current_system_id} • PID {status.pid || '—'}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-retro-text tracking-wide uppercase">
          {status.current_game_title || 'Jeu en cours'}
        </h1>
        <p className="text-xs text-retro-textMuted">
          Session supervisée par KaïroOS. L'interface réapparaîtra automatiquement à la fermeture.
        </p>
      </div>

      <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-retro-bg border border-retro-border mb-8 text-retro-text">
        <Clock className="w-5 h-5 text-amber-500 animate-bounce" />
        <span className="text-xl font-mono font-black tracking-wider text-retro-text">
          {formatElapsedSeconds(elapsed)}
        </span>
      </div>

      <button
        onClick={onKillGame}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 text-red-600 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
      >
        <Square className="w-4 h-4 fill-current" />
        <span>Forcer la Fermeture du Jeu</span>
      </button>
    </div>
  );
};
