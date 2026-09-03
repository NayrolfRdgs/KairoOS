import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { FilterBar } from './components/layout/FilterBar';
import { ArcadeCatalog } from './components/games';
import {
  GameDetailsModal,
  SettingsModal,
  GamepadSettingsModal,
  ScannerModal,
  FranchiseOrganizerModal,
  KioskUnlockModal,
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
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    selectedGenre,
    setSelectedGenre,
    focusedIndex,
    setFocusedIndex,
    allFranchises,
    gamesCountBySystem,
    gamesCountByFranchise,
    totalFavorites,
    totalRecent,
    availableGenres,
    filteredAndSortedGames,
  } = useLibrary({ customFranchises: settings.custom_franchises });

  const { launchStatus, isGameRunning, launch, kill } = useLauncher(loadData);

  // 2. États des Modales
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Game | null>(null);
  const [gameConfigForDetails, setGameConfigForDetails] = useState<GameConfig | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [gamepadSettingsOpen, setGamepadSettingsOpen] = useState(false);
  const [kioskUnlockOpen, setKioskUnlockOpen] = useState(false);
  const [franchiseOrganizerGame, setFranchiseOrganizerGame] = useState<Game | null>(null);

  const isKiosk = appMode === 'kiosk';

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, [loadData]);

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
      loadData();
    } catch (err) {
      console.warn('[App] Save metadata fallback:', err);
      updateLocalGame(gameId, metadata);
    }
  };

  // Actions de navigation Manette
  const gamepadActions = useMemo(
    () => ({
      onNavigate: (dir: 'up' | 'down' | 'left' | 'right') => {
        if (
          selectedGameForDetails ||
          scannerOpen ||
          settingsOpen ||
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
          !gamepadSettingsOpen &&
          !kioskUnlockOpen &&
          filteredAndSortedGames[focusedIndex]
        ) {
          handleOpenDetails(filteredAndSortedGames[focusedIndex]);
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
      gamepadSettingsOpen,
      kioskUnlockOpen,
      franchiseOrganizerGame,
      isGameRunning,
      isKiosk,
      settings.game_select_action,
      launch,
      toggleFavorite,
      setFocusedIndex,
    ]
  );

  const isAnyModalOpen =
    scannerOpen ||
    settingsOpen ||
    gamepadSettingsOpen ||
    kioskUnlockOpen ||
    franchiseOrganizerGame !== null ||
    selectedGameForDetails !== null ||
    isGameRunning;

  const { isConnected: gamepadConnected, gamepadName } = useGamepad(
    gamepadActions,
    !isAnyModalOpen,
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
        gamepadConnected={gamepadConnected}
        gamepadName={gamepadName}
        appMode={appMode}
        onOpenScanner={() => setScannerOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGamepadSettings={() => setGamepadSettingsOpen(true)}
        onOpenKioskUnlock={() => setKioskUnlockOpen(true)}
      />

      {/* 2. Panneau Principal (Barre de Recherche + Catalogue Netflix-Arcade) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-[#f8f7ff] via-white to-purple-50/30">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedGenre={selectedGenre}
          onGenreChange={setSelectedGenre}
          availableGenres={availableGenres}
          totalGames={allGames.length}
          filteredCount={filteredAndSortedGames.length}
        />

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <ArcadeCatalog
            games={filteredAndSortedGames}
            focusedGameId={focusedGame?.id || null}
            onSelectGame={handleGameCardSelect}
            onLaunchGame={launch}
            onToggleFavorite={toggleFavorite}
            onOpenGamepadConfig={() => setGamepadSettingsOpen(true)}
            selectedCategory={selectedCategory}
            isSearching={Boolean(searchQuery.trim() || selectedGenre)}
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
