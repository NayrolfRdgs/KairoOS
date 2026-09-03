import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Tv,
  Gamepad2,
  Wifi,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Save,
  RotateCcw,
} from 'lucide-react';
import {
  RemoteConfig,
  AppSettings,
  Emulator,
  GamepadMapping,
} from '../types';

interface SettingsViewProps {
  pin: string;
  onSaveRemoteConfig: (cfg: RemoteConfig) => Promise<void>;
  onSaveAppSettings: (settings: AppSettings) => Promise<void>;
  onSaveEmulators: (emus: Emulator[]) => Promise<void>;
  onReloadAll: () => Promise<void>;
  loading: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onSaveRemoteConfig,
  onSaveAppSettings,
  onSaveEmulators,
  onReloadAll,
  loading: parentLoading,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'emulators' | 'gamepads' | 'remote'>('settings');

  // 1. Settings State
  const [settings, setSettings] = useState<AppSettings>({
    fullscreen: true,
    always_on_top: false,
    kiosk_mode: false,
    auto_kiosk: false,
    game_select_action: 'details',
    arcade_ui_scale: 'normal',
    enabled_franchises: [],
    custom_franchises: [],
    roms_path: './roms',
    theme: 'retro-80s-light',
    default_sort: 'title_asc',
    retroarch_shader: 'none',
    aspect_ratio: '4:3',
    brightness: 50,
    contrast: 50,
    metadata_language: 'fr',
    launch_resolution: 'native',
    forced_fullscreen: 'per_game',
    autosave_enabled: true,
    rewind_enabled: false,
    cheats_dir: '',
    saves_dir: '',
    screenshots_dir: '',
    scraping_delay_seconds: 1,
    screenscraper_ssid: '',
    screenscraper_sspassword: '',
  });

  // 2. Emulators State
  const [emulators, setEmulators] = useState<Emulator[]>([]);
  const [pathTestResults, setPathTestResults] = useState<Record<string, { testing: boolean; exists?: boolean; error?: string }>>({});

  // 3. Gamepads State (lecture seule)
  const [gamepads, setGamepads] = useState<GamepadMapping[]>([]);

  // 4. Remote Config State
  const [remoteCfg, setRemoteCfg] = useState<RemoteConfig>({
    enabled: true,
    port: 8080,
    pin: '1234',
    allowed_origins: ['*'],
  });
  const [showPin, setShowPin] = useState(false);
  const [showSsPassword, setShowSsPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Chargement des données
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [settingsRes, emulatorsRes, remoteRes, gamepadsRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/emulators'),
          fetch('/api/remote/config'),
          fetch('/api/gamepads').catch(() => null),
        ]);

        if (settingsRes.ok) {
          const json = await settingsRes.json();
          if (json.data) setSettings((prev) => ({ ...prev, ...json.data }));
        }

        if (emulatorsRes.ok) {
          const json = await emulatorsRes.json();
          if (json.data) setEmulators(json.data);
        }

        if (remoteRes.ok) {
          const json = await remoteRes.json();
          if (json.data) setRemoteCfg(json.data);
        }

