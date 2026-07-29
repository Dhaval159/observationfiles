import type { Result } from "../results/result";
import type { SaveData, SaveMetaData } from "../models/save-data";

export interface ISaveEngine {
  readonly id: string;
  readonly name: string;

  save(data: SaveData): Promise<Result<SaveData>>;
  load(saveId: string, playerId: string): Promise<Result<SaveData>>;
  delete(saveId: string, playerId: string): Promise<Result<void>>;
  listSaves(playerId: string): Promise<Result<SaveMetaData[]>>;
  getSaveMetadata(saveId: string): Promise<Result<SaveMetaData>>;
  autoSave(playerId: string, caseId: string | null, gameData: Record<string, unknown>): Promise<Result<SaveData>>;
  quickSave(playerId: string, caseId: string, gameData: Record<string, unknown>): Promise<Result<SaveData>>;
  createBackup(saveId: string, playerId: string): Promise<Result<SaveData>>;
  restoreBackup(saveId: string, playerId: string): Promise<Result<SaveData>>;
  getMostRecentSave(playerId: string): Promise<Result<SaveMetaData | null>>;
  getSaveCount(playerId: string): Promise<Result<number>>;
  getTotalStorageUsed(playerId: string): Promise<Result<number>>;
  syncToCloud(saveId: string, playerId: string): Promise<Result<void>>;
  syncFromCloud(saveId: string, playerId: string): Promise<Result<void>>;
  resolveConflict(saveId: string, playerId: string, strategy: "local" | "cloud" | "merge"): Promise<Result<SaveData>>;
  validateSave(data: SaveData): Promise<Result<boolean>>;
  getSupportedVersions(): ReadonlyArray<number>;
  migrateSave(data: SaveData, targetVersion: number): Promise<Result<SaveData>>;
}
