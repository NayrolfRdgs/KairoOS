import React from 'react';
import { Tv, Gamepad2, PlusCircle, Sliders, Lock, Shield } from 'lucide-react';
import { ThemeMode, StatusResponse } from '../types';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  status: StatusResponse | null;
  theme: ThemeMode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  status,
  theme,
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Borne', icon: Tv, hasDot: status?.is_running },
    { id: 'games', label: 'Jeux', icon: Gamepad2 },
    { id: 'add', label: 'Ajouter', icon: PlusCircle },
    { id: 'settings', label: 'Réglages', icon: Sliders },
    { id: 'unlock', label: 'Kiosk', icon: status?.kiosk_mode ? Lock : Shield },
  ];

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t px-2 py-2 flex items-center justify-around transition-colors ${
        isDark
          ? 'bg-retro-card/95 border-retro-border text-white'
          : 'bg-white/95 border-retro-border text-retro-text shadow-lg'
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all relative ${
              isActive
                ? isDark
                  ? 'text-retro-cyan font-bold scale-105'
                  : 'text-retro-primary font-bold scale-105'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-retro-text/60 hover:text-retro-primary'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.hasDot && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-retro-green border-2 border-retro-card animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-arcade tracking-wider">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
