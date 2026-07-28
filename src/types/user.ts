export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio: string | null;
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  theme: "dark" | "light";
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  autoSave: boolean;
  reducedMotion: boolean;
}

export interface UserStats {
  casesCompleted: number;
  casesStarted: number;
  totalPlaytime: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
}
