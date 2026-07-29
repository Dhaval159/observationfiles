export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Map) return new Map(Array.from(obj.entries()).map(([k, v]) => [deepClone(k), deepClone(v)])) as unknown as T;
  if (obj instanceof Set) return new Set(Array.from(obj).map((v) => deepClone(v))) as unknown as T;
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags) as unknown as T;
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as unknown as T;

  const cloned: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    cloned[key] = deepClone((obj as Record<string, unknown>)[key]);
  }
  return cloned as T;
}

export function structuredCloneSafe<T>(obj: T): T {
  try {
    if (typeof structuredClone === "function") {
      return structuredClone(obj);
    }
  } catch {
    // structuredClone may fail for certain types
  }
  return deepClone(obj);
}
