import React, { useState, useEffect } from 'react';
import { Wifi, Eye, EyeOff, Copy, Check, ShieldCheck } from 'lucide-react';
import { AppSettings, RemoteConfig } from '../../../types';

interface NetworkSectionProps {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, val: any) => void;
  remoteConfig?: RemoteConfig;
  onSaveRemoteConfig?: (cfg: RemoteConfig) => Promise<void>;
}

export const NetworkSection: React.FC<NetworkSectionProps> = ({
  settings,
  updateSetting,
  remoteConfig,
  onSaveRemoteConfig,
}) => {
  const [showPin, setShowPin] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localPort, setLocalPort] = useState(remoteConfig?.port || 3030);
  const [localPin, setLocalPin] = useState(remoteConfig?.pin || '1234');
  const detectedIp = '192.168.1.50';

  useEffect(() => {
    if (remoteConfig) {
      setLocalPort(remoteConfig.port);
      setLocalPin(remoteConfig.pin);
    }
  }, [remoteConfig]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`http://${detectedIp}:${localPort}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNetwork = async (port: number, pin: string) => {
    if (onSaveRemoteConfig && remoteConfig) {
      await onSaveRemoteConfig({
        ...remoteConfig,
        port,
        pin,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Serveur Remote PWA */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Serveur Web & Télécommande Mobile (Kaïro Remote)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Port du Serveur Remote</label>
            <input
              type="number"
              value={localPort}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10) || 3030;
                setLocalPort(val);
                handleSaveNetwork(val, localPin);
              }}
              className="w-full text-xs font-mono p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            />
            <p className="text-[10px] text-slate-400 mt-1">Par défaut : 3030</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Code PIN d'Accès Sécurisé</label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={localPin}
                  onChange={(e) => {
                    setLocalPin(e.target.value);
                    handleSaveNetwork(localPort, e.target.value);
                  }}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-purple-100 bg-purple-50/20 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Requis pour l'accès sans manette physique locale</p>
          </div>

          <label className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 bg-purple-50/20 cursor-pointer transition-colors">
            <div>
              <div className="text-xs font-black text-slate-800">Démarrer le serveur remote automatiquement</div>
              <div className="text-[11px] text-slate-400">Permet le contrôle à distance dès l'allumage de la borne</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(settings.remote_autostart ?? true)}
              onChange={(e) => updateSetting('remote_autostart', e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
          </label>
        </div>
      </div>

      {/* 2. Adresse IP & Connexion */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Adresse de Connexion Télécommande
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">URL Locale de la borne</div>
            <div className="text-sm font-mono font-bold text-purple-700">http://{detectedIp}:{localPort}</div>
          </div>

          <button
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
