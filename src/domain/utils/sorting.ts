import type { DomainTimestamp } from "../value-objects/timestamp";

export type SortDirection = "asc" | "desc";

export function sortByKey<T>(items: T[], key: keyof T, direction: SortDirection = "asc"): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === bVal) return 0;
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;
    const result = aVal < bVal ? -1 : 1;
    return direction === "asc" ? result : -result;
  });
}

export function sortByDateField<T>(items: T[], dateExtractor: (item: T) => DomainTimestamp, direction: SortDirection = "asc"): T[] {
  return [...items].sort((a, b) => {
    const diff = dateExtractor(a).unix - dateExtractor(b).unix;
    return direction === "asc" ? diff : -diff;
  });
}

export function sortByScore<T>(items: T[], scoreExtractor: (item: T) => number, direction: SortDirection = "desc"): T[] {
  return [...items].sort((a, b) => {
    const diff = scoreExtractor(a) - scoreExtractor(b);
    return direction === "asc" ? diff : -diff;
  });
}

export function sortByMultiple<T>(items: T[], comparators: Array<(a: T, b: T) => number>): T[] {
  return [...items].sort((a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}

export function sortByString<T>(items: T[], extractor: (item: T) => string, direction: SortDirection = "asc", caseSensitive: boolean = false): T[] {
  return [...items].sort((a, b) => {
    let aStr = extractor(a);
    let bStr = extractor(b);
    if (!caseSensitive) {
      aStr = aStr.toLowerCase();
      bStr = bStr.toLowerCase();
    }
    const result = aStr.localeCompare(bStr);
    return direction === "asc" ? result : -result;
  });
}
