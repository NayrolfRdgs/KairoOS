import React from 'react';
import { Tv, Gamepad2, PlusCircle, Sliders, Lock, Sparkles, Shield, Wifi } from 'lucide-react';
import { ThemeMode, StatusResponse } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  status: StatusResponse | null;
  gamesCount: number;
  theme: ThemeMode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  status,
  gamesCount,
  theme,
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Tv, badge: status?.is_running ? 'EN JEU' : undefined, badgeColor: 'bg-retro-green text-retro-dark' },
    { id: 'games', label: 'Bibliothèque Jeux', icon: Gamepad2, badge: `${gamesCount}`, badgeColor: isDark ? 'bg-retro-purple/40 text-retro-cyan' : 'bg-retro-primary/10 text-retro-primary' },
    { id: 'add', label: 'Ajouter un Jeu', icon: PlusCircle },
    { id: 'settings', label: 'Réglages Système', icon: Sliders },
    { id: 'unlock', label: 'Mode Kiosk', icon: status?.kiosk_mode ? Lock : Shield, badge: status?.kiosk_mode ? 'LOCK' : 'ADMIN', badgeColor: status?.kiosk_mode ? 'bg-amber-500 text-black' : 'bg-emerald-500/20 text-emerald-400' },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col w-64 border-r shrink-0 select-none p-4 justify-between transition-colors ${
        isDark
          ? 'bg-retro-card/70 border-retro-border text-white'
          : 'bg-white/80 border-retro-border text-retro-text shadow-sm'
      }`}
    >
      <div className="space-y-6">
        {/* Quick Station Status */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-retro-panel/70 border-retro-border' : 'bg-retro-warm/60 border-retro-border'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold font-arcade mb-1">
            <span className="text-slate-400">BORNE IP :</span>
            <span className="text-retro-cyan font-mono">{status?.local_ip || '127.0.0.1'}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Port : {status?.port || 8080}</span>
            <span className="font-mono text-emerald-400">v{status?.version || '0.1.0'}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold font-arcade transition-all ${
                  isActive
                    ? isDark
                      ? 'bg-gradient-to-r from-retro-primary to-retro-purple text-white shadow-md shadow-retro-primary/20 scale-[1.02]'
                      : 'bg-gradient-to-r from-retro-primary to-retro-orange text-white shadow-retro scale-[1.02]'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-retro-text/70 hover:text-retro-primary hover:bg-retro-warm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full font-mono ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-retro-border/50 text-[10px] text-slate-400 text-center font-mono">
        KaïroOS Remote Control • 80s Arcade
      </div>
    </aside>
  );
};
