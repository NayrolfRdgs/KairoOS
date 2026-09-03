import React from 'react';
import { System } from '../../../types';
import { ConsoleLogo } from '../../common/ConsoleLogo';

interface SidebarSystemsProps {
  systems: System[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  gamesCountBySystem: Record<string, number>;
  enabledSystems?: string[];
}

export const SidebarSystems: React.FC<SidebarSystemsProps> = ({
  systems,
  selectedCategory,
  onSelectCategory,
  gamesCountBySystem,
  enabledSystems,
}) => {
  const visibleSystems = systems.filter((s) => {
    if (!enabledSystems || enabledSystems.length === 0) return true;
    return enabledSystems.includes(s.id);
  });

  return (
    <div className="space-y-1">
      <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans mb-2">
        CONSOLES & SYSTÈMES
      </h3>

      <div className="space-y-0.5">
        {visibleSystems.map((system) => {
          const isSelected = selectedCategory === system.id;
          const count = gamesCountBySystem[system.id] || 0;

          return (
            <button
              key={system.id}
              onClick={() => onSelectCategory(system.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-50 to-purple-50 text-rose-600 border border-pink-200/80 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <ConsoleLogo systemId={system.id} size="sm" className="shrink-0" />
                <span className="truncate">{system.name}</span>
              </div>

              {count > 0 && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md font-mono ${
                    isSelected
                      ? 'bg-rose-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
