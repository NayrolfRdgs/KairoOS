import React from 'react';
import { Gamepad2, Check, Tv } from 'lucide-react';
import { System } from '../../../types';

interface ConsolesTabProps {
  systems: System[];
  enabledSystems: string[];
  setEnabledSystems: (systems: string[]) => void;
}

export const ConsolesTab: React.FC<ConsolesTabProps> = ({
  systems,
  enabledSystems,
  setEnabledSystems,
}) => {
  const isSystemEnabled = (sysId: string) => {
    if (enabledSystems.length === 0) return true;
    return enabledSystems.includes(sysId);
  };

  const toggleSystem = (sysId: string) => {
    if (enabledSystems.length === 0) {
      // Toutes étaient actives, désactiver seulement celle-ci
      const newEnabled = systems.map((s) => s.id).filter((id) => id !== sysId);
      setEnabledSystems(newEnabled);
    } else if (enabledSystems.includes(sysId)) {
      setEnabledSystems(enabledSystems.filter((id) => id !== sysId));
    } else {
      setEnabledSystems([...enabledSystems, sysId]);
    }
  };

  const handleEnableAll = () => {
    setEnabledSystems(systems.map((s) => s.id));
  };

  const handleDisableAll = () => {
    setEnabledSystems([]);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec Actions Globales */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50 via-pink-50 to-white border border-purple-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Tv className="w-4 h-4 text-rose-500" />
            <span>Consoles Visibles dans le Menu</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cochez les consoles et systèmes de jeu que vous souhaitez afficher dans la navigation de la borne.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleEnableAll}
            className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-50 shadow-2xs transition-all active:scale-95"
          >
            Tout Activer
          </button>
          <button
            type="button"
            onClick={handleDisableAll}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 shadow-2xs transition-all active:scale-95"
          >
            Tout Masquer
          </button>
        </div>
      </div>

      {/* Grille des Consoles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {systems.map((system) => {
          const active = isSystemEnabled(system.id);

          return (
            <div
              key={system.id}
              onClick={() => toggleSystem(system.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-2xs ${
                active
                  ? 'bg-white border-rose-500/80 shadow-rose-500/5'
                  : 'bg-slate-50/80 border-slate-200/80 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    active
                      ? 'bg-gradient-to-tr from-purple-600 to-rose-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Gamepad2 className="w-5 h-5" />
                </div>

                <div>
                  <div className="font-extrabold text-xs text-slate-900">
                    {system.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    {system.id} • {system.extensions.slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>

              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  active
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'border border-slate-300 bg-white'
                }`}
              >
                {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
