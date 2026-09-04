import React from 'react';
import { Gamepad2, Sliders, ExternalLink } from 'lucide-react';
import { AppSettings } from '../../../types';

interface GamepadsSectionProps {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, val: any) => void;
  onOpenGamepadModal?: () => void;
}

export const GamepadsSection: React.FC<GamepadsSectionProps> = ({
  settings,
  updateSetting,
  onOpenGamepadModal,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Raccourci vers le configurateur */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">Affectation des Touches & Boutons</h3>
            <p className="text-xs text-slate-400">Configurer les touches des joueurs 1 à 4</p>
          </div>
        </div>

        {onOpenGamepadModal && (
          <button
            onClick={onOpenGamepadModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>Configurateur Manettes</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Sensibilité & Navigation */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Navigation dans les Menus KaïroOS
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Joueur prioritaire pour la navigation UI
            </label>
            <select
              value={settings.ui_navigation_player ?? 0}
              onChange={(e) => updateSetting('ui_navigation_player', parseInt(e.target.value, 10))}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-purple-100 bg-purple-50/20"
            >
              <option value={0}>Joueur 1 (Recommandé)</option>
              <option value={1}>Joueur 2</option>
              <option value={2}>Joueur 3</option>
              <option value={3}>Joueur 4</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Délai de répétition navigation</span>
              <span className="font-mono text-purple-600">{settings.navigation_repeat_rate_ms ?? 180} ms</span>
            </div>
            <input
              type="range"
              min="80"
              max="400"
              step="10"
              value={settings.navigation_repeat_rate_ms ?? 180}
              onChange={(e) => updateSetting('navigation_repeat_rate_ms', parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer mt-2"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Sensibilité des sticks analogiques (Zone morte)</span>
              <span className="font-mono text-purple-600">{settings.stick_sensitivity ?? 50}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.stick_sensitivity ?? 50}
              onChange={(e) => updateSetting('stick_sensitivity', parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 3. Style des boutons d'aide UI */}
      <div className="p-5 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Style des Boutons d'Aide à l'Écran
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          Choisissez l'apparence des touches affichées dans la barre d'aide inférieure et dans l'interface de navigation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={() => updateSetting('button_prompt_style', 'xbox')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              (settings.button_prompt_style || 'xbox') === 'xbox'
                ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                : 'border-purple-100 hover:border-purple-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-900">Disposition Xbox</span>
              {(settings.button_prompt_style || 'xbox') === 'xbox' && (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Actif
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                A
              </span>
              <span className="w-7 h-7 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                B
              </span>
              <span className="w-7 h-7 rounded-full bg-blue-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                X
              </span>
              <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                Y
              </span>
            </div>
          </div>

          <div
            onClick={() => updateSetting('button_prompt_style', 'playstation')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
              settings.button_prompt_style === 'playstation'
                ? 'border-blue-500 bg-blue-50/20 shadow-xs'
                : 'border-purple-100 hover:border-purple-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-slate-900">Disposition PlayStation</span>
              {settings.button_prompt_style === 'playstation' && (
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  Actif
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                ✕
              </span>
              <span className="w-7 h-7 rounded-full bg-rose-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                ○
              </span>
              <span className="w-7 h-7 rounded-full bg-pink-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                □
              </span>
              <span className="w-7 h-7 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                △
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
