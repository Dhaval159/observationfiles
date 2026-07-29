import type { Result } from "../results/result";

export interface StorageEntry {
  id: string;
  playerId: string;
  key: string;
  data: unknown;
  size: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
}

export interface StorageRepository {
  get(key: string, playerId: string): Promise<Result<StorageEntry | null>>;
  set(key: string, playerId: string, data: unknown, ttlSeconds?: number): Promise<Result<StorageEntry>>;
  delete(key: string, playerId: string): Promise<Result<void>>;
  list(playerId: string, prefix?: string): Promise<Result<StorageEntry[]>>;
  clear(playerId: string): Promise<Result<void>>;
  getSize(playerId: string): Promise<Result<number>>;
  find(key: string, playerId: string): Promise<Result<StorageEntry[]>>;
}
