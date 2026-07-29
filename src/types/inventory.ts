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

export interface InventoryState {
  slots: InventorySlot[];
  capacity: number;
  filters: InventoryFilter;
  sortBy: "name" | "category" | "collected" | "analyzed";
  searchQuery: string;
}

export interface InventoryFilter {
  category: InventoryCategory | null;
  type: string | null;
  collected: boolean | null;
  analyzed: boolean | null;
  keyEvidence: boolean | null;
}
