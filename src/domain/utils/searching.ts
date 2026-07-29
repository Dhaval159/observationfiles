export interface SearchOptions {
  query: string;
  fields: string[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
  fuzzyThreshold?: number;
}

export function search<T>(items: T[], options: SearchOptions): T[] {
  const { query, fields, caseSensitive = false, exactMatch = false, fuzzyThreshold = 0.8 } = options;

  if (!query || query.trim().length === 0) return items;

  const normalizedQuery = caseSensitive ? query : query.toLowerCase();

  return items.filter((item) =>
    fields.some((field) => {
      const value = getNestedValue(item, field);
      if (value === null || value === undefined) return false;

      const stringValue = String(value);
      const normalizedValue = caseSensitive ? stringValue : stringValue.toLowerCase();

      if (exactMatch) {
        return normalizedValue === normalizedQuery;
      }

      return normalizedValue.includes(normalizedQuery);
    }),
  );
}

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    if (typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function rankSearchResults<T>(items: T[], query: string, fields: string[]): Array<{ item: T; score: number }> {
  const normalizedQuery = query.toLowerCase();
  return items
    .map((item) => {
      let score = 0;
      for (const field of fields) {
        const value = getNestedValue(item, field);
        if (!value) continue;
        const stringValue = String(value).toLowerCase();
        if (stringValue === normalizedQuery) {
          score += 100;
        } else if (stringValue.startsWith(normalizedQuery)) {
          score += 50;
        } else if (stringValue.includes(normalizedQuery)) {
          score += 25;
        }
      }
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function highlightMatches(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
