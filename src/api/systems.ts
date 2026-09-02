import { invokeCommand } from './client';
import { System } from '../types';

export async function getSystems(): Promise<System[]> {
  return invokeCommand<System[]>('get_systems');
}

export async function getSystemById(id: string): Promise<System | null> {
  return invokeCommand<System | null>('get_system_by_id', { id });
}
