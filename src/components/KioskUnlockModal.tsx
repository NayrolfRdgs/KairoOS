import React, { useState, useEffect } from 'react';
import { X, Lock, Unlock, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface KioskUnlockModalProps {
  onClose: () => void;
  onUnlock: (pin: string) => Promise<boolean>;
}

export const KioskUnlockModal: React.FC<KioskUnlockModalProps> = ({ onClose, onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key >= '0' && e.key <= '9' && pin.length < 8) {
        setPin((prev) => prev + e.key);
        setError(null);
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
        setError(null);
      } else if (e.key === 'Enter') {
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [pin, onClose]);

  const handleDigitClick = (digit: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleConfirm = async () => {
    if (!pin) {
      setError('Veuillez saisir votre code PIN');
      return;
    }

    setLoading(true);
    setError(null);

    const ok = await onUnlock(pin);
    setLoading(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } else {
      setError('Code PIN incorrect');
      setPin('');
    }
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-retro-dark/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
    >
      <div className="bg-retro-panel border-4 border-retro-dark/40 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-retro-dark/60 hover:text-retro-dark hover:bg-black/10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-arcade-orange/20 border-2 border-arcade-orange flex items-center justify-center mb-4 text-arcade-orange shadow-inner">
          {success ? (
            <Unlock className="w-8 h-8 text-arcade-green animate-bounce" />
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>

        <h2 className="text-xl font-bold font-arcade tracking-wider text-retro-dark">
          DÉVERROUILLER MODE ADMIN
        </h2>
        <p className="text-xs text-retro-dark/65 mt-1 mb-6">
          Saisissez le code PIN pour quitter le mode Kiosk et accéder aux paramètres.
        </p>

        {/* Affichage des pastilles PIN */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-5 h-5 rounded-full border-2 transition-all ${
                i < pin.length
                  ? 'bg-arcade-orange border-retro-dark scale-110 shadow-md'
                  : 'bg-white/80 border-retro-dark/30'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 rounded-xl bg-arcade-red/15 border border-arcade-red/30 text-arcade-red text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 px-4 py-2 mb-4 rounded-xl bg-arcade-green/15 border border-arcade-green/30 text-arcade-green text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Mode Admin déverrouillé !</span>
          </div>
        )}

        {/* Clavier numérique arcade */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigitClick(digit)}
              className="py-3.5 rounded-2xl bg-white border-2 border-retro-dark/15 text-lg font-bold font-arcade text-retro-dark hover:bg-arcade-orange/15 hover:border-arcade-orange active:scale-95 transition-all shadow-xs"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="py-3.5 rounded-2xl bg-white/60 border-2 border-retro-dark/10 text-xs font-bold text-retro-dark/60 hover:bg-white active:scale-95 transition-all"
          >
            C
          </button>
          <button
            onClick={() => handleDigitClick('0')}
            className="py-3.5 rounded-2xl bg-white border-2 border-retro-dark/15 text-lg font-bold font-arcade text-retro-dark hover:bg-arcade-orange/15 hover:border-arcade-orange active:scale-95 transition-all shadow-xs"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="py-3.5 rounded-2xl bg-white/60 border-2 border-retro-dark/10 text-xs font-bold text-retro-dark/60 hover:bg-white active:scale-95 transition-all"
          >
            ⌫
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between w-full gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-white border border-retro-dark/15 text-xs font-bold text-retro-dark hover:bg-black/5 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !pin}
            className="flex-1 py-3 rounded-2xl bg-retro-dark hover:bg-retro-dark/90 text-retro-cream text-xs font-bold font-arcade shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-arcade-yellow" />
            <span>VALIDER</span>
          </button>
        </div>

        <div className="mt-4 text-[10px] text-retro-dark/40 font-mono">
          Raccourci Joystick : LB + RB + Start maintenu 3s
        </div>
      </div>
    </div>
  );
};
