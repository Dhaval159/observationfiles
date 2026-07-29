import { storage, getStorageSize } from "@/utils/storage";
import type { SaveData, SaveSlot } from "@/types/save";

const SAVES_KEY = "saves";
const SLOTS_KEY = "slots";
const AUTO_SAVE_PREFIX = "auto";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export class StorageService {
  private getSlots(): SaveSlot[] {
    return storage.get<SaveSlot[]>(SLOTS_KEY) ?? [];
  }

  private setSlots(slots: SaveSlot[]): void {
    storage.set(SLOTS_KEY, slots);
  }

  private getSaveData(saveSlotId: string): SaveData | null {
    return storage.get<SaveData>(`${SAVES_KEY}:${saveSlotId}`);
  }

  private setSaveData(saveSlotId: string, data: SaveData): void {
    storage.set(`${SAVES_KEY}:${saveSlotId}`, data);
  }

  private deleteSaveData(saveSlotId: string): void {
    storage.remove(`${SAVES_KEY}:${saveSlotId}`);
  }

  async saveGame(saveData: SaveData): Promise<void> {
    const { saveSlot } = saveData;
    this.setSaveData(saveSlot.id, saveData);

    const slots = this.getSlots();
    const idx = slots.findIndex((s) => s.id === saveSlot.id);
    if (idx >= 0) {
      slots[idx] = { ...saveSlot, updatedAt: new Date().toISOString() };
    } else {
      slots.push(saveSlot);
    }
    this.setSlots(slots);
  }

  async loadGame(saveSlotId: string): Promise<SaveData | null> {
    return this.getSaveData(saveSlotId);
  }

  async deleteSave(saveSlotId: string): Promise<void> {
    this.deleteSaveData(saveSlotId);

    const slots = this.getSlots().filter((s) => s.id !== saveSlotId);
    this.setSlots(slots);
  }

  async listSaves(caseId?: string): Promise<SaveSlot[]> {
    const slots = this.getSlots();
    if (caseId) {
      return slots.filter((s) => s.caseId === caseId);
    }
    return slots;
  }

  async getLatestSave(caseId: string): Promise<SaveData | null> {
    const slots = this.getSlots()
      .filter((s) => s.caseId === caseId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    if (slots.length === 0) return null;
    const latest = slots[0];
    if (!latest) return null;
    return this.getSaveData(latest.id);
  }

  async autoSave(data: SaveData): Promise<void> {
    const maxAutoSaves = 3;

    const autoSlots = this.getSlots()
      .filter((s) => s.caseId === data.saveSlot.caseId && s.slotType === "auto")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (autoSlots.length >= maxAutoSaves) {
      const oldest = autoSlots[0];
      if (oldest) {
        this.deleteSaveData(oldest.id);
        this.setSlots(this.getSlots().filter((s) => s.id !== oldest.id));
      }
    }

    const autoSlot: SaveSlot = {
      ...data.saveSlot,
      id: generateId(),
      slotType: "auto",
      label: `${AUTO_SAVE_PREFIX}-${autoSlots.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveData: SaveData = { ...data, saveSlot: autoSlot };
    await this.saveGame(saveData);
  }

  async createSaveSlot(data: SaveData): Promise<SaveSlot> {
    const slot: SaveSlot = {
      ...data.saveSlot,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveData: SaveData = { ...data, saveSlot: slot };
    await this.saveGame(saveData);
    return slot;
  }

  async exportSave(saveSlotId: string): Promise<string> {
    const saveData = this.getSaveData(saveSlotId);
    if (!saveData) {
      throw new Error(`Save slot ${saveSlotId} not found`);
    }
    return JSON.stringify(saveData, null, 2);
  }

  async importSave(json: string): Promise<SaveSlot> {
    let saveData: SaveData;
    try {
      saveData = JSON.parse(json);
    } catch {
      throw new Error("Invalid save data format");
    }

    if (!saveData.saveSlot || !saveData.version) {
      throw new Error("Invalid save data structure");
    }

    const newSlot: SaveSlot = {
      ...saveData.saveSlot,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const importedData: SaveData = { ...saveData, saveSlot: newSlot };
    await this.saveGame(importedData);
    return newSlot;
  }

  async getCloudStatus(): Promise<{ isAvailable: boolean }> {
    return { isAvailable: false };
  }

  async syncToCloud(_saveSlotId: string): Promise<void> {
    // Future: sync save to Supabase or cloud storage
  }

  async getSaveMetadata(saveSlotId: string): Promise<SaveSlot | null> {
    const slots = this.getSlots();
    return slots.find((s) => s.id === saveSlotId) ?? null;
  }

  getTotalSaveSize(): number {
    return getStorageSize();
  }

  async cleanupOldAutoSaves(maxAutoSaves = 3): Promise<void> {
    const slots = this.getSlots();
    const autoSlots = slots
      .filter((s) => s.slotType === "auto")
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    while (autoSlots.length > maxAutoSaves) {
      const oldest = autoSlots.shift();
      if (oldest) {
        this.deleteSaveData(oldest.id);
      }
    }

    this.setSlots(
      slots.filter((s) => s.slotType !== "auto" || autoSlots.some((a) => a.id === s.id)),
    );
  }
}

export const storageService = new StorageService();
