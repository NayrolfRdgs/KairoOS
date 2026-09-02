import { Game } from '../types';

export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'rating'
  | 'play-time'
  | 'recent'
  | 'release-desc'
  | 'release-asc';

/**
 * Sorts an array of games according to the chosen sort criteria.
 */
export function sortGames(games: Game[], sortBy: SortOption): Game[] {
  const sorted = [...games];

  sorted.sort((a, b) => {
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

  return sorted;
}
