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
