import React from 'react';
import { Zap, Check, CornerDownLeft, SkipForward, X } from 'lucide-react';
import { RemapStep } from '../../../types';

interface GamepadWizardProps {
  currentStep: RemapStep;
  wizardStep: number;
  totalSteps: number;
  pendingInput: string | null;
  onConfirmStep: () => void;
  onSkipStep: () => void;
  onCancel: () => void;
}

const formatInputLabel = (input: string | null) => {
  if (!input) return '';
  if (input === 'h0up') return 'JOYSTICK HAUT ⬆️';
  if (input === 'h0down') return 'JOYSTICK BAS ⬇️';
  if (input === 'h0left') return 'JOYSTICK GAUCHE ⬅️';
  if (input === 'h0right') return 'JOYSTICK DROITE ➡️';
  if (!isNaN(Number(input))) {
    return `BOUTON ${Number(input) + 1} (Signal physique ${input})`;
  }
  return input.toUpperCase();
};

export const GamepadWizard: React.FC<GamepadWizardProps> = ({
  currentStep,
  wizardStep,
  totalSteps,
  pendingInput,
  onConfirmStep,
  onSkipStep,
  onCancel,
}) => {
  const isPending = pendingInput !== null;

  return (
    <div className="bg-white border-2 border-purple-200 rounded-3xl p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200 shadow-xl max-w-xl mx-auto space-y-5">
      {/* Progress pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-black text-purple-700">
        <span>Configuration pas-à-pas</span>
        <span>•</span>
        <span>Étape {wizardStep + 1} sur {totalSteps}</span>
      </div>

      <div className="text-5xl">{currentStep?.icon}</div>

      <div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
          {currentStep?.label}
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          {currentStep?.desc}
        </p>
      </div>

      {/* Zone de statut / Détection */}
      {!isPending ? (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5 animate-pulse">
          <div className="flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>En attente de votre pression...</span>
          </div>
          <p className="text-xs text-amber-700">
            Appuyez sur le bouton souhaité ou poussez le joystick sur votre borne arcade.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-emerald-950 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
            Touche détectée avec succès !
          </div>
          <div className="text-lg font-black text-emerald-800 bg-white/80 py-1.5 px-4 rounded-xl inline-block border border-emerald-200 shadow-2xs">
            {formatInputLabel(pendingInput)}
          </div>
          <div className="text-xs font-bold text-emerald-800 pt-1 flex items-center justify-center gap-1.5">
            <CornerDownLeft className="w-4 h-4 text-emerald-600" />
            <span>
              Validez avec la touche <strong className="underline">ENTRÉE ↵</strong> (clavier) ou le <strong className="underline">BOUTON 1</strong> (borne)
            </span>
          </div>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
        {isPending ? (
          <button
            onClick={onConfirmStep}
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-md flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Valider et passer au suivant (Entrée ↵)</span>
          </button>
        ) : null}

        <button
          onClick={onSkipStep}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5"
          title="Passer cette touche sans l'assigner"
        >
          <SkipForward className="w-3.5 h-3.5 text-slate-500" />
          <span>Passer cette touche</span>
        </button>

        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-bold transition-all flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          <span>Annuler l'assistant</span>
        </button>
      </div>
    </div>
  );
};
