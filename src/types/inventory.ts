import type { Evidence } from "./evidence";

export interface InventorySlot {
  id: string;
  item: InventoryItem | null;
  quantity: number;
  category: InventoryCategory;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: InventoryCategory;
  stackable: boolean;
  maxStack: number;
  evidence?: Evidence;
}

export type InventoryCategory = "evidence" | "tool" | "document" | "key-item" | "consumable";
