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

  const currentMapping = mappings[selectedPlayer] || DEFAULT_GAMEPAD_MAPPING(selectedPlayer);
  const currentAssignedIndex = assignedPadIndices[selectedPlayer] ?? selectedPlayer;
  const activeGamepad = connectedPads[currentAssignedIndex] || null;
  const currentRemapSteps = REMAP_STEPS_BY_TYPE[currentMapping.controller_type] || REMAP_STEPS_BY_TYPE.arcade_stick;

  // Verrouillage strict : bloquer la propagation des touches vers l'arrière-plan
  useEffect(() => {
    const handleModalKeyDown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === 'Escape' && !isWizardActive) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleModalKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleModalKeyDown, { capture: true });
  }, [isWizardActive, onClose]);

  const lastPressedRef = useRef<number | null>(null);

  const handleWizardInput = useCallback(
    (pad: Gamepad, pressed: Set<number>, axisX: number, axisY: number) => {
      const currentStep = currentRemapSteps[wizardStep];
      if (!currentStep) return;

      let detectedInput: string | null = null;

      // Détection des boutons
      for (const btnIndex of pressed) {
        if (lastPressedRef.current !== btnIndex) {
          detectedInput = btnIndex.toString();
          lastPressedRef.current = btnIndex;
          break;
        }
      }

      // Détection des axes pour les directions
      if (!detectedInput) {
        if (currentStep.key === 'btn_up' && axisY < -0.5) detectedInput = 'h0up';
        if (currentStep.key === 'btn_down' && axisY > 0.5) detectedInput = 'h0down';
        if (currentStep.key === 'btn_left' && axisX < -0.5) detectedInput = 'h0left';
        if (currentStep.key === 'btn_right' && axisX > 0.5) detectedInput = 'h0right';
      }

      if (detectedInput) {
        setMappings((prev) => {
          const next = [...prev];
          const target = { ...next[selectedPlayer] };
          (target as any)[currentStep.key] = detectedInput;
          target.device_name = pad.id || target.device_name;
          next[selectedPlayer] = target;
          return next;
        });

        setTimeout(() => {
          if (wizardStep + 1 < currentRemapSteps.length) {
            setWizardStep((s) => s + 1);
            lastPressedRef.current = null;
          } else {
            setIsWizardActive(false);
            setWizardStep(0);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
          }
        }, 300);
      }
    },
    [wizardStep, selectedPlayer, currentRemapSteps]
  );

  // Polling des manettes physiques
  useEffect(() => {
    let animId: number;

    const pollGamepads = () => {
      const raw = navigator.getGamepads
        ? (Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[])
        : [];
      setConnectedPads(raw);

      const targetPad = raw[currentAssignedIndex];
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
    const pad = connectedPads[padIdx];
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-retro-dark/75 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
    >
      <div className="bg-retro-panel border-4 border-retro-dark/30 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-retro-dark/10 flex items-center justify-between bg-retro-warm/80">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-arcade-orange text-white rounded-2xl shadow-md">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-arcade tracking-wider text-retro-dark">
                  GESTIONNAIRE DE CONTRÔLEURS & ARCADE STICKS
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-arcade-orange text-white font-arcade uppercase">
                  1 À 10 JOUEURS
                </span>
              </div>
              <p className="text-xs text-retro-dark/65">
                Assignation des périphériques, priorité J1/J2, remapping interactif et synchronisation automatique avec les émulateurs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-retro-dark/60 hover:text-retro-dark hover:bg-black/10 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sélecteur de Joueur J1 à J10 */}
        <PlayerSelector
          selectedPlayer={selectedPlayer}
          onSelectPlayer={(idx) => {
            setSelectedPlayer(idx);
            setIsWizardActive(false);
          }}
          primaryPlayer={primaryPlayer}
          connectedPads={connectedPads}
          assignedPadIndices={assignedPadIndices}
        />

        {/* Corps Principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ligne 1 : Assignation Périphérique & Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 bg-white/80 rounded-2xl p-4 border border-retro-dark/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-retro-dark/60 uppercase">
                  Périphérique Physique Assigné à Joueur {selectedPlayer + 1}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                    activeGamepad
                      ? 'bg-arcade-green/20 text-arcade-green'
                      : 'bg-retro-dark/10 text-retro-dark/40'
                  }`}
                >
                  {activeGamepad ? `Connecté (Port #${activeGamepad.index})` : 'Aucun contrôleur détecté'}
                </span>
              </div>

              {connectedPads.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    value={currentAssignedIndex}
                    onChange={(e) => handleAssignPad(Number(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-retro-dark/15 text-xs font-bold text-retro-dark focus:outline-none focus:border-arcade-orange"
                  >
                    {connectedPads.map((pad, idx) => (
                      <option key={idx} value={idx}>
                        🎮 Manette #{idx + 1} : {pad.id} ({pad.buttons.length} boutons, {pad.axes.length} axes)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-retro-warm/50 border border-dashed border-retro-dark/20 text-xs text-retro-dark/60">
                  ⚠️ Branchez une manette ou un encodeur USB arcade, puis appuyez sur un bouton pour l'activer.
                </div>
              )}
            </div>

            <div className="md:col-span-4 bg-white/80 rounded-2xl p-4 border border-retro-dark/10 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-bold text-retro-dark/60 uppercase block mb-1">
                Priorité de Navigation
              </span>
              <div className="flex items-center justify-between">
                <div className="text-xs">
                  {primaryPlayer === selectedPlayer ? (
                    <span className="text-arcade-green font-bold flex items-center gap-1">
                      ⭐ Contrôle Principal Actif
                    </span>
                  ) : (
                    <span className="text-retro-dark/60">Contrôle Secondaire</span>
                  )}
                </div>
                <button
                  onClick={() => handleSetPrimary(selectedPlayer)}
                  disabled={primaryPlayer === selectedPlayer}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-arcade transition-all ${
                    primaryPlayer === selectedPlayer
                      ? 'bg-arcade-green text-white cursor-default'
                      : 'bg-retro-dark/10 text-retro-dark hover:bg-retro-dark hover:text-white'
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
              onSkipStep={() => {
                if (wizardStep + 1 < currentRemapSteps.length) {
                  setWizardStep((s) => s + 1);
                } else {
                  setIsWizardActive(false);
                }
              }}
              onCancel={() => setIsWizardActive(false)}
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
        <div className="px-6 py-4 border-t border-retro-dark/10 bg-retro-warm/80 flex items-center justify-between">
          <div className="text-xs text-retro-dark/70">
            {saveSuccess && (
              <span className="inline-flex items-center gap-1.5 text-arcade-green font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Configuration synchronisée avec tous les émulateurs !</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white border border-retro-dark/15 text-xs font-bold text-retro-dark hover:bg-black/5 transition-all"
            >
              Fermer
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-retro-dark hover:bg-retro-dark/90 text-retro-cream text-xs font-bold font-arcade shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-arcade-yellow" />
              <span>ENREGISTRER & APPLIQUER</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
