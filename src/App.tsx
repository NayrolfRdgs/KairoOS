import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Header } from './components/Header';
import { SystemSelector } from './components/SystemSelector';
import { GameGrid } from './components/GameGrid';
import { GameDetailsModal } from './components/GameDetailsModal';
import { ScannerModal } from './components/ScannerModal';
import { LaunchOverlay } from './components/LaunchOverlay';
import { GamepadBar } from './components/GamepadBar';
import { useGamepad } from './hooks/useGamepad';
import { Emulator, Game, GameConfig, LaunchStatus, ScanStats, System } from './types';

export const App: React.FC = () => {
  const [systems, setSystems] = useState<System[]>([]);
  const [emulators, setEmulators] = useState<Emulator[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState<string>('all');
  const [games, setGames] = useState<Game[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Game | null>(null);
  const [gameConfigForDetails, setGameConfigForDetails] = useState<GameConfig | null>(null);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>({ is_running: false });

  const loadInitialData = useCallback(async () => {
    try {
      const fetchedSystems = await invoke<System[]>('get_systems');
      setSystems(fetchedSystems);

      const fetchedEmus = await invoke<Emulator[]>('get_emulators');
      setEmulators(fetchedEmus);
    } catch (err) {
      console.warn('Mode Web / Tauri non disponible, chargement des consoles de démo:', err);
      setSystems([
        { id: 'snes', name: 'Super Nintendo', short_name: 'SNES', manufacturer: 'Nintendo', extensions: ['sfc'], icon: 'gamepad-2', default_emulator_id: 'retroarch', folder_names: ['snes'] },
        { id: 'ps1', name: 'PlayStation', short_name: 'PS1', manufacturer: 'Sony', extensions: ['cue', 'chd'], icon: 'disc', default_emulator_id: 'retroarch', folder_names: ['ps1'] },
        { id: 'switch', name: 'Nintendo Switch', short_name: 'Switch', manufacturer: 'Nintendo', extensions: ['nsp', 'xci'], icon: 'toggle-right', default_emulator_id: 'ryujinx', folder_names: ['switch'] },
        { id: 'ps2', name: 'PlayStation 2', short_name: 'PS2', manufacturer: 'Sony', extensions: ['iso', 'chd'], icon: 'disc', default_emulator_id: 'pcsx2', folder_names: ['ps2'] },
        { id: 'arcade', name: 'Arcade', short_name: 'Arcade', manufacturer: 'Arcade', extensions: ['zip'], icon: 'joystick', default_emulator_id: 'retroarch', folder_names: ['arcade'] },
        { id: 'windows', name: 'PC Games', short_name: 'PC Games', manufacturer: 'Microsoft', extensions: ['exe'], icon: 'monitor', default_emulator_id: 'native', folder_names: ['windows'] },
      ]);
    }
  }, []);

  const loadGames = useCallback(async () => {
    try {
      let fetchedGames: Game[] = [];
      if (selectedSystemId === 'all') {
        fetchedGames = await invoke<Game[]>('get_all_games');
      } else if (selectedSystemId === 'favorites') {
        fetchedGames = await invoke<Game[]>('get_favorite_games');
      } else {
        fetchedGames = await invoke<Game[]>('get_games_by_system', { systemId: selectedSystemId });
      }
      setGames(fetchedGames);
      setFocusedIndex(0);
    } catch (err) {
      console.warn('Mode Web / Tauri non disponible, chargement des jeux de démo:', err);
      const demoGames: Game[] = [
        {
          id: 'demo-1',
          system_id: 'snes',
          title: 'Super Mario World',
          file_path: 'D:\\Roms\\snes\\Super Mario World.sfc',
          file_name: 'Super Mario World.sfc',
          file_size: 1048576,
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7d.png',
          genre: 'Platformer',
          developer: 'Nintendo',
          rating: 4.9,
          favorite: true,
          hidden: false,
          play_count: 12,
          play_time_seconds: 3600,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: 'Accompagnez Mario et Yoshi dans une aventure légendaire à travers Dinosaur Land pour sauver la princesse Peach de Bowser.',
        },
        {
          id: 'demo-2',
          system_id: 'ps1',
          title: 'Tekken 3',
          file_path: 'D:\\Roms\\ps1\\Tekken 3.chd',
          file_name: 'Tekken 3.chd',
          file_size: 524288000,
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20ex.png',
          genre: 'Fighting / Versus',
          developer: 'Namco',
          rating: 4.8,
          favorite: true,
          hidden: false,
          play_count: 24,
          play_time_seconds: 7200,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: 'Le jeu de combat culte en 3D avec Jin Kazama, Eddy Gordo, Hwoarang et le tournoi King of Iron Fist.',
        },
        {
          id: 'demo-3',
          system_id: 'arcade',
          title: 'Street Fighter II - Champion Edition',
          file_path: 'D:\\Roms\\arcade\\sf2ce.zip',
          file_name: 'sf2ce.zip',
          file_size: 8388608,
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r2s.png',
          genre: 'Arcade Versus',
          developer: 'Capcom',
          rating: 4.9,
          favorite: false,
          hidden: false,
          play_count: 8,
          play_time_seconds: 2400,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: 'L\'icône absolue des bornes d\'arcade avec les 12 guerriers et les boss jouables.',
        },
      ];

      if (selectedSystemId === 'all') {
        setGames(demoGames);
      } else if (selectedSystemId === 'favorites') {
        setGames(demoGames.filter((g) => g.favorite));
      } else {
        setGames(demoGames.filter((g) => g.system_id === selectedSystemId));
      }
      setFocusedIndex(0);
    }
  }, [selectedSystemId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  useEffect(() => {
    let interval: any;
    if (launchStatus.is_running) {
      interval = setInterval(async () => {
        try {
          const status = await invoke<LaunchStatus>('get_launcher_status');
          setLaunchStatus(status);
          if (!status.is_running) {
            loadGames();
          }
        } catch (err) {
          console.error('Erreur polling status:', err);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [launchStatus.is_running, loadGames]);

  const gamesCountBySystem = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of games) {
      counts[g.system_id] = (counts[g.system_id] || 0) + 1;
    }
    return counts;
  }, [games]);

  const totalFavorites = useMemo(() => {
    return games.filter((g) => g.favorite).length;
  }, [games]);

  const currentSystemObj = useMemo(() => {
    if (selectedSystemId === 'all' || selectedSystemId === 'favorites') return null;
    return systems.find((s) => s.id === selectedSystemId) || null;
  }, [systems, selectedSystemId]);

  const handleLaunchGame = async (game: Game) => {
    try {
      const status = await invoke<LaunchStatus>('launch_game', { gameId: game.id });
      setLaunchStatus(status);
      if (selectedGameForDetails) {
        setSelectedGameForDetails(null);
      }
    } catch (err: any) {
      alert(`Erreur de lancement: ${typeof err === 'string' ? err : err.message}`);
    }
  };

  const handleKillGame = async () => {
    try {
      await invoke('kill_running_game');
      setLaunchStatus({ is_running: false });
      loadGames();
    } catch (err) {
      console.error('Erreur kill game:', err);
    }
  };

  const handleToggleFavorite = async (game: Game) => {
    try {
      const isFav = await invoke<boolean>('toggle_favorite', { gameId: game.id });
      setGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, favorite: isFav } : g))
      );
      if (selectedGameForDetails && selectedGameForDetails.id === game.id) {
        setSelectedGameForDetails((prev) => prev ? { ...prev, favorite: isFav } : null);
      }
    } catch (err) {
      console.error('Erreur toggle favorite:', err);
    }
  };

  const handleOpenDetails = async (game: Game) => {
    try {
      const [g, cfg] = await invoke<[Game | null, GameConfig | null]>('get_game_details', {
        gameId: game.id,
      });
      if (g) {
        setSelectedGameForDetails(g);
        setGameConfigForDetails(cfg);
      }
    } catch (err) {
      setSelectedGameForDetails(game);
      setGameConfigForDetails(null);
    }
  };

  const handleSaveConfig = async (config: GameConfig) => {
    try {
      await invoke('update_game_config', { config });
      setGameConfigForDetails(config);
    } catch (err) {
      console.error('Erreur save config:', err);
    }
  };

  const handleScanDirectory = async (path: string, calculateHashes: boolean): Promise<ScanStats> => {
    return await invoke<ScanStats>('scan_roms_directory', { path, calculateHashes });
  };

  const allSystemTabs = useMemo(() => {
    return ['all', 'favorites', ...systems.map((s) => s.id)];
  }, [systems]);

  const switchSystemRelative = (direction: 1 | -1) => {
    const currentIndex = allSystemTabs.indexOf(selectedSystemId);
    if (currentIndex === -1) return;
    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = allSystemTabs.length - 1;
    if (nextIndex >= allSystemTabs.length) nextIndex = 0;
    setSelectedSystemId(allSystemTabs[nextIndex]);
  };

  const gamepadActions = useMemo(
    () => ({
      onNavigate: (dir: 'up' | 'down' | 'left' | 'right') => {
        if (selectedGameForDetails || scannerOpen || launchStatus.is_running) return;

        setFocusedIndex((prev) => {
          if (games.length === 0) return 0;
          let next = prev;
          if (dir === 'right') next = Math.min(prev + 1, games.length - 1);
          if (dir === 'left') next = Math.max(prev - 1, 0);
          if (dir === 'down') next = Math.min(prev + 4, games.length - 1);
          if (dir === 'up') next = Math.max(prev - 4, 0);
          return next;
        });
      },
      onConfirm: () => {
        if (selectedGameForDetails) {
          handleLaunchGame(selectedGameForDetails);
        } else if (!scannerOpen && !launchStatus.is_running && games[focusedIndex]) {
          handleLaunchGame(games[focusedIndex]);
        }
      },
      onBack: () => {
        if (selectedGameForDetails) {
          setSelectedGameForDetails(null);
        } else if (scannerOpen) {
          setScannerOpen(false);
        }
      },
      onToggleFavorite: () => {
        if (selectedGameForDetails) {
          handleToggleFavorite(selectedGameForDetails);
        } else if (games[focusedIndex]) {
          handleToggleFavorite(games[focusedIndex]);
        }
      },
      onDetails: () => {
        if (!selectedGameForDetails && !scannerOpen && games[focusedIndex]) {
          handleOpenDetails(games[focusedIndex]);
        }
      },
      onPrevSystem: () => switchSystemRelative(-1),
      onNextSystem: () => switchSystemRelative(1),
      onMenu: () => setScannerOpen((prev) => !prev),
    }),
    [
      games,
      focusedIndex,
      selectedGameForDetails,
      scannerOpen,
      launchStatus.is_running,
      allSystemTabs,
      selectedSystemId,
    ]
  );

  const { isConnected: gamepadConnected, gamepadName } = useGamepad(gamepadActions);

  return (
    <div className="relative h-screen w-screen bg-arcade-bg text-arcade-text flex flex-col overflow-hidden font-sans arcade-scanlines">
      <Header
        currentSystem={currentSystemObj}
        totalGames={games.length}
        gamepadConnected={gamepadConnected}
        gamepadName={gamepadName}
        onOpenScanner={() => setScannerOpen(true)}
      />

      <SystemSelector
        systems={systems}
        selectedSystemId={selectedSystemId}
        onSelectSystem={(id) => setSelectedSystemId(id)}
        gamesCountBySystem={gamesCountBySystem}
        totalAllGames={games.length}
        totalFavorites={totalFavorites}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <GameGrid
          games={games}
          focusedIndex={focusedIndex}
          onSelectGame={(g) => handleOpenDetails(g)}
          onLaunchGame={(g) => handleLaunchGame(g)}
          onToggleFavorite={(g) => handleToggleFavorite(g)}
          onOpenScanner={() => setScannerOpen(true)}
        />
      </main>

      <GamepadBar />

      {selectedGameForDetails && (
        <GameDetailsModal
          game={selectedGameForDetails}
          system={systems.find((s) => s.id === selectedGameForDetails.system_id) || null}
          config={gameConfigForDetails}
          emulators={emulators}
          onClose={() => setSelectedGameForDetails(null)}
          onLaunch={handleLaunchGame}
          onToggleFavorite={handleToggleFavorite}
          onSaveConfig={handleSaveConfig}
        />
      )}

      {scannerOpen && (
        <ScannerModal
          onClose={() => setScannerOpen(false)}
          onScan={handleScanDirectory}
          onScanComplete={loadGames}
        />
      )}

      {launchStatus.is_running && (
        <LaunchOverlay status={launchStatus} onKillGame={handleKillGame} />
      )}
    </div>
  );
};
