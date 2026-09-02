import React, { useState } from 'react';
import { X, Sliders, Shield, Eye, Folder, Gamepad2, Check } from 'lucide-react';
import { AppSettings, CustomFranchise, RemoteConfig } from '../../../types';
import { KioskTab } from './KioskTab';
import { FranchisesTab } from './FranchisesTab';
import { FoldersTab } from './FoldersTab';

interface SettingsModalProps {
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => Promise<void>;
  onToggleFullscreen: () => Promise<boolean | void>;
  onOpenGamepadSettings?: () => void;
  remoteConfig?: RemoteConfig;
  onSaveRemoteConfig?: (cfg: RemoteConfig) => Promise<void>;
  onLockKioskNow?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onClose,
  onSave,
  onToggleFullscreen,
  onOpenGamepadSettings,
  remoteConfig,
  onSaveRemoteConfig,
  onLockKioskNow,
}) => {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'franchises' | 'folders'>('kiosk');
  const [fullscreen, setFullscreen] = useState(settings.fullscreen);
  const [alwaysOnTop, setAlwaysOnTop] = useState(settings.always_on_top);
  const [kioskMode, setKioskMode] = useState(settings.kiosk_mode);
  const [enabledFranchises, setEnabledFranchises] = useState<string[]>(settings.enabled_franchises || []);
  const [customFranchises, setCustomFranchises] = useState<CustomFranchise[]>(settings.custom_franchises || []);
  const [romsPath, setRomsPath] = useState(settings.roms_path || '');
  const [localRemote, setLocalRemote] = useState<RemoteConfig | undefined>(remoteConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = async () => {
    const updated: AppSettings = {
      fullscreen,
      always_on_top: alwaysOnTop,
      kiosk_mode: kioskMode,
      enabled_franchises: enabledFranchises,
      custom_franchises: customFranchises,
      roms_path: romsPath.trim() ? romsPath.trim() : undefined,
      theme: 'retro-80s-light',
    };

    await onSave(updated);

    if (localRemote && onSaveRemoteConfig) {
      await onSaveRemoteConfig(localRemote);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-retro-text/40 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-retro-border rounded-3xl shadow-retro-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-retro-border bg-gradient-to-r from-retro-primary via-retro-purple to-retro-cyan flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-display text-white tracking-wide uppercase">
                Paramètres KaïroOS
              </h2>
              <span className="text-xs text-white/80 font-medium">
                Mode Borne Arcade, Serveur Distant PWA & Franchises
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-6 border-b border-retro-border bg-retro-bg/50">
          <button
            onClick={() => setActiveTab('kiosk')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'kiosk'
                ? 'border-retro-primary text-retro-primary'
                : 'border-transparent text-retro-textMuted hover:text-retro-text'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Mode Borne & Distant</span>
          </button>

          <button
            onClick={() => setActiveTab('franchises')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'franchises'
                ? 'border-retro-primary text-retro-primary'
                : 'border-transparent text-retro-textMuted hover:text-retro-text'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Franchises Visibles</span>
          </button>

          <button
            onClick={() => setActiveTab('folders')}
            className={`py-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'folders'
                ? 'border-retro-primary text-retro-primary'
                : 'border-transparent text-retro-textMuted hover:text-retro-text'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Dossiers & Emplacement</span>
          </button>

          {onOpenGamepadSettings && (
            <button
              onClick={() => {
                onClose();
                onOpenGamepadSettings();
              }}
              className="py-3 text-xs font-bold uppercase tracking-wider border-b-2 border-transparent text-retro-primary hover:text-retro-purple flex items-center gap-2 transition-all ml-auto"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>🎮 Manettes (1-10)</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'kiosk' && (
            <KioskTab
              fullscreen={fullscreen}
              setFullscreen={setFullscreen}
              alwaysOnTop={alwaysOnTop}
              setAlwaysOnTop={setAlwaysOnTop}
              kioskMode={kioskMode}
              setKioskMode={setKioskMode}
              onToggleFullscreen={onToggleFullscreen}
              onOpenGamepadSettings={onOpenGamepadSettings}
              remoteConfig={localRemote}
              setRemoteConfig={setLocalRemote}
              onLockKioskNow={onLockKioskNow}
            />
          )}

          {activeTab === 'franchises' && (
            <FranchisesTab
              enabledFranchises={enabledFranchises}
              setEnabledFranchises={setEnabledFranchises}
              customFranchises={customFranchises}
              setCustomFranchises={setCustomFranchises}
            />
          )}

          {activeTab === 'folders' && (
            <FoldersTab romsPath={romsPath} setRomsPath={setRomsPath} />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-retro-border bg-retro-bg/40 flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 animate-fadeIn flex items-center gap-1">
                <Check className="w-4 h-4" />
                Paramètres enregistrés et appliqués !
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-retro-textMuted hover:text-retro-text transition-all"
            >
              Fermer
            </button>

            <button
              onClick={handleSaveAll}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-retro-primary to-retro-purple text-white font-bold text-xs uppercase tracking-wider shadow-retro-neon hover:scale-105 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer les Paramètres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
