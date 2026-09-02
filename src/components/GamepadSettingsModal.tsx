import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Gamepad2, CheckCircle2, RotateCcw, Save, Zap, CircleDot, Play } from 'lucide-react';
import { GamepadMapping } from '../types';

interface GamepadSettingsModalProps {
  onClose: () => void;
  onSaveMappings?: (mappings: GamepadMapping[]) => Promise<void>;
  initialMappings?: GamepadMapping[];
}

const DEFAULT_MAPPING = (playerIndex: number): GamepadMapping => ({
  player_index: playerIndex,
  device_name: `Contrôleur Joueur ${playerIndex + 1}`,
  device_id: `pad_${playerIndex}`,
  controller_type: 'arcade_stick',
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

const REMAP_STEPS: { key: keyof GamepadMapping; label: string; icon: string; desc: string }[] = [
  { key: 'btn_up', label: 'HAUT (Direction)', icon: '⬆️', desc: 'Poussez le joystick vers le haut ou flèche haut' },
  { key: 'btn_down', label: 'BAS (Direction)', icon: '⬇️', desc: 'Poussez le joystick vers le bas ou flèche bas' },
  { key: 'btn_left', label: 'GAUCHE (Direction)', icon: '⬅️', desc: 'Poussez le joystick vers la gauche' },
  { key: 'btn_right', label: 'DROITE (Direction)', icon: '➡️', desc: 'Poussez le joystick vers la droite' },
  { key: 'btn_a', label: 'BOUTON 1 / A (Poing Léger / Saut)', icon: '🔴', desc: 'Bouton 1 de votre borne arcade ou bouton A' },
  { key: 'btn_b', label: 'BOUTON 2 / B (Pied Léger / Attaque)', icon: '🔵', desc: 'Bouton 2 ou bouton B' },
  { key: 'btn_x', label: 'BOUTON 3 / X (Poing Moyen / Tir)', icon: '🟡', desc: 'Bouton 3 ou bouton X' },
  { key: 'btn_y', label: 'BOUTON 4 / Y (Pied Moyen / Spécial)', icon: '🟢', desc: 'Bouton 4 ou bouton Y' },
  { key: 'btn_l1', label: 'BOUTON 5 / L1 (Poing Fort / L)', icon: '🟣', desc: 'Bouton 5 ou gâchette gauche' },
  { key: 'btn_r1', label: 'BOUTON 6 / R1 (Pied Fort / R)', icon: '🟠', desc: 'Bouton 6 ou gâchette droite' },
  { key: 'btn_select', label: 'COIN / CRÉDIT 🪙 (Select)', icon: '🪙', desc: 'Insérer une pièce / Crédit arcade' },
  { key: 'btn_start', label: 'START 🕹️ (1P / 2P Start)', icon: '🚀', desc: 'Lancer la partie joueur' },
  { key: 'btn_hotkey', label: 'HOTKEY MENU / QUITTER', icon: '⚙️', desc: 'Bouton combiné pour quitter le jeu' },
];

export const GamepadSettingsModal: React.FC<GamepadSettingsModalProps> = ({
  onClose,
  onSaveMappings,
  initialMappings = [],
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<number>(0); // 0 to 9
  const [mappings, setMappings] = useState<GamepadMapping[]>(() => {
    const list: GamepadMapping[] = [];
    for (let i = 0; i < 10; i++) {
      const found = initialMappings.find((m) => m.player_index === i);
      list.push(found || DEFAULT_MAPPING(i));
    }
    return list;
  });

  const [connectedPads, setConnectedPads] = useState<(Gamepad | null)[]>([]);
  const [activeButtons, setActiveButtons] = useState<Set<number>>(new Set());
  const [activeAxes, setActiveAxes] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mode Assistant d'Assignation (Wizard)
  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);
  const [wizardStep, setWizardStep] = useState<number>(0);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const currentMapping = mappings[selectedPlayer] || DEFAULT_MAPPING(selectedPlayer);
  const activeGamepad = connectedPads[selectedPlayer] || null;

  // Polling des manettes physiques
  useEffect(() => {
    let animId: number;

    const pollGamepads = () => {
      const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : [];
      setConnectedPads(pads);

      const targetPad = pads[selectedPlayer];
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
        setActiveAxes({ x, y });

        // Si l'assistant de configuration est actif
        if (isWizardActive) {
          handleWizardInput(targetPad, pressed, x, y);
        }
      } else {
        setActiveButtons(new Set());
        setActiveAxes({ x: 0, y: 0 });
      }

      animId = requestAnimationFrame(pollGamepads);
    };

    animId = requestAnimationFrame(pollGamepads);
    return () => cancelAnimationFrame(animId);
  }, [selectedPlayer, isWizardActive, wizardStep]);

  const lastPressedRef = useRef<number | null>(null);

  const handleWizardInput = useCallback(
    (pad: Gamepad, pressed: Set<number>, axisX: number, axisY: number) => {
      const currentStep = REMAP_STEPS[wizardStep];
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
        // Enregistrer la touche pour le step courant
        setMappings((prev) => {
          const next = [...prev];
          const target = { ...next[selectedPlayer] };
          (target as any)[currentStep.key] = detectedInput;
          target.device_name = pad.id || target.device_name;
          next[selectedPlayer] = target;
          return next;
        });

        // Passer à l'étape suivante
        setTimeout(() => {
          if (wizardStep + 1 < REMAP_STEPS.length) {
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
    [wizardStep, selectedPlayer]
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-retro-dark/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-retro-panel border-4 border-retro-dark/20 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b-2 border-retro-dark/10 flex items-center justify-between bg-retro-warm/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-arcade-orange text-white rounded-xl shadow-md">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-arcade tracking-wider text-retro-dark">
                GESTIONNAIRE DE CONTRÔLEURS & ARCADE STICKS
              </h2>
              <p className="text-xs text-retro-dark/60">
                Configuration multi-joueurs (1 à 10 manettes) & synchronisation automatique avec tous les émulateurs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-retro-dark/60 hover:text-retro-dark hover:bg-black/5 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sélecteur de Joueur (J1 à J10) */}
        <div className="px-6 py-3 bg-white/40 border-b border-retro-dark/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {Array.from({ length: 10 }).map((_, idx) => {
            const isConnected = !!connectedPads[idx];
            const isSelected = selectedPlayer === idx;

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedPlayer(idx);
                  setIsWizardActive(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-arcade transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-retro-dark text-retro-cream shadow-md scale-105'
                    : 'bg-white/80 text-retro-dark/70 hover:bg-white hover:text-retro-dark'
                }`}
              >
                <CircleDot
                  className={`w-3.5 h-3.5 ${
                    isConnected ? 'text-arcade-green animate-pulse' : 'text-retro-dark/30'
                  }`}
                />
                <span>J{idx + 1}</span>
                {isConnected && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-arcade-green/20 text-arcade-green">
                    ON
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Corps Principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Statut & Type de manette */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Info Périphérique */}
            <div className="bg-white/80 rounded-xl p-4 border border-retro-dark/10 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-retro-dark/60 uppercase">Périphérique J{selectedPlayer + 1}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    activeGamepad
                      ? 'bg-arcade-green/20 text-arcade-green'
                      : 'bg-retro-dark/10 text-retro-dark/40'
                  }`}
                >
                  {activeGamepad ? 'Connecté' : 'Non Détecté'}
                </span>
              </div>
              <p className="font-bold text-sm text-retro-dark mt-2 truncate">
                {activeGamepad ? activeGamepad.id : 'Branchez votre manette ou stick arcade'}
              </p>
            </div>

            {/* Sélecteur de Type */}
            <div className="md:col-span-2 bg-white/80 rounded-xl p-4 border border-retro-dark/10 shadow-sm">
              <span className="text-xs font-bold text-retro-dark/60 uppercase block mb-2">
                Type de Contrôleur
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'arcade_stick', label: '🕹️ Borne / Stick Arcade', desc: '6 ou 8 boutons' },
                  { id: 'standard', label: '🎮 Manette Moderne', desc: 'Xbox / PlayStation' },
                  { id: 'retro_snes', label: '🕹️ Rétro 4 Boutons', desc: 'SNES / GBA' },
                  { id: 'retro_sega', label: '🕹️ Rétro 6 Boutons', desc: 'Mega Drive / Arcade' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTypeChange(t.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      currentMapping.controller_type === t.id
                        ? 'border-arcade-orange bg-arcade-orange/10 font-bold text-retro-dark shadow-sm'
                        : 'border-retro-dark/10 bg-white hover:bg-black/5 text-retro-dark/70'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[10px] text-retro-dark/50">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mode Assistant ou Vue Tableau de Bord */}
          {isWizardActive ? (
            <div className="bg-arcade-orange/10 border-2 border-arcade-orange rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200">
              <div className="text-4xl mb-2">{REMAP_STEPS[wizardStep]?.icon}</div>
              <h3 className="text-xl font-bold font-arcade text-retro-dark mb-1">
                {REMAP_STEPS[wizardStep]?.label}
              </h3>
              <p className="text-sm text-retro-dark/70 max-w-md mx-auto mb-4">
                {REMAP_STEPS[wizardStep]?.desc}
              </p>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-retro-dark text-retro-cream rounded-xl text-xs font-arcade animate-pulse">
                <Zap className="w-4 h-4 text-arcade-yellow" />
                <span>Appuyez sur la touche physique correspondante...</span>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    if (wizardStep + 1 < REMAP_STEPS.length) {
                      setWizardStep((s) => s + 1);
                    } else {
                      setIsWizardActive(false);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-retro-dark text-xs font-bold hover:bg-black/5 border border-retro-dark/10"
                >
                  Passer cette touche ⏭️
                </button>
                <button
                  onClick={() => setIsWizardActive(false)}
                  className="px-4 py-2 rounded-xl bg-retro-dark/10 text-retro-dark text-xs font-bold hover:bg-retro-dark/20"
                >
                  Annuler l'assistant
                </button>
              </div>
            </div>
          ) : (
            /* Visualiseur Borne Arcade en direct & Tableau de mapping */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Visualiseur Arcade Stick */}
              <div className="lg:col-span-5 bg-retro-dark text-retro-cream rounded-2xl p-6 shadow-inner flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-arcade text-xs tracking-wider text-arcade-yellow">
                      TEST VISUEL DU CONTRÔLEUR EN DIRECT
                    </h3>
                    <span className="text-[10px] text-white/50">Interactif</span>
                  </div>

                  {/* Panneau Borne Arcade Visuel */}
                  <div className="bg-black/40 border border-white/10 rounded-xl p-5 relative min-h-[180px] flex items-center justify-between">
                    {/* Joystick Virtuel */}
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

                    {/* Boutons d'Arcade (Disposition 6 ou 8 boutons) */}
                    <div className="grid grid-cols-4 gap-2.5">
                      {[
                        { btn: 'btn_a', name: '1 (A)', color: 'bg-arcade-red', num: 0 },
                        { btn: 'btn_x', name: '3 (X)', color: 'bg-arcade-yellow', num: 2 },
                        { btn: 'btn_l1', name: '5 (L1)', color: 'bg-arcade-purple', num: 4 },
                        { btn: 'btn_l2', name: '7 (L2)', color: 'bg-white/40', num: 6 },
                        { btn: 'btn_b', name: '2 (B)', color: 'bg-arcade-blue', num: 1 },
                        { btn: 'btn_y', name: '4 (Y)', color: 'bg-arcade-green', num: 3 },
                        { btn: 'btn_r1', name: '6 (R1)', color: 'bg-arcade-orange', num: 5 },
                        { btn: 'btn_r2', name: '8 (R2)', color: 'bg-white/40', num: 7 },
                      ].map((b, i) => {
                        const isPressed = activeButtons.has(b.num);
                        return (
                          <div
                            key={i}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${
                              isPressed
                                ? `${b.color} text-white scale-110 shadow-lg shadow-white/30 border-white`
                                : 'bg-black/60 text-white/40 border-white/20'
                            }`}
                          >
                            {b.name.split(' ')[0]}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Boutons Start & Coin */}
                  <div className="flex items-center justify-center gap-6 mt-4">
                    <div
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        activeButtons.has(8)
                          ? 'bg-arcade-yellow text-retro-dark border-white scale-105'
                          : 'bg-black/40 text-white/40 border-white/10'
                      }`}
                    >
                      🪙 COIN (Select)
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
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
                  className="w-full mt-4 py-3 rounded-xl bg-arcade-orange hover:bg-arcade-orange/90 text-white font-bold font-arcade text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>LANCER L'ASSISTANT DE REMAPPING COMPLET</span>
                </button>
              </div>

              {/* Tableau Récapitulatif des Boutons */}
              <div className="lg:col-span-7 bg-white/80 rounded-2xl p-5 border border-retro-dark/10 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-arcade text-xs tracking-wider text-retro-dark mb-3">
                    TABLEAU DE CORRESPONDANCE (ÉMULATEURS)
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {REMAP_STEPS.map((step) => {
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
                    Les réglages sont sauvegardés dans <code className="font-mono">config/gamepads.json</code>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-retro-dark/10 bg-retro-warm/60 flex items-center justify-between">
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
              className="px-4 py-2.5 rounded-xl bg-white border border-retro-dark/15 text-xs font-bold text-retro-dark hover:bg-black/5 transition-all"
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
