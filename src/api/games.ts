import { invokeCommand } from './client';
import { Game, GameConfig, LocalGameMetadata } from '../types';

export async function getAllGames(): Promise<Game[]> {
  return invokeCommand<Game[]>('get_all_games');
}

export async function getGamesBySystem(systemId: string): Promise<Game[]> {
  return invokeCommand<Game[]>('get_games_by_system', { systemId });
}

export async function getFavoriteGames(): Promise<Game[]> {
  return invokeCommand<Game[]>('get_favorite_games');
}

export async function getRecentGames(limit: number = 20): Promise<Game[]> {
  return invokeCommand<Game[]>('get_recent_games', { limit });
}

export async function getGameDetails(gameId: string): Promise<[Game | null, GameConfig | null]> {
  return invokeCommand<[Game | null, GameConfig | null]>('get_game_details', { gameId });
}

export async function toggleFavorite(gameId: string): Promise<boolean> {
  return invokeCommand<boolean>('toggle_favorite', { gameId });
}

export async function updateGameConfig(config: GameConfig): Promise<void> {
  return invokeCommand<void>('update_game_config', { config });
}

export async function saveLocalGameMetadata(gameId: string, metadata: LocalGameMetadata): Promise<void> {
  return invokeCommand<void>('save_local_game_metadata', { gameId, metadata });
}

export async function organizeGameIntoFranchise(
  gameId: string,
  franchiseName: string,
  targetBaseDir?: string
): Promise<string> {
  return invokeCommand<string>('organize_game_into_franchise', {
    gameId,
    franchiseName,
    targetBaseDir,
  });
}

export async function addManualGame(params: {
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
}): Promise<Game> {
  return invokeCommand<Game>('add_manual_game', {
    filePath: params.filePath,
    systemId: params.systemId,
    title: params.title,
    coverUrl: params.coverUrl,
    franchise: params.franchise,
    genre: params.genre,
    developer: params.developer,
    releaseDate: params.releaseDate,
    synopsis: params.synopsis,
    rating: params.rating,
    players: params.players,
  });
}

/** Supprime un jeu de la base (ne touche pas les fichiers du disque) */
export async function deleteGame(gameId: string): Promise<void> {
  return invokeCommand<void>('delete_game', { gameId });
}

/**
 * Supprime de la base tous les jeux dont le fichier ROM est introuvable sur le disque.
 * Retourne le nombre d'entrées supprimées.
 */
export async function purgeMissingGames(): Promise<number> {
  return invokeCommand<number>('purge_missing_games');
}
