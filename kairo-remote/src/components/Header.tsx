import React from 'react';
import { Gamepad2, Sun, Moon, KeyRound, Wifi, WifiOff } from 'lucide-react';
import { ThemeMode } from '../types';

interface HeaderProps {
  connected: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  pin: string;
  onOpenPinModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connected,
  theme,
  onToggleTheme,
  pin,
  onOpenPinModal,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between transition-colors ${
        isDark
          ? 'bg-retro-card/90 border-retro-border text-white'
          : 'bg-white/95 border-retro-border text-retro-text shadow-sm'
      }`}
    >
      {/* Brand & Connection Status */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-retro-primary to-retro-purple flex items-center justify-center text-white shadow-md">
          <Gamepad2 className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm tracking-wider uppercase font-arcade">
              Kaïro<span className="text-retro-primary">OS</span>
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold tracking-widest ${
                isDark
                  ? 'bg-retro-purple/30 text-retro-cyan border border-retro-purple/50'
                  : 'bg-retro-primary/10 text-retro-primary border border-retro-primary/20'
              }`}
            >
              REMOTE
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px]">
            {connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-retro-green animate-pulse" />
                <span className="text-retro-green font-bold">Borne En Ligne</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-retro-primary animate-ping" />
                <span className="text-retro-primary font-bold">Déconnecté</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: Theme Toggle + PIN */}
      <div className="flex items-center gap-2">
        {/* Dark / Light Toggle */}
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Passer au thème clair (Arcade 80s)' : 'Passer au thème sombre'}
          className={`p-2 rounded-xl border transition-all active:scale-90 ${
            isDark
              ? 'bg-retro-panel border-retro-border text-retro-yellow hover:border-retro-yellow/50 shadow-sm'
              : 'bg-retro-warm border-retro-border text-retro-primary hover:border-retro-primary/50 shadow-sm'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* PIN Badge / Button */}
        <button
          onClick={onOpenPinModal}
          title="Modifier le Code PIN de session"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all active:scale-95 ${
            isDark
              ? 'bg-retro-panel border-retro-border hover:border-retro-cyan text-white shadow-sm'
              : 'bg-retro-warm border-retro-border hover:border-retro-primary text-retro-text shadow-sm'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-retro-yellow" />
          <span className="font-mono text-xs font-bold tracking-wider">
            {pin ? '••••' : 'Saisir PIN'}
          </span>
        </button>
      </div>
    </header>
  );
};
