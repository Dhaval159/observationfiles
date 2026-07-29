export interface SaveData {
  readonly id: string;
  readonly playerId: string;
  readonly slotIndex: number;
  readonly slotType: SaveSlotType;
  readonly label: string;
  readonly description: string | null;
  readonly caseId: string | null;
  readonly gameData: Record<string, unknown>;
  readonly version: number;
  readonly playTimeSeconds: number;
  readonly totalPlayTimeSeconds: number;
  readonly thumbnailUrl: string | null;
  readonly isAutoSave: boolean;
  readonly isCloudSynced: boolean;
  readonly cloudSyncStatus: CloudSyncStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly expiresAt: string | null;
}

export type SaveSlotType = "auto" | "manual" | "quick" | "checkpoint" | "cloud";
export type CloudSyncStatus = "synced" | "pending" | "conflict" | "failed" | "not_configured";

export interface SaveMetaData {
  readonly id: string;
  readonly slotIndex: number;
  readonly slotType: SaveSlotType;
  readonly label: string;
  readonly description: string | null;
  readonly caseId: string | null;
  readonly caseTitle: string | null;
  readonly playTimeSeconds: number;
  readonly thumbnailUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
