import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Wifi,
  Gamepad2,
  Check,
  Server,
  Info,
  Copy,
  RefreshCw,
} from 'lucide-react';
import {
  ThemeMode,
  RemoteConfig,
  AppSettings,
  Emulator,
  SystemInfoResponse,
} from '../types';

interface SettingsViewProps {
  pin: string;
  onSaveRemoteConfig: (cfg: RemoteConfig) => Promise<void>;
  onSaveAppSettings: (settings: AppSettings) => Promise<void>;
  onSaveEmulators: (emus: Emulator[]) => Promise<void>;
  onReloadAll: () => Promise<void>;
  loading: boolean;
  theme: ThemeMode;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  pin,
  onSaveRemoteConfig,
  onSaveAppSettings,
  onSaveEmulators,
  onReloadAll,
  loading,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [activeSubTab, setActiveSubTab] = useState<'remote' | 'emulators' | 'app' | 'system'>('remote');

  const [remoteCfg, setRemoteCfg] = useState<RemoteConfig>({
    enabled: true,
    port: 8080,
    pin: '1234',
    allowed_origins: ['*'],
  });
  const [newPinConfirm, setNewPinConfirm] = useState('1234');

  const [appSettings, setAppSettings] = useState<AppSettings>({
    fullscreen: true,
    always_on_top: false,
    kiosk_mode: false,
    enabled_franchises: [],
    custom_franchises: [],
    roms_path: './roms',
    theme: 'retro-80s-light',
  });

  const [emulators, setEmulators] = useState<Emulator[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfoResponse | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedIp, setCopiedIp] = useState(false);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [remoteRes, settingsRes, emusRes, infoRes] = await Promise.all([
          fetch('/api/remote/config'),
          fetch('/api/settings'),
          fetch('/api/emulators'),
          fetch('/api/system/info'),
        ]);

        if (remoteRes.ok) {
          const json = await remoteRes.json();
          if (json.data) {
            setRemoteCfg(json.data);
            setNewPinConfirm(json.data.pin);
          }
        }

        if (settingsRes.ok) {
          const json = await settingsRes.json();
          if (json.data) setAppSettings(json.data);
        }

        if (emusRes.ok) {
          const json = await emusRes.json();
          if (json.data) setEmulators(json.data);
        }

