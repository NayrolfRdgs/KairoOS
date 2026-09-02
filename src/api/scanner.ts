import { invokeCommand } from './client';
import { ScanStats } from '../types';

export async function scanRomsDirectory(path: string, calculateHashes: boolean): Promise<ScanStats> {
  return invokeCommand<ScanStats>('scan_roms_directory', { path, calculateHashes });
}
