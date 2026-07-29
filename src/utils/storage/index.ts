import { storageConfig } from "@/config/storage";

export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  has(key: string): boolean;
  clear(): void;
  keys(): string[];
  getAll(): Record<string, unknown>;
}

function getStore(): globalThis.Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = `__storage_test_${Math.random()}`;
    window.localStorage.setItem(testKey, "test");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getStorageSize(): number {
  const store = getStore();
  if (!store) return 0;
  let size = 0;
  for (let i = 0; i < store.length; i++) {
    const key = store.key(i);
    if (key) {
      size += key.length * 2;
      const value = store.getItem(key);
      if (value) size += value.length * 2;
    }
  }
  return size;
}

export function getRemainingSpace(): number {
  const available = isStorageAvailable();
  if (!available) return 0;
  const maxSize = 5 * 1024 * 1024;
  return maxSize - getStorageSize();
}

function prefixKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

export function createStorage(namespace: string): StorageAdapter {
  const prefixed = (key: string) => prefixKey(namespace, key);

  return {
    get<T>(key: string): T | null {
      const store = getStore();
      if (!store) return null;
      try {
        const raw = store.getItem(prefixed(key));
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    },

    set<T>(key: string, value: T): void {
      const store = getStore();
      if (!store) return;
      try {
        store.setItem(prefixed(key), JSON.stringify(value));
      } catch (err) {
        if (err instanceof DOMException && (err.name === "QuotaExceededError" || err.code === 22)) {
          console.warn("[Storage] Quota exceeded, could not set key:", key);
        }
      }
    },

    remove(key: string): void {
      const store = getStore();
      if (!store) return;
      try {
        store.removeItem(prefixed(key));
      } catch {
        // noop
      }
    },

    has(key: string): boolean {
      const store = getStore();
      if (!store) return false;
      try {
        return store.getItem(prefixed(key)) !== null;
      } catch {
        return false;
      }
    },

    clear(): void {
      const store = getStore();
      if (!store) return;
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          if (k && k.startsWith(`${namespace}:`)) {
            toRemove.push(k);
          }
        }
        for (const k of toRemove) {
          store.removeItem(k);
        }
      } catch {
        // noop
      }
    },

    keys(): string[] {
      const store = getStore();
      if (!store) return [];
      try {
        const result: string[] = [];
        const prefix = `${namespace}:`;
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          if (k && k.startsWith(prefix)) {
            result.push(k.slice(prefix.length));
          }
        }
        return result;
      } catch {
        return [];
      }
    },

    getAll(): Record<string, unknown> {
      const store = getStore();
      if (!store) return {};
      try {
        const result: Record<string, unknown> = {};
        const prefix = `${namespace}:`;
        for (let i = 0; i < store.length; i++) {
          const k = store.key(i);
          if (k && k.startsWith(prefix)) {
            const raw = store.getItem(k);
            if (raw) {
              try {
                result[k.slice(prefix.length)] = JSON.parse(raw);
              } catch {
                result[k.slice(prefix.length)] = raw;
              }
            }
          }
        }
        return result;
      } catch {
        return {};
      }
    },
  };
}

export const storage: StorageAdapter = createStorage(storageConfig.prefix);
