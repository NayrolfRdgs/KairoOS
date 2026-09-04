import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  X,
  Palette,
  Monitor,
  Cpu,
  Tv,
  Gamepad2,
  Library,
  Globe,
  Wifi,
  Layers,
  Settings as SettingsIcon,
  Check,
  ChevronRight,
} from 'lucide-react';
import { AppSettings, Emulator, RemoteConfig, System } from '../../../types';
import { useTheme } from '../../../hooks';
import { ThemesSection } from './ThemesSection';
import { DisplaySection } from './DisplaySection';
import { EmulatorsSection } from './EmulatorsSection';
import { MediaSection } from './MediaSection';
import { GamepadsSection } from './GamepadsSection';
import { LibrarySection } from './LibrarySection';
import { ScrapingSection } from './ScrapingSection';
import { NetworkSection } from './NetworkSection';
import { AdvancedSection } from './AdvancedSection';
import { ConsolesTab } from './ConsolesTab';

export type SettingsSectionId =
  | 'themes'
  | 'display'
  | 'emulators'
  | 'media'
  | 'gamepads'
  | 'library'
  | 'scraping'
  | 'network'
  | 'consoles'
  | 'advanced';

interface SettingsModalProps {
  settings: AppSettings;
  systems?: System[];
  emulators?: Emulator[];
  onClose: () => void;
  onSave: (settings: AppSettings) => Promise<void>;
  onToggleFullscreen: () => Promise<boolean | void>;
  onOpenGamepadSettings?: () => void;
  remoteConfig?: RemoteConfig;
  onSaveRemoteConfig?: (cfg: RemoteConfig) => Promise<void>;
  onLockKioskNow?: () => void;
  onScanComplete?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings: initialSettings,
  systems = [],
  emulators = [],
  onClose,
  onSave,
  onToggleFullscreen,
  onOpenGamepadSettings,
  remoteConfig,
  onSaveRemoteConfig,
  onLockKioskNow,
  onScanComplete,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('themes');
  const [localSettings, setLocalSettings] = useState<AppSettings>(initialSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSettingsRef = useRef<AppSettings>(initialSettings);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Hook du gestionnaire de thèmes
  const themeManager = useTheme();

  // Sauvegarde temps réel avec debounce 300ms pour éviter tout redémarrage
  const updateSetting = useCallback(
    (key: keyof AppSettings, val: any) => {
      setLocalSettings((prev) => {
        const updated = { ...prev, [key]: val };
        pendingSettingsRef.current = updated;

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          onSave(pendingSettingsRef.current).catch((err) => {
            console.error('[SettingsModal] Erreur sauvegarde temps réel:', err);
          });
        }, 300);

        return updated;
      });

      setSavedSuccess(true);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => setSavedSuccess(false), 1500);
    },
    [onSave]
  );

  // Navigation manette (D-Pad / Sticks)
  const sectionsList: { id: SettingsSectionId; label: string; icon: React.ReactNode }[] = [
    { id: 'themes', label: 'Thèmes & Style', icon: <Palette className="w-4 h-4" /> },
    { id: 'display', label: 'Affichage & Écran', icon: <Monitor className="w-4 h-4" /> },
    { id: 'emulators', label: 'Émulateurs & CLI', icon: <Cpu className="w-4 h-4" /> },
    { id: 'media', label: 'Image & Son', icon: <Tv className="w-4 h-4" /> },
    { id: 'gamepads', label: 'Manettes', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'library', label: 'Bibliothèque', icon: <Library className="w-4 h-4" /> },
    { id: 'scraping', label: 'Scraping', icon: <Globe className="w-4 h-4" /> },
    { id: 'network', label: 'Réseau & Remote', icon: <Wifi className="w-4 h-4" /> },
    { id: 'consoles', label: 'Consoles & Modes', icon: <Layers className="w-4 h-4" /> },
    { id: 'advanced', label: 'Avancé & Système', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  // Gestion du D-Pad pour naviguer entre les sections
  useEffect(() => {
    let animId: number;
    let lastNavTime = 0;

    const pollGamepads = () => {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = pads[0] || pads[1] || pads[2] || pads[3];

      if (pad) {
        const now = performance.now();
        const delay = localSettings.navigation_repeat_rate_ms || 180;

        if (now - lastNavTime > delay) {
          const upPressed = pad.buttons[12]?.pressed || (pad.axes[1] && pad.axes[1] < -0.5);
          const downPressed = pad.buttons[13]?.pressed || (pad.axes[1] && pad.axes[1] > 0.5);
          const bPressed = pad.buttons[1]?.pressed;

          if (upPressed) {
            setActiveSection((curr) => {
              const idx = sectionsList.findIndex((s) => s.id === curr);
              const nextIdx = idx > 0 ? idx - 1 : sectionsList.length - 1;
              return sectionsList[nextIdx].id;
            });
            lastNavTime = now;
          } else if (downPressed) {
            setActiveSection((curr) => {
              const idx = sectionsList.findIndex((s) => s.id === curr);
              const nextIdx = idx < sectionsList.length - 1 ? idx + 1 : 0;
              return sectionsList[nextIdx].id;
            });
            lastNavTime = now;
          } else if (bPressed) {
            onClose();
            lastNavTime = now;
          }
        }
      }

      animId = requestAnimationFrame(pollGamepads);
    };

    animId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animId);
  }, [sectionsList, localSettings.navigation_repeat_rate_ms, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-fadeIn select-none">
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
        className="relative w-full max-w-5xl h-[88vh] border rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header Bar */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
          }}
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                color: 'var(--accent-primary)',
              }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-2xs"
            >
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2
                style={{ color: 'var(--text-primary)' }}
                className="text-base font-black font-sans tracking-tight"
              >
                PARAMÈTRES DE LA BORNE
              </h2>
              <p
                style={{ color: 'var(--text-muted)' }}
                className="text-xs"
              >
                Configuration générale, thèmes, émulation et manettes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                <span>Enregistré en temps réel</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/10 text-slate-400 hover:text-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two Columns Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Internal Sidebar */}
          <div
            style={{
              backgroundColor: 'var(--sidebar-bg)',
              borderColor: 'var(--border-color)',
            }}
            className="w-64 border-r p-3 flex flex-col gap-1 overflow-y-auto shrink-0"
          >
            {sectionsList.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  style={{
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-primary)',
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive ? 'shadow-sm' : 'hover:bg-black/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                </button>
              );
            })}

            <div
              style={{
                color: 'var(--text-muted)',
                borderColor: 'var(--border-color)',
              }}
              className="mt-auto pt-3 border-t text-[10px] text-center font-mono"
            >
              D-Pad ↕ naviguer • (B) fermer
            </div>
          </div>

          {/* Section Main View */}
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
            }}
            className="flex-1 overflow-y-auto p-6 scrollbar-thin"
          >
            {activeSection === 'themes' && <ThemesSection themeManager={themeManager} />}

            {activeSection === 'display' && (
              <DisplaySection
                settings={localSettings}
                updateSetting={updateSetting}
                onNavigateToThemes={() => setActiveSection('themes')}
                activeTheme={themeManager.activeTheme}
                onToggleFullscreen={onToggleFullscreen}
              />
            )}

            {activeSection === 'emulators' && (
              <EmulatorsSection
                settings={localSettings}
                updateSetting={updateSetting}
                emulators={emulators}
              />
            )}

            {activeSection === 'media' && (
              <MediaSection settings={localSettings} updateSetting={updateSetting} />
            )}

            {activeSection === 'gamepads' && (
              <GamepadsSection
                settings={localSettings}
                updateSetting={updateSetting}
                onOpenGamepadModal={onOpenGamepadSettings}
              />
            )}

            {activeSection === 'library' && (
              <LibrarySection
                settings={localSettings}
                updateSetting={updateSetting}
                onScanComplete={onScanComplete}
              />
            )}

            {activeSection === 'scraping' && (
              <ScrapingSection settings={localSettings} updateSetting={updateSetting} />
            )}

            {activeSection === 'network' && (
              <NetworkSection
                settings={localSettings}
                updateSetting={updateSetting}
                remoteConfig={remoteConfig}
                onSaveRemoteConfig={onSaveRemoteConfig}
              />
            )}

            {activeSection === 'consoles' && (
              <ConsolesTab
                systems={systems}
                enabledSystems={localSettings.enabled_systems || []}
                setEnabledSystems={(systemsList) => updateSetting('enabled_systems', systemsList)}
                enabledModes={localSettings.enabled_modes || ['2-players', 'genre:fight', 'genre:platform']}
                setEnabledModes={(modesList) => updateSetting('enabled_modes', modesList)}
                enabledFranchises={localSettings.enabled_franchises || []}
                setEnabledFranchises={(frList) => updateSetting('enabled_franchises', frList)}
              />
            )}

            {activeSection === 'advanced' && (
              <AdvancedSection
                settings={localSettings}
                updateSetting={updateSetting}
                onLockKioskNow={onLockKioskNow}
                onReloadSettings={onScanComplete}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
          }}
          className="p-4 border-t flex items-center justify-between gap-3 shrink-0"
        >
          <div
            style={{ color: 'var(--text-muted)' }}
            className="text-[11px] font-mono"
          >
            KaïroOS v2.0 • Paramètres & Thèmes • Sauvegarde temps réel
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'var(--accent-primary)',
            }}
            className="px-6 py-2 rounded-xl text-white text-xs font-black uppercase tracking-wider shadow-md active:scale-95 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};