import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ThemeUIProps } from '../types';
import { useGamepad } from '../../hooks';
import { openThemesFolder } from '../../api';
import { AlertCircle, FolderOpen, RefreshCw } from 'lucide-react';

/**
 * =========================================================================
 * UI Thème Personnalisé avec Code Complet (HTML, CSS, JS / Vite / React)
 * =========================================================================
 * Ce composant charge dynamiquement le code d'un thème externe depuis
 * son fichier `index.html` situé dans `themes/<nom-du-theme>/`.
 * 
 * Il expose le pont Kaïro (`window.kairo` + `postMessage`) permettant à
 * n'importe quel développeur d'afficher les jeux, consoles, réagir aux
 * manettes et lancer les jeux en totale liberté.
 */
export const CustomCodeTheme: React.FC<ThemeUIProps> = ({
  systems,
  allGames,
  allFranchises,
  customFranchises,
  enabledSystems,
  enabledModes,
  enabledFranchises,
  twoPlayerGames,
  recentGames,
  fightGames,
  platformGames,
  onSelectGame,
  onLaunchGame,
  onToggleFavorite,
  onOpenSettings,
  onOpenGamepadSettings,
  onOpenAddGame,
  onOpenKioskUnlock,
  gamepadConnected,
  gamepadName,
  isGameRunning,
  appMode,
  settings,
  theme,
  primaryPlayerIndex = 0,
  gamepadMapping,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Conversion des jaquettes et fonds en URLs valides pour Tauri
  const serializedGames = useMemo(() => {
    return allGames.map((g) => ({
      ...g,
      cover_url: g.cover_url
        ? g.cover_url.startsWith('http')
          ? g.cover_url
          : convertFileSrc(g.cover_url)
        : null,
      backdrop_url: g.backdrop_url
        ? g.backdrop_url.startsWith('http')
          ? g.backdrop_url
          : convertFileSrc(g.backdrop_url)
        : null,
    }));
  }, [allGames]);

  // URL du fichier HTML d'entrée
  const themeSrcUrl = useMemo(() => {
    if (!theme.entry_path) return null;
    return convertFileSrc(theme.entry_path);
  }, [theme.entry_path]);

  // Recherche de jeu par ID
  const findGame = useCallback(
    (gameId: string) => {
      return allGames.find((g) => g.id === gameId);
    },
    [allGames]
  );

  // Actions du pont Kaïro
  const handleLaunch = useCallback(
    (gameId: string) => {
      const game = findGame(gameId);
      if (game) onLaunchGame(game);
    },
    [findGame, onLaunchGame]
  );

  const handleSelect = useCallback(
    (gameId: string) => {
      const game = findGame(gameId);
      if (game) onSelectGame(game);
    },
    [findGame, onSelectGame]
  );

  const handleToggleFav = useCallback(
    (gameId: string) => {
      const game = findGame(gameId);
      if (game) onToggleFavorite(game);
    },
    [findGame, onToggleFavorite]
  );

  // Objet Kaïro Bridge injecté dans la fenêtre
  const kairoBridge = useMemo(() => {
    return {
      version: '1.0.0',
      games: serializedGames,
      systems,
      franchises: allFranchises,
      customFranchises,
      enabledSystems,
      enabledModes,
      enabledFranchises,
      favoriteGames: serializedGames.filter((g) => g.favorite),
      twoPlayerGames,
      recentGames,
      fightGames,
      platformGames,
      settings,
      theme,
      appMode,
      gamepadConnected,
      gamepadName,
      isGameRunning,
      launchGame: handleLaunch,
      selectGame: handleSelect,
      toggleFavorite: handleToggleFav,
      openSettings: onOpenSettings,
      openGamepadSettings: onOpenGamepadSettings,
      openAddGame: onOpenAddGame,
      openKioskUnlock: onOpenKioskUnlock,
      // Listeners callbacks
      _gamepadListeners: [] as ((event: any) => void)[],
      onGamepad: function (cb: (event: any) => void) {
        this._gamepadListeners.push(cb);
      },
      _libraryListeners: [] as ((games: any[]) => void)[],
      onLibraryUpdate: function (cb: (games: any[]) => void) {
        this._libraryListeners.push(cb);
      },
    };
  }, [
    serializedGames,
    systems,
    allFranchises,
    customFranchises,
    enabledSystems,
    enabledModes,
    enabledFranchises,
    twoPlayerGames,
    recentGames,
    fightGames,
    platformGames,
    settings,
    theme,
    appMode,
    gamepadConnected,
    gamepadName,
    isGameRunning,
    handleLaunch,
    handleSelect,
    handleToggleFav,
    onOpenSettings,
    onOpenGamepadSettings,
    onOpenAddGame,
    onOpenKioskUnlock,
  ]);

  // Exposition du pont sur window parent
  useEffect(() => {
    (window as any).kairo = kairoBridge;
  }, [kairoBridge]);

  // Transmission des mises à jour aux écouteurs de l'iframe
  useEffect(() => {
    if (kairoBridge._libraryListeners.length > 0) {
      kairoBridge._libraryListeners.forEach((cb) => cb(serializedGames));
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'KAIRO_LIBRARY_UPDATE',
          payload: { games: serializedGames },
        },
        '*'
      );
    }
  }, [serializedGames, kairoBridge]);

  // Envoi d'événements manette au thème via postMessage et callbacks
  const broadcastGamepadEvent = useCallback(
    (action: string, payload?: any) => {
      const eventData = { action, payload };
      if (kairoBridge._gamepadListeners.length > 0) {
        kairoBridge._gamepadListeners.forEach((cb) => cb(eventData));
      }
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'KAIRO_GAMEPAD_EVENT',
            payload: eventData,
          },
          '*'
        );
      }
    },
    [kairoBridge]
  );

  // Hook manette avec priorité
  const gamepadActions = useMemo(
    () => ({
      onNavigate: (dir: 'up' | 'down' | 'left' | 'right') => {
        broadcastGamepadEvent('navigate', { direction: dir });
      },
      onConfirm: () => {
        broadcastGamepadEvent('confirm');
      },
      onBack: () => {
        broadcastGamepadEvent('back');
      },
      onToggleFavorite: () => {
        broadcastGamepadEvent('toggle_favorite');
      },
      onPrevSystem: () => {
        broadcastGamepadEvent('prev_system');
      },
      onNextSystem: () => {
        broadcastGamepadEvent('next_system');
      },
      onMenu: onOpenSettings,
    }),
    [broadcastGamepadEvent, onOpenSettings]
  );

  useGamepad(gamepadActions, true, primaryPlayerIndex, gamepadMapping);

  // Synchronisation directe du pont dans l'iframe
  const syncBridgeToIframe = useCallback(() => {
    if (!iframeRef.current) return;
    try {
      const contentWin = iframeRef.current.contentWindow;
      if (contentWin) {
        (contentWin as any).kairo = kairoBridge;
        contentWin.postMessage(
          {
            type: 'KAIRO_INIT',
            payload: {
              games: serializedGames,
              systems,
              settings,
              theme,
              gamepadConnected,
              gamepadName,
            },
          },
          '*'
        );
      }
    } catch {
      // Ignorer les erreurs d'isolation de domaine éventuelles
    }
  }, [kairoBridge, serializedGames, systems, settings, theme, gamepadConnected, gamepadName]);

  // Écoute des messages postMessage provenant de l'iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const { type, payload } = event.data;

      switch (type) {
        case 'KAIRO_LAUNCH_GAME':
          if (payload?.gameId) handleLaunch(payload.gameId);
          break;
        case 'KAIRO_SELECT_GAME':
          if (payload?.gameId) handleSelect(payload.gameId);
          break;
        case 'KAIRO_TOGGLE_FAVORITE':
          if (payload?.gameId) handleToggleFav(payload.gameId);
          break;
        case 'KAIRO_OPEN_SETTINGS':
          onOpenSettings();
          break;
        case 'KAIRO_OPEN_GAMEPAD':
          onOpenGamepadSettings();
          break;
        case 'KAIRO_OPEN_ADD_GAME':
          if (onOpenAddGame) onOpenAddGame();
          break;
        case 'KAIRO_READY':
          syncBridgeToIframe();
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleLaunch, handleSelect, handleToggleFav, onOpenSettings, onOpenGamepadSettings, onOpenAddGame, syncBridgeToIframe]);

  const handleIframeLoad = () => {
    setLoadError(null);
    syncBridgeToIframe();
  };

  const handleIframeError = () => {
    setLoadError(
      `Impossible de charger le fichier index.html du thème (${theme.entry_path || 'introuvable'}).`
    );
  };

  if (!themeSrcUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black mb-2">Fichier index.html introuvable</h2>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Le thème <strong className="text-white">{theme.name}</strong> est configuré en mode code personnalisé, mais aucun fichier <code className="text-purple-400">index.html</code> n'a été trouvé dans son dossier.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openThemesFolder()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Ouvrir le dossier themes/</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all"
          >
            <span>Changer de thème</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-black select-none">
      {loadError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center text-white">
          <AlertCircle className="w-10 h-10 text-rose-500 mb-3" />
          <h3 className="text-base font-bold text-rose-400 mb-1">Erreur de chargement du thème</h3>
          <p className="text-xs text-slate-400 max-w-md mb-4">{loadError}</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (iframeRef.current) {
                  iframeRef.current.src = themeSrcUrl;
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold border border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Réessayer</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-md"
            >
              Paramètres
            </button>
          </div>
        </div>
      )}

      {/* Frame principale du thème personnalisé */}
      <iframe
        ref={iframeRef}
        src={themeSrcUrl}
        title={theme.name}
        className="w-full h-full border-0 block"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads"
      />
    </div>
  );
};
