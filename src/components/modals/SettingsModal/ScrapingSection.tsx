import React, { useState } from 'react';
import { Globe, Eye, EyeOff } from 'lucide-react';
import { AppSettings } from '../../../types';

interface ScrapingSectionProps {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, val: any) => void;
}

export const ScrapingSection: React.FC<ScrapingSectionProps> = ({ settings, updateSetting }) => {
  const [showPassword, setShowPassword] = useState(false);

  const mediaTypes = [
    { id: 'cover', label: 'Jaquette Box (2D/3D)' },
    { id: 'screenshot', label: 'Captures d\'écran en jeu' },
    { id: 'backdrop', label: 'Fond d\'écran / Fanart' },
    { id: 'wheel', label: 'Logo transparent (Wheel)' },
    { id: 'video', label: 'Aperçu vidéo (Trailer MP4)' },
  ];

  const currentMediaTypes = settings.media_download_types || ['cover', 'backdrop'];

  const toggleMediaType = (id: string) => {
    if (currentMediaTypes.includes(id)) {
      updateSetting('media_download_types', currentMediaTypes.filter((t) => t !== id));
    } else {
      updateSetting('media_download_types', [...currentMediaTypes, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Compte ScreenScraper */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Identifiants ScreenScraper.fr
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Identifiant (SSID)</label>
            <input
              type="text"
              placeholder="Votre nom d'utilisateur ScreenScraper"
              value={settings.screenscraper_ssid || ''}
              onChange={(e) => updateSetting('screenscraper_ssid', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mot de passe (SSPassword)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={settings.screenscraper_sspassword || ''}
                onChange={(e) => updateSetting('screenscraper_sspassword', e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-purple-100 bg-purple-50/20 pr-9"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Délai entre chaque requête API</span>
              <span className="font-mono text-purple-600">{settings.scraping_delay_seconds ?? 1} seconde(s)</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.scraping_delay_seconds ?? 1}
              onChange={(e) => updateSetting('scraping_delay_seconds', parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Respecter les quotas de bande passante ScreenScraper pour éviter les blocages IP temporaires.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Types de Médias à Télécharger */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
          Médias & Automatisation
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {mediaTypes.map((mt) => {
            const checked = currentMediaTypes.includes(mt.id);
            return (
              <label
                key={mt.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-colors"
              >
                <span className="text-xs font-bold text-slate-800">{mt.label}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleMediaType(mt.id)}
                  className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
                />
              </label>
            );
          })}
        </div>

        <label className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 bg-purple-50/20 cursor-pointer transition-colors mt-3">
          <div>
            <div className="text-xs font-black text-slate-800">Scraping automatique après scan</div>
            <div className="text-[11px] text-slate-400">Télécharge automatiquement les données des nouveaux jeux détectés</div>
          </div>
          <input
            type="checkbox"
            checked={Boolean(settings.auto_scrape_after_scan)}
            onChange={(e) => updateSetting('auto_scrape_after_scan', e.target.checked)}
            className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
          />
        </label>
      </div>
    </div>
  );
};
