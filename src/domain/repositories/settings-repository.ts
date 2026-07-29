import type { Result } from "../results/result";
import type { AppSettings } from "../../types/settings";

export interface SettingsRepository {
  getSettings(playerId: string): Promise<Result<AppSettings>>;
  updateSettings(playerId: string, settings: Partial<AppSettings>): Promise<Result<AppSettings>>;
  resetSettings(playerId: string): Promise<Result<AppSettings>>;
  getPreference<T>(playerId: string, key: string): Promise<Result<T | null>>;
  setPreference<T>(playerId: string, key: string, value: T): Promise<Result<T>>;
  deletePreference(playerId: string, key: string): Promise<Result<void>>;
  getPreferences(playerId: string): Promise<Result<Record<string, unknown>>>;
}
