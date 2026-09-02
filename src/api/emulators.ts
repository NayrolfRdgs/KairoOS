import { invokeCommand } from './client';
import { Emulator } from '../types';

export async function getEmulators(): Promise<Emulator[]> {
  return invokeCommand<Emulator[]>('get_emulators');
}

export async function updateEmulatorPath(id: string, exePath: string | null): Promise<void> {
  return invokeCommand<void>('update_emulator_path', { id, exePath });
}
