import React from 'react';
import { LayoutDashboard, Gamepad2, PlusCircle, Sliders, Lock, Shield, Smartphone } from 'lucide-react';
import { ThemeMode, StatusResponse } from '../types';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  status: StatusResponse | null;
  theme: ThemeMode;
  onOpenGamepad: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  status,
  theme,
  onOpenGamepad,
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Borne', icon: LayoutDashboard, hasDot: status?.is_running },
    { id: 'games', label: 'Jeux', icon: Gamepad2 },
    { id: 'add', label: 'Ajouter', icon: PlusCircle },
    { id: 'settings', label: 'Réglages', icon: Sliders },
  ];

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-lg border-t px-2 py-1.5 flex items-center justify-around transition-colors ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-800 shadow-lg'
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
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {item.hasDot && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        );
      })}

      {/* Bouton Manette Mobile direct */}
      <button
        onClick={onOpenGamepad}
        className="flex flex-col items-center gap-1 p-2 rounded-2xl text-emerald-600 dark:text-emerald-400 font-bold"
      >
        <Smartphone className="w-5 h-5" />
        <span className="text-[10px]">Manette</span>
      </button>
    </nav>
  );
};
