import { invokeCommand } from './client';
import { LaunchStatus } from '../types';

export async function launchGame(gameId: string): Promise<LaunchStatus> {
  return invokeCommand<LaunchStatus>('launch_game', { gameId });
}

export async function getLauncherStatus(): Promise<LaunchStatus> {
  return invokeCommand<LaunchStatus>('get_launcher_status');
}

export async function killRunningGame(): Promise<void> {
  return invokeCommand<void>('kill_running_game');
}
