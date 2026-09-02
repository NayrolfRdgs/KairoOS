import { useEffect, useRef, useState } from 'react';

export interface GamepadActions {
  onNavigate?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onConfirm?: () => void;
  onBack?: () => void;
  onToggleFavorite?: () => void;
  onDetails?: () => void;
  onPrevSystem?: () => void;
  onNextSystem?: () => void;
  onMenu?: () => void;
}

export function useGamepad(actions: GamepadActions, enabled: boolean = true, primaryPadIndex: number = 0) {
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
      const gamepads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[] : [];
      
      if (gamepads.length > 0) {
        const primary = gamepads[primaryIndexRef.current] || gamepads[0];
        setConnectedGamepadName(primary.id);

        // Si désactivé (ex: modale ouverte ou en arrière-plan), ne rien déclencher
        if (enabledRef.current && primary) {
          const now = performance.now();
          const prev = prevButtonsRef.current;
          const currentButtons = primary.buttons.map((b) => b.pressed || b.value > 0.4);

          const isJustPressed = (index: number) => currentButtons[index] && !prev[index];

          if (isJustPressed(0)) actionsRef.current.onConfirm?.();
          if (isJustPressed(1)) actionsRef.current.onBack?.();
          if (isJustPressed(2)) actionsRef.current.onToggleFavorite?.();
          if (isJustPressed(3)) actionsRef.current.onDetails?.();
          if (isJustPressed(4)) actionsRef.current.onPrevSystem?.();
          if (isJustPressed(5)) actionsRef.current.onNextSystem?.();
          if (isJustPressed(9)) actionsRef.current.onMenu?.();

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
      } else {
        setConnectedGamepadName(null);
        prevButtonsRef.current = [];
      }

      animationFrameId = requestAnimationFrame(pollGamepad);
    };

    animationFrameId = requestAnimationFrame(pollGamepad);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Si désactivé ou dans un input, bloquer les raccourcis globaux
      if (!enabledRef.current) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
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
