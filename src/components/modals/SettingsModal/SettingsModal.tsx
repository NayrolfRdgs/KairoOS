import React, { useState } from 'react';
import {
  X,
  Sliders,
  Shield,
  Gamepad2,
  Check,
  Tv,
  Play,
  FileText,
  Maximize,
  Layers,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { AppSettings, CustomFranchise, GameSelectAction, RemoteConfig, System } from '../../../types';
import { KioskTab } from './KioskTab';
import { FoldersTab } from './FoldersTab';
import { ConsolesTab } from './ConsolesTab';
import { ArrowDownAZ } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  systems?: System[];
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
  settings,
  systems = [],
  onClose,
  onSave,
  onToggleFullscreen,
  onOpenGamepadSettings,
  remoteConfig,
  onSaveRemoteConfig,
  onLockKioskNow,
  onScanComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'gameplay' | 'consoles' | 'kiosk' | 'folders'>('gameplay');
  const [fullscreen, setFullscreen] = useState(settings.fullscreen);
  const [alwaysOnTop, setAlwaysOnTop] = useState(settings.always_on_top);
  const [kioskMode, setKioskMode] = useState(settings.kiosk_mode);
  const [autoKiosk, setAutoKiosk] = useState(settings.auto_kiosk || false);
  const [defaultSort, setDefaultSort] = useState<NonNullable<AppSettings['default_sort']>>(settings.default_sort || 'title-asc');
  const [enabledSystems, setEnabledSystems] = useState<string[]>(settings.enabled_systems || []);
  const [enabledModes, setEnabledModes] = useState<string[]>(settings.enabled_modes || ['2-players', 'genre:fight', 'genre:platform']);
  const [gameSelectAction, setGameSelectAction] = useState<GameSelectAction>(
    settings.game_select_action || 'details'
  );
  const [enabledFranchises, setEnabledFranchises] = useState<string[]>(settings.enabled_franchises || []);
  const [customFranchises] = useState<CustomFranchise[]>(settings.custom_franchises || []);
  const [romsPath, setRomsPath] = useState(settings.roms_path || '');
  const [localRemote, setLocalRemote] = useState<RemoteConfig | undefined>(remoteConfig);
  const [arcadeUiScale, setArcadeUiScale] = useState<'normal' | 'large' | 'xl'>(settings.arcade_ui_scale || 'normal');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = async () => {
    const updated: AppSettings = {
      fullscreen,
      always_on_top: alwaysOnTop,
      kiosk_mode: kioskMode,
      auto_kiosk: autoKiosk,
      default_sort: defaultSort,
      enabled_systems: enabledSystems,
      enabled_modes: enabledModes,
      game_select_action: gameSelectAction,
      arcade_ui_scale: arcadeUiScale,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/40 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white border border-purple-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-pink-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 font-sans tracking-tight">
                PARAMÈTRES DE LA BORNE
              </h2>
              <p className="text-xs text-slate-500">
                Gameplay, comportement manette, sécurité et affichage
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-6 border-b border-purple-100 flex items-center gap-2 bg-white shrink-0 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('gameplay')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'gameplay'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-purple-50/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Gameplay & Interface</span>
          </button>

          <button
            onClick={() => setActiveTab('consoles')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'consoles'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-purple-50/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Consoles, Modes & Franchises</span>
          </button>

          <button
            onClick={() => setActiveTab('kiosk')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'kiosk'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-purple-50/50'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Mode Salle (Kiosk)</span>
          </button>

          <button
            onClick={() => setActiveTab('folders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'folders'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-purple-50/50'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Dossiers & Réseau</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-gradient-to-b from-white to-purple-50/20">
          {activeTab === 'gameplay' && (
            <div className="space-y-6">
              {/* Comportement lors de la sélection d'un jeu */}
              <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-rose-500" />
                    <span>Comportement lors de la sélection d'un jeu</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Définissez l'action exécutée quand l'utilisateur appuie sur A ou clique sur une jaquette.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Afficher la fiche du jeu */}
                  <label
                    className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      gameSelectAction === 'details'
                        ? 'border-rose-500 bg-rose-50/40 text-rose-950 shadow-xs'
                        : 'border-purple-100 bg-white hover:border-purple-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gameSelectAction"
                      value="details"
                      checked={gameSelectAction === 'details'}
                      onChange={() => setGameSelectAction('details')}
                      className="mt-1 w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <FileText className="w-3.5 h-3.5 text-rose-500" />
                        <span>Afficher la fiche du jeu</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Ouvre la page de présentation complète avec screenshots, jaquette, description et commandes.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Lancer directement */}
                  <label
                    className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      gameSelectAction === 'launch'
                        ? 'border-rose-500 bg-rose-50/40 text-rose-950 shadow-xs'
                        : 'border-purple-100 bg-white hover:border-purple-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gameSelectAction"
                      value="launch"
                      checked={gameSelectAction === 'launch'}
                      onChange={() => setGameSelectAction('launch')}
                      className="mt-1 w-4 h-4 text-rose-600 focus:ring-rose-500"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Play className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span>Lancer directement</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Lance immédiatement le jeu dans l'émulateur configuré. Idéal pour une expérience arcade directe.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Accessibilité Borne d'Arcade & Échelle d'Affichage */}
              <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Taille des Éléments & Accessibilité Borne (Grossir Icônes & Boutons)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Adaptez la taille globale de l'interface pour une lisibilité et un confort parfaits debout devant votre borne.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setArcadeUiScale('normal')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      arcadeUiScale === 'normal'
                        ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-2 ring-purple-600/20'
                        : 'border-purple-100 bg-white hover:border-purple-200 text-slate-700'
                    }`}
                  >
                    <div className="text-xl mb-1.5">🖥️</div>
                    <div className="text-xs font-black text-slate-900">Standard (100%)</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                      Taille standard pour écran d'ordinateur de bureau ou portable.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setArcadeUiScale('large')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      arcadeUiScale === 'large'
                        ? 'border-rose-500 bg-rose-50/50 shadow-xs ring-2 ring-rose-500/20'
                        : 'border-purple-100 bg-white hover:border-purple-200 text-slate-700'
                    }`}
                  >
                    <div className="text-xl mb-1.5">🕹️</div>
                    <div className="text-xs font-black text-slate-900">Grand — Borne (115%)</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                      Boutons et icônes agrandis pour borne d'arcade et vue debout.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setArcadeUiScale('xl')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      arcadeUiScale === 'xl'
                        ? 'border-rose-600 bg-rose-50/60 shadow-xs ring-2 ring-rose-600/30'
                        : 'border-purple-100 bg-white hover:border-purple-200 text-slate-700'
                    }`}
                  >
                    <div className="text-xl mb-1.5">📺</div>
                    <div className="text-xs font-black text-slate-900">Très Grand (130%)</div>
                    <div className="text-[10px] text-slate-500 mt-1 leading-snug">
                      Visibilité maximale à 2 mètres sur grand écran TV ou borne 4K.
                    </div>
                  </button>
                </div>
              </div>

              {/* Options d'Affichage Windows */}
              <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Maximize className="w-4 h-4 text-purple-600" />
                  <span>Affichage & Fenêtre</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="p-4 rounded-2xl border border-purple-100 bg-white flex items-center justify-between cursor-pointer hover:border-purple-200 transition-all">
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold text-slate-900 block">Plein Écran (F11)</span>
                      <span className="text-[11px] text-slate-500">Immerge totalement la borne arcade</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={fullscreen}
                      onChange={async (e) => {
                        setFullscreen(e.target.checked);
                        await onToggleFullscreen();
                      }}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </label>

                  <label className="p-4 rounded-2xl border border-purple-100 bg-white flex items-center justify-between cursor-pointer hover:border-purple-200 transition-all">
                    <div className="text-xs space-y-0.5">
                      <span className="font-bold text-slate-900 block">Toujours au Premier Plan</span>
                      <span className="text-[11px] text-slate-500">Empêche les autres fenêtres d'apparaître</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={alwaysOnTop}
                      onChange={(e) => setAlwaysOnTop(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Tri par Défaut du Catalogue */}
              <div className="p-5 rounded-3xl bg-white border border-purple-100/90 shadow-xs space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ArrowDownAZ className="w-4 h-4 text-rose-500" />
                    <span>Tri par défaut du catalogue</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Choisissez le classement automatique des jeux au démarrage et lors de la navigation.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'title-asc', label: 'Titre (A à Z)' },
                    { id: 'title-desc', label: 'Titre (Z à A)' },
                    { id: 'release-desc', label: 'Année de sortie' },
                    { id: 'rating', label: 'Meilleures notes' },
                    { id: 'recent', label: 'Récemment joués' },
                    { id: 'play-time', label: 'Temps de jeu' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setDefaultSort(option.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        defaultSort === option.id
                          ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs ring-2 ring-rose-500/20'
                          : 'border-purple-100 bg-white hover:border-purple-200 text-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Configuration Manettes raccourci */}
              {onOpenGamepadSettings && (
                <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex items-center justify-between gap-4 shadow-xs">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Manettes & Boutons Arcade</h4>
                    <p className="text-[11px] text-slate-500">Configurez les mappings J1 à J10 et la priorité des manettes.</p>
                  </div>
                  <button
                    onClick={onOpenGamepadSettings}
                    className="px-4 py-2 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-rose-600 text-xs font-bold shadow-xs hover:scale-105 transition-all"
                  >
                    Ouvrir Mappings
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'consoles' && (
            <ConsolesTab
              systems={systems}
              enabledSystems={enabledSystems}
              setEnabledSystems={setEnabledSystems}
              enabledModes={enabledModes}
              setEnabledModes={setEnabledModes}
              enabledFranchises={enabledFranchises}
              setEnabledFranchises={setEnabledFranchises}
            />
          )}

          {activeTab === 'kiosk' && (
            <KioskTab
              fullscreen={fullscreen}
              setFullscreen={setFullscreen}
              alwaysOnTop={alwaysOnTop}
              setAlwaysOnTop={setAlwaysOnTop}
              kioskMode={kioskMode}
              setKioskMode={setKioskMode}
              autoKiosk={autoKiosk}
              setAutoKiosk={setAutoKiosk}
              onToggleFullscreen={onToggleFullscreen}
              onOpenGamepadSettings={onOpenGamepadSettings}
              remoteConfig={localRemote}
              setRemoteConfig={setLocalRemote}
              onLockKioskNow={onLockKioskNow}
            />
          )}

          {activeTab === 'folders' && (
            <FoldersTab
              romsPath={romsPath}
              setRomsPath={setRomsPath}
              onScanComplete={onScanComplete}
            />
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-purple-100 bg-white flex items-center justify-between gap-3 shrink-0">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
              <Check className="w-4 h-4" />
              <span>Paramètres enregistrés avec succès !</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 font-mono">
              KaïroOS v2.0 • Paramètres
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-purple-100 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all"
            >
              Fermer
            </button>

            <button
              onClick={handleSaveAll}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-rose-500/20 active:scale-95 transition-all"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