        if (infoRes.ok) {
          const json = await infoRes.json();
          setSystemInfo(json);
        }
      } catch (err) {
        console.warn('Erreur chargement configs:', err);
      }
    };

    fetchConfigs();
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSaveRemote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remoteCfg.pin !== newPinConfirm) {
      alert('Les deux saisies du code PIN ne correspondent pas.');
      return;
    }
    await onSaveRemoteConfig(remoteCfg);
    showFeedback('Configuration Remote enregistrée !');
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveAppSettings(appSettings);
    showFeedback('Paramètres KaïroOS enregistrés !');
  };

  const handleSaveEmus = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveEmulators(emulators);
    showFeedback('Configuration des Émulateurs enregistrée !');
  };

  const handleEmulatorChange = (index: number, field: keyof Emulator, value: any) => {
    const updated = [...emulators];
    updated[index] = { ...updated[index], [field]: value };
    setEmulators(updated);
  };

  const handleCopyUrl = () => {
    if (systemInfo?.local_ip) {
      navigator.clipboard?.writeText(`http://${systemInfo.local_ip}:${systemInfo.port}`);
      setCopiedIp(true);
      setTimeout(() => setCopiedIp(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Navigation Onglets Réglages */}
      <div
        className={`p-1.5 rounded-2xl border flex items-center gap-1 overflow-x-auto shadow-xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <button
          onClick={() => setActiveSubTab('remote')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'remote'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Serveur Distant</span>
        </button>

        <button
          onClick={() => setActiveSubTab('emulators')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'emulators'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Émulateurs & CLI</span>
        </button>

        <button
          onClick={() => setActiveSubTab('app')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'app'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Paramètres Borne</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeSubTab === 'system'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Infos Système</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. Serveur Remote */}
      {activeSubTab === 'remote' && (
        <form onSubmit={handleSaveRemote} className="space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Serveur HTTP Embarqué (config/remote.json)
                </h3>
                <p className="text-xs text-slate-500">
                  Port d'écoute et code PIN de contrôle à distance.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1 text-slate-600 dark:text-slate-400">
                  Port d'Écoute
                </label>
                <input
                  type="number"
                  value={remoteCfg.port}
                  onChange={(e) => setRemoteCfg({ ...remoteCfg, port: parseInt(e.target.value) || 8080 })}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border transition-all focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1 text-slate-600 dark:text-slate-400">
                  Origines Autorisées (CORS)
                </label>
                <input
                  type="text"
                  value={remoteCfg.allowed_origins.join(', ')}
                  onChange={(e) =>
                    setRemoteCfg({
                      ...remoteCfg,
                      allowed_origins: e.target.value.split(',').map((s) => s.trim()),
                    })
                  }
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono border transition-all focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1 text-slate-600 dark:text-slate-400">
                  Code PIN Borne
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={remoteCfg.pin}
                  onChange={(e) => setRemoteCfg({ ...remoteCfg, pin: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-widest border transition-all focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1 text-slate-600 dark:text-slate-400">
                  Confirmer le PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={newPinConfirm}
                  onChange={(e) => setNewPinConfirm(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-widest border transition-all focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
            >
              Enregistrer la Configuration Distante
            </button>
          </div>
        </form>
      )}

      {/* 2. Émulateurs */}
      {activeSubTab === 'emulators' && (
        <form onSubmit={handleSaveEmus} className="space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Émulateurs & Lignes de Commande (config/emulators.json)
                </h3>
                <p className="text-xs text-slate-500">
                  Chemins des exécutables et templates d'arguments CLI.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {emulators.map((emu, idx) => (
                <div
                  key={emu.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {emu.name} ({emu.id})
                    </span>
                    {emu.is_builtin && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                        Intégré
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Chemin de l'exécutable
                      </label>
                      <input
                        type="text"
                        value={emu.exe_path || ''}
                        onChange={(e) => handleEmulatorChange(idx, 'exe_path', e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg font-mono text-[11px] border transition-all focus:outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                        Arguments CLI par défaut
                      </label>
                      <input
                        type="text"
                        value={emu.default_args}
                        onChange={(e) => handleEmulatorChange(idx, 'default_args', e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg font-mono text-[11px] border transition-all focus:outline-none ${
                          isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
            >
              Enregistrer les Émulateurs
            </button>
          </div>
        </form>
      )}

      {/* 3. Paramètres Borne */}
      {activeSubTab === 'app' && (
        <form onSubmit={handleSaveApp} className="space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Paramètres Borne (config/settings.json)
                </h3>
                <p className="text-xs text-slate-500">
                  Dossier ROMs et comportement de l'affichage.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold block mb-1 text-slate-600 dark:text-slate-400">
                  Dossier ROMs par Défaut
                </label>
                <input
                  type="text"
                  value={appSettings.roms_path || './roms'}
                  onChange={(e) => setAppSettings({ ...appSettings, roms_path: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-mono font-semibold border transition-all focus:outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs">
                    <span className="font-semibold block text-slate-900 dark:text-white">
                      Mode Kiosk au Démarrage
                    </span>
                    <span className="text-[11px] text-slate-500">Verrouille les menus dès le boot</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.kiosk_mode}
                    onChange={(e) => setAppSettings({ ...appSettings, kiosk_mode: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>

                <label
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs">
                    <span className="font-semibold block text-slate-900 dark:text-white">
                      Toujours au Premier Plan
                    </span>
                    <span className="text-[11px] text-slate-500">Masque les fenêtres Windows</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.always_on_top}
                    onChange={(e) => setAppSettings({ ...appSettings, always_on_top: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95"
            >
              Enregistrer les Paramètres
            </button>
          </div>
        </form>
      )}

      {/* 4. Infos Système */}
      {activeSubTab === 'system' && (
        <div className="space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Informations Borne & Réseau
                </h3>
                <p className="text-xs text-slate-500">
                  Détails de connexion et chemins de la station.
                </p>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className="text-[11px] text-slate-500 block">URL de connexion smartphone :</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  http://{systemInfo?.local_ip || '127.0.0.1'}:{systemInfo?.port || 8080}
                </span>
              </div>

              <button
                onClick={handleCopyUrl}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  copiedIp
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {copiedIp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIp ? 'Copié' : 'Copier'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-slate-400 block text-[11px] mb-0.5">Version</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  v{systemInfo?.version || '0.1.0'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-slate-400 block text-[11px] mb-0.5">Total Jeux</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {systemInfo?.total_games || 0} jeux
                </span>
              </div>

              <div className={`sm:col-span-2 p-3 rounded-xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-slate-400 block text-[11px] mb-0.5">Dossier Racine</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all">
                  {systemInfo?.install_dir || '.'}
                </span>
              </div>
            </div>

            <button
              onClick={onReloadAll}
              className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Rafraîchir les Données</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
