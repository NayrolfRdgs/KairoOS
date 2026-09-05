import { useEffect, useRef, useState } from 'react';
import { GamepadActions, GamepadMapping } from '../types';

function isPriorityGamepad(id: string): boolean {
  if (!id) return false;
  const s = id.toLowerCase();
  return (
    s.includes('xbox') ||
    s.includes('x-box') ||
    s.includes('xinput') ||
    s.includes('playstation') ||
    s.includes('dualshock') ||
    s.includes('dualsense') ||
    s.includes('sony') ||
    s.includes('ps5') ||
    s.includes('ps4') ||
    s.includes('pro controller') ||
    s.includes('usb') ||
    s.includes('controller') ||
    s.includes('gamepad')
  );
}

export function useGamepad(
  actions: GamepadActions,
  enabled: boolean = true,
  primaryPadIndex: number = 0,
  mapping?: GamepadMapping
) {
  const [connectedGamepadName, setConnectedGamepadName] = useState<string | null>(null);
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const activePadIndexRef = useRef<number>(primaryPadIndex);

  useEffect(() => {
    activePadIndexRef.current = primaryPadIndex;
  }, [primaryPadIndex]);

  const prevButtonsRef = useRef<boolean[]>([]);
  const buttonMustReleaseRef = useRef<Set<number>>(new Set());
  const buttonCooldownRef = useRef<Record<number, number>>({});
  const lastNavTimeRef = useRef<number>(0);
  const keyCooldownRef = useRef<Record<string, number>>({});
  const navRepeatDelay = 180;

  // Détection du combo Kiosk Unlock (LB + RB + Start maintenu 3s)
  const comboStartTimeRef = useRef<number | null>(null);
  const comboTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      // Priorité automatique si manette USB reconnue (Xbox, PS4, PS5, etc.) ou si aucune manette active
      if (isPriorityGamepad(e.gamepad.id) || connectedGamepadName === null) {
        activePadIndexRef.current = e.gamepad.index;
      }
      setConnectedGamepadName((prev) => (prev !== e.gamepad.id ? e.gamepad.id : prev));
      // Pré-enregistrer les boutons déjà enfoncés à la connexion pour exiger leur relâchement
      if (e.gamepad.buttons) {
        e.gamepad.buttons.forEach((b, idx) => {
          if (b.pressed || b.value > 0.4) {
            buttonMustReleaseRef.current.add(idx);
          }
        });
      }
    };

    const handleGamepadDisconnected = (_e: GamepadEvent) => {
      const remainingGamepads = navigator.getGamepads
        ? (Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[])
        : [];

      if (remainingGamepads.length > 0) {
        // Sélectionner la meilleure manette restante (priorité aux manettes Xbox / PS / USB)
        const bestRemaining =
          remainingGamepads.find((p) => isPriorityGamepad(p.id)) || remainingGamepads[0];
        activePadIndexRef.current = bestRemaining.index;
        setConnectedGamepadName((prev) => (prev !== bestRemaining.id ? bestRemaining.id : prev));
      } else {
        setConnectedGamepadName(null);
      }
      prevButtonsRef.current = [];
      buttonMustReleaseRef.current.clear();
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    let animationFrameId: number;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads
        ? (Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[])
        : [];

      if (gamepads.length > 0) {
        // Priorité d'entrée active : si n'importe quelle manette branchée reçoit une action utilisateur (bouton ou stick),
        // elle prend instantanément le contrôle principal.
        let padWithInput: Gamepad | null = null;
        for (const pad of gamepads) {
          const hasButtonPressed = pad.buttons.some((b) => b.pressed || b.value > 0.4);
          const hasAxisMoved = pad.axes.some((a) => Math.abs(a) > 0.5);
          if (hasButtonPressed || hasAxisMoved) {
            padWithInput = pad;
            break;
          }
        }

        if (padWithInput && padWithInput.index !== activePadIndexRef.current) {
          activePadIndexRef.current = padWithInput.index;
          setConnectedGamepadName((prev) => (prev !== padWithInput!.id ? padWithInput!.id : prev));
        }

        // Récupération de la manette active en cours
        let primary = gamepads.find((p) => p.index === activePadIndexRef.current);
        if (!primary) {
          primary = gamepads.find((p) => isPriorityGamepad(p.id)) || gamepads[0];
          if (primary) {
            activePadIndexRef.current = primary.index;
          }
        }

        if (primary) {
          setConnectedGamepadName((prev) => (prev !== primary!.id ? primary!.id : prev));

          const now = performance.now();
          const currentButtons = primary.buttons.map((b) => b.pressed || b.value > 0.4);

          // Si c'est la première lecture, initialiser l'état précédent sans déclencher d'action
          if (prevButtonsRef.current.length === 0) {
            prevButtonsRef.current = currentButtons;
            currentButtons.forEach((pressed, idx) => {
              if (pressed) buttonMustReleaseRef.current.add(idx);
            });
          }

          const prev = prevButtonsRef.current;

          // Mise à jour de l'état "doit être relâché" : dès qu'un bouton n'est plus pressé physiquement, on l'autorise à nouveau
          currentButtons.forEach((pressed, idx) => {
            if (!pressed) {
              buttonMustReleaseRef.current.delete(idx);
            }
          });

          const btnA = mapping?.btn_a && !isNaN(Number(mapping.btn_a)) ? Number(mapping.btn_a) : 0;
          const btnB = mapping?.btn_b && !isNaN(Number(mapping.btn_b)) ? Number(mapping.btn_b) : 1;
          const btnX = mapping?.btn_x && !isNaN(Number(mapping.btn_x)) ? Number(mapping.btn_x) : 2;
          const btnY = mapping?.btn_y && !isNaN(Number(mapping.btn_y)) ? Number(mapping.btn_y) : 3;
          const btnL1 = mapping?.btn_l1 && !isNaN(Number(mapping.btn_l1)) ? Number(mapping.btn_l1) : 4;
          const btnR1 = mapping?.btn_r1 && !isNaN(Number(mapping.btn_r1)) ? Number(mapping.btn_r1) : 5;
          const btnSelect = mapping?.btn_select && !isNaN(Number(mapping.btn_select)) ? Number(mapping.btn_select) : 8;
          const btnStart = mapping?.btn_start && !isNaN(Number(mapping.btn_start)) ? Number(mapping.btn_start) : 9;

          // 1. Détection universelle des combos
          const lbPressed = currentButtons[btnL1] || false;
          const rbPressed = currentButtons[btnR1] || false;
          const startPressed = currentButtons[btnStart] || false;
          const coinPressed = currentButtons[btnSelect] || false; // Select / Coin 🪙

          // Combo Arcade Quitter le jeu : Coin + 1P Start
          if (coinPressed && startPressed) {
            actionsRef.current.onCoinStartExit?.();
          }

          if (lbPressed && rbPressed && startPressed) {
            if (comboStartTimeRef.current === null) {
              comboStartTimeRef.current = now;
              comboTriggeredRef.current = false;
            } else if (now - comboStartTimeRef.current >= 3000 && !comboTriggeredRef.current) {
              comboTriggeredRef.current = true;
              actionsRef.current.onKioskUnlockCombo?.();
            }
          } else {
            comboStartTimeRef.current = null;
            comboTriggeredRef.current = false;
          }

          // 2. Actions normales si activé
          if (enabledRef.current) {
            // Détection stricte de transition : appuyé MAINTENANT + relâché AVANT + NON VERROUILLÉ + DÉBOUNCE
            const triggerIfJustPressed = (index: number, callback?: () => void) => {
              if (!callback) return;
              const isPhysicallyPressed = currentButtons[index];
              const wasPhysicallyPressed = prev[index];
              const mustRelease = buttonMustReleaseRef.current.has(index);
              const lastTime = buttonCooldownRef.current[index] || 0;

              // Déclenchement UNIQUEMENT lors du front montant (relâché -> appuyé)
              if (isPhysicallyPressed && !wasPhysicallyPressed && !mustRelease && (now - lastTime > 250)) {
                buttonMustReleaseRef.current.add(index);
                buttonCooldownRef.current[index] = now;
                callback();
              }
            };

            triggerIfJustPressed(btnA, () => actionsRef.current.onConfirm?.());
            triggerIfJustPressed(btnB, () => actionsRef.current.onBack?.());
            triggerIfJustPressed(btnX, () => actionsRef.current.onToggleFavorite?.());
            triggerIfJustPressed(btnY, () => actionsRef.current.onDetails?.());
            if (!rbPressed && !startPressed) triggerIfJustPressed(btnL1, () => actionsRef.current.onPrevSystem?.());
            if (!lbPressed && !startPressed) triggerIfJustPressed(btnR1, () => actionsRef.current.onNextSystem?.());
            if (!lbPressed && !rbPressed) triggerIfJustPressed(btnStart, () => actionsRef.current.onMenu?.());

            // Navigation au D-Pad / Stick avec répétition contrôlée
            if (now - lastNavTimeRef.current > navRepeatDelay) {
              const dpadUp = currentButtons[12] || primary.axes[1] < -0.5;
              const dpadDown = currentButtons[13] || primary.axes[1] > 0.5;
              const dpadLeft = currentButtons[14] || primary.axes[0] < -0.5;
              const dpadRight = currentButtons[15] || primary.axes[0] > 0.5;

              if (dpadUp) {
                actionsRef.current.onNavigate?.('up');
                lastNavTimeRef.current = now;
              } else if (dpadDown) {
                actionsRef.current.onNavigate?.('down');
                lastNavTimeRef.current = now;
              } else if (dpadLeft) {
                actionsRef.current.onNavigate?.('left');
                lastNavTimeRef.current = now;
              } else if (dpadRight) {
                actionsRef.current.onNavigate?.('right');
                lastNavTimeRef.current = now;
              }
            }
          }

          // Toujours mémoriser l'état des boutons pour maintenir la continuité physique
          prevButtonsRef.current = currentButtons;
        }
      } else {
        setConnectedGamepadName(null);
        prevButtonsRef.current = [];
        buttonMustReleaseRef.current.clear();
      }

      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    animationFrameId = requestAnimationFrame(pollGamepad);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Raccourci clavier de déverrouillage Kiosk universel : Ctrl+Shift+K
      if (e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k')) {
        e.preventDefault();
        actionsRef.current.onKioskUnlockCombo?.();
        return;
      }

      if (!enabledRef.current) return;
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Anti-répétition automatique du navigateur pour les touches d'action
      if (e.repeat) {
        if (['Enter', 'Escape', 'Backspace', ' ', 'f', 'F', 'y', 'Y', 'a', 'A', 'e', 'E', 'm', 'M'].includes(e.key)) {
          e.preventDefault();
          return;
        }
      }

      const now = performance.now();
      const triggerKeyAction = (key: string, callback?: () => void) => {
        if (!callback) return;
        const last = keyCooldownRef.current[key] || 0;
        if (now - last < 250) return;
        keyCooldownRef.current[key] = now;
        callback();
      };

      switch (e.key) {
        case 'ArrowUp':
        case 'z':
        case 'Z':
          e.preventDefault();
          actionsRef.current.onNavigate?.('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          actionsRef.current.onNavigate?.('down');
          break;
        case 'ArrowLeft':
        case 'q':
        case 'Q':
          e.preventDefault();
          actionsRef.current.onNavigate?.('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          actionsRef.current.onNavigate?.('right');
          break;
        case 'Enter':
          e.preventDefault();
          triggerKeyAction('Enter', () => actionsRef.current.onConfirm?.());
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          triggerKeyAction('Escape', () => actionsRef.current.onBack?.());
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          triggerKeyAction('f', () => actionsRef.current.onToggleFavorite?.());
          break;
        case ' ':
        case 'y':
        case 'Y':
          e.preventDefault();
          triggerKeyAction('y', () => actionsRef.current.onDetails?.());
          break;
        case 'a':
        case 'A':
        case 'PageUp':
          e.preventDefault();
          triggerKeyAction('a', () => actionsRef.current.onPrevSystem?.());
          break;
        case 'e':
        case 'E':
        case 'PageDown':
          e.preventDefault();
          triggerKeyAction('e', () => actionsRef.current.onNextSystem?.());
          break;
        case 'm':
        case 'M':
        case 'F1':
          e.preventDefault();
          triggerKeyAction('m', () => actionsRef.current.onMenu?.());
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return {
    isConnected: connectedGamepadName !== null,
    gamepadName: connectedGamepadName,
  };
}
