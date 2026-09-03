import React from 'react';
import { ControllerType } from '../../../types';
import { CONTROLLER_PROFILES } from '../../../constants';

interface ControllerTypeSelectorProps {
  currentType: ControllerType;
  onTypeChange: (type: ControllerType) => void;
}

export const ControllerTypeSelector: React.FC<ControllerTypeSelectorProps> = ({
  currentType,
  onTypeChange,
}) => {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-purple-100/90 shadow-xs">
      <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-2">
        Type de Manette / Stick (Adapte l'interface et les émulateurs)
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CONTROLLER_PROFILES.map((t) => (
          <button
            key={t.id}
            onClick={() => onTypeChange(t.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              currentType === t.id
                ? 'border-rose-500 bg-rose-50/80 font-bold text-slate-900 shadow-sm ring-2 ring-rose-500/20'
                : 'border-purple-100 bg-white hover:border-purple-200 text-slate-600'
            }`}
          >
            <div className="text-xs font-bold text-slate-900">{t.label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
