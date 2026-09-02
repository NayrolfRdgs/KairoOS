import React, { useEffect, useState } from 'react';
import { Gamepad2, FolderSearch, Clock } from 'lucide-react';
import { System } from '../types';

interface HeaderProps {
  currentSystem: System | null;
  totalGames: number;
  gamepadConnected: boolean;
  gamepadName: string | null;
  onOpenScanner: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentSystem,
  totalGames,
  gamepadConnected,
  gamepadName,
  onOpenScanner,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-arcade-border/60 bg-arcade-surface/80 backdrop-blur-md select-none z-30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="KaïroOS"
            className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-arcade-accent/30 border border-arcade-accent/40"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-wider uppercase font-display bg-gradient-to-r from-arcade-accent to-arcade-neon bg-clip-text text-transparent">
              Kaïro<span className="text-arcade-text">OS</span>
            </span>
            <span className="text-[10px] text-arcade-muted uppercase tracking-widest font-semibold -mt-1">
              Arcade Station
            </span>
          </div>
        </div>

        {currentSystem && (
          <div className="hidden md:flex items-center gap-2 pl-6 border-l border-arcade-border">
            <span className="text-xs text-arcade-muted uppercase font-semibold">Console:</span>
            <span className="text-xs px-2.5 py-1 rounded bg-arcade-card border border-arcade-border text-arcade-accent font-bold">
              {currentSystem.name}
            </span>
            <span className="text-xs text-arcade-muted font-medium">
              ({totalGames} {totalGames > 1 ? 'jeux' : 'jeu'})
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-arcade-card/80 border border-arcade-border text-xs">
          <Gamepad2
            className={`w-4 h-4 ${
              gamepadConnected ? 'text-arcade-success animate-pulse' : 'text-arcade-muted'
            }`}
          />
          <span className="hidden sm:inline text-arcade-muted font-medium">
            {gamepadConnected ? (
              <span className="text-arcade-success font-semibold">
                {gamepadName ? gamepadName.split('(')[0].trim() : 'Manette Active'}
              </span>
            ) : (
              'Clavier / Prêt Manette'
            )}
          </span>
        </div>

        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-arcade-card hover:bg-arcade-border/80 border border-arcade-border hover:border-arcade-accent text-xs font-semibold text-arcade-text transition-all hover:shadow-lg hover:shadow-arcade-accent/10"
        >
          <FolderSearch className="w-4 h-4 text-arcade-accent" />
          <span>Scanner ROMs</span>
        </button>

        <div className="flex items-center gap-2 text-sm font-bold text-arcade-text pl-2 border-l border-arcade-border">
          <Clock className="w-4 h-4 text-arcade-gold" />
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
};
