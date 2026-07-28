import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storageKeys } from "@/config/storage";
import type { AppSettings } from "@/types/settings";
import type { Theme } from "@/config/theme";

interface SettingsStore {
  settings: AppSettings;
  theme: Theme;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setTheme: (theme: Theme) => void;
  reset: () => void;
}

const defaultSettings: AppSettings = {
  display: { theme: "dark", language: "en", fontSize: "medium", reducedMotion: false, highContrast: false },
  audio: { masterVolume: 0.8, musicVolume: 0.7, sfxVolume: 0.8, voiceVolume: 1.0, ambientEnabled: true },
  gameplay: { autoSave: true, autoSaveInterval: 30000, showTutorials: true, confirmActions: true, showTimestamps: true, autoplayDialogue: false },
  accessibility: { screenReader: false, subtitleSize: "medium", highContrastText: false, colorBlindMode: "none", focusIndicator: true },
  privacy: { shareAnalytics: false, shareProgress: false, allowFriendRequests: true, showOnlineStatus: true },
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      theme: "dark",
      updateSettings: (partial) =>
        set((state) => ({
          settings: { ...state.settings, ...partial },
        })),
      setTheme: (theme) => set({ theme }),
      reset: () => set({ settings: defaultSettings, theme: "dark" }),
    }),
    {
      name: storageKeys.settings,
      partialize: (state) => ({ settings: state.settings, theme: state.theme }),
    },
  ),
);
