export const storageKeys = {
  theme: "tof-theme",
  auth: "tof-auth",
  settings: "tof-settings",
  progress: "tof-progress",
  onboarding: "tof-onboarding",
  workspaceLayout: "tof-workspace-layout",
} as const;

export const storageConfig = {
  prefix: "tof",
  supabaseBucket: "game-assets",
  maxUploadSize: 10 * 1024 * 1024, // 10MB
} as const;
