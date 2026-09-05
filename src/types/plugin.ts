export type PluginType = 'builtin' | 'official' | 'community';

export interface PluginSettingField {
  type: 'string' | 'number' | 'boolean';
  label: string;
  default: any;
  secret?: boolean;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  type: PluginType;
  description: string;
  min_kairo_version?: string;
  permissions: string[];
  entry?: string;
  ui?: string;
  commands: string[];
  settings_schema: Record<string, PluginSettingField>;
  sandbox?: boolean;
}

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  author: string;
  plugin_type: PluginType;
  description: string;
  enabled: boolean;
  running: boolean;
  permissions: string[];
  commands: string[];
  ui?: string;
  has_settings: boolean;
  path: string;
}

export interface PluginDetail {
  manifest: PluginManifest;
  enabled: boolean;
  running: boolean;
  settings: Record<string, any>;
  path: string;
}
