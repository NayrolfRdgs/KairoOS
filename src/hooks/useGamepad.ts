import { useEffect, useRef, useState } from 'react';
import { GamepadActions, GamepadMapping } from '../types';

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

  const primaryIndexRef = useRef(primaryPadIndex);
  primaryIndexRef.current = primaryPadIndex;

  const prevButtonsRef = useRef<boolean[]>([]);
  const lastNavTimeRef = useRef<number>(0);
  const navRepeatDelay = 180;

  // Détection du combo Kiosk Unlock (LB + RB + Start maintenu 3s)
  const comboStartTimeRef = useRef<number | null>(null);
  const comboTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      setConnectedGamepadName(e.gamepad.id);
    };

    const handleGamepadDisconnected = () => {
      setConnectedGamepadName(null);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    let animationFrameId: number;

    const pollGamepad = () => {
      const gamepads = navigator.getGamepads
        ? (Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[])
        : [];

      if (gamepads.length > 0) {
        const primary = gamepads[primaryIndexRef.current] || gamepads[0];
        setConnectedGamepadName(primary.id);

        if (primary) {
          const now = performance.now();
          const prev = prevButtonsRef.current;
          const currentButtons = primary.buttons.map((b) => b.pressed || b.value > 0.4);

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
            const isJustPressed = (index: number) => currentButtons[index] && !prev[index];

            if (isJustPressed(btnA)) actionsRef.current.onConfirm?.();
            if (isJustPressed(btnB)) actionsRef.current.onBack?.();
            if (isJustPressed(btnX)) actionsRef.current.onToggleFavorite?.();
            if (isJustPressed(btnY)) actionsRef.current.onDetails?.();
            if (isJustPressed(btnL1) && !rbPressed && !startPressed) actionsRef.current.onPrevSystem?.();
            if (isJustPressed(btnR1) && !lbPressed && !startPressed) actionsRef.current.onNextSystem?.();
            if (isJustPressed(btnStart) && !lbPressed && !rbPressed) actionsRef.current.onMenu?.();

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

            prevButtonsRef.current = currentButtons;
          } else {
            prevButtonsRef.current = [];
          }
        }
      } else {
        setConnectedGamepadName(null);
        prevButtonsRef.current = [];
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
          actionsRef.current.onConfirm?.();
          break;
        case 'Escape':
        case 'Backspace':
          e.preventDefault();
          actionsRef.current.onBack?.();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          actionsRef.current.onToggleFavorite?.();
          break;
        case ' ':
        case 'y':
        case 'Y':
          e.preventDefault();
          actionsRef.current.onDetails?.();
          break;
        case 'a':
        case 'A':
        case 'PageUp':
          e.preventDefault();
          actionsRef.current.onPrevSystem?.();
          break;
        case 'e':
        case 'E':
        case 'PageDown':
          e.preventDefault();
          actionsRef.current.onNextSystem?.();
          break;
        case 'm':
        case 'M':
        case 'F1':
          e.preventDefault();
          actionsRef.current.onMenu?.();
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
