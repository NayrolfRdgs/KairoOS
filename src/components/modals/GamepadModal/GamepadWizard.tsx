import React from 'react';
import { Zap } from 'lucide-react';
import { RemapStep } from '../../../types';

interface GamepadWizardProps {
  currentStep: RemapStep;
  wizardStep: number;
  totalSteps: number;
  onSkipStep: () => void;
  onCancel: () => void;
}

export const GamepadWizard: React.FC<GamepadWizardProps> = ({
  currentStep,
  wizardStep,
  totalSteps,
  onSkipStep,
  onCancel,
}) => {
  return (
    <div className="bg-arcade-orange/15 border-3 border-arcade-orange rounded-3xl p-8 text-center animate-in zoom-in-95 duration-200 shadow-xl">
      <div className="text-5xl mb-3">{currentStep?.icon}</div>
      <h3 className="text-2xl font-bold font-arcade text-retro-dark mb-1">
        {currentStep?.label}
      </h3>
      <p className="text-sm text-retro-dark/75 max-w-md mx-auto mb-6">
        {currentStep?.desc}
      </p>

      <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-retro-dark text-retro-cream rounded-2xl text-xs font-arcade animate-pulse shadow-lg">
        <Zap className="w-4 h-4 text-arcade-yellow" />
        <span>APPUYEZ SUR LA TOUCHE CORRESPONDANTE SUR VOTRE MANETTE...</span>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          onClick={onSkipStep}
          className="px-5 py-2.5 rounded-xl bg-white text-retro-dark text-xs font-bold hover:bg-black/5 border border-retro-dark/15 shadow-sm"
        >
          Passer cette touche ({wizardStep + 1}/{totalSteps}) ⏭️
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl bg-retro-dark/10 text-retro-dark text-xs font-bold hover:bg-retro-dark/20"
        >
          Annuler l'assistant
        </button>
      </div>
    </div>
  );
};
