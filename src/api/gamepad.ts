import { invokeCommand } from './client';
import { GamepadMapping } from '../types';

export async function getGamepadMappings(): Promise<GamepadMapping[]> {
  return invokeCommand<GamepadMapping[]>('get_gamepad_mappings');
}

export async function saveGamepadMappings(mappings: GamepadMapping[]): Promise<void> {
  return invokeCommand<void>('save_gamepad_mappings', { mappings });
}
