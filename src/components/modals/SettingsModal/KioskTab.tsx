import React from 'react';
import { Tv, Shield, Gamepad2, Wifi, Lock } from 'lucide-react';
import { RemoteConfig } from '../../../types';

interface KioskTabProps {
  fullscreen: boolean;
  setFullscreen: (val: boolean) => void;
  alwaysOnTop: boolean;
  setAlwaysOnTop: (val: boolean) => void;
  kioskMode: boolean;
  setKioskMode: (val: boolean) => void;
  onToggleFullscreen: () => Promise<boolean | void>;
  onOpenGamepadSettings?: () => void;
  remoteConfig?: RemoteConfig;
  setRemoteConfig?: (cfg: RemoteConfig) => void;
  onLockKioskNow?: () => void;
}

export const KioskTab: React.FC<KioskTabProps> = ({
  fullscreen,
  setFullscreen,
  alwaysOnTop,
  setAlwaysOnTop,
  kioskMode,
  setKioskMode,
  onToggleFullscreen,
  onOpenGamepadSettings,
  remoteConfig,
  setRemoteConfig,
  onLockKioskNow,
}) => {
  return (
    <div className="space-y-5">
      {/* Carte Manettes & Arcade Stick */}
      {onOpenGamepadSettings && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-arcade-orange/15 to-retro-warm/50 border-2 border-arcade-orange/30 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-arcade-orange text-white shadow-md">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide text-retro-text font-arcade">
                GESTIONNAIRE MULTI-MANETTES & ARCADE STICKS
              </h4>
              <p className="text-[11px] text-retro-textMuted">
                Configuration de 1 à 10 joueurs, boutons arcade 6/8 boutons, Coin/Crédit et synchronisation émulateurs.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenGamepadSettings}
            className="px-4 py-2 rounded-xl bg-arcade-orange hover:bg-arcade-orange/90 text-white font-bold text-xs shadow-md transition-all font-arcade whitespace-nowrap"
          >
            CONFIGURER (1-10) 🎮
          </button>
        </div>
      )}

      {/* Option 1: Plein Écran Exclusif */}
      <div className="p-4 rounded-2xl bg-retro-bg border border-retro-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-retro-primary border border-retro-border shadow-sm">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-retro-text">
              Mode Plein Écran Exclusif (Borne d'Arcade)
            </h4>
            <p className="text-[11px] text-retro-textMuted">
              Occupe la totalité de l'écran sans barre de titre ni bordures. (Raccourci clavier:{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white font-mono text-retro-primary font-bold border border-retro-border">
                F11
              </kbd>
              ).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setFullscreen(!fullscreen);
              await onToggleFullscreen();
            }}
            className="px-3 py-1.5 rounded-xl bg-white border border-retro-border text-xs font-bold text-retro-text hover:border-retro-primary transition-all shadow-sm"
          >
            Bascule Rapide
          </button>
          <input
            type="checkbox"
            checked={fullscreen}
            onChange={(e) => setFullscreen(e.target.checked)}
            className="w-5 h-5 rounded text-retro-primary focus:ring-retro-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Option 2: Toujours au premier plan */}
      <div className="p-4 rounded-2xl bg-retro-bg border border-retro-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-retro-cyan border border-retro-border shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-retro-text">
              Toujours au Premier Plan (Lock-down Windows)
            </h4>
            <p className="text-[11px] text-retro-textMuted">
              Empêche les popups, notifications et fenêtres Windows de passer devant la borne.
            </p>
          </div>
        </div>

        <input
          type="checkbox"
          checked={alwaysOnTop}
          onChange={(e) => setAlwaysOnTop(e.target.checked)}
          className="w-5 h-5 rounded text-retro-cyan focus:ring-retro-cyan cursor-pointer"
        />
      </div>

      {/* Option 3: Mode Borne Physique / Kiosk */}
      <div className="p-4 rounded-2xl bg-retro-bg border border-retro-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white text-retro-yellow border border-retro-border shadow-sm">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-retro-text">
              Mode Kiosk Salle d'Arcade
            </h4>
            <p className="text-[11px] text-retro-textMuted">
              Masque les menus d'administration et les scans. Déverrouillage par combo joystick <kbd className="px-1 py-0.5 rounded bg-white font-mono border text-[10px]">LB+RB+Start</kbd> (3s) ou <kbd className="px-1 py-0.5 rounded bg-white font-mono border text-[10px]">Ctrl+Shift+K</kbd>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onLockKioskNow && (
            <button
              onClick={onLockKioskNow}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold font-arcade shadow-sm transition-all"
            >
              Activer Kiosk 🔒
            </button>
          )}
          <input
            type="checkbox"
            checked={kioskMode}
            onChange={(e) => setKioskMode(e.target.checked)}
            className="w-5 h-5 rounded text-retro-yellow focus:ring-retro-yellow cursor-pointer"
          />
        </div>
      </div>

      {/* Option 4: Contrôle à Distance & Serveur HTTP PWA */}
      {remoteConfig && setRemoteConfig && (
        <div className="p-4 rounded-2xl bg-white border border-retro-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-retro-primary/10 text-retro-primary border border-retro-primary/20">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-retro-text font-arcade">
                  Serveur Distant & Télécommande Mobile (PWA)
                </h4>
                <p className="text-[11px] text-retro-textMuted">
                  Permet de piloter la borne depuis un smartphone sur le même réseau Wi-Fi.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={remoteConfig.enabled}
              onChange={(e) => setRemoteConfig({ ...remoteConfig, enabled: e.target.checked })}
              className="w-5 h-5 rounded text-retro-primary focus:ring-retro-primary cursor-pointer"
            />
          </div>

          {remoteConfig.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-retro-border/50">
              <div>
                <label className="text-[11px] font-bold text-retro-textMuted uppercase block mb-1">
                  Port Serveur HTTP
                </label>
                <input
                  type="number"
                  value={remoteConfig.port}
                  onChange={(e) => setRemoteConfig({ ...remoteConfig, port: parseInt(e.target.value) || 8080 })}
                  className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs font-mono font-bold text-retro-text"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-retro-textMuted uppercase block mb-1">
                  Code PIN de Sécurité (Action POST)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={remoteConfig.pin}
                  onChange={(e) => setRemoteConfig({ ...remoteConfig, pin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-retro-bg border border-retro-border text-xs font-mono font-bold text-retro-text tracking-widest"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
