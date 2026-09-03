import React from 'react';
import { Gamepad2, Sliders, Sun, Moon, KeyRound, LogOut, Smartphone } from 'lucide-react';
import { ThemeMode } from '../types';

interface HeaderProps {
  connected: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  pin: string;
  onOpenPinModal: () => void;
  appMode: 'admin' | 'gamepad';
  onToggleAppMode: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  connected,
  theme,
  onToggleTheme,
  pin,
  onOpenPinModal,
  appMode,
  onToggleAppMode,
  onLogout,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-6 py-3 flex items-center justify-between transition-colors ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-xs'
      }`}
    >
      {/* Marque & Statut de Connexion */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-xs">
          K
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight font-sans">
              KaïroOS <span className="text-indigo-600 dark:text-indigo-400">Admin</span>
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                isDark
                  ? 'bg-slate-800 text-slate-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              REMOTE
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px]">
            {connected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Borne Connectée</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-500 font-medium">Hors-ligne</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contrôles Header : Bascule Manette / Thème / PIN / Logout */}
      <div className="flex items-center gap-2">
        {/* Bascule vers Mode Manette Virtuelle */}
        <button
          onClick={onToggleAppMode}
          title={appMode === 'admin' ? 'Ouvrir la Manette Virtuelle' : 'Ouvrir le Panneau Admin'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold shadow-xs transition-all"
        >
          <Gamepad2 className="w-4 h-4" />
          <span className="hidden sm:inline">Manette Virtuelle</span>
        </button>

        {/* PIN Button */}
        <button
          onClick={onOpenPinModal}
          title="Modifier le Code PIN"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-500" />
          <span>••••</span>
        </button>

        {/* Thème clair / sombre */}
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Passer au thème clair' : 'Passer au thème sombre'}
          className={`p-1.5 rounded-xl border transition-all ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Déconnexion */}
        <button
          onClick={onLogout}
          title="Se déconnecter"
          className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
