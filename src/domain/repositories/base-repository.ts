import type { Result } from "../results/result";

export interface BaseRepository<TEntity, TId = string> {
  findById(id: TId): Promise<Result<TEntity>>;
  findAll(filters?: Record<string, unknown>): Promise<Result<TEntity[]>>;
  save(entity: TEntity): Promise<Result<TEntity>>;
  delete(id: TId): Promise<Result<void>>;
  exists(id: TId): Promise<Result<boolean>>;
  count(filters?: Record<string, unknown>): Promise<Result<number>>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
  includeDeleted?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
