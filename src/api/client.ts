import { invoke } from '@tauri-apps/api/core';

/**
 * Executes a Tauri invoke command safely with informative logging on error.
 */
export async function invokeCommand<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (err) {
    console.warn(`[Tauri API] Error executing "${cmd}":`, err);
    throw err;
  }
}
