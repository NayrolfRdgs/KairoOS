import React from 'react';
import { Tv, Shield, Gamepad2, Wifi, Lock, Sparkles } from 'lucide-react';
import { RemoteConfig } from '../../../types';

interface KioskTabProps {
  fullscreen: boolean;
  setFullscreen: (val: boolean) => void;
  alwaysOnTop: boolean;
  setAlwaysOnTop: (val: boolean) => void;
  kioskMode: boolean;
  setKioskMode: (val: boolean) => void;
  autoKiosk: boolean;
  setAutoKiosk: (val: boolean) => void;
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
  autoKiosk,
  setAutoKiosk,
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
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-purple-600 to-rose-500 text-white shadow-md shadow-pink-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wide text-slate-900 font-sans">
                GESTIONNAIRE MULTI-MANETTES & ARCADE STICKS
              </h4>
              <p className="text-[11px] text-slate-500">
                Configuration de 1 à 10 joueurs, boutons arcade 6/8 boutons, Coin/Crédit et synchronisation émulateurs.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenGamepadSettings}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all whitespace-nowrap active:scale-95"
          >
            CONFIGURER (1-10) 🎮
          </button>
        </div>
      )}

      {/* Option A: Démarrage Automatique en Mode Kiosque */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shadow-2xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
              Démarrage Automatique en Mode Kiosque (Borne Publique)
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Verrouille automatiquement l'application dès son allumage. Les joueurs ne peuvent pas modifier les jeux, supprimer des fichiers ou accéder aux paramètres sans le code PIN.
            </p>
          </div>
        </div>

        <input
          type="checkbox"
          checked={autoKiosk}
          onChange={(e) => setAutoKiosk(e.target.checked)}
          className="w-5 h-5 rounded-lg text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-500"
        />
      </div>

      {/* Option B: Mode Borne Physique Immédiat / Kiosk */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
              Activer le Mode Kiosque Maintenant
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Masque les menus d'administration. Déverrouillage par combo manette <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold border border-slate-200">LB+RB+Start</kbd> (3s) ou <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] font-bold border border-slate-200">Ctrl+Shift+K</kbd>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onLockKioskNow && (
            <button
              onClick={onLockKioskNow}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              Verrouiller Kiosk 🔒
            </button>
          )}
          <input
            type="checkbox"
            checked={kioskMode}
            onChange={(e) => setKioskMode(e.target.checked)}
            className="w-5 h-5 rounded-lg text-amber-500 focus:ring-amber-500 cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Option C: Plein Écran Exclusif */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 shadow-2xs">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
              Mode Plein Écran Exclusif
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Occupe la totalité de l'écran sans barre de titre Windows ni bordures. (Touche <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-purple-600 font-bold border border-slate-200">F11</kbd>).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              setFullscreen(!fullscreen);
              await onToggleFullscreen();
            }}
            className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-all shadow-2xs"
          >
            Bascule Rapide
          </button>
          <input
            type="checkbox"
            checked={fullscreen}
            onChange={(e) => setFullscreen(e.target.checked)}
            className="w-5 h-5 rounded-lg text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
          />
        </div>
      </div>

      {/* Option D: Toujours au premier plan */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-slate-900">
              Toujours au Premier Plan (Verrouillage Windows)
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Empêche les notifications et popups Windows de passer devant la borne.
            </p>
          </div>
        </div>

        <input
          type="checkbox"
          checked={alwaysOnTop}
          onChange={(e) => setAlwaysOnTop(e.target.checked)}
          className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
        />
      </div>

      {/* Option E: Contrôle à Distance & Serveur Admin */}
      {remoteConfig && setRemoteConfig && (
        <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-50 text-rose-600 border border-pink-100 shadow-2xs">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-slate-900 font-sans">
                  Serveur d'Accès Distant & Contrôle Administrateur (PWA)
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Permet de piloter la borne et d'accéder aux paramètres d'administration à distance depuis un smartphone ou un PC sur le réseau.
                </p>
              </div>
            </div>

            <input
              type="checkbox"
              checked={remoteConfig.enabled}
              onChange={(e) => setRemoteConfig({ ...remoteConfig, enabled: e.target.checked })}
              className="w-5 h-5 rounded-lg text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-500"
            />
          </div>

          {remoteConfig.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-purple-100/60">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Port Serveur HTTP
                </label>
                <input
                  type="number"
                  value={remoteConfig.port}
                  onChange={(e) => setRemoteConfig({ ...remoteConfig, port: parseInt(e.target.value) || 8080 })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-mono font-bold text-slate-900 focus:border-rose-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                  Code PIN de Sécurité Administrateur
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={remoteConfig.pin}
                  onChange={(e) => setRemoteConfig({ ...remoteConfig, pin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-purple-50/40 border border-purple-100 text-xs font-mono font-bold text-slate-900 tracking-widest focus:border-rose-400"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
