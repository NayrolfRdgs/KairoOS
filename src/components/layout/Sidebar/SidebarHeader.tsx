import React from 'react';
import { Gamepad2, Settings as SettingsIcon, Lock } from 'lucide-react';
import { AppMode } from '../../../types';

interface SidebarHeaderProps {
  gamepadConnected: boolean;
  gamepadName: string | null;
  appMode?: AppMode;
  onOpenSettings: () => void;
  onOpenGamepadSettings?: () => void;
  onOpenKioskUnlock?: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  gamepadConnected,
  gamepadName,
  appMode = 'admin',
  onOpenSettings,
  onOpenGamepadSettings,
  onOpenKioskUnlock,
}) => {
  const isKiosk = appMode === 'kiosk';

  return (
    <div className="p-5 border-b border-retro-border flex items-center justify-between bg-gradient-to-br from-retro-sidebar to-retro-bg/40">
      <div className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="KaïroOS"
          className="w-10 h-10 rounded-xl object-cover shadow-md border-2 border-retro-primary/20"
        />
        <div>
          <div className="flex items-center gap-1">
            <span className="text-lg font-black tracking-wider uppercase font-display bg-gradient-to-r from-retro-primary via-retro-purple to-retro-cyan bg-clip-text text-transparent">
              Kaïro
            </span>
            <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-retro-primary text-white tracking-widest font-arcade">
              OS
            </span>
          </div>
          <span className="text-[10px] text-retro-textMuted uppercase tracking-widest font-bold block -mt-0.5">
            Arcade Station 80s
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {isKiosk ? (
          <button
            onClick={onOpenKioskUnlock}
            title="Mode Kiosk Activé (Cliquez ou LB+RB+Start pour déverrouiller)"
            className="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 flex items-center gap-1.5 text-xs font-bold font-arcade shadow-xs animate-pulse"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>KIOSK</span>
          </button>
        ) : (
          <>
            <button
              onClick={onOpenGamepadSettings}
              title={
                gamepadConnected
                  ? `${gamepadName || 'Manette connectée'} (Cliquez pour configurer)`
                  : 'Configurer les Manettes & Arcade Sticks'
              }
              className={`p-2 rounded-xl border flex items-center justify-center transition-all shadow-sm ${
                gamepadConnected
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100 animate-pulse'
                  : 'bg-retro-bg border-retro-border text-retro-textMuted hover:text-retro-primary hover:bg-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              title="Paramètres & Mode Borne"
              className="p-2 rounded-xl border border-retro-border bg-retro-bg hover:bg-white text-retro-textMuted hover:text-retro-primary transition-all shadow-sm"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
