import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Zap, ChevronDown, X } from 'lucide-react';
import { GamepadMapping, RemapStep } from '../../../types';

interface MappingTableProps {
  currentMapping: GamepadMapping;
  remapSteps: RemapStep[];
  selectedPlayer: number;
  activeButtons: Set<number>;
  activeAxes: { x: number; y: number; rx: number; ry: number };
  editingKey: string | null;
  onSelectKeyToEdit: (key: string | null) => void;
  onUpdateKey: (key: string, value: string) => void;
  onResetPlayer: () => void;
}

const QUICK_OPTIONS = [
  { label: 'Bouton 1 (Signal 0)', value: '0' },
  { label: 'Bouton 2 (Signal 1)', value: '1' },
  { label: 'Bouton 3 (Signal 2)', value: '2' },
  { label: 'Bouton 4 (Signal 3)', value: '3' },
  { label: 'Bouton 5 (Signal 4)', value: '4' },
  { label: 'Bouton 6 (Signal 5)', value: '5' },
  { label: 'Bouton 7 (Signal 6)', value: '6' },
  { label: 'Bouton 8 (Signal 7)', value: '7' },
  { label: 'Bouton 9 (Signal 8 / Coin)', value: '8' },
  { label: 'Bouton 10 (Signal 9 / Start)', value: '9' },
  { label: 'Bouton 11 (Signal 10)', value: '10' },
  { label: 'Bouton 12 (Signal 11)', value: '11' },
  { label: 'Joystick Haut (h0up)', value: 'h0up' },
  { label: 'Joystick Bas (h0down)', value: 'h0down' },
  { label: 'Joystick Gauche (h0left)', value: 'h0left' },
  { label: 'Joystick Droite (h0right)', value: 'h0right' },
  { label: 'Axe Haut (-1)', value: '-1' },
  { label: 'Axe Bas (+1)', value: '+1' },
  { label: 'Axe Gauche (-0)', value: '-0' },
  { label: 'Axe Droite (+0)', value: '+0' },
  { label: 'Non assigné', value: '' },
];

