interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export const cacheService = {
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const entry: CacheEntry<T> = { data, timestamp: Date.now(), ttl };
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // Cache failures are non-critical
    }
  },

  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp > entry.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // noop
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      // noop
    }
  },
};
