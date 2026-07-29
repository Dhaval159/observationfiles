const DEFAULT_TTL_SECONDS = 300;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

export class CacheService {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds = DEFAULT_TTL_SECONDS): void {
    const now = Date.now();
    this.store.set(key, {
      data,
      expiresAt: now + ttlSeconds * 1000,
      createdAt: now,
    });
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds = DEFAULT_TTL_SECONDS,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;

    const data = await factory();
    this.set(key, data, ttlSeconds);
    return data;
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  size(): number {
    this.purgeExpired();
    return this.store.size;
  }

  keys(): string[] {
    this.purgeExpired();
    return Array.from(this.store.keys());
  }

  private purgeExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();

interface QueryCacheEntry<T> {
  data: T;
  staleAt: number;
  createdAt: number;
}

export function createQueryCache() {
  const queryStore = new Map<string, QueryCacheEntry<unknown>>();
  const subscribers = new Map<string, Set<() => void>>();
  const DEFAULT_STALE_TIME = DEFAULT_TTL_SECONDS * 1000;

  return {
    get<T>(key: string): T | null {
      const entry = queryStore.get(key);
      if (!entry) return null;
      return entry.data as T;
    },

    set<T>(key: string, data: T, staleTime = DEFAULT_STALE_TIME): void {
      const now = Date.now();
      queryStore.set(key, {
        data,
        staleAt: now + staleTime,
        createdAt: now,
      });
      const subs = subscribers.get(key);
      if (subs) {
        for (const cb of subs) {
          cb();
        }
      }
    },

    has(key: string): boolean {
      const entry = queryStore.get(key);
      if (!entry) return false;
      return Date.now() < entry.staleAt;
    },

    invalidate(key: string): void {
      queryStore.delete(key);
      const subs = subscribers.get(key);
      if (subs) {
        for (const cb of subs) {
          cb();
        }
      }
    },

    subscribe(key: string, callback: () => void): () => void {
      let subs = subscribers.get(key);
      if (!subs) {
        subs = new Set();
        subscribers.set(key, subs);
      }
      subs.add(callback);
      return () => {
        subs?.delete(callback);
        if (subs && subs.size === 0) {
          subscribers.delete(key);
        }
      };
    },

    clear(): void {
      queryStore.clear();
      subscribers.clear();
    },

    size(): number {
      return queryStore.size;
    },
  };
}