export const MappingTable: React.FC<MappingTableProps> = ({
  currentMapping,
  remapSteps,
  selectedPlayer,
  activeButtons,
  activeAxes,
  editingKey,
  onSelectKeyToEdit,
  onUpdateKey,
  onResetPlayer,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'action' | 'direction' | 'system'>('all');
  const waitingReleaseRef = useRef<boolean>(false);

  // Déterminer la catégorie d'un step
  const getStepCategory = (key: string): 'action' | 'direction' | 'system' => {
    if (key.includes('up') || key.includes('down') || key.includes('left') || key.includes('right')) {
      return 'direction';
    }
    if (key.includes('start') || key.includes('select') || key.includes('hotkey')) {
      return 'system';
    }
    return 'action';
  };

  const filteredSteps = remapSteps.filter((step) => {
    if (categoryFilter === 'all') return true;
    return getStepCategory(step.key) === categoryFilter;
  });

  // Quand on entre en mode édition, attendre que rien ne soit pressé avant de capturer
  const startEditing = (key: string) => {
    const isSomethingActive =
      activeButtons.size > 0 ||
      Math.abs(activeAxes.x) > 0.4 ||
      Math.abs(activeAxes.y) > 0.4;

    waitingReleaseRef.current = isSomethingActive;
    onSelectKeyToEdit(key);
  };

  // Écoute des appuis physiques de boutons ou directions quand editingKey est actif
  useEffect(() => {
    if (!editingKey) return;

    const isNeutral =
      activeButtons.size === 0 &&
      Math.abs(activeAxes.x) < 0.4 &&
      Math.abs(activeAxes.y) < 0.4;

    if (waitingReleaseRef.current) {
      if (isNeutral) {
        waitingReleaseRef.current = false;
      }
      return;
    }

    // 1. Détection d'un bouton pressé
    if (activeButtons.size > 0) {
      const pressedBtn = Array.from(activeButtons)[0];
      onUpdateKey(editingKey, pressedBtn.toString());
      onSelectKeyToEdit(null);
      return;
    }

    // 2. Détection d'une direction de joystick
    const isDirection =
      editingKey.includes('up') ||
      editingKey.includes('down') ||
      editingKey.includes('left') ||
      editingKey.includes('right');

    if (isDirection) {
      if (editingKey.includes('up') && activeAxes.y < -0.55) {
        onUpdateKey(editingKey, 'h0up');
        onSelectKeyToEdit(null);
        return;
      }
      if (editingKey.includes('down') && activeAxes.y > 0.55) {
        onUpdateKey(editingKey, 'h0down');
        onSelectKeyToEdit(null);
        return;
      }
      if (editingKey.includes('left') && activeAxes.x < -0.55) {
        onUpdateKey(editingKey, 'h0left');
        onSelectKeyToEdit(null);
        return;
      }
      if (editingKey.includes('right') && activeAxes.x > 0.55) {
        onUpdateKey(editingKey, 'h0right');
        onSelectKeyToEdit(null);
        return;
      }
    } else {
      if (activeAxes.y < -0.6) {
        onUpdateKey(editingKey, 'h0up');
        onSelectKeyToEdit(null);
        return;
      }
      if (activeAxes.y > 0.6) {
        onUpdateKey(editingKey, 'h0down');
        onSelectKeyToEdit(null);
        return;
      }
      if (activeAxes.x < -0.6) {
        onUpdateKey(editingKey, 'h0left');
        onSelectKeyToEdit(null);
        return;
      }
      if (activeAxes.x > 0.6) {
        onUpdateKey(editingKey, 'h0right');
        onSelectKeyToEdit(null);
        return;
      }
    }
  }, [editingKey, activeButtons, activeAxes, onUpdateKey]);

  // Échappe pour annuler l'édition
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingKey) {
        onSelectKeyToEdit(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingKey]);

  // Savoir si une touche est actuellement pressée physiquement
  const isKeyPhysicallyActive = (val: string | undefined | null): boolean => {
    if (!val) return false;
    const num = parseInt(val, 10);
    if (!isNaN(num) && activeButtons.has(num)) return true;
    if ((val === 'h0up' || val === 'up' || val === '-1') && activeAxes.y < -0.55) return true;
    if ((val === 'h0down' || val === 'down' || val === '+1') && activeAxes.y > 0.55) return true;
    if ((val === 'h0left' || val === 'left' || val === '-0') && activeAxes.x < -0.55) return true;
    if ((val === 'h0right' || val === 'right' || val === '+0') && activeAxes.x > 0.55) return true;
    return false;
  };

  return (
    <div className="lg:col-span-7 bg-slate-50 rounded-3xl p-5 border border-purple-100/90 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <span>TABLEAU DE CORRESPONDANCE</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-mono lowercase">
                synchro immédiate
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Cliquez directement sur une case pour la réassigner ou choisissez dans la liste déroulante.
            </p>
          </div>

          {/* Filtres de catégorie */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-purple-100 shadow-2xs">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                categoryFilter === 'all'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({remapSteps.length})
            </button>
            <button
              onClick={() => setCategoryFilter('action')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                categoryFilter === 'action'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Boutons
            </button>
            <button
              onClick={() => setCategoryFilter('direction')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                categoryFilter === 'direction'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Directions
            </button>
            <button
              onClick={() => setCategoryFilter('system')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                categoryFilter === 'system'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Système
            </button>
          </div>
        </div>

        {/* Message d'attente quand une touche est en cours d'assignation */}
        {editingKey && (
          <div className="mb-3 px-4 py-2.5 rounded-2xl bg-amber-500 text-white shadow-md flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 animate-bounce" />
              <span className="text-xs font-black">
                EN ÉCOUTE : Appuyez sur un bouton de la borne ou poussez le joystick pour valider...
              </span>
            </div>
            <button
              onClick={() => onSelectKeyToEdit(null)}
              className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Annuler (Échap)</span>
            </button>
          </div>
        )}

        {/* Grille des touches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredSteps.map((step) => {
            const val = (currentMapping as any)[step.key] || '';
            const isEditing = editingKey === step.key;
            const isActive = isKeyPhysicallyActive(val);

            return (
              <div
                key={step.key}
                onClick={() => startEditing(step.key)}
                className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs ${
                  isEditing
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-300 shadow-md scale-[1.01]'
                    : isActive
                    ? 'bg-emerald-50 border-emerald-300 shadow-xs ring-1 ring-emerald-300'
                    : 'bg-white border-purple-100 hover:border-purple-300 hover:shadow-xs'
                }`}
              >
                {/* Icône & Libellé */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm shrink-0">{step.icon}</span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-black text-slate-800 truncate leading-tight flex items-center gap-1.5">
                      <span>{step.label}</span>
                      {isActive && (
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-mono uppercase tracking-wider animate-pulse">
                          ● Actif
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {step.desc || step.key}
                    </div>
                  </div>
                </div>

                {/* Valeur & Sélecteur rapide */}
                <div
                  className="flex items-center gap-1.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isEditing ? (
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-black text-[11px] flex items-center gap-1 animate-pulse">
                      <Zap className="w-3 h-3" />
                      <span>Appuyez...</span>
                    </span>
                  ) : (
                    <div className="relative flex items-center">
                      <select
                        value={val}
                        onChange={(e) => onUpdateKey(step.key, e.target.value)}
                        className={`appearance-none pl-2.5 pr-6 py-1 rounded-xl font-mono text-[11px] font-bold border transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-400 ${
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : val
                            ? 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {val && !QUICK_OPTIONS.some((opt) => opt.value === val) && (
                          <option value={val}>Signal: {val}</option>
                        )}
                        {QUICK_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className={`w-3 h-3 absolute right-1.5 pointer-events-none ${
                          isActive ? 'text-white' : 'text-purple-600'
                        }`}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pied de tableau */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-3 mt-3 border-t border-purple-100 gap-2">
        <button
          onClick={onResetPlayer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Réinitialiser J{selectedPlayer + 1} (Arcade standard)</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Les touches pressées s'illuminent en vert en temps réel</span>
        </div>
      </div>
    </div>
  );
};
