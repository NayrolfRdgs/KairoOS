import React, { useEffect, useState } from 'react';
import { Gamepad2, Square, Clock, Activity } from 'lucide-react';
import { LaunchStatus } from '../types';

interface LaunchOverlayProps {
  status: LaunchStatus;
  onKillGame: () => void;
}

export const LaunchOverlay: React.FC<LaunchOverlayProps> = ({
  status,
  onKillGame,
}) => {
  const [elapsed, setElapsed] = useState<number>(status.elapsed_seconds || 0);

  useEffect(() => {
    setElapsed(status.elapsed_seconds || 0);
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [status.start_time]);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none animate-fadeIn">
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-3xl bg-arcade-card border-2 border-arcade-accent/80 flex items-center justify-center shadow-2xl shadow-arcade-accent/30 animate-pulse">
          <Gamepad2 className="w-16 h-16 text-arcade-accent" />
        </div>
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-arcade-accent text-arcade-bg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-lg">
          <Activity className="w-3 h-3 animate-spin" />
          <span>EN COURS</span>
        </div>
      </div>

      <div className="max-w-xl space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-arcade-accent">
          {status.current_system_id} • PID {status.pid || '—'}
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-arcade-text tracking-wide uppercase">
          {status.current_game_title || 'Jeu en cours'}
        </h1>
        <p className="text-xs text-arcade-muted">
          La session est supervisée par KaïroOS. Le frontend reprendra automatiquement à la fermeture du jeu.
        </p>
      </div>

      <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-arcade-card border border-arcade-border mb-10 text-arcade-text">
        <Clock className="w-5 h-5 text-arcade-gold animate-bounce" />
        <span className="text-xl font-mono font-black tracking-wider text-arcade-gold">
          {formatElapsed(elapsed)}
        </span>
      </div>

      <button
        onClick={onKillGame}
        className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-red-600/20 hover:bg-red-600 border border-red-500/50 hover:border-red-500 text-red-200 hover:text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg hover:shadow-red-600/30 hover:scale-105 active:scale-95"
      >
        <Square className="w-4 h-4 fill-current" />
        <span>Arrêter le Jeu (Forcer la sortie)</span>
      </button>
    </div>
  );
};
