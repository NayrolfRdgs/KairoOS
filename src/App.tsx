import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Sidebar, POPULAR_FRANCHISES } from './components/Sidebar';
import { FilterBar, SortOption } from './components/FilterBar';
import { GameGrid } from './components/GameGrid';
import { GameDetailsModal } from './components/GameDetailsModal';
import { ScannerModal } from './components/ScannerModal';
import { SettingsModal } from './components/SettingsModal';
import { GamepadSettingsModal } from './components/GamepadSettingsModal';
import { FranchiseOrganizerModal } from './components/FranchiseOrganizerModal';
import { LaunchOverlay } from './components/LaunchOverlay';
import { useGamepad } from './hooks/useGamepad';
import {
  AppSettings,
  Emulator,
  Game,
  GameConfig,
  GamepadMapping,
  LaunchStatus,
  LocalGameMetadata,
  ScanStats,
  System,
} from './types';

export const App: React.FC = () => {
  const [systems, setSystems] = useState<System[]>([]);
  const [emulators, setEmulators] = useState<Emulator[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    fullscreen: false,
    always_on_top: false,
    kiosk_mode: false,
    enabled_franchises: ['mario', 'zelda', 'pokemon', 'sonic', 'versus', 'rpg'],
    custom_franchises: [],
    theme: 'retro-80s-light',
  });

  // Navigation & Filtering States
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // 'all' | 'favorites' | 'recent' | 'system:xxx' | 'franchise:xxx'
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('title-asc');
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [selectedGameForDetails, setSelectedGameForDetails] = useState<Game | null>(null);
  const [gameConfigForDetails, setGameConfigForDetails] = useState<GameConfig | null>(null);
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [gamepadSettingsOpen, setGamepadSettingsOpen] = useState<boolean>(false);
  const [gamepadMappings, setGamepadMappings] = useState<GamepadMapping[]>([]);
  const [franchiseOrganizerGame, setFranchiseOrganizerGame] = useState<Game | null>(null);
  const [launchStatus, setLaunchStatus] = useState<LaunchStatus>({ is_running: false });

  const loadData = useCallback(async () => {
    try {
      const fetchedSystems = await invoke<System[]>('get_systems');
      setSystems(fetchedSystems);

      const fetchedEmus = await invoke<Emulator[]>('get_emulators');
      setEmulators(fetchedEmus);

      const fetchedGames = await invoke<Game[]>('get_all_games');
      setAllGames(fetchedGames);

      const fetchedSettings = await invoke<AppSettings>('get_app_settings');
      setSettings(fetchedSettings);

      const fetchedPads = await invoke<GamepadMapping[]>('get_gamepad_mappings');
      setGamepadMappings(fetchedPads);
    } catch (err) {
      console.warn('Mode Web / Tauri non connecté, chargement des données de démonstration:', err);
      setSystems([
        { id: 'snes', name: 'Super Nintendo', short_name: 'SNES', manufacturer: 'Nintendo', extensions: ['sfc'], icon: 'gamepad-2', default_emulator_id: 'retroarch', folder_names: ['snes'] },
        { id: 'ps1', name: 'PlayStation', short_name: 'PS1', manufacturer: 'Sony', extensions: ['cue', 'chd'], icon: 'disc', default_emulator_id: 'retroarch', folder_names: ['ps1'] },
        { id: 'n64', name: 'Nintendo 64', short_name: 'N64', manufacturer: 'Nintendo', extensions: ['z64'], icon: 'box', default_emulator_id: 'retroarch', folder_names: ['n64'] },
        { id: 'switch', name: 'Nintendo Switch', short_name: 'Switch', manufacturer: 'Nintendo', extensions: ['nsp', 'xci'], icon: 'toggle-right', default_emulator_id: 'ryujinx', folder_names: ['switch'] },
        { id: 'ps2', name: 'PlayStation 2', short_name: 'PS2', manufacturer: 'Sony', extensions: ['iso', 'chd'], icon: 'disc', default_emulator_id: 'pcsx2', folder_names: ['ps2'] },
        { id: 'arcade', name: 'Arcade (MAME)', short_name: 'Arcade', manufacturer: 'Arcade', extensions: ['zip'], icon: 'joystick', default_emulator_id: 'retroarch', folder_names: ['arcade'] },
        { id: 'windows', name: 'PC Games Windows', short_name: 'PC Games', manufacturer: 'Microsoft', extensions: ['exe'], icon: 'monitor', default_emulator_id: 'native', folder_names: ['windows'] },
      ]);

      setAllGames([
        {
          id: 'demo-1',
          system_id: 'snes',
          title: 'Super Mario World',
          file_path: 'D:\\Roms\\snes\\Super Mario World.sfc',
          file_name: 'Super Mario World.sfc',
          file_size: 1048576,
          franchise: 'Super Mario',
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1x7d.png',
          genre: 'Plateforme',
          developer: 'Nintendo EAD',
          release_date: '1990-11-21',
          rating: 4.9,
          favorite: true,
          hidden: false,
          play_count: 14,
          play_time_seconds: 4800,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: 'Mario et Yoshi parcourent Dinosaur Land pour délivrer Peach et battre Bowser.',
        },
        {
          id: 'demo-2',
          system_id: 'snes',
          title: 'Super Mario Kart',
          file_path: 'D:\\Roms\\snes\\Super Mario Kart.sfc',
          file_name: 'Super Mario Kart.sfc',
          file_size: 1048576,
          franchise: 'Super Mario',
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r2h.png',
          genre: 'Course',
          developer: 'Nintendo EAD',
          release_date: '1992-08-27',
          rating: 4.7,
          favorite: true,
          hidden: false,
          play_count: 22,
          play_time_seconds: 6200,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: 'Le premier Mario Kart légendaire avec le Mode 7 de la Super Nintendo.',
        },
        {
          id: 'demo-3',
          system_id: 'snes',
          title: 'The Legend of Zelda: A Link to the Past',
          file_path: 'D:\\Roms\\snes\\Zelda - A Link to the Past.sfc',
          file_name: 'Zelda - A Link to the Past.sfc',
          file_size: 2097152,
          franchise: 'The Legend of Zelda',
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8c.png',
          genre: 'Aventure / Action-RPG',
          developer: 'Nintendo',
          release_date: '1991-11-21',
          rating: 5.0,
          favorite: true,
          hidden: false,
          play_count: 9,
          play_time_seconds: 12000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: 'Link explore Hyrule et le Monde des Ténèbres pour sceller Ganon.',
        },
        {
          id: 'demo-4',
          system_id: 'ps1',
          title: 'Tekken 3',
          file_path: 'D:\\Roms\\ps1\\Tekken 3.chd',
          file_name: 'Tekken 3.chd',
          file_size: 524288000,
          franchise: 'Street Fighter & Tekken',
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20ex.png',
          genre: 'Combat / Versus',
          developer: 'Namco',
          release_date: '1998-03-26',
          rating: 4.8,
          favorite: true,
          hidden: false,
          play_count: 31,
          play_time_seconds: 9400,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: 'Le roi des jeux de combat 3D PlayStation.',
        },
        {
          id: 'demo-5',
          system_id: 'arcade',
          title: 'Street Fighter II - Champion Edition',
          file_path: 'D:\\Roms\\arcade\\sf2ce.zip',
          file_name: 'sf2ce.zip',
          file_size: 8388608,
          franchise: 'Street Fighter & Tekken',
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1r2s.png',
          genre: 'Combat / Arcade',
          developer: 'Capcom',
          release_date: '1992-03-13',
          rating: 4.9,
          favorite: false,
          hidden: false,
          play_count: 18,
          play_time_seconds: 5400,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: "L'icône absolue des salles d'arcade 80s/90s.",
        },
        {
          id: 'demo-6',
          system_id: 'n64',
          title: 'Super Mario 64',
          file_path: 'D:\\Roms\\n64\\Super Mario 64.z64',
          file_name: 'Super Mario 64.z64',
          file_size: 8388608,
          franchise: 'Super Mario',
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1w2y.png',
          genre: 'Plateforme 3D',
          developer: 'Nintendo',
          release_date: '1996-06-23',
          rating: 4.9,
          favorite: true,
          hidden: false,
          play_count: 15,
          play_time_seconds: 7000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: 'Le jeu qui a défini la 3D.',
        },
        {
          id: 'demo-7',
          system_id: 'switch',
          title: 'Super Mario Odyssey',
          file_path: 'D:\\Roms\\switch\\Super Mario Odyssey.nsp',
          file_name: 'Super Mario Odyssey.nsp',
          file_size: 5700000000,
          franchise: 'Super Mario',
          cover_url: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co1m1o.png',
          genre: 'Plateforme 3D',
          developer: 'Nintendo EPD',
          release_date: '2017-10-27',
          rating: 4.9,
          favorite: false,
          hidden: false,
          play_count: 6,
          play_time_seconds: 18000,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          synopsis: "Explorez d'immenses royaumes 3D avec Cappy.",
        }
      ]);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Global Keyboard listener for F11 (Fullscreen) & Escape
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        try {
          const next = await invoke<boolean>('toggle_fullscreen');
          setSettings((prev) => ({ ...prev, fullscreen: next }));
        } catch (err) {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }
      } else if (e.key === 'Escape') {
        if (selectedGameForDetails) setSelectedGameForDetails(null);
        else if (scannerOpen) setScannerOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
        else if (franchiseOrganizerGame) setFranchiseOrganizerGame(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGameForDetails, scannerOpen, settingsOpen, franchiseOrganizerGame]);

  // Polling de statut de lancement
  useEffect(() => {
    let interval: any;
    if (launchStatus.is_running) {
      interval = setInterval(async () => {
        try {
          const status = await invoke<LaunchStatus>('get_launcher_status');
          setLaunchStatus(status);
          if (!status.is_running) {
            loadData();
          }
        } catch (err) {
          console.error('Erreur polling:', err);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [launchStatus.is_running, loadData]);

  // Statistiques et compteurs par console & franchise
  const allFranchiseList = useMemo(() => {
    const list = [...POPULAR_FRANCHISES];
    for (const cf of settings.custom_franchises) {
      list.push({
        id: cf.id,
        name: cf.name,
        color: cf.color,
        keywords: cf.keywords,
      });
    }
    return list;
  }, [settings.custom_franchises]);

  const gamesCountBySystem = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of allGames) {
      counts[g.system_id] = (counts[g.system_id] || 0) + 1;
    }
    return counts;
  }, [allGames]);

  const gamesCountByFranchise = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of allFranchiseList) {
      counts[f.id] = allGames.filter((g) => {
        if (g.franchise && g.franchise.toLowerCase() === f.name.toLowerCase()) return true;
        const titleLower = g.title.toLowerCase();
        return f.keywords.some((k) => titleLower.includes(k));
      }).length;
    }
    return counts;
  }, [allGames, allFranchiseList]);

  const totalFavorites = useMemo(() => allGames.filter((g) => g.favorite).length, [allGames]);
  const totalRecent = useMemo(() => allGames.filter((g) => g.play_count > 0).length, [allGames]);

  // Genres disponibles
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    for (const g of allGames) {
      if (g.genre) set.add(g.genre);
    }
    return Array.from(set).sort();
  }, [allGames]);

  // Filtrage et Tri combiné
  const filteredAndSortedGames = useMemo(() => {
    let list = [...allGames];

    // 1. Filtrage par Catégorie / Console / Franchise
    if (selectedCategory === 'favorites') {
      list = list.filter((g) => g.favorite);
    } else if (selectedCategory === 'recent') {
      list = list.filter((g) => g.play_count > 0);
    } else if (selectedCategory.startsWith('system:')) {
      const sysId = selectedCategory.replace('system:', '');
      list = list.filter((g) => g.system_id === sysId);
    } else if (selectedCategory.startsWith('franchise:')) {
      const fId = selectedCategory.replace('franchise:', '');
      const franchise = allFranchiseList.find((f) => f.id === fId);
      if (franchise) {
        list = list.filter((g) => {
          if (g.franchise && g.franchise.toLowerCase() === franchise.name.toLowerCase()) return true;
          const titleLower = g.title.toLowerCase();
          return franchise.keywords.some((k) => titleLower.includes(k));
        });
      }
    }

    // 2. Filtrage par Genre
    if (selectedGenre) {
      list = list.filter((g) => g.genre === selectedGenre);
    }

    // 3. Filtrage par Recherche textuelle
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.system_id.toLowerCase().includes(q) ||
          (g.franchise && g.franchise.toLowerCase().includes(q)) ||
          (g.developer && g.developer.toLowerCase().includes(q)) ||
          (g.genre && g.genre.toLowerCase().includes(q))
      );
    }

    // 4. Tri multi-critères
    list.sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'release-desc':
          return (b.release_date || '').localeCompare(a.release_date || '');
        case 'release-asc':
          return (a.release_date || '9999').localeCompare(b.release_date || '9999');
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'play-time':
          return b.play_time_seconds - a.play_time_seconds;
        case 'recent':
          return (b.play_count || 0) - (a.play_count || 0);
        default:
          return 0;
      }
    });

    return list;
  }, [allGames, selectedCategory, selectedGenre, searchQuery, sortBy, allFranchiseList]);

  // Actions Jeux
  const handleLaunchGame = async (game: Game) => {
    try {
      const status = await invoke<LaunchStatus>('launch_game', { gameId: game.id });
      setLaunchStatus(status);
      if (selectedGameForDetails) setSelectedGameForDetails(null);
    } catch (err: any) {
      console.warn('Simulation de lancement en mode web:', err);
      setLaunchStatus({
        is_running: true,
        current_game_id: game.id,
        current_game_title: game.title,
        current_system_id: game.system_id,
        pid: 12345,
        start_time: new Date().toISOString(),
        elapsed_seconds: 0,
      });
    }
  };

  const handleKillGame = async () => {
    try {
      await invoke('kill_running_game');
    } catch (err) {
      console.warn('Kill running game web fallback:', err);
    }
    setLaunchStatus({ is_running: false });
    loadData();
  };

  const handleToggleFavorite = async (game: Game) => {
    try {
      const isFav = await invoke<boolean>('toggle_favorite', { gameId: game.id });
      setAllGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, favorite: isFav } : g))
      );
      if (selectedGameForDetails?.id === game.id) {
        setSelectedGameForDetails((prev) => (prev ? { ...prev, favorite: isFav } : null));
      }
    } catch (err) {
      setAllGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, favorite: !g.favorite } : g))
      );
      if (selectedGameForDetails?.id === game.id) {
        setSelectedGameForDetails((prev) => (prev ? { ...prev, favorite: !prev.favorite } : null));
      }
    }
  };

  const handleOpenDetails = async (game: Game) => {
    try {
      const [g, cfg] = await invoke<[Game | null, GameConfig | null]>('get_game_details', {
        gameId: game.id,
      });
      setSelectedGameForDetails(g || game);
      setGameConfigForDetails(cfg);
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
      setGameConfigForDetails(config);
    }
  };

  const handleSaveMetadata = async (gameId: string, metadata: LocalGameMetadata) => {
    try {
      await invoke('save_local_game_metadata', { gameId, metadata });
      loadData();
    } catch (err) {
      console.warn('Save metadata fallback:', err);
      setAllGames((prev) =>
        prev.map((g) => (g.id === gameId ? { ...g, ...metadata } : g))
      );
    }
  };

  const handleOrganizeGame = async (gameId: string, franchiseName: string): Promise<string> => {
    return await invoke<string>('organize_game_into_franchise', {
      gameId,
      franchiseName,
      targetBaseDir: settings.roms_path,
    });
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    try {
      await invoke('save_app_settings', { settings: newSettings });
    } catch (err) {
      console.warn('Save settings fallback:', err);
    }
    setSettings(newSettings);
  };

  const handleToggleFullscreen = async () => {
    try {
      const next = await invoke<boolean>('toggle_fullscreen');
      setSettings((prev) => ({ ...prev, fullscreen: next }));
    } catch (err) {
      setSettings((prev) => ({ ...prev, fullscreen: !prev.fullscreen }));
    }
  };

  const handleScanDirectory = async (path: string, calculateHashes: boolean): Promise<ScanStats> => {
    return await invoke<ScanStats>('scan_roms_directory', { path, calculateHashes });
  };

  // Support Gamepad Actions
  const gamepadActions = useMemo(
    () => ({
      onNavigate: (dir: 'up' | 'down' | 'left' | 'right') => {
        if (selectedGameForDetails || scannerOpen || settingsOpen || franchiseOrganizerGame || launchStatus.is_running) return;

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
          handleLaunchGame(selectedGameForDetails);
        } else if (!scannerOpen && !settingsOpen && !franchiseOrganizerGame && !launchStatus.is_running && filteredAndSortedGames[focusedIndex]) {
          handleLaunchGame(filteredAndSortedGames[focusedIndex]);
        }
      },
      onBack: () => {
        if (selectedGameForDetails) setSelectedGameForDetails(null);
        else if (scannerOpen) setScannerOpen(false);
        else if (settingsOpen) setSettingsOpen(false);
        else if (franchiseOrganizerGame) setFranchiseOrganizerGame(null);
      },
      onToggleFavorite: () => {
        if (selectedGameForDetails) {
          handleToggleFavorite(selectedGameForDetails);
        } else if (filteredAndSortedGames[focusedIndex]) {
          handleToggleFavorite(filteredAndSortedGames[focusedIndex]);
        }
      },
      onDetails: () => {
        if (!selectedGameForDetails && !scannerOpen && !settingsOpen && filteredAndSortedGames[focusedIndex]) {
          handleOpenDetails(filteredAndSortedGames[focusedIndex]);
        }
      },
      onMenu: () => setSettingsOpen((prev) => !prev),
    }),
    [
      filteredAndSortedGames,
      focusedIndex,
      selectedGameForDetails,
      scannerOpen,
      settingsOpen,
      franchiseOrganizerGame,
      launchStatus.is_running,
    ]
  );

  const [primaryPlayerIndex, setPrimaryPlayerIndex] = useState<number>(0);

  const isAnyModalOpen =
    scannerOpen ||
    settingsOpen ||
    gamepadSettingsOpen ||
    franchiseOrganizerGame !== null ||
    selectedGameForDetails !== null ||
    launchStatus.is_running;

  const { isConnected: gamepadConnected, gamepadName } = useGamepad(
    gamepadActions,
    !isAnyModalOpen,
    primaryPlayerIndex
  );

  const handleSaveGamepadMappings = async (mappings: GamepadMapping[]) => {
    try {
      await invoke('save_gamepad_mappings', { mappings });
      setGamepadMappings(mappings);
    } catch (err) {
      console.warn('Erreur sauvegarde manettes (Mode Web):', err);
      setGamepadMappings(mappings);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-retro-bg text-retro-text overflow-hidden font-sans retro-grid-bg antialiased select-none">
      {/* 1. Navigation Latérale Gauche (Sidebar) */}
      <Sidebar
        systems={systems}
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
        enabledFranchises={settings.enabled_franchises}
        customFranchises={settings.custom_franchises}
        gamepadConnected={gamepadConnected}
        gamepadName={gamepadName}
        onOpenScanner={() => setScannerOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenGamepadSettings={() => setGamepadSettingsOpen(true)}
      />

      {/* 2. Panneau Principal (Filtres + Grille de Jeux) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Barre de Recherche & Filtres de Tri */}
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

        {/* Grille de Jeux */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <GameGrid
            games={filteredAndSortedGames}
            focusedIndex={focusedIndex}
            onSelectGame={(g) => handleOpenDetails(g)}
            onLaunchGame={(g) => handleLaunchGame(g)}
            onToggleFavorite={(g) => handleToggleFavorite(g)}
            onOpenScanner={() => setScannerOpen(true)}
            isSearching={Boolean(searchQuery.trim() || selectedGenre)}
          />
        </main>
      </div>

      {/* Modales & Overlays */}
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
          onSaveMetadata={handleSaveMetadata}
          onOpenFranchiseOrganizer={(g) => {
            setSelectedGameForDetails(null);
            setFranchiseOrganizerGame(g);
          }}
        />
      )}

      {scannerOpen && (
        <ScannerModal
          onClose={() => setScannerOpen(false)}
          onScan={handleScanDirectory}
          onScanComplete={loadData}
          defaultPath={settings.roms_path || './roms'}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onSave={handleSaveSettings}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenGamepadSettings={() => {
            setSettingsOpen(false);
            setGamepadSettingsOpen(true);
          }}
        />
      )}

      {gamepadSettingsOpen && (
        <GamepadSettingsModal
          initialMappings={gamepadMappings}
          primaryPlayerIndex={primaryPlayerIndex}
          onSetPrimaryPlayer={setPrimaryPlayerIndex}
          onClose={() => setGamepadSettingsOpen(false)}
          onSaveMappings={handleSaveGamepadMappings}
        />
      )}

      {franchiseOrganizerGame && (
        <FranchiseOrganizerModal
          game={franchiseOrganizerGame}
          onClose={() => setFranchiseOrganizerGame(null)}
          onOrganize={handleOrganizeGame}
          onComplete={loadData}
        />
      )}

      {launchStatus.is_running && (
        <LaunchOverlay status={launchStatus} onKillGame={handleKillGame} />
      )}
    </div>
  );
};
