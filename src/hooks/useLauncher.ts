import { useState, useEffect, useCallback, useRef } from 'react';
import { Game, LaunchStatus } from '../types';
import { launchGame as apiLaunchGame, getLauncherStatus, killRunningGame as apiKillGame } from '../api';

export function useLauncher(onGameFinished?: () => void) {
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>({ is_running: false });
  const isLaunchingRef = useRef<boolean>(false);
  const lastLaunchTimeRef = useRef<number>(0);

  const launch = useCallback(async (game: Game) => {
    const now = Date.now();
    // Verrou anti-spam : bloque tout lancement multiple dans un intervalle de 1500ms
    if (isLaunchingRef.current || (now - lastLaunchTimeRef.current < 1500)) {
      console.warn('[useLauncher] Launch ignoré : lancement déjà en cours ou trop rapide');
      return;
    }
    isLaunchingRef.current = true;
    lastLaunchTimeRef.current = now;

    try {
      const status = await apiLaunchGame(game.id);
      setLaunchStatus(status);
    } catch (err: any) {
      console.error('[useLauncher] Launch error:', err);
      const errMsg = err?.message || String(err);
      // Si le jeu est déjà en cours d'exécution, ne pas afficher d'alerte agressive
      if (errMsg.includes('AlreadyRunning') || errMsg.includes('déjà en cours')) {
        console.warn('[useLauncher] Jeu déjà en cours d\'exécution, doublon ignoré');
        setLaunchStatus({
          is_running: true,
          current_game_id: game.id,
          current_game_title: game.title,
        });
        return;
      }
      // En environnement Tauri natif, informer l'utilisateur de l'erreur exacte
      if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
        alert(`Impossible de lancer le jeu :\n${errMsg}`);
        setLaunchStatus({ is_running: false });
        return;
      }
      // Simulation dans le navigateur web pur
      setLaunchStatus({
        is_running: true,
        current_game_id: game.id,
        current_game_title: game.title,
        current_system_id: game.system_id,
        pid: 12345,
        start_time: new Date().toISOString(),
        elapsed_seconds: 0,
      });
    } finally {
      // Libérer le verrou après un délai sécurisé
      setTimeout(() => {
        isLaunchingRef.current = false;
      }, 1500);
    }
  }, []);


  const kill = useCallback(async () => {
    try {
      await apiKillGame();
    } catch (err) {
      console.warn('[useLauncher] Kill fallback:', err);
    }
    setLaunchStatus({ is_running: false });
    onGameFinished?.();
  }, [onGameFinished]);

  // Polling process status while a game is running
  useEffect(() => {
    let interval: any;
    if (launchStatus.is_running) {
      interval = setInterval(async () => {
        try {
          const status = await getLauncherStatus();
          setLaunchStatus(status);
          if (!status.is_running) {
            onGameFinished?.();
          }
        } catch (err) {
          console.error('[useLauncher] Polling error:', err);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [launchStatus.is_running, onGameFinished]);

  return {
    launchStatus,
    isGameRunning: launchStatus.is_running,
    launch,
    kill,
  };
}
