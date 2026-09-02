import React, { useState } from 'react';
import { X, FolderPlus, CheckCircle2, AlertCircle, RefreshCw, Tag } from 'lucide-react';
import { Game } from '../../../types';
import { POPULAR_FRANCHISES } from '../../../constants';

interface FranchiseOrganizerModalProps {
  game: Game;
  onClose: () => void;
  onOrganize: (gameId: string, franchiseName: string) => Promise<string>;
  onComplete: () => void;
}

export const FranchiseOrganizerModal: React.FC<FranchiseOrganizerModalProps> = ({
  game,
  onClose,
  onOrganize,
  onComplete,
}) => {
  const [selectedFranchise, setSelectedFranchise] = useState<string>(
    game.franchise || POPULAR_FRANCHISES[0].name
  );
  const [customFranchiseName, setCustomFranchiseName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPath, setSuccessPath] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOrganize = async () => {
    const finalFranchise = customFranchiseName.trim() ? customFranchiseName.trim() : selectedFranchise;
    if (!finalFranchise) {
      setErrorMsg('Veuillez sélectionner ou saisir un nom de franchise.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setSuccessPath(null);

    try {
      const newPath = await onOrganize(game.id, finalFranchise);
      setSuccessPath(newPath);
      onComplete();
    } catch (err: any) {
      setErrorMsg(typeof err === 'string' ? err : err?.message || "Erreur lors de l'organisation du dossier.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-retro-text/40 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-white border border-retro-border rounded-3xl shadow-retro-lg p-6 sm:p-8 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-retro-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase font-display tracking-wider text-retro-text">
                Organiser dans une Franchise
              </h2>
              <span className="text-[11px] text-retro-textMuted">
                Dossier multi-consoles + Fichier JSON & Jaquette
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-full hover:bg-retro-bg text-retro-textMuted hover:text-retro-text transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="py-6 space-y-5">
          <div className="p-3.5 rounded-2xl bg-retro-bg border border-retro-border">
            <span className="text-[10px] uppercase font-bold text-retro-textMuted block mb-1">Jeu Sélectionné</span>
            <span className="font-bold text-retro-text block truncate text-xs">{game.title}</span>
            <span className="text-[10px] text-retro-primary font-bold uppercase">{game.system_id}</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-retro-text mb-2">
              Choisir une Franchise Existante
            </label>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_FRANCHISES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFranchise(f.name);
                    setCustomFranchiseName('');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left truncate flex items-center gap-2 ${
                    selectedFranchise === f.name && !customFranchiseName
                      ? 'bg-purple-50 text-purple-600 border-purple-300 shadow-sm'
                      : 'bg-retro-bg border-retro-border text-retro-text hover:bg-white'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 shrink-0 text-purple-500" />
                  <span className="truncate">{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-retro-text mb-2">
              Ou Saisir un Nom de Franchise Personnalisé
            </label>
            <input
              type="text"
              value={customFranchiseName}
              onChange={(e) => setCustomFranchiseName(e.target.value)}
              placeholder="ex: Castlevania, Dragon Ball, Mega Man..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-retro-bg border border-retro-border text-xs text-retro-text focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
            ✨ Cette action va déplacer la ROM dans un sous-dossier de franchise dédié et générer le fichier{' '}
            <code className="font-mono font-bold">.json</code> de métadonnées ainsi que les images associées.
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successPath && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ROM organisée avec succès !</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-mono truncate">{successPath}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-retro-border">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl text-xs font-bold text-retro-textMuted hover:text-retro-text transition-all disabled:opacity-50"
          >
            Fermer
          </button>

          <button
            onClick={handleOrganize}
            disabled={isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Organisation...</span>
              </>
            ) : (
              <>
                <FolderPlus className="w-4 h-4" />
                <span>Déplacer & Générer JSON</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
