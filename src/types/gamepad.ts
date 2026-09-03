export type ControllerType = 'arcade_stick' | 'standard' | 'retro_snes' | 'retro_sega' | 'wheel';

export interface GamepadMapping {
  player_index: number; // 0 to 9 (P1 to P10)
  device_name: string;
  device_id: string;
  controller_type: ControllerType;
  btn_up?: string;
  btn_down?: string;
  btn_left?: string;
  btn_right?: string;
  btn_a?: string;
  btn_b?: string;
  btn_x?: string;
  btn_y?: string;
  btn_l1?: string;
  btn_r1?: string;
  btn_l2?: string;
  btn_r2?: string;
  btn_select?: string; // Coin / Crédit 🪙
  btn_start?: string;  // Start 🕹️
  btn_hotkey?: string; // Quitter / Hotkey
  deadzone: number;
}

export interface GamepadActions {
  onNavigate?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  onConfirm?: () => void;
  onBack?: () => void;
  onToggleFavorite?: () => void;
  onDetails?: () => void;
  onPrevSystem?: () => void;
  onNextSystem?: () => void;
  onMenu?: () => void;
  onKioskUnlockCombo?: () => void;
  onCoinStartExit?: () => void;
}

export interface RemapStep {
  key: keyof GamepadMapping;
  label: string;
  icon: string;
  desc: string;
}
