import { useState, useCallback, useMemo } from 'react';
import { Game, LocalGameMetadata, System, Emulator, FranchiseCollection } from '../types';
import { getAllGames, getSystems, getEmulators, toggleFavorite as apiToggleFavorite } from '../api';
import { POPULAR_FRANCHISES, DEMO_SYSTEMS, DEMO_GAMES } from '../constants';
import { SortOption, sortGames } from '../utils';

interface UseLibraryProps {
  customFranchises?: Array<{ id: string; name: string; color: string; keywords: string[] }>;
}

export function useLibrary({ customFranchises = [] }: UseLibraryProps = {}) {
  const [systems, setSystems] = useState<System[]>([]);
  const [emulators, setEmulators] = useState<Emulator[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Navigation & Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('title-asc');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedSystems, fetchedEmus, fetchedGames] = await Promise.all([
        getSystems(),
        getEmulators(),
        getAllGames(),
      ]);
      setSystems(fetchedSystems);
      setEmulators(fetchedEmus);
      setAllGames(fetchedGames);
    } catch (err) {
      console.warn('[useLibrary] Tauri connection unavailable, loading demo mock data:', err);
      setSystems(DEMO_SYSTEMS);
      setAllGames(DEMO_GAMES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (game: Game) => {
    try {
      const isFav = await apiToggleFavorite(game.id);
      setAllGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, favorite: isFav } : g))
      );
      return isFav;
    } catch {
      const nextFav = !game.favorite;
      setAllGames((prev) =>
        prev.map((g) => (g.id === game.id ? { ...g, favorite: nextFav } : g))
      );
      return nextFav;
    }
  }, []);

  const updateLocalGame = useCallback((gameId: string, metadata: LocalGameMetadata) => {
    setAllGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, ...metadata } : g))
    );
  }, []);

  const allFranchises = useMemo<FranchiseCollection[]>(() => {
    const list = [...POPULAR_FRANCHISES];
    for (const cf of customFranchises) {
      list.push({
        id: cf.id,
        name: cf.name,
        color: cf.color,
        keywords: cf.keywords,
      });
    }
    return list;
  }, [customFranchises]);

  const gamesCountBySystem = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of allGames) {
      counts[g.system_id] = (counts[g.system_id] || 0) + 1;
    }
    return counts;
  }, [allGames]);

  const gamesCountByFranchise = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of allFranchises) {
      counts[f.id] = allGames.filter((g) => {
        if (g.franchise && g.franchise.toLowerCase() === f.name.toLowerCase()) return true;
        const titleLower = g.title.toLowerCase();
        return f.keywords.some((k) => titleLower.includes(k));
      }).length;
    }
    return counts;
  }, [allGames, allFranchises]);

  const totalFavorites = useMemo(() => allGames.filter((g) => g.favorite).length, [allGames]);
  const totalRecent = useMemo(() => allGames.filter((g) => g.play_count > 0).length, [allGames]);
  const total2Players = useMemo(() => allGames.filter((g) => g.players && g.players >= 2).length, [allGames]);
  const totalFightGames = useMemo(() => allGames.filter((g) => {
    const genre = (g.genre || '').toLowerCase();
    return genre.includes('combat') || genre.includes('fight') || genre.includes('versus');
  }).length, [allGames]);
  const totalPlatformGames = useMemo(() => allGames.filter((g) => {
    const genre = (g.genre || '').toLowerCase();
    return genre.includes('plateforme') || genre.includes('platform');
  }).length, [allGames]);

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    for (const g of allGames) {
      if (g.genre) set.add(g.genre);
    }
    return Array.from(set).sort();
  }, [allGames]);

  const filteredAndSortedGames = useMemo(() => {
    let list = [...allGames];

    // 1. Filtrage par Catégorie / Console / Franchise / Collections Intelligentes
    if (selectedCategory === 'favorites') {
      list = list.filter((g) => g.favorite);
    } else if (selectedCategory === 'recent') {
      list = list.filter((g) => g.play_count > 0);
    } else if (selectedCategory === '2-players') {
      list = list.filter((g) => g.players && g.players >= 2);
    } else if (selectedCategory === 'genre:fight') {
      list = list.filter((g) => {
        const genre = (g.genre || '').toLowerCase();
        return genre.includes('combat') || genre.includes('fight') || genre.includes('versus');
      });
    } else if (selectedCategory === 'genre:platform') {
      list = list.filter((g) => {
        const genre = (g.genre || '').toLowerCase();
        return genre.includes('plateforme') || genre.includes('platform');
      });
    } else if (selectedCategory.startsWith('system:')) {
      const sysId = selectedCategory.replace('system:', '');
      list = list.filter((g) => g.system_id === sysId);
    } else if (systems.some((s) => s.id === selectedCategory)) {
      list = list.filter((g) => g.system_id === selectedCategory);
    } else if (selectedCategory.startsWith('franchise:')) {
      const fId = selectedCategory.replace('franchise:', '');
      const franchise = allFranchises.find((f) => f.id === fId);
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

    // 4. Tri
    return sortGames(list, sortBy);
  }, [allGames, selectedCategory, selectedGenre, searchQuery, sortBy, allFranchises]);

  return {
    systems,
    emulators,
    allGames,
    isLoading,
    loadData,
    toggleFavorite,
    updateLocalGame,
    // Filter & sort states
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
    // Computed values
    allFranchises,
    gamesCountBySystem,
    gamesCountByFranchise,
    totalFavorites,
    totalRecent,
    total2Players,
    totalFightGames,
    totalPlatformGames,
    availableGenres,
    filteredAndSortedGames,
  };
}
