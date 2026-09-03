import React from 'react';
import { LayoutDashboard, Gamepad2, PlusCircle, Sliders, Lock, Shield, Smartphone } from 'lucide-react';
import { ThemeMode, StatusResponse } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: any) => void;
  status: StatusResponse | null;
  gamesCount: number;
  theme: ThemeMode;
  onOpenGamepad: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  status,
  gamesCount,
  theme,
  onOpenGamepad,
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      badge: status?.is_running ? 'EN JEU' : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      id: 'games',
      label: 'Catalogue des Jeux',
      icon: Gamepad2,
      badge: `${gamesCount}`,
      badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    },
    {
      id: 'add',
      label: 'Ajouter une ROM',
      icon: PlusCircle,
    },
    {
      id: 'settings',
      label: 'Configuration & Émulateurs',
      icon: Sliders,
    },
    {
      id: 'unlock',
      label: 'Mode Salle (Kiosk)',
      icon: status?.kiosk_mode ? Lock : Shield,
      badge: status?.kiosk_mode ? 'Actif' : 'Libre',
      badgeColor: status?.kiosk_mode
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col w-64 border-r shrink-0 select-none p-4 justify-between transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      <div className="space-y-6">
        {/* Infos IP Borne */}
        <div
          className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
            isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between font-semibold">
            <span className="text-slate-400">IP BORNE :</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {status?.local_ip || '127.0.0.1'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Port : {status?.port || 8080}</span>
            <span className="font-mono">v{status?.version || '0.1.0'}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bouton rapide Manette Virtuelle */}
        <div className="pt-2">
          <button
            onClick={onOpenGamepad}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all shadow-xs ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-indigo-400 border-slate-700'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Manette Virtuelle (J1-J4)</span>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 text-center font-mono">
        KaïroOS Admin Panel
      </div>
    </aside>
  );
};
