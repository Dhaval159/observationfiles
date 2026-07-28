export interface AppSettings {
  display: DisplaySettings;
  audio: AudioSettings;
  gameplay: GameplaySettings;
  accessibility: AccessibilitySettings;
  privacy: PrivacySettings;
}

export interface DisplaySettings {
  theme: "dark" | "light" | "system";
  language: string;
  fontSize: "small" | "medium" | "large";
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambientEnabled: boolean;
}

export interface GameplaySettings {
  autoSave: boolean;
  autoSaveInterval: number;
  showTutorials: boolean;
  confirmActions: boolean;
  showTimestamps: boolean;
  autoplayDialogue: boolean;
}

export interface AccessibilitySettings {
  screenReader: boolean;
  subtitleSize: "small" | "medium" | "large";
  highContrastText: boolean;
  colorBlindMode: "none" | "deuteranopia" | "protanopia" | "tritanopia";
  focusIndicator: boolean;
}

export interface PrivacySettings {
  shareAnalytics: boolean;
  shareProgress: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
}
