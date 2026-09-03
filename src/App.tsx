import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { ArcadeCatalog } from './components/games';
import {
  GameDetailsModal,
  SettingsModal,
  GamepadSettingsModal,
  ScannerModal,
  FranchiseOrganizerModal,
  KioskUnlockModal,
  AddGameModal,
} from './components/modals';
import { LaunchOverlay } from './components/overlay';
import { useLibrary, useLauncher, useAppSettings, useGamepad } from './hooks';
import { Game, GameConfig, LocalGameMetadata } from './types';
import {
  getGameDetails,
  updateGameConfig,
  saveLocalGameMetadata,
  organizeGameIntoFranchise,
  scanRomsDirectory,
  addManualGame,
  purgeMissingGames,
} from './api';

export const App: React.FC = () => {
  // 1. Hooks Métier
  const {
    settings,
    saveSettings,
    toggleFullscreen,
    gamepadMappings,
    saveGamepadMappings,
    primaryPlayerIndex,
    setPrimaryPlayerIndex,
    appMode,
    lockKiosk,
    unlockKiosk,
    remoteConfig,
    saveRemoteConfig,
  } = useAppSettings();

  const {
    systems,
    emulators,
    allGames,
    loadData,
    toggleFavorite,
    updateLocalGame,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    focusedIndex,
    setFocusedIndex,
    allFranchises,
    gamesCountBySystem,
    gamesCountByFranchise,
    totalFavorites,
    totalRecent,
    total2Players,
    totalFightGames,
    totalPlatformGames,
    filteredAndSortedGames,
  } = useLibrary({ customFranchises: settings.custom_franchises });

  const { launchStatus, isGameRunning, launch, kill } = useLauncher(loadData);

  // Synchronisation du tri par défaut depuis les paramètres
  useEffect(() => {
    if (settings.default_sort && settings.default_sort !== sortBy) {
      setSortBy(settings.default_sort);
    }
  }, [settings.default_sort, setSortBy, sortBy]);

  // Démarrage automatique en mode Kiosque si configuré
  useEffect(() => {
    if (settings.auto_kiosk && appMode !== 'kiosk') {
      lockKiosk();
    }
  }, [settings.auto_kiosk, appMode, lockKiosk]);

  // 2. États des Modales
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Game | null>(null);
  const [gameConfigForDetails, setGameConfigForDetails] = useState<GameConfig | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addGameOpen, setAddGameOpen] = useState(false);
  const [gamepadSettingsOpen, setGamepadSettingsOpen] = useState(false);
  const [kioskUnlockOpen, setKioskUnlockOpen] = useState(false);
  const [franchiseOrganizerGame, setFranchiseOrganizerGame] = useState<Game | null>(null);

  const isKiosk = appMode === 'kiosk';

  // Chargement initial des données & Auto-scan du dossier ROMs (ex: ./roms en mode portable)
  useEffect(() => {
    const initApp = async () => {
      await loadData();
      try {
        // Nettoyer les entrées orphelines (ROMs supprimées / déplacées)
        const purged = await purgeMissingGames();
        if (purged > 0) {
          console.info(`[App] ${purged} jeu(x) orphelin(s) supprimé(s) de la base.`);
        }
        const romPath = settings.roms_path || './roms';
        const stats = await scanRomsDirectory(romPath);
        if (purged > 0 || stats.games_added > 0 || stats.games_updated > 0) {
          await loadData();
        }
      } catch (err) {
        console.warn('[App] Auto-scan background:', err);
      }
    };
    initApp();
  }, [loadData, settings.roms_path]);

  // Raccourcis clavier globaux (F11 plein écran, Échap fermeture modales, Ctrl+K focus recherche)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        await toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (selectedGameForDetails) setSelectedGameForDetails(null);
        else if (scannerOpen) setScannerOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
        else if (addGameOpen) setAddGameOpen(false);
        else if (gamepadSettingsOpen) setGamepadSettingsOpen(false);
        else if (kioskUnlockOpen) setKioskUnlockOpen(false);
        else if (franchiseOrganizerGame) setFranchiseOrganizerGame(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedGameForDetails,
    scannerOpen,
    settingsOpen,
    addGameOpen,
    gamepadSettingsOpen,
    kioskUnlockOpen,
    franchiseOrganizerGame,
    toggleFullscreen,
  ]);

  // Actions Jeux
  const handleOpenDetails = async (game: Game) => {
    try {
      const [g, cfg] = await getGameDetails(game.id);
      setSelectedGameForDetails(g || game);
      setGameConfigForDetails(cfg);
    } catch {
      setSelectedGameForDetails(game);
      setGameConfigForDetails(null);
    }
  };

  // Clic ou sélection sur un jeu (selon préférence configurée)
  const handleGameCardSelect = (game: Game) => {
    if (settings.game_select_action === 'launch') {
      launch(game);
    } else {
      handleOpenDetails(game);
    }
  };

  const handleSaveConfig = async (config: GameConfig) => {
    if (isKiosk) return;
    try {
      await updateGameConfig(config);
    } catch (err) {
      console.warn('[App] Config save fallback:', err);
    }
    setGameConfigForDetails(config);
  };

  const handleSaveMetadata = async (gameId: string, metadata: LocalGameMetadata) => {
    if (isKiosk) return;
    try {
      await saveLocalGameMetadata(gameId, metadata);
      await loadData();
    } catch (err) {
      console.warn('[App] Save metadata fallback:', err);
      updateLocalGame(gameId, metadata);
    }
  };

  const handleAddManualGame = async (gameData: {
    filePath: string;
    systemId: string;
    title?: string;
    coverUrl?: string;
    franchise?: string;
    genre?: string;
    developer?: string;
    releaseDate?: string;
    synopsis?: string;
    rating?: number;
    players?: number;
  }) => {
    await addManualGame(gameData);
    await loadData();
  };

  // Liste des catégories pour cycler avec LB / RB à la manette
  const categoryList = useMemo(() => {
    const list = ['all', 'favorites', 'recent', '2-players', 'genre:fight', 'genre:platform'];
    const visibleSystems = systems.filter((s) => {
      if (!settings.enabled_systems || settings.enabled_systems.length === 0) return true;
      return settings.enabled_systems.includes(s.id);
    });
    visibleSystems.forEach((s) => list.push(s.id));
    allFranchises.forEach((f) => list.push(`franchise:${f.id}`));
    return list;
  }, [systems, allFranchises, settings.enabled_systems]);

  const currentCategoryTitle = useMemo(() => {
    if (selectedCategory === 'all') return 'TOUS LES JEUX';
    if (selectedCategory === 'favorites') return 'VOS JEUX FAVORIS';
    if (selectedCategory === 'recent') return 'RÉCEMMENT JOUÉS';
    if (selectedCategory === '2-players') return 'JEUX À 2 JOUEURS (VERSUS & CO-OP)';
    if (selectedCategory === 'genre:fight') return 'JEUX DE COMBAT (VERSUS FIGHTING)';
    if (selectedCategory === 'genre:platform') return 'JEUX DE PLATEFORME';
    const sys = systems.find((s) => s.id === selectedCategory || `system:${s.id}` === selectedCategory);
    if (sys) return sys.name.toUpperCase();
    const fr = allFranchises.find((f) => f.id === selectedCategory || `franchise:${f.id}` === selectedCategory);
    if (fr) return `FRANCHISE : ${fr.name.toUpperCase()}`;
    return selectedCategory.toUpperCase();
  }, [selectedCategory, systems, allFranchises]);

  // Actions de navigation Manette
  const gamepadActions = useMemo(
    () => ({
      onNavigate: (dir: 'up' | 'down' | 'left' | 'right') => {
        if (
          selectedGameForDetails ||
          scannerOpen ||
          settingsOpen ||
          addGameOpen ||
          gamepadSettingsOpen ||
          kioskUnlockOpen ||
          franchiseOrganizerGame ||
          isGameRunning
        )
          return;

        setFocusedIndex((prev) => {
          if (filteredAndSortedGames.length === 0) return 0;
          let next = prev;
          if (dir === 'right') next = Math.min(prev + 1, filteredAndSortedGames.length - 1);
          if (dir === 'left') next = Math.max(prev - 1, 0);
          if (dir === 'down') next = Math.min(prev + 4, filteredAndSortedGames.length - 1);
          if (dir === 'up') next = Math.max(prev - 4, 0);
          return next;
        });
      },
      onConfirm: () => {
        if (selectedGameForDetails) {
          launch(selectedGameForDetails);
          setSelectedGameForDetails(null);
        } else if (
          !scannerOpen &&
          !settingsOpen &&
          !addGameOpen &&
          !gamepadSettingsOpen &&
          !kioskUnlockOpen &&
          !franchiseOrganizerGame &&
          !isGameRunning &&
          filteredAndSortedGames[focusedIndex]
        ) {
          const game = filteredAndSortedGames[focusedIndex];
          if (settings.game_select_action === 'launch') {
            launch(game);
          } else {
            handleOpenDetails(game);
          }
        }
      },
      onBack: () => {
        if (selectedGameForDetails) setSelectedGameForDetails(null);
        else if (scannerOpen) setScannerOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
        else if (addGameOpen) setAddGameOpen(false);
        else if (gamepadSettingsOpen) setGamepadSettingsOpen(false);
        else if (kioskUnlockOpen) setKioskUnlockOpen(false);
        else if (franchiseOrganizerGame) setFranchiseOrganizerGame(null);
      },
      onToggleFavorite: () => {
        if (isKiosk) return;
        const target = selectedGameForDetails || filteredAndSortedGames[focusedIndex];
        if (target) toggleFavorite(target);
      },
      onDetails: () => {
        if (
          !selectedGameForDetails &&
          !scannerOpen &&
          !settingsOpen &&
          !addGameOpen &&
          !gamepadSettingsOpen &&
          !kioskUnlockOpen &&
          filteredAndSortedGames[focusedIndex]
        ) {
          handleOpenDetails(filteredAndSortedGames[focusedIndex]);
        }
      },
      onPrevSystem: () => {
        if (selectedGameForDetails || settingsOpen || addGameOpen || scannerOpen || isGameRunning) return;
        setSelectedCategory((curr) => {
          const idx = categoryList.indexOf(curr);
          const prevIdx = idx <= 0 ? categoryList.length - 1 : idx - 1;
          setFocusedIndex(0);
          return categoryList[prevIdx];
        });
      },
      onNextSystem: () => {
        if (selectedGameForDetails || settingsOpen || addGameOpen || scannerOpen || isGameRunning) return;
        setSelectedCategory((curr) => {
          const idx = categoryList.indexOf(curr);
          const nextIdx = idx === -1 || idx >= categoryList.length - 1 ? 0 : idx + 1;
          setFocusedIndex(0);
          return categoryList[nextIdx];
        });
      },
      onCoinStartExit: () => {
        if (isGameRunning) {
          kill();
        }
      },
      onMenu: () => {
        if (isKiosk) {
          setKioskUnlockOpen(true);
        } else {
          setSettingsOpen((prev) => !prev);
        }
      },
      onKioskUnlockCombo: () => {
        setKioskUnlockOpen(true);
      },
    }),
    [
      filteredAndSortedGames,
      focusedIndex,
      selectedGameForDetails,
      scannerOpen,
      settingsOpen,
      addGameOpen,
      gamepadSettingsOpen,
      kioskUnlockOpen,
      franchiseOrganizerGame,
      isGameRunning,
      isKiosk,
      settings.game_select_action,
      categoryList,
      launch,
      kill,
      toggleFavorite,
      setFocusedIndex,
      setSelectedCategory,
    ]
  );

  // La manette reste active dans les modales et en jeu (pour Quitter / Valider / Fermer)
  // Elle n'est désactivée QUE dans le configurateur de manette pour ne pas parasiter le remapping
  const { isConnected: gamepadConnected, gamepadName } = useGamepad(
    gamepadActions,
    !gamepadSettingsOpen,
    primaryPlayerIndex
  );

  const focusedGame = filteredAndSortedGames[focusedIndex] || null;

  return (
    <div className="flex h-screen w-screen bg-[#f8f7ff] text-slate-900 overflow-hidden font-sans antialiased select-none">
      {/* 1. Navigation Latérale Gauche (Sidebar) */}
      <Sidebar
        systems={systems}
        popularFranchises={allFranchises}
        customFranchises={settings.custom_franchises}
        enabledFranchises={settings.enabled_franchises}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setFocusedIndex(0);
        }}
        gamesCountBySystem={gamesCountBySystem}
        gamesCountByFranchise={gamesCountByFranchise}
        totalAllGames={allGames.length}
        totalFavorites={totalFavorites}
        totalRecent={totalRecent}
        total2Players={total2Players}
        totalFightGames={totalFightGames}
        totalPlatformGames={totalPlatformGames}
        enabledSystems={settings.enabled_systems}
        gamepadConnected={gamepadConnected}
        gamepadName={gamepadName}
        appMode={appMode}
        onOpenScanner={() => setScannerOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGamepadSettings={() => setGamepadSettingsOpen(true)}
        onOpenKioskUnlock={() => setKioskUnlockOpen(true)}
        onOpenAddGame={() => setAddGameOpen(true)}
      />

      {/* 2. Panneau Principal (Catalogue Plein Écran) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-[#f8f7ff] via-white to-purple-50/20">
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <ArcadeCatalog
            games={filteredAndSortedGames}
            focusedGameId={focusedGame?.id || null}
            onSelectGame={handleGameCardSelect}
            onLaunchGame={launch}
            onToggleFavorite={toggleFavorite}
            onOpenGamepadConfig={() => setGamepadSettingsOpen(true)}
            selectedCategory={selectedCategory}
            isSearching={false}
            categoryTitle={currentCategoryTitle}
          />
        </main>
      </div>

      {/* 3. Modales & Overlays */}
      {selectedGameForDetails && (
        <GameDetailsModal
          game={selectedGameForDetails}
          system={systems.find((s) => s.id === selectedGameForDetails.system_id) || null}
          config={gameConfigForDetails}
          emulators={emulators}
          onClose={() => setSelectedGameForDetails(null)}
          onLaunch={(g: Game) => {
            launch(g);
            setSelectedGameForDetails(null);
          }}
          onToggleFavorite={toggleFavorite}
          onSaveConfig={handleSaveConfig}
          onSaveMetadata={handleSaveMetadata}
          onOpenFranchiseOrganizer={(g: Game) => {
            setSelectedGameForDetails(null);
            setFranchiseOrganizerGame(g);
          }}
        />
      )}

      {addGameOpen && !isKiosk && (
        <AddGameModal
          systems={systems}
          onClose={() => setAddGameOpen(false)}
          onAddGame={handleAddManualGame}
          defaultSystemId={selectedCategory !== 'all' && selectedCategory !== 'favorites' && selectedCategory !== 'recent' ? selectedCategory : 'arcade'}
        />
      )}

      {scannerOpen && !isKiosk && (
        <ScannerModal
          onClose={() => setScannerOpen(false)}
          onScan={scanRomsDirectory}
          onScanComplete={loadData}
          defaultPath={settings.roms_path || './roms'}
        />
      )}

      {settingsOpen && !isKiosk && (
        <SettingsModal
          settings={settings}
          systems={systems}
          onClose={() => setSettingsOpen(false)}
          onSave={saveSettings}
          onToggleFullscreen={toggleFullscreen}
          onOpenGamepadSettings={() => {
            setSettingsOpen(false);
            setGamepadSettingsOpen(true);
          }}
          remoteConfig={remoteConfig}
          onSaveRemoteConfig={saveRemoteConfig}
          onLockKioskNow={() => {
            setSettingsOpen(false);
            lockKiosk();
          }}
          onScanComplete={loadData}
        />
      )}

      {gamepadSettingsOpen && (
        <GamepadSettingsModal
          initialMappings={gamepadMappings}
          primaryPlayerIndex={primaryPlayerIndex}
          onSetPrimaryPlayer={setPrimaryPlayerIndex}
          onClose={() => setGamepadSettingsOpen(false)}
          onSaveMappings={saveGamepadMappings}
        />
      )}

      {kioskUnlockOpen && (
        <KioskUnlockModal
          onClose={() => setKioskUnlockOpen(false)}
          onUnlock={unlockKiosk}
        />
      )}

      {franchiseOrganizerGame && !isKiosk && (
        <FranchiseOrganizerModal
          game={franchiseOrganizerGame}
          onClose={() => setFranchiseOrganizerGame(null)}
          onOrganize={(id: string, name: string) =>
            organizeGameIntoFranchise(id, name, settings.roms_path)
          }
          onComplete={loadData}
        />
      )}

      {isGameRunning && (
        <LaunchOverlay status={launchStatus} onKillGame={kill} />
      )}
    </div>
  );
};
export default App;
