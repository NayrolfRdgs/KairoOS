import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Gamepad2, CheckCircle2, RotateCcw, Save, Zap, CircleDot, Play } from 'lucide-react';
import { GamepadMapping } from '../types';

interface GamepadSettingsModalProps {
  onClose: () => void;
  onSaveMappings?: (mappings: GamepadMapping[]) => Promise<void>;
  initialMappings?: GamepadMapping[];
  primaryPlayerIndex?: number;
  onSetPrimaryPlayer?: (index: number) => void;
}

const DEFAULT_MAPPING = (playerIndex: number): GamepadMapping => ({
  player_index: playerIndex,
  device_name: `Contrôleur Joueur ${playerIndex + 1}`,
  device_id: `pad_${playerIndex}`,
  controller_type: playerIndex === 0 ? 'arcade_stick' : 'standard',
  btn_up: 'up',
  btn_down: 'down',
  btn_left: 'left',
  btn_right: 'right',
  btn_a: '0',
  btn_b: '1',
  btn_x: '2',
  btn_y: '3',
  btn_l1: '4',
  btn_r1: '5',
  btn_l2: '6',
  btn_r2: '7',
  btn_select: '8',
  btn_start: '9',
  btn_hotkey: '8',
  deadzone: 0.15,
});

const REMAP_STEPS_BY_TYPE: Record<string, { key: keyof GamepadMapping; label: string; icon: string; desc: string }[]> = {
  arcade_stick: [
    { key: 'btn_up', label: 'HAUT (Joystick)', icon: '⬆️', desc: 'Poussez le joystick vers le haut' },
    { key: 'btn_down', label: 'BAS (Joystick)', icon: '⬇️', desc: 'Poussez le joystick vers le bas' },
    { key: 'btn_left', label: 'GAUCHE (Joystick)', icon: '⬅️', desc: 'Poussez le joystick vers la gauche' },
    { key: 'btn_right', label: 'DROITE (Joystick)', icon: '➡️', desc: 'Poussez le joystick vers la droite' },
    { key: 'btn_a', label: 'BOUTON 1 (Poing Léger / A)', icon: '🔴', desc: 'Bouton 1 de votre borne arcade' },
    { key: 'btn_b', label: 'BOUTON 2 (Pied Léger / B)', icon: '🔵', desc: 'Bouton 2 de votre borne arcade' },
    { key: 'btn_x', label: 'BOUTON 3 (Poing Moyen / X)', icon: '🟡', desc: 'Bouton 3 de votre borne arcade' },
    { key: 'btn_y', label: 'BOUTON 4 (Pied Moyen / Y)', icon: '🟢', desc: 'Bouton 4 de votre borne arcade' },
    { key: 'btn_l1', label: 'BOUTON 5 (Poing Fort / L1)', icon: '🟣', desc: 'Bouton 5 de votre borne arcade' },
    { key: 'btn_r1', label: 'BOUTON 6 (Pied Fort / R1)', icon: '🟠', desc: 'Bouton 6 de votre borne arcade' },
    { key: 'btn_select', label: 'COIN / CRÉDIT 🪙', icon: '🪙', desc: 'Bouton Insérer une Pièce / Crédit Arcade' },
    { key: 'btn_start', label: 'START 🕹️ (1P Start)', icon: '🚀', desc: 'Bouton Lancer Partie Joueur' },
    { key: 'btn_hotkey', label: 'HOTKEY MENU / QUITTER', icon: '⚙️', desc: 'Bouton pour quitter le jeu vers KaïroOS' },
  ],
  standard: [
    { key: 'btn_up', label: 'D-PAD HAUT', icon: '⬆️', desc: 'Croix directionnelle Haut' },
    { key: 'btn_down', label: 'D-PAD BAS', icon: '⬇️', desc: 'Croix directionnelle Bas' },
    { key: 'btn_left', label: 'D-PAD GAUCHE', icon: '⬅️', desc: 'Croix directionnelle Gauche' },
    { key: 'btn_right', label: 'D-PAD DROITE', icon: '➡️', desc: 'Croix directionnelle Droite' },
    { key: 'btn_a', label: 'BOUTON A (Croix)', icon: '🟢', desc: 'Bouton A (Xbox) ou Croix (PlayStation)' },
    { key: 'btn_b', label: 'BOUTON B (Rond)', icon: '🔴', desc: 'Bouton B (Xbox) ou Rond (PlayStation)' },
    { key: 'btn_x', label: 'BOUTON X (Carré)', icon: '🔵', desc: 'Bouton X (Xbox) ou Carré (PlayStation)' },
    { key: 'btn_y', label: 'BOUTON Y (Triangle)', icon: '🟡', desc: 'Bouton Y (Xbox) ou Triangle (PlayStation)' },
    { key: 'btn_l1', label: 'GÂCHETTE LB / L1', icon: '🔘', desc: 'Bouton supérieur gauche' },
    { key: 'btn_r1', label: 'GÂCHETTE RB / R1', icon: '🔘', desc: 'Bouton supérieur droit' },
    { key: 'btn_l2', label: 'GÂCHETTE LT / L2', icon: '⚡', desc: 'Gâchette basse gauche' },
    { key: 'btn_r2', label: 'GÂCHETTE RT / R2', icon: '⚡', desc: 'Gâchette basse droite' },
    { key: 'btn_select', label: 'SELECT / BACK / VIEW', icon: '⬅️', desc: 'Touche Select ou View' },
    { key: 'btn_start', label: 'START / MENU', icon: '▶️', desc: 'Touche Start ou Options' },
    { key: 'btn_hotkey', label: 'BOUTON GUIDE / HOTKEY', icon: '🏠', desc: 'Bouton central Xbox/PS' },
  ],
  retro_snes: [
    { key: 'btn_up', label: 'CROIX HAUT', icon: '⬆️', desc: 'D-Pad Haut' },
    { key: 'btn_down', label: 'CROIX BAS', icon: '⬇️', desc: 'D-Pad Bas' },
    { key: 'btn_left', label: 'CROIX GAUCHE', icon: '⬅️', desc: 'D-Pad Gauche' },
    { key: 'btn_right', label: 'CROIX DROITE', icon: '➡️', desc: 'D-Pad Droite' },
    { key: 'btn_b', label: 'BOUTON B (Bas)', icon: '🟣', desc: 'Bouton B inférieur' },
    { key: 'btn_a', label: 'BOUTON A (Droite)', icon: '🟣', desc: 'Bouton A droit' },
    { key: 'btn_y', label: 'BOUTON Y (Gauche)', icon: '⚪', desc: 'Bouton Y gauche' },
    { key: 'btn_x', label: 'BOUTON X (Haut)', icon: '⚪', desc: 'Bouton X supérieur' },
    { key: 'btn_l1', label: 'BOUTON L', icon: '🔘', desc: 'Gâchette L' },
    { key: 'btn_r1', label: 'BOUTON R', icon: '🔘', desc: 'Gâchette R' },
    { key: 'btn_select', label: 'SELECT', icon: '➖', desc: 'Bouton Select' },
    { key: 'btn_start', label: 'START', icon: '➕', desc: 'Bouton Start' },
  ],
  retro_sega: [
    { key: 'btn_up', label: 'CROIX HAUT', icon: '⬆️', desc: 'D-Pad Haut' },
    { key: 'btn_down', label: 'CROIX BAS', icon: '⬇️', desc: 'D-Pad Bas' },
    { key: 'btn_left', label: 'CROIX GAUCHE', icon: '⬅️', desc: 'D-Pad Gauche' },
    { key: 'btn_right', label: 'CROIX DROITE', icon: '➡️', desc: 'D-Pad Droite' },
    { key: 'btn_a', label: 'BOUTON A', icon: '⚪', desc: 'Bouton A inférieur gauche' },
    { key: 'btn_b', label: 'BOUTON B', icon: '⚪', desc: 'Bouton B inférieur milieu' },
    { key: 'btn_l1', label: 'BOUTON C', icon: '⚪', desc: 'Bouton C inférieur droit' },
    { key: 'btn_x', label: 'BOUTON X', icon: '⚫', desc: 'Bouton X supérieur gauche' },
    { key: 'btn_y', label: 'BOUTON Y', icon: '⚫', desc: 'Bouton Y supérieur milieu' },
    { key: 'btn_r1', label: 'BOUTON Z', icon: '⚫', desc: 'Bouton Z supérieur droit' },
    { key: 'btn_select', label: 'MODE', icon: '🔘', desc: 'Bouton Mode' },
    { key: 'btn_start', label: 'START', icon: '🔴', desc: 'Bouton Start' },
  ],
};

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
      list.push(found || DEFAULT_MAPPING(i));
    }
    return list;
  });

  const [connectedPads, setConnectedPads] = useState<Gamepad[]>([]);
  const [assignedPadIndices, setAssignedPadIndices] = useState<Record<number, number>>({
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
  });

  const [activeButtons, setActiveButtons] = useState<Set<number>>(new Set());
  const [activeAxes, setActiveAxes] = useState<{ x: number; y: number; rx: number; ry: number }>({
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
  });

  // Mode Assistant d'Assignation (Wizard)
  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentMapping = mappings[selectedPlayer] || DEFAULT_MAPPING(selectedPlayer);
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

  // Polling des manettes physiques
  useEffect(() => {
    let animId: number;

    const pollGamepads = () => {
      const raw = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[] : [];
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

        // Si l'assistant est actif
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
  }, [selectedPlayer, currentAssignedIndex, isWizardActive, wizardStep, currentRemapSteps]);

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

  const handleTypeChange = (type: GamepadMapping['controller_type']) => {
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
    if (onSetPrimaryPlayer) {
      onSetPrimaryPlayer(playerIdx);
    }
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
      next[selectedPlayer] = DEFAULT_MAPPING(selectedPlayer);
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

        {/* Sélecteur de Joueur J1 à J10 avec badge de priorité */}
        <div className="px-6 py-3 bg-white/60 border-b border-retro-dark/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {Array.from({ length: 10 }).map((_, idx) => {
            const assignedPad = connectedPads[assignedPadIndices[idx] ?? idx];
            const isConnected = !!assignedPad;
            const isSelected = selectedPlayer === idx;
            const isPrimary = primaryPlayer === idx;

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPlayer(idx);
                  setIsWizardActive(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold font-arcade transition-all whitespace-nowrap relative ${
                  isSelected
                    ? 'bg-retro-dark text-retro-cream shadow-md scale-105 ring-2 ring-arcade-orange'
                    : 'bg-white/80 text-retro-dark/70 hover:bg-white hover:text-retro-dark'
                }`}
              >
                <CircleDot
                  className={`w-3.5 h-3.5 ${
                    isConnected ? 'text-arcade-green animate-pulse' : 'text-retro-dark/30'
                  }`}
                />
                <span>J{idx + 1}</span>
                {isPrimary && (
                  <span title="Joueur prioritaire sur l'interface" className="text-arcade-yellow text-[11px]">
                    ⭐
                  </span>
                )}
                {isConnected && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-arcade-green/20 text-arcade-green">
                    ON
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Corps Principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ligne 1 : Assignation du Périphérique Physique & Priorité */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Sélecteur de périphérique physique branché */}
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

            {/* Priorité de contrôle interface (J1 prend le dessus) */}
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

          {/* Ligne 2 : Sélecteur de Type de Contrôleur */}
          <div className="bg-white/80 rounded-2xl p-4 border border-retro-dark/10 shadow-sm">
            <span className="text-xs font-bold text-retro-dark/60 uppercase block mb-2">
              Type de Manette / Stick (Adapte l'interface et les émulateurs)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'arcade_stick', label: '🕹️ Borne / Stick Arcade', desc: '6 ou 8 boutons de borne' },
                { id: 'standard', label: '🎮 Manette Moderne', desc: 'Xbox Series / One / PS4 / PS5' },
                { id: 'retro_snes', label: '🕹️ Rétro SNES / NES', desc: 'Croix + 4 Boutons A/B/X/Y' },
                { id: 'retro_sega', label: '🕹️ Rétro Mega Drive', desc: 'Croix + 6 Boutons A/B/C/X/Y/Z' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTypeChange(t.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currentMapping.controller_type === t.id
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

          {/* Ligne 3 : Assistant de Remapping ou Vue Visuelle Adaptée */}
          {isWizardActive ? (
            <div className="bg-arcade-orange/15 border-3 border-arcade-orange rounded-3xl p-8 text-center animate-in zoom-in-95 duration-200 shadow-xl">
              <div className="text-5xl mb-3">{currentRemapSteps[wizardStep]?.icon}</div>
              <h3 className="text-2xl font-bold font-arcade text-retro-dark mb-1">
                {currentRemapSteps[wizardStep]?.label}
              </h3>
              <p className="text-sm text-retro-dark/75 max-w-md mx-auto mb-6">
                {currentRemapSteps[wizardStep]?.desc}
              </p>

              <div className="inline-flex items-center gap-2.5 px-6 py-3 bg-retro-dark text-retro-cream rounded-2xl text-xs font-arcade animate-pulse shadow-lg">
                <Zap className="w-4 h-4 text-arcade-yellow" />
                <span>APPUYEZ SUR LA TOUCHE CORRESPONDANTE SUR VOTRE MANETTE...</span>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    if (wizardStep + 1 < currentRemapSteps.length) {
                      setWizardStep((s) => s + 1);
                    } else {
                      setIsWizardActive(false);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-white text-retro-dark text-xs font-bold hover:bg-black/5 border border-retro-dark/15 shadow-sm"
                >
                  Passer cette touche ⏭️
                </button>
                <button
                  onClick={() => setIsWizardActive(false)}
                  className="px-5 py-2.5 rounded-xl bg-retro-dark/10 text-retro-dark text-xs font-bold hover:bg-retro-dark/20"
                >
                  Annuler l'assistant
                </button>
              </div>
            </div>
          ) : (
            /* Visualiseur Adaptatif en direct & Tableau de mapping */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Visualiseur Adapté selon le Type de Manette */}
              <div className="lg:col-span-5 bg-retro-dark text-retro-cream rounded-3xl p-6 shadow-inner flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-arcade text-xs tracking-wider text-arcade-yellow">
                      TEST VISUEL — {currentMapping.controller_type.toUpperCase().replace('_', ' ')}
                    </h3>
                    <span className="text-[10px] text-white/50">Temps Réel</span>
                  </div>

                  {/* 1. Disposition Borne Arcade */}
                  {currentMapping.controller_type === 'arcade_stick' && (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 relative min-h-[190px] flex items-center justify-between">
                      {/* Joystick Rouge */}
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border-2 border-white/20 bg-black/60 flex items-center justify-center">
                          <div
                            className="w-10 h-10 rounded-full bg-arcade-red shadow-lg transition-transform duration-75 border-2 border-white/40"
                            style={{
                              transform: `translate(${activeAxes.x * 20}px, ${activeAxes.y * 20}px)`,
                            }}
                          />
                        </div>
                      </div>

                      {/* 8 Boutons d'Arcade */}
                      <div className="grid grid-cols-4 gap-2.5">
                        {[
                          { name: '1 (A)', color: 'bg-arcade-red', num: 0 },
                          { name: '3 (X)', color: 'bg-arcade-yellow', num: 2 },
                          { name: '5 (L1)', color: 'bg-arcade-purple', num: 4 },
                          { name: '7 (L2)', color: 'bg-white/40', num: 6 },
                          { name: '2 (B)', color: 'bg-arcade-blue', num: 1 },
                          { name: '4 (Y)', color: 'bg-arcade-green', num: 3 },
                          { name: '6 (R1)', color: 'bg-arcade-orange', num: 5 },
                          { name: '8 (R2)', color: 'bg-white/40', num: 7 },
                        ].map((b, i) => {
                          const isPressed = activeButtons.has(b.num);
                          return (
                            <div
                              key={i}
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${
                                isPressed
                                  ? `${b.color} text-white scale-110 shadow-lg shadow-white/40 border-white`
                                  : 'bg-black/60 text-white/40 border-white/20'
                              }`}
                            >
                              {b.name.split(' ')[0]}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 2. Disposition Manette Moderne (Xbox / PS) */}
                  {currentMapping.controller_type === 'standard' && (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 relative min-h-[190px] flex flex-col justify-between gap-4">
                      {/* Gâchettes LB/LT & RB/RT */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <div className={`px-2 py-1 rounded text-[10px] border ${activeButtons.has(4) ? 'bg-arcade-purple text-white border-white' : 'bg-black/60 text-white/40 border-white/10'}`}>LB</div>
                          <div className={`px-2 py-1 rounded text-[10px] border ${activeButtons.has(6) ? 'bg-arcade-purple text-white border-white' : 'bg-black/60 text-white/40 border-white/10'}`}>LT</div>
                        </div>
                        <div className="flex gap-2">
                          <div className={`px-2 py-1 rounded text-[10px] border ${activeButtons.has(7) ? 'bg-arcade-orange text-white border-white' : 'bg-black/60 text-white/40 border-white/10'}`}>RT</div>
                          <div className={`px-2 py-1 rounded text-[10px] border ${activeButtons.has(5) ? 'bg-arcade-orange text-white border-white' : 'bg-black/60 text-white/40 border-white/10'}`}>RB</div>
                        </div>
                      </div>

                      {/* Sticks & Diamant ABXY */}
                      <div className="flex items-center justify-between">
                        {/* Stick Gauche (L3) */}
                        <div className="w-14 h-14 rounded-full border-2 border-white/20 bg-black/60 flex items-center justify-center">
                          <div
                            className="w-7 h-7 rounded-full bg-arcade-blue border border-white/40 shadow-md"
                            style={{ transform: `translate(${activeAxes.x * 12}px, ${activeAxes.y * 12}px)` }}
                          />
                        </div>

                        {/* Diamant ABXY */}
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <div className={`absolute top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeButtons.has(3) ? 'bg-arcade-yellow text-retro-dark shadow-md' : 'bg-black/60 text-white/40'}`}>Y</div>
                          <div className={`absolute bottom-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeButtons.has(0) ? 'bg-arcade-green text-white shadow-md' : 'bg-black/60 text-white/40'}`}>A</div>
                          <div className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeButtons.has(2) ? 'bg-arcade-blue text-white shadow-md' : 'bg-black/60 text-white/40'}`}>X</div>
                          <div className={`absolute right-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${activeButtons.has(1) ? 'bg-arcade-red text-white shadow-md' : 'bg-black/60 text-white/40'}`}>B</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. Disposition Rétro SNES / Mega Drive */}
                  {(currentMapping.controller_type === 'retro_snes' || currentMapping.controller_type === 'retro_sega') && (
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-5 min-h-[190px] flex items-center justify-between">
                      {/* D-Pad Rétro */}
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className={`absolute top-0 w-6 h-6 rounded ${activeButtons.has(12) ? 'bg-arcade-green text-white' : 'bg-black/60 text-white/40'}`}>⬆️</div>
                        <div className={`absolute bottom-0 w-6 h-6 rounded ${activeButtons.has(13) ? 'bg-arcade-green text-white' : 'bg-black/60 text-white/40'}`}>⬇️</div>
                        <div className={`absolute left-0 w-6 h-6 rounded ${activeButtons.has(14) ? 'bg-arcade-green text-white' : 'bg-black/60 text-white/40'}`}>⬅️</div>
                        <div className={`absolute right-0 w-6 h-6 rounded ${activeButtons.has(15) ? 'bg-arcade-green text-white' : 'bg-black/60 text-white/40'}`}>➡️</div>
                      </div>

                      {/* Boutons Rétro */}
                      <div className="grid grid-cols-3 gap-2">
                        {['A', 'B', 'X', 'Y', 'L', 'R'].map((btn, i) => (
                          <div
                            key={btn}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              activeButtons.has(i) ? 'bg-arcade-purple text-white shadow-md' : 'bg-black/60 text-white/40'
                            }`}
                          >
                            {btn}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Boutons Start & Coin */}
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        activeButtons.has(8)
                          ? 'bg-arcade-yellow text-retro-dark border-white scale-105'
                          : 'bg-black/40 text-white/40 border-white/10'
                      }`}
                    >
                      🪙 COIN / SELECT
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                        activeButtons.has(9)
                          ? 'bg-arcade-green text-white border-white scale-105'
                          : 'bg-black/40 text-white/40 border-white/10'
                      }`}
                    >
                      🕹️ 1P START
                    </div>
                  </div>
                </div>

                {/* Bouton de lancement de l'assistant */}
                <button
                  onClick={() => {
                    setIsWizardActive(true);
                    setWizardStep(0);
                  }}
                  className="w-full mt-4 py-3 rounded-2xl bg-arcade-orange hover:bg-arcade-orange/90 text-white font-bold font-arcade text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>LANCER L'ASSISTANT DE REMAPPING COMPLET</span>
                </button>
              </div>

              {/* Tableau Récapitulatif des Boutons */}
              <div className="lg:col-span-7 bg-white/80 rounded-3xl p-5 border border-retro-dark/10 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-arcade text-xs tracking-wider text-retro-dark mb-3">
                    TABLEAU DE CORRESPONDANCE (SYNCHRONISÉ ÉMULATEURS)
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {currentRemapSteps.map((step) => {
                      const val = (currentMapping as any)[step.key] || 'Non assigné';

                      return (
                        <div
                          key={step.key}
                          className="bg-white p-2.5 rounded-xl border border-retro-dark/10 shadow-2xs flex items-center justify-between"
                        >
                          <div>
                            <div className="text-[11px] font-bold text-retro-dark truncate">
                              {step.label.split(' ')[0]} {step.label.split(' ')[1]}
                            </div>
                            <div className="text-[10px] text-retro-dark/50">{step.icon}</div>
                          </div>
                          <span className="px-2 py-1 rounded bg-retro-warm font-mono text-xs font-bold text-retro-dark">
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-retro-dark/10">
                  <button
                    onClick={handleResetCurrent}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-retro-dark/70 hover:bg-black/5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Réinitialiser J{selectedPlayer + 1}</span>
                  </button>
                  <span className="text-[11px] text-retro-dark/50">
                    Sauvegardé dans <code className="font-mono">config/gamepads.json</code>
                  </span>
                </div>
              </div>
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
