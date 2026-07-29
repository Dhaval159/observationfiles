export interface Inventory {
  readonly id: string;
  readonly playerId: string;
  readonly caseId: string;
  readonly slots: InventorySlot[];
  readonly maxSlots: number;
  readonly usedSlots: number;
  readonly isFull: boolean;
  readonly isEmpty: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InventorySlot {
  readonly index: number;
  readonly itemId: string | null;
  readonly isLocked: boolean;
  readonly unlockCondition: Record<string, unknown> | null;
}

export interface InventoryItem {
  readonly id: string;
  readonly evidenceId: string;
  readonly name: string;
  readonly description: string;
  readonly type: InventoryItemType;
  readonly category: string;
  readonly isKey: boolean;
  readonly weight: number;
  readonly icon: string;
  readonly thumbnailUrl: string | null;
  readonly collectedAt: string;
  readonly locationId: string;
  readonly canBeDiscarded: boolean;
  readonly canBeExamined: boolean;
  readonly isExamined: boolean;
  readonly examinationNotes: string | null;
  readonly tags: string[];
}

export type InventoryItemType = "evidence" | "key_item" | "document" | "tool" | "consumable" | "collectible" | "miscellaneous";
