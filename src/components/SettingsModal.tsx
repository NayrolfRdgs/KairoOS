import React, { useState } from 'react';
import {
  X,
  Sliders,
  Tv,
  Eye,
  Folder,
  Plus,
  Trash2,
  Check,
  Shield,
  Gamepad2,
} from 'lucide-react';
import { AppSettings, CustomFranchise } from '../types';
import { POPULAR_FRANCHISES } from './Sidebar';

interface SettingsModalProps {
  settings: AppSettings;
  onClose: () => void;
  onSave: (settings: AppSettings) => Promise<void>;
  onToggleFullscreen: () => Promise<void>;
  onOpenGamepadSettings?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onClose,
  onSave,
  onToggleFullscreen,
  onOpenGamepadSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'kiosk' | 'franchises' | 'folders'>('kiosk');
  const [fullscreen, setFullscreen] = useState(settings.fullscreen);
  const [alwaysOnTop, setAlwaysOnTop] = useState(settings.always_on_top);
  const [kioskMode, setKioskMode] = useState(settings.kiosk_mode);
  const [enabledFranchises, setEnabledFranchises] = useState<string[]>(settings.enabled_franchises || []);
  const [customFranchises, setCustomFranchises] = useState<CustomFranchise[]>(settings.custom_franchises || []);
  const [romsPath, setRomsPath] = useState(settings.roms_path || '');
  const [newFranchiseName, setNewFranchiseName] = useState('');
  const [newFranchiseKeywords, setNewFranchiseKeywords] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleFranchise = (id: string) => {
    setEnabledFranchises((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomFranchise = () => {
    if (!newFranchiseName.trim()) return;
    const id = `custom-${Date.now()}`;
    const keywords = newFranchiseKeywords
      .split(',')
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    const newFranchise: CustomFranchise = {
      id,
      name: newFranchiseName.trim(),
      color: 'bg-teal-50 text-teal-600 border-teal-200',
      keywords: keywords.length > 0 ? keywords : [newFranchiseName.trim().toLowerCase()],
      is_enabled: true,
    };

    setCustomFranchises((prev) => [...prev, newFranchise]);
    setEnabledFranchises((prev) => [...prev, id]);
    setNewFranchiseName('');
    setNewFranchiseKeywords('');
  };

  const handleDeleteCustomFranchise = (id: string) => {
    setCustomFranchises((prev) => prev.filter((f) => f.id !== id));
    setEnabledFranchises((prev) => prev.filter((item) => item !== id));
  };

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
                Mode Borne Arcade, Affichage des Franchises & Dossiers
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
            <span>Mode Borne & Écran</span>
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
                    onClick={() => {
                      onClose();
                      onOpenGamepadSettings();
                    }}
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
                      Occupe la totalité de l'écran sans barre de titre ni bordures. (Raccourci clavier: <kbd className="px-1.5 py-0.5 rounded bg-white font-mono text-retro-primary font-bold border border-retro-border">F11</kbd>).
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

              {/* Option 3: Mode Borne Physique */}
              <div className="p-4 rounded-2xl bg-retro-bg border border-retro-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white text-retro-yellow border border-retro-border shadow-sm">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wide text-retro-text">
                      Verrouillage Interface Kiosk
                    </h4>
                    <p className="text-[11px] text-retro-textMuted">
                      Active le lancement direct au démarrage de la machine sans affichage du bureau.
                    </p>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={kioskMode}
                  onChange={(e) => setKioskMode(e.target.checked)}
                  className="w-5 h-5 rounded text-retro-yellow focus:ring-retro-yellow cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'franchises' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wide text-retro-text mb-1">
                  Franchises à Afficher dans la Barre Latérale
                </h4>
                <p className="text-[11px] text-retro-textMuted mb-4">
                  Cochez ou décochez les sagas que vous souhaitez voir apparaître dans votre menu.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {POPULAR_FRANCHISES.map((franchise) => {
                    const isChecked = enabledFranchises.includes(franchise.id);
                    return (
                      <label
                        key={franchise.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white border-retro-primary shadow-retro'
                            : 'bg-retro-bg border-retro-border opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xs font-bold text-retro-text">{franchise.name}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFranchise(franchise.id)}
                          className="w-4 h-4 rounded text-retro-primary focus:ring-retro-primary"
                        />
                      </label>
                    );
                  })}

                  {customFranchises.map((custom) => {
                    const isChecked = enabledFranchises.includes(custom.id);
                    return (
                      <div
                        key={custom.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                          isChecked
                            ? 'bg-white border-retro-cyan shadow-retro'
                            : 'bg-retro-bg border-retro-border opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFranchise(custom.id)}
                            className="w-4 h-4 rounded text-retro-cyan focus:ring-retro-cyan"
                          />
                          <span className="text-xs font-bold text-retro-text">{custom.name}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCustomFranchise(custom.id)}
                          className="p-1 rounded-md text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ajouter une nouvelle franchise personnalisée */}
              <div className="p-4 rounded-2xl bg-retro-bg border border-retro-border space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-retro-text">
                  <Plus className="w-4 h-4 text-retro-primary" />
                  <span>Ajouter une Franchise Personnalisée</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-retro-textMuted mb-1">
                      Nom de la Franchise (ex: Castlevania)
                    </label>
                    <input
                      type="text"
                      value={newFranchiseName}
                      onChange={(e) => setNewFranchiseName(e.target.value)}
                      placeholder="Nom affiché dans le menu"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-retro-textMuted mb-1">
                      Mots-clés séparés par virgules
                    </label>
                    <input
                      type="text"
                      value={newFranchiseKeywords}
                      onChange={(e) => setNewFranchiseKeywords(e.target.value)}
                      placeholder="ex: castlevania, belmont, dracula"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-retro-border text-xs text-retro-text focus:outline-none focus:border-retro-primary"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddCustomFranchise}
                  disabled={!newFranchiseName.trim()}
                  className="px-4 py-2 rounded-xl bg-white border border-retro-border text-xs font-bold text-retro-primary hover:border-retro-primary disabled:opacity-50 transition-all shadow-sm"
                >
                  + Ajouter la franchise
                </button>
              </div>
            </div>
          )}

          {activeTab === 'folders' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-retro-text mb-2">
                  Répertoire Racine des ROMs par Défaut
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-retro-bg border border-retro-border focus-within:border-retro-primary">
                  <Folder className="w-4 h-4 text-retro-primary shrink-0" />
                  <input
                    type="text"
                    value={romsPath}
                    onChange={(e) => setRomsPath(e.target.value)}
                    placeholder="ex: D:\Emulation\Roms ou .\roms pour mode portable"
                    className="w-full bg-transparent text-retro-text font-mono text-xs focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-retro-textMuted mt-1.5 leading-relaxed">
                  En version portable, vous pouvez utiliser <code className="text-retro-primary font-bold">.\roms</code> pour que le logiciel charge automatiquement les jeux placés sur votre clé USB ou disque dur externe.
                </p>
              </div>
            </div>
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