        if (gamepadsRes && gamepadsRes.ok) {
          const json = await gamepadsRes.json();
          if (json.data) setGamepads(json.data);
        }
      } catch (err: any) {
        showFeedback("Erreur lors de la récupération des configurations: " + err.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  // Tester un chemin d'exécutable
  const handleTestPath = async (emulatorId: string, path: string) => {
    if (!path || !path.trim()) {
      setPathTestResults((prev) => ({
        ...prev,
        [emulatorId]: { testing: false, exists: false, error: 'Chemin vide' },
      }));
      return;
    }

    setPathTestResults((prev) => ({
      ...prev,
      [emulatorId]: { testing: true },
    }));

    try {
      const res = await fetch('/api/emulators/test-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });

      if (res.ok) {
        const json = await res.json();
        setPathTestResults((prev) => ({
          ...prev,
          [emulatorId]: { testing: false, exists: json.data?.exists ?? false },
        }));
      } else {
        setPathTestResults((prev) => ({
          ...prev,
          [emulatorId]: { testing: false, exists: false, error: 'Erreur API' },
        }));
      }
    } catch (e: any) {
      setPathTestResults((prev) => ({
        ...prev,
        [emulatorId]: { testing: false, exists: false, error: e.message },
      }));
    }
  };

  // Sauvegardes
  const handleSaveSettingsTab = async () => {
    setLoading(true);
    try {
      await onSaveAppSettings(settings);
      showFeedback('settings.json enregistré avec succès !');
    } catch (e: any) {
      showFeedback('Erreur: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmulatorsTab = async () => {
    setLoading(true);
    try {
      await onSaveEmulators(emulators);
      showFeedback('emulators.json enregistré avec succès !');
    } catch (e: any) {
      showFeedback('Erreur: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRemoteTab = async () => {
    setLoading(true);
    try {
      await onSaveRemoteConfig(remoteCfg);
      showFeedback('remote.json enregistré avec succès !');
    } catch (e: any) {
      showFeedback('Erreur: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête sobre d'administration */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fichiers de Configuration & Paramètres</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administration directe du système KaïroOS. Modifications appliquées immédiatement sans redémarrage.
          </p>
        </div>

        <button
          onClick={onReloadAll}
          disabled={loading || parentLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Rafraîchir</span>
        </button>
      </div>

      {/* Message de notification */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Navigation par Onglets Fichiers */}
      <div className="flex border-b border-slate-200 space-x-1">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>settings.json</span>
        </button>

        <button
          onClick={() => setActiveTab('emulators')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'emulators'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tv className="w-4 h-4" />
          <span>emulators.json</span>
        </button>

        <button
          onClick={() => setActiveTab('gamepads')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'gamepads'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>gamepads.json</span>
        </button>

        <button
          onClick={() => setActiveTab('remote')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'remote'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>remote.json</span>
        </button>
      </div>

      {/* 1. ONGLET SETTINGS.JSON (Éditable champ par champ avec labels lisibles) */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Comportement & Affichage Borne</h2>
              <p className="text-xs text-slate-500">Paramètres généraux de l'interface et du lancement</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Mode Plein Écran</div>
                  <div className="text-[11px] text-slate-500">Lancer KaïroOS en plein écran</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.fullscreen}
                  onChange={(e) => setSettings({ ...settings, fullscreen: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Toujours au premier plan</div>
                  <div className="text-[11px] text-slate-500">Empêcher d'autres fenêtres de passer devant</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.always_on_top}
                  onChange={(e) => setSettings({ ...settings, always_on_top: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Mode Kiosque (Salle Arcade)</div>
                  <div className="text-[11px] text-slate-500">Verrouille les options administrateur</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.kiosk_mode}
                  onChange={(e) => setSettings({ ...settings, kiosk_mode: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Sauvegarde automatique (Autosave)</div>
                  <div className="text-[11px] text-slate-500">Sauvegarde d'état automatique en quittant</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autosave_enabled ?? true}
                  onChange={(e) => setSettings({ ...settings, autosave_enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Fonction Rewind (Rembobinage)</div>
                  <div className="text-[11px] text-slate-500">Désactivé par défaut (consommation RAM élevée)</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.rewind_enabled ?? false}
                  onChange={(e) => setSettings({ ...settings, rewind_enabled: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div className="p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-semibold text-slate-800 mb-1">Échelle Interface & Accessibilité</label>
                <select
                  value={settings.arcade_ui_scale || 'normal'}
                  onChange={(e) => setSettings({ ...settings, arcade_ui_scale: e.target.value })}
                  className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                >
                  <option value="normal">Standard (100%) — Écran de bureau</option>
                  <option value="large">Grand (115%) — Borne d'arcade debout</option>
                  <option value="xl">Très Grand (130%) — Grand écran / 4K</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Paramètres Rendu & Shaders (RetroBat)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Shaders d'Émulation</label>
                  <select
                    value={settings.retroarch_shader || 'none'}
                    onChange={(e) => setSettings({ ...settings, retroarch_shader: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="none">Aucun (Pixel net)</option>
                    <option value="scanlines_light">Scanlines légères</option>
                    <option value="scanlines_strong">Scanlines fortes</option>
                    <option value="crt_curved">CRT courbé (Cathodique rétro)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Ratio d'Écran</label>
                  <select
                    value={settings.aspect_ratio || '4:3'}
                    onChange={(e) => setSettings({ ...settings, aspect_ratio: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="4:3">4:3 (Format classique arcade)</option>
                    <option value="16:9">16:9 (Plein écran étiré)</option>
                    <option value="pixel_perfect">Pixel Perfect (1:1 natif)</option>
                    <option value="stretch">Étirer pour remplir l'écran</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Résolution de Lancement</label>
                  <select
                    value={settings.launch_resolution || 'native'}
                    onChange={(e) => setSettings({ ...settings, launch_resolution: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="native">Native (Selon le jeu)</option>
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="4k">4K Ultra HD</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Dossiers & Chemins Custom</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Dossier des ROMs</label>
                  <input
                    type="text"
                    value={settings.roms_path || './roms'}
                    onChange={(e) => setSettings({ ...settings, roms_path: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Dossier des Sauvegardes</label>
                  <input
                    type="text"
                    placeholder="Par défaut (laissé vide)"
                    value={settings.saves_dir || ''}
                    onChange={(e) => setSettings({ ...settings, saves_dir: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Dossier des Captures d'écran</label>
                  <input
                    type="text"
                    placeholder="Par défaut (laissé vide)"
                    value={settings.screenshots_dir || ''}
                    onChange={(e) => setSettings({ ...settings, screenshots_dir: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Dossier des Cheats</label>
                  <input
                    type="text"
                    placeholder="Par défaut (laissé vide)"
                    value={settings.cheats_dir || ''}
                    onChange={(e) => setSettings({ ...settings, cheats_dir: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Scraping ScreenScraper</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Langue prioritaire</label>
                  <select
                    value={settings.metadata_language || 'fr'}
                    onChange={(e) => setSettings({ ...settings, metadata_language: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="fr">Français (Prioritaire)</option>
                    <option value="en">Anglais (Fallback)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Identifiant SSID</label>
                  <input
                    type="text"
                    placeholder="Identifiant ScreenScraper"
                    value={settings.screenscraper_ssid || ''}
                    onChange={(e) => setSettings({ ...settings, screenscraper_ssid: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Mot de passe SSPassword</label>
                  <div className="relative">
                    <input
                      type={showSsPassword ? 'text' : 'password'}
                      placeholder="Mot de passe API"
                      value={settings.screenscraper_sspassword || ''}
                      onChange={(e) => setSettings({ ...settings, screenscraper_sspassword: e.target.value })}
                      className="w-full text-xs p-2 rounded border border-slate-300 pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSsPassword(!showSsPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showSsPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton de Sauvegarde */}
            <div className="pt-3 flex justify-end border-t border-slate-100">
              <button
                onClick={handleSaveSettingsTab}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:bg-blue-800 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer settings.json</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ONGLET EMULATORS.JSON (Liste des émulateurs, chemins, arguments et test du chemin) */}
      {activeTab === 'emulators' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Émulateurs Configurés (emulators.json)</h2>
                <p className="text-xs text-slate-500">Modifiez le chemin de l'exécutable et vérifiez son existence</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{emulators.length} émulateur(s)</span>
            </div>

            <div className="space-y-4">
              {emulators.map((emu, idx) => {
                const testResult = pathTestResults[emu.id];

                return (
                  <div key={emu.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                        <span>{emu.name}</span>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">({emu.id})</span>
                      </div>

                      {emu.is_builtin && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                          Intégré
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      <div className="md:col-span-8">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Chemin de l'exécutable (exe_path)
                        </label>
                        <input
                          type="text"
                          value={emu.exe_path || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEmulators((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, exe_path: val } : item))
                            );
                          }}
                          placeholder="Ex: emulators/RetroArch/retroarch.exe"
                          className="w-full text-xs p-2 rounded border border-slate-300 font-mono bg-white"
                        />
                      </div>

                      <div className="md:col-span-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleTestPath(emu.id, emu.exe_path || '')}
                          disabled={testResult?.testing}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 active:bg-slate-200 transition-all shrink-0"
                        >
                          <Search className={`w-3.5 h-3.5 ${testResult?.testing ? 'animate-spin' : ''}`} />
                          <span>Tester le chemin</span>
                        </button>

                        {testResult && !testResult.testing && (
                          <div className="text-xs flex items-center gap-1 font-semibold truncate">
                            {testResult.exists ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
                                ✓ Existe
                              </span>
                            ) : (
                              <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded">
                                ✗ Introuvable
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Arguments CLI par défaut (default_args)
                      </label>
                      <input
                        type="text"
                        value={emu.default_args || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEmulators((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, default_args: val } : item))
                          );
                        }}
                        className="w-full text-xs p-2 rounded border border-slate-300 font-mono bg-white text-slate-800"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-100">
              <button
                onClick={handleSaveEmulatorsTab}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:bg-blue-800 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer emulators.json</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ONGLET GAMEPADS.JSON (Lecture seule des profils configurés) */}
      {activeTab === 'gamepads' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Profils Manettes & Bornes (gamepads.json)</h2>
                <p className="text-xs text-slate-500">Affichage en lecture seule des mappings actifs enregistrés</p>
              </div>
              <span className="text-xs font-mono text-slate-400">{gamepads.length} profil(s)</span>
            </div>

            {gamepads.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs">
                Aucun profil de manette personnalisé n'est encore enregistré dans la base SQLite.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gamepads.map((gp, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="font-bold text-xs text-slate-900">
                        Joueur {gp.player_index + 1} : {gp.device_name}
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 font-mono rounded">
                        {gp.controller_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-slate-600">
                      <div>A : <span className="font-bold text-slate-900">{gp.btn_a || '—'}</span></div>
                      <div>B : <span className="font-bold text-slate-900">{gp.btn_b || '—'}</span></div>
                      <div>X : <span className="font-bold text-slate-900">{gp.btn_x || '—'}</span></div>
                      <div>Y : <span className="font-bold text-slate-900">{gp.btn_y || '—'}</span></div>
                      <div>L1 : <span className="font-bold text-slate-900">{gp.btn_l1 || '—'}</span></div>
                      <div>R1 : <span className="font-bold text-slate-900">{gp.btn_r1 || '—'}</span></div>
                      <div>Coin : <span className="font-bold text-slate-900">{gp.btn_select || '—'}</span></div>
                      <div>Start : <span className="font-bold text-slate-900">{gp.btn_start || '—'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ONGLET REMOTE.JSON (Port, PIN masqué avec toggle show/hide, allowed_origins) */}
      {activeTab === 'remote' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">Serveur Distant (remote.json)</h2>
              <p className="text-xs text-slate-500">Configuration du port HTTP, du code PIN et des autorisations CORS</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Port du serveur HTTP
                </label>
                <input
                  type="number"
                  value={remoteCfg.port}
                  onChange={(e) => setRemoteCfg({ ...remoteCfg, port: parseInt(e.target.value, 10) || 8080 })}
                  className="w-full text-xs p-2 rounded border border-slate-300 font-mono"
                />
                <p className="text-[10px] text-amber-600 mt-1">
                  ⚠️ Modifier le port nécessite un redémarrage de KaïroOS pour prendre effet sur le socket.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Code PIN de sécurité
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={remoteCfg.pin}
                    onChange={(e) => setRemoteCfg({ ...remoteCfg, pin: e.target.value })}
                    className="w-full text-xs p-2 rounded border border-slate-300 font-mono pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    title={showPin ? 'Masquer' : 'Afficher'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Exigé pour les requêtes web distantes (sauf si manette physique connectée localement).
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Origines CORS Autorisées (allowed_origins)
                </label>
                <input
                  type="text"
                  value={remoteCfg.allowed_origins.join(', ')}
                  onChange={(e) =>
                    setRemoteCfg({
                      ...remoteCfg,
                      allowed_origins: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full text-xs p-2 rounded border border-slate-300 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Séparez les domaines par des virgules (ex: * ou http://localhost:5173).
                </p>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-100">
              <button
                onClick={handleSaveRemoteTab}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs active:bg-blue-800 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer remote.json</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
