import { invokeCommand } from './client';
import { AppMode, AppSettings, RemoteConfig } from '../types';

export async function getAppSettings(): Promise<AppSettings> {
  return invokeCommand<AppSettings>('get_app_settings');
}

export async function saveAppSettings(settings: AppSettings): Promise<void> {
  return invokeCommand<void>('save_app_settings', { settings });
}

export async function toggleFullscreen(): Promise<boolean> {
  return invokeCommand<boolean>('toggle_fullscreen');
}

export async function setFullscreen(fullscreen: boolean): Promise<void> {
  return invokeCommand<void>('set_fullscreen', { fullscreen });
}

export async function setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
  return invokeCommand<void>('set_always_on_top', { alwaysOnTop });
}

export async function getAppMode(): Promise<AppMode> {
  return invokeCommand<AppMode>('get_app_mode');
}

export async function setAppMode(mode: AppMode, pin?: string): Promise<string> {
  return invokeCommand<string>('set_app_mode', { mode, pin });
}

export async function getRemoteConfig(): Promise<RemoteConfig> {
  return invokeCommand<RemoteConfig>('get_remote_config');
}

export async function saveRemoteConfig(config: RemoteConfig): Promise<void> {
  return invokeCommand<void>('save_remote_config', { config });
}
