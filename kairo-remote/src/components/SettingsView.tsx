import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Wifi,
  Server,
  Gamepad2,
  Folder,
  Shield,
  RefreshCw,
  Check,
  Info,
  Tv,
  AlertCircle,
  Copy,
  Layers,
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

  // Form states
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

  // Charger toutes les données de configuration depuis l'API REST
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Subtab Navigation */}
      <div
        className={`p-2 rounded-2xl border flex items-center gap-1.5 overflow-x-auto shadow-sm ${
          isDark ? 'bg-retro-card border-retro-border' : 'bg-white border-retro-border'
        }`}
      >
        <button
          onClick={() => setActiveSubTab('remote')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-arcade whitespace-nowrap transition-all ${
            activeSubTab === 'remote'
              ? isDark
                ? 'bg-retro-primary text-white shadow-md'
                : 'bg-retro-primary text-white shadow-retro'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Serveur Remote</span>
        </button>

        <button
          onClick={() => setActiveSubTab('emulators')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-arcade whitespace-nowrap transition-all ${
            activeSubTab === 'emulators'
              ? isDark
                ? 'bg-retro-purple text-white shadow-md'
                : 'bg-retro-purple text-white shadow-retro'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          <span>Émulateurs & CLI</span>
        </button>

        <button
          onClick={() => setActiveSubTab('app')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-arcade whitespace-nowrap transition-all ${
            activeSubTab === 'app'
              ? isDark
                ? 'bg-retro-cyan text-retro-dark shadow-md font-black'
                : 'bg-retro-cyan text-retro-dark shadow-retro font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Paramètres Borne</span>
        </button>

        <button
          onClick={() => setActiveSubTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold font-arcade whitespace-nowrap transition-all ${
            activeSubTab === 'system'
              ? isDark
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-emerald-500 text-white shadow-retro'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Infos Système</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-arcade flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* 1. Onglet Serveur Remote (config/remote.json) */}
      {activeSubTab === 'remote' && (
        <form onSubmit={handleSaveRemote} className="space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-sm ${
              isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-retro-border/50">
              <div className="p-2.5 rounded-2xl bg-retro-primary/20 text-retro-primary">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black font-arcade uppercase tracking-wider">
                  Configuration Serveur HTTP (config/remote.json)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Pilotez le port d'écoute et le mot de passe PIN de sécurité.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1 text-slate-400">
                  Port d'Écoute HTTP
                </label>
                <input
                  type="number"
                  value={remoteCfg.port}
                  onChange={(e) => setRemoteCfg({ ...remoteCfg, port: parseInt(e.target.value) || 8080 })}
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all focus:outline-none ${
                    isDark ? 'bg-retro-panel border-retro-border text-white' : 'bg-retro-warm border-retro-border text-retro-text'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1 text-slate-400">
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
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all focus:outline-none ${
                    isDark ? 'bg-retro-panel border-retro-border text-white' : 'bg-retro-warm border-retro-border text-retro-text'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1 text-slate-400">
                  Nouveau Code PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={remoteCfg.pin}
                  onChange={(e) => setRemoteCfg({ ...remoteCfg, pin: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-widest border transition-all focus:outline-none ${
                    isDark ? 'bg-retro-panel border-retro-border text-retro-yellow' : 'bg-retro-warm border-retro-border text-retro-primary'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1 text-slate-400">
                  Confirmer le Code PIN
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={newPinConfirm}
                  onChange={(e) => setNewPinConfirm(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold tracking-widest border transition-all focus:outline-none ${
                    isDark ? 'bg-retro-panel border-retro-border text-retro-yellow' : 'bg-retro-warm border-retro-border text-retro-primary'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-black font-arcade text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${
                isDark
                  ? 'bg-gradient-to-r from-retro-primary to-retro-purple text-white shadow-retro-primary/20'
                  : 'bg-gradient-to-r from-retro-primary to-retro-orange text-white shadow-retro'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>ENREGISTRER REMOTE.JSON</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Onglet Émulateurs (config/emulators.json) */}
      {activeSubTab === 'emulators' && (
        <form onSubmit={handleSaveEmus} className="space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-sm ${
              isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-retro-border/50">
              <div className="p-2.5 rounded-2xl bg-retro-purple/20 text-retro-purple">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black font-arcade uppercase tracking-wider">
                  Configuration Émulateurs (config/emulators.json)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Modifiez les chemins exécutables et arguments CLI passés par le launcher.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {emulators.map((emu, idx) => (
                <div
                  key={emu.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    isDark ? 'bg-retro-panel/70 border-retro-border' : 'bg-retro-warm/60 border-retro-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase font-arcade text-retro-cyan">
                      {emu.name} ({emu.id})
                    </span>
                    {emu.is_builtin && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                        EMBARQUÉ
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                        Chemin Exécutable (.exe)
                      </label>
                      <input
                        type="text"
                        value={emu.exe_path || ''}
                        onChange={(e) => handleEmulatorChange(idx, 'exe_path', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl font-mono text-[11px] border transition-all focus:outline-none ${
                          isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">
                        Arguments CLI par défaut
                      </label>
                      <input
                        type="text"
                        value={emu.default_args}
                        onChange={(e) => handleEmulatorChange(idx, 'default_args', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl font-mono text-[11px] border transition-all focus:outline-none ${
                          isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
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
              className={`w-full py-3.5 rounded-2xl font-black font-arcade text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${
                isDark
                  ? 'bg-gradient-to-r from-retro-purple to-retro-cyan text-white shadow-retro-purple/20'
                  : 'bg-gradient-to-r from-retro-purple to-retro-primary text-white shadow-retro'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>ENREGISTRER EMULATORS.JSON</span>
            </button>
          </div>
        </form>
      )}

      {/* 3. Onglet Paramètres Borne (config/settings.json) */}
      {activeSubTab === 'app' && (
        <form onSubmit={handleSaveApp} className="space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-sm ${
              isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-retro-border/50">
              <div className="p-2.5 rounded-2xl bg-retro-cyan/20 text-retro-cyan">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black font-arcade uppercase tracking-wider">
                  Paramètres Borne KaïroOS (config/settings.json)
                </h3>
                <p className="text-[11px] text-slate-400">
                  Dossier de stockage, plein écran et mode de démarrage.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider block mb-1 text-slate-400">
                  Dossier de ROMs par défaut
                </label>
                <input
                  type="text"
                  value={appSettings.roms_path || './roms'}
                  onChange={(e) => setAppSettings({ ...appSettings, roms_path: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all focus:outline-none ${
                    isDark ? 'bg-retro-panel border-retro-border text-white' : 'bg-retro-warm border-retro-border text-retro-text'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <label
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isDark ? 'bg-retro-panel/70 border-retro-border' : 'bg-retro-warm/60 border-retro-border'
                  }`}
                >
                  <div className="text-xs">
                    <span className="font-bold block">Mode Kiosk au Démarrage</span>
                    <span className="text-[10px] text-slate-400">Verrouille les menus dès l'allumage</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.kiosk_mode}
                    onChange={(e) => setAppSettings({ ...appSettings, kiosk_mode: e.target.checked })}
                    className="w-5 h-5 rounded text-retro-primary focus:ring-retro-primary cursor-pointer"
                  />
                </label>

                <label
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isDark ? 'bg-retro-panel/70 border-retro-border' : 'bg-retro-warm/60 border-retro-border'
                  }`}
                >
                  <div className="text-xs">
                    <span className="font-bold block">Toujours au Premier Plan</span>
                    <span className="text-[10px] text-slate-400">Empêche les fenêtres Windows d'apparaître</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={appSettings.always_on_top}
                    onChange={(e) => setAppSettings({ ...appSettings, always_on_top: e.target.checked })}
                    className="w-5 h-5 rounded text-retro-cyan focus:ring-retro-cyan cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-black font-arcade text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 ${
                isDark
                  ? 'bg-gradient-to-r from-retro-cyan to-retro-purple text-retro-dark font-black shadow-retro-cyan/20'
                  : 'bg-gradient-to-r from-retro-cyan to-retro-primary text-white shadow-retro'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>ENREGISTRER SETTINGS.JSON</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Onglet Infos Système */}
      {activeSubTab === 'system' && (
        <div className="space-y-6">
          <div
            className={`p-6 sm:p-8 rounded-3xl border space-y-5 shadow-sm ${
              isDark ? 'bg-retro-card border-retro-border text-white' : 'bg-white border-retro-border text-retro-text'
            }`}
          >
            <div className="flex items-center gap-3 pb-3 border-b border-retro-border/50">
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black font-arcade uppercase tracking-wider">
                  Informations de la Borne KaïroOS
                </h3>
                <p className="text-[11px] text-slate-400">
                  Détails réseau, version logicielle et chemin local d'exécution.
                </p>
              </div>
            </div>

            {/* Grande Carte IP Réseau */}
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isDark ? 'bg-retro-panel border-retro-cyan/30' : 'bg-retro-warm border-retro-primary/30'
              }`}
            >
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-arcade">
                  Adresse URL pour Smartphone :
                </span>
                <h2 className="text-lg sm:text-xl font-black font-mono text-retro-cyan">
                  http://{systemInfo?.local_ip || '127.0.0.1'}:{systemInfo?.port || 8080}
                </h2>
              </div>

              <button
                onClick={handleCopyUrl}
                className={`px-4 py-2.5 rounded-xl font-bold font-arcade text-xs flex items-center gap-2 border transition-all active:scale-95 shrink-0 ${
                  copiedIp
                    ? 'bg-retro-green text-retro-dark border-retro-green font-black'
                    : isDark
                    ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    : 'bg-white hover:bg-retro-warm text-retro-text border-retro-border'
                }`}
              >
                {copiedIp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedIp ? 'Copié !' : 'Copier l\'adresse'}</span>
              </button>
            </div>

            {/* Grille Détails */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-retro-panel/70 border-retro-border' : 'bg-retro-warm/60 border-retro-border'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">
                  Version de KaïroOS
                </span>
                <span className="font-mono font-bold text-retro-yellow text-sm">
                  v{systemInfo?.version || '0.1.0'}
                </span>
              </div>

              <div
                className={`p-3.5 rounded-2xl border ${
                  isDark ? 'bg-retro-panel/70 border-retro-border' : 'bg-retro-warm/60 border-retro-border'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">
                  Total Jeux Indexés
                </span>
                <span className="font-mono font-bold text-retro-cyan text-sm">
                  {systemInfo?.total_games || 0} jeux
                </span>
              </div>

              <div
                className={`sm:col-span-2 p-3.5 rounded-2xl border ${
                  isDark ? 'bg-retro-panel/70 border-retro-border' : 'bg-retro-warm/60 border-retro-border'
                }`}
              >
                <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">
                  Dossier d'Installation
                </span>
                <span className="font-mono text-[11px] text-slate-300 break-all">
                  {systemInfo?.install_dir || '.'}
                </span>
              </div>
            </div>

            <button
              onClick={onReloadAll}
              className={`w-full py-3.5 rounded-2xl border font-bold font-arcade text-xs tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all ${
                isDark
                  ? 'bg-retro-panel hover:bg-slate-700 text-white border-retro-border'
                  : 'bg-retro-warm hover:bg-slate-200 text-retro-text border-retro-border'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>RAFRAÎCHIR LES DONNÉES DU SERVEUR</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
