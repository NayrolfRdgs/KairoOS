import React from 'react';
import { Tv, Volume2, AlertTriangle } from 'lucide-react';
import { AppSettings } from '../../../types';

interface MediaSectionProps {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, val: any) => void;
}

export const MediaSection: React.FC<MediaSectionProps> = ({ settings, updateSetting }) => {
  return (
    <div className="space-y-6">
      {/* 1. Shaders & Ratios */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Rendu Vidéo & Shaders
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Shader par défaut</label>
            <select
              value={settings.retroarch_shader || 'none'}
              onChange={(e) => updateSetting('retroarch_shader', e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            >
              <option value="none">Aucun (Net / Pixels d'origine)</option>
              <option value="scanlines_light">Scanlines légères</option>
              <option value="scanlines_strong">Scanlines fortes (CRT Arcade)</option>
              <option value="crt_curved">CRT courbé rétro (Cathodique)</option>
              <option value="pixel_perfect">Pixel Perfect</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ratio d'écran par défaut</label>
            <select
              value={settings.aspect_ratio || '4:3'}
              onChange={(e) => updateSetting('aspect_ratio', e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            >
              <option value="4:3">4:3 (Format classique rétro)</option>
              <option value="16:9">16:9 (Plein écran étiré)</option>
              <option value="pixel_perfect">Pixel Perfect (1:1)</option>
              <option value="stretch">Étirer pour remplir l'écran</option>
            </select>
          </div>
        </div>

        {/* Sliders luminosité / contraste */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-purple-50">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Luminosité Émulateurs</span>
              <span className="font-mono text-purple-600">{settings.brightness ?? 50}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.brightness ?? 50}
              onChange={(e) => updateSetting('brightness', parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Contraste Émulateurs</span>
              <span className="font-mono text-purple-600">{settings.contrast ?? 50}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.contrast ?? 50}
              onChange={(e) => updateSetting('contrast', parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 2. Audio & Rewind */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Audio, Sauvegardes & Rembobinage
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-colors">
            <div>
              <div className="text-xs font-black text-slate-800">Sauvegarde automatique (Autosave)</div>
              <div className="text-[11px] text-slate-400">Sauvegarder l'état du jeu automatiquement en quittant</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(settings.autosave_enabled ?? true)}
              onChange={(e) => updateSetting('autosave_enabled', e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-colors">
            <div>
              <div className="text-xs font-black text-slate-800">Son de démarrage KaïroOS</div>
              <div className="text-[11px] text-slate-400">Joue le son du thème au lancement de la borne</div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(settings.startup_sound_enabled ?? true)}
              onChange={(e) => updateSetting('startup_sound_enabled', e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
          </label>

          <label className="sm:col-span-2 flex items-center justify-between p-3.5 rounded-2xl border border-purple-100 hover:bg-purple-50/20 cursor-pointer transition-colors">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-800">Rewind (Rembobinage temps réel)</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <AlertTriangle className="w-3 h-3" />
                  Consommation RAM accrue
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Permet de revenir en arrière de quelques secondes en cours de partie
              </div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(settings.rewind_enabled)}
              onChange={(e) => updateSetting('rewind_enabled', e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
