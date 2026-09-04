import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Gamepad2, CheckCircle2, Save } from 'lucide-react';
import { ControllerType, GamepadMapping } from '../../../types';
import { DEFAULT_GAMEPAD_MAPPING, REMAP_STEPS_BY_TYPE } from '../../../constants';
import { PlayerSelector } from './PlayerSelector';
import { ControllerTypeSelector } from './ControllerTypeSelector';
import { GamepadWizard } from './GamepadWizard';
import { GamepadVisualizer } from './GamepadVisualizer';
import { MappingTable } from './MappingTable';

interface GamepadSettingsModalProps {
  onClose: () => void;
  onSaveMappings?: (mappings: GamepadMapping[]) => Promise<void>;
  initialMappings?: GamepadMapping[];
  primaryPlayerIndex?: number;
  onSetPrimaryPlayer?: (index: number) => void;
}

export const GamepadSettingsModal: React.FC<GamepadSettingsModalProps> = ({
  onClose,
  onSaveMappings,
  initialMappings = [],
  primaryPlayerIndex = 0,
  onSetPrimaryPlayer,
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0);
  const [primaryPlayer, setPrimaryPlayer] = useState<number>(primaryPlayerIndex);
  const [mappings, setMappings] = useState<GamepadMapping[]>(() => {
    const list: GamepadMapping[] = [];
    for (let i = 0; i < 10; i++) {
      const found = initialMappings.find((m) => m.player_index === i);
      list.push(found || DEFAULT_GAMEPAD_MAPPING(i));
    }
    return list;
  });

  // Synchronisation dynamique si initialMappings arrive de manière asynchrone
  useEffect(() => {
    if (initialMappings && initialMappings.length > 0) {
      setMappings((prev) => {
        const list: GamepadMapping[] = [];
        for (let i = 0; i < 10; i++) {
          const found = initialMappings.find((m) => m.player_index === i);
          list.push(found || prev[i] || DEFAULT_GAMEPAD_MAPPING(i));
        }
        return list;
      });
    }
  }, [initialMappings]);

  const [connectedPads, setConnectedPads] = useState<Gamepad[]>([]);
  const [assignedPadIndices, setAssignedPadIndices] = useState<Record<number, number>>({
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
  });

  const [activeButtons, setActiveButtons] = useState<Set<number>>(new Set());
  const [activeAxes, setActiveAxes] = useState<{ x: number; y: number; rx: number; ry: number }>({
    x: 0, y: 0, rx: 0, ry: 0,
  });

  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [pendingInput, setPendingInput] = useState<string | null>(null);

  const currentMapping = mappings[selectedPlayer] || DEFAULT_GAMEPAD_MAPPING(selectedPlayer);
  const currentAssignedIndex = assignedPadIndices[selectedPlayer] ?? selectedPlayer;
  const activeGamepad = connectedPads.find((p) => p.index === currentAssignedIndex) || connectedPads[selectedPlayer] || null;
  const currentRemapSteps = REMAP_STEPS_BY_TYPE[currentMapping.controller_type] || REMAP_STEPS_BY_TYPE.arcade_stick;

  const currentStep = currentRemapSteps[wizardStep];
  const pendingInputRef = useRef<string | null>(null);
  pendingInputRef.current = pendingInput;

  const waitingForReleaseRef = useRef<boolean>(false);
  const confirmedButton1Ref = useRef<string | null>(null);

  // Changement propre de joueur (dissociation totale P1/P2 et réinitialisation de l'assistant)
  const handleSelectPlayer = useCallback((idx: number) => {
    setSelectedPlayer(idx);
    setIsWizardActive(false);
    setWizardStep(0);
    setPendingInput(null);
    confirmedButton1Ref.current = null;
    waitingForReleaseRef.current = false;
  }, []);

  // Valider et enregistrer la touche sélectionnée
  const handleConfirmStep = useCallback(() => {
    const inputToSave = pendingInputRef.current;
    if (!inputToSave || !currentStep) return;

    if (currentStep.key === 'btn_a') {
      confirmedButton1Ref.current = inputToSave;
    }

    const nextMappings = [...mappings];
    const target = { ...nextMappings[selectedPlayer] };
    (target as any)[currentStep.key] = inputToSave;
    if (activeGamepad?.id) {
      target.device_name = activeGamepad.id;
    }
    nextMappings[selectedPlayer] = target;
    setMappings(nextMappings);

    setPendingInput(null);
    waitingForReleaseRef.current = true;

    if (wizardStep + 1 < currentRemapSteps.length) {
      setWizardStep((s) => s + 1);
    } else {
      setIsWizardActive(false);
      setWizardStep(0);
      setSaveSuccess(true);
      // Sauvegarde automatique immédiate en base, config JSON et fichiers RetroArch !
      if (onSaveMappings) {
        onSaveMappings(nextMappings);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }, [currentStep, wizardStep, currentRemapSteps.length, selectedPlayer, activeGamepad, mappings, onSaveMappings]);

  // Passer la touche sans l'assigner
  const handleSkipStep = useCallback(() => {
    setPendingInput(null);
    waitingForReleaseRef.current = true;
    if (wizardStep + 1 < currentRemapSteps.length) {
      setWizardStep((s) => s + 1);
    } else {
      setIsWizardActive(false);
      setWizardStep(0);
      setSaveSuccess(true);
      if (onSaveMappings) {
        onSaveMappings(mappings);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }, [wizardStep, currentRemapSteps.length, mappings, onSaveMappings]);

  // Gestion du clavier dans la modale et l'assistant
  useEffect(() => {
    const handleModalKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (isWizardActive) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (pendingInputRef.current) {
            handleConfirmStep();
          }
        } else if (e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          handleSkipStep();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsWizardActive(false);
          setPendingInput(null);
          waitingForReleaseRef.current = false;
        }
      } else {
        if (e.key === 'Escape') {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleModalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleModalKeyDown, { capture: true });
  }, [isWizardActive, handleConfirmStep, handleSkipStep, onClose]);

  const handleWizardInput = useCallback(
    (_pad: Gamepad, pressed: Set<number>, axisX: number, axisY: number) => {
      if (!currentStep) return;

      const isNeutral =
        pressed.size === 0 &&
        Math.abs(axisX) < 0.35 &&
        Math.abs(axisY) < 0.35;

      // Attendre que tout soit relâché avant d'accepter une nouvelle entrée
      if (waitingForReleaseRef.current) {
        if (isNeutral) {
          waitingForReleaseRef.current = false;
        }
        return;
      }

      // 1. Si pendingInput est null (aucune touche en attente de confirmation)
      if (pendingInputRef.current === null) {
        // Détecter un bouton
        for (const btnIndex of pressed) {
          const btnStr = btnIndex.toString();
          setPendingInput(btnStr);
          waitingForReleaseRef.current = true; // DOIT relâcher avant de pouvoir confirmer !
          return;
        }

        // Détecter un axe de joystick
        const isDirectionStep = ['btn_up', 'btn_down', 'btn_left', 'btn_right'].includes(currentStep.key);
        if (isDirectionStep) {
          let dirDetected: string | null = null;
          if (currentStep.key === 'btn_up' && axisY < -0.55) dirDetected = 'h0up';
          if (currentStep.key === 'btn_down' && axisY > 0.55) dirDetected = 'h0down';
          if (currentStep.key === 'btn_left' && axisX < -0.55) dirDetected = 'h0left';
          if (currentStep.key === 'btn_right' && axisX > 0.55) dirDetected = 'h0right';

          if (dirDetected) {
            setPendingInput(dirDetected);
            waitingForReleaseRef.current = true; // DOIT ramener le stick au repos !
            return;
          }
        }
      } else {
        // 2. pendingInput est déjà en attente (affiché en vert)
        const currentBtn1 = confirmedButton1Ref.current || currentMapping.btn_a;

        for (const btnIndex of pressed) {
          const btnStr = btnIndex.toString();

          // Étape 1 (btn_a) : réappuyer sur la même touche valide le bouton 1 !
          if (currentStep.key === 'btn_a' && pendingInputRef.current === btnStr) {
            handleConfirmStep();
            return;
          }

          // Étapes suivantes : appuyer sur Bouton 1 valide la sélection !
          if (currentStep.key !== 'btn_a' && currentBtn1 && btnStr === currentBtn1) {
            handleConfirmStep();
            return;
          }

          // Si l'utilisateur appuie sur un AUTRE bouton que Bouton 1 : on remplace le choix
          if (pendingInputRef.current !== btnStr && (!currentBtn1 || btnStr !== currentBtn1)) {
            setPendingInput(btnStr);
            waitingForReleaseRef.current = true;
            return;
          }
        }
      }
    },
    [currentStep, currentMapping.btn_a, handleConfirmStep]
  );

  // Polling des manettes physiques
  useEffect(() => {
    let animId: number;

    const pollGamepads = () => {
      const raw = navigator.getGamepads
        ? (Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[])
        : [];
      setConnectedPads(raw);

      const targetPad = raw.find((p) => p.index === currentAssignedIndex) || raw[selectedPlayer] || raw[0] || null;
      if (targetPad) {
        const pressed = new Set<number>();
        targetPad.buttons.forEach((btn, idx) => {
          if (btn.pressed || btn.value > 0.4) {
            pressed.add(idx);
          }
        });
        setActiveButtons(pressed);

        const x = targetPad.axes[0] || 0;
        const y = targetPad.axes[1] || 0;
        const rx = targetPad.axes[2] || 0;
        const ry = targetPad.axes[3] || 0;
        setActiveAxes({ x, y, rx, ry });

        if (isWizardActive) {
          handleWizardInput(targetPad, pressed, x, y);
        }
      } else {
        setActiveButtons(new Set());
        setActiveAxes({ x: 0, y: 0, rx: 0, ry: 0 });
      }

      animId = requestAnimationFrame(pollGamepads);
    };

    animId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animId);
  }, [selectedPlayer, currentAssignedIndex, isWizardActive, wizardStep, currentRemapSteps, handleWizardInput]);

  const handleTypeChange = (type: ControllerType) => {
    setMappings((prev) => {
      const next = [...prev];
      next[selectedPlayer] = {
        ...next[selectedPlayer],
        controller_type: type,
      };
      return next;
    });
  };

  const handleAssignPad = (padIdx: number) => {
    setAssignedPadIndices((prev) => ({
      ...prev,
      [selectedPlayer]: padIdx,
    }));
    const pad = connectedPads.find((p) => p.index === padIdx) || connectedPads[padIdx];
    if (pad) {
      setMappings((prev) => {
        const next = [...prev];
        next[selectedPlayer] = {
          ...next[selectedPlayer],
          device_name: pad.id,
          device_id: `pad_hw_${pad.index}`,
        };
        return next;
      });
    }
  };

  const handleSetPrimary = (playerIdx: number) => {
    setPrimaryPlayer(playerIdx);
    onSetPrimaryPlayer?.(playerIdx);
  };

  const handleSave = async () => {
    if (onSaveMappings) {
      await onSaveMappings(mappings);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleResetCurrent = () => {
    setMappings((prev) => {
      const next = [...prev];
      next[selectedPlayer] = DEFAULT_GAMEPAD_MAPPING(selectedPlayer);
      return next;
    });
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-fadeIn select-none"
    >
      <div className="bg-white border border-purple-100 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-pink-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 font-sans tracking-tight">
                  GESTIONNAIRE DE CONTRÔLEURS & ARCADE STICKS
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono uppercase">
                  1 À 10 JOUEURS
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Assignation des périphériques, priorité J1/J2, remapping interactif et synchronisation automatique avec les émulateurs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sélecteur de Joueur J1 à J10 */}
        <PlayerSelector
          selectedPlayer={selectedPlayer}
          onSelectPlayer={handleSelectPlayer}
          primaryPlayer={primaryPlayer}
          connectedPads={connectedPads}
          assignedPadIndices={assignedPadIndices}
        />

        {/* Corps Principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ligne 1 : Assignation Périphérique & Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 bg-slate-50 rounded-2xl p-4 border border-purple-100/90 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Périphérique Physique Assigné à Joueur {selectedPlayer + 1}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    activeGamepad
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {activeGamepad ? `Connecté (Port #${activeGamepad.index})` : 'Aucun contrôleur détecté'}
                </span>
              </div>

              {connectedPads.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={currentAssignedIndex}
                      onChange={(e) => handleAssignPad(Number(e.target.value))}
                      className="flex-1 px-3 py-2 rounded-xl bg-white border border-purple-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-rose-400 shadow-2xs"
                    >
                      {connectedPads.map((pad) => (
                        <option key={pad.index} value={pad.index}>
                          🎮 Manette #{pad.index + 1} (Port #{pad.index}) : {pad.id} ({pad.buttons.length} boutons, {pad.axes.length} axes)
                        </option>
                      ))}
                    </select>
                  </div>
                  {connectedPads.length === 1 && (
                    <p className="text-[11px] text-amber-600 font-medium">
                      💡 Une seule manette est actuellement active. Appuyez sur un bouton du Joueur 2 pour réveiller le second contrôleur USB.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-purple-50/50 border border-dashed border-purple-200 text-xs text-slate-500">
                  ⚠️ Branchez une manette ou un encodeur USB arcade, puis appuyez sur un bouton pour l'activer.
                </div>
              )}
            </div>

            <div className="md:col-span-4 bg-slate-50 rounded-2xl p-4 border border-purple-100/90 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Priorité de Navigation
              </span>
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  {primaryPlayer === selectedPlayer ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      ⭐ Contrôle Principal Actif
                    </span>
                  ) : (
                    <span className="text-slate-400">Contrôle Secondaire</span>
                  )}
                </div>
                <button
                  onClick={() => handleSetPrimary(selectedPlayer)}
                  disabled={primaryPlayer === selectedPlayer}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    primaryPlayer === selectedPlayer
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-white border border-purple-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300'
                  }`}
                >
                  {primaryPlayer === selectedPlayer ? 'PRIORITAIRE' : 'DONNER PRIORITÉ ⭐'}
                </button>
              </div>
            </div>
          </div>

          {/* Ligne 2 : Type de Manette */}
          <ControllerTypeSelector
            currentType={currentMapping.controller_type}
            onTypeChange={handleTypeChange}
          />

          {/* Ligne 3 : Assistant de Remapping OU Visualiseur + Table */}
          {isWizardActive ? (
            <GamepadWizard
              currentStep={currentRemapSteps[wizardStep]}
              wizardStep={wizardStep}
              totalSteps={currentRemapSteps.length}
              pendingInput={pendingInput}
              onConfirmStep={handleConfirmStep}
              onSkipStep={handleSkipStep}
              onCancel={() => {
                setIsWizardActive(false);
                setPendingInput(null);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <GamepadVisualizer
                controllerType={currentMapping.controller_type}
                activeButtons={activeButtons}
                activeAxes={activeAxes}
                onStartWizard={() => {
                  setIsWizardActive(true);
                  setWizardStep(0);
                }}
              />

              <MappingTable
                currentMapping={currentMapping}
                remapSteps={currentRemapSteps}
                selectedPlayer={selectedPlayer}
                onResetPlayer={handleResetCurrent}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-purple-100 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration synchronisée avec tous les émulateurs !</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Fermer
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4 text-white" />
              <span>ENREGISTRER & APPLIQUER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
