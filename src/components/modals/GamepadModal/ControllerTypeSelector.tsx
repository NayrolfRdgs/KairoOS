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
    <div className="bg-white/80 rounded-2xl p-4 border border-retro-dark/10 shadow-sm">
      <span className="text-xs font-bold text-retro-dark/60 uppercase block mb-2">
        Type de Manette / Stick (Adapte l'interface et les émulateurs)
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {CONTROLLER_PROFILES.map((t) => (
          <button
            key={t.id}
            onClick={() => onTypeChange(t.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              currentType === t.id
                ? 'border-arcade-orange bg-arcade-orange/15 font-bold text-retro-dark shadow-sm ring-2 ring-arcade-orange/30'
                : 'border-retro-dark/10 bg-white hover:bg-black/5 text-retro-dark/70'
            }`}
          >
            <div className="text-xs font-bold">{t.label}</div>
            <div className="text-[10px] text-retro-dark/50 mt-0.5">{t.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
};
