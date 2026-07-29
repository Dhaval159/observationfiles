export type SaveSlotType = "auto" | "manual" | "checkpoint";

export interface SaveSlot {
  id: string;
  userId: string;
  caseId: string;
  slotType: SaveSlotType;
  slotNumber: number;
  label: string;
  createdAt: string;
  updatedAt: string;
  playTime: number;
  progressPercentage: number;
  metadata: SaveSlotMetadata;
}

export interface SaveSlotMetadata {
  caseTitle: string;
  caseDifficulty: string;
  currentLocation: string;
  currentChapter: number;
  screenshotUrl: string | null;
  gameVersion: string;
}

export interface SaveData {
  saveSlot: SaveSlot;
  investigationState: unknown;
  evidenceState: unknown;
  observationState: unknown;
  timelineState: unknown;
  theoryBoardState: unknown;
  interrogationSessions: unknown;
  dialogueState: unknown;
  npcStates: unknown;
  scoreState: unknown;
  hintState: unknown;
  achievementProgress: unknown;
  gameFlags: Record<string, unknown>;
  version: number;
  checksum: string;
}

export interface SaveManager {
  save: (data: SaveData) => Promise<void>;
  load: (saveSlotId: string) => Promise<SaveData>;
  deleteSlot: (saveSlotId: string) => Promise<void>;
  listSlots: (caseId?: string) => Promise<SaveSlot[]>;
  getLatestSave: (caseId: string) => Promise<SaveData | null>;
  exportSave: (saveSlotId: string) => Promise<string>;
  importSave: (json: string) => Promise<SaveSlot>;
  getCloudStatus: () => Promise<CloudSaveStatus>;
  syncToCloud: (saveSlotId: string) => Promise<void>;
}

export interface CloudSaveStatus {
  isAvailable: boolean;
  lastSyncedAt: string | null;
  pendingUploads: number;
  pendingDownloads: number;
  conflicts: SaveConflict[];
}

export interface SaveConflict {
  localSlot: SaveSlot;
  cloudSlot: SaveSlot;
  localUpdatedAt: string;
  cloudUpdatedAt: string;
}
