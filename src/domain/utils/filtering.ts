export type FilterOperator = "equals" | "not_equals" | "greater_than" | "less_than" | "contains" | "starts_with" | "ends_with" | "exists" | "in" | "between" | "regex";

export interface FilterCriteria {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

export function applyFilters<T>(items: T[], filters: FilterCriteria[]): T[] {
  if (!filters || filters.length === 0) return items;

  return items.filter((item) =>
    filters.every((filter) => evaluateFilter(item, filter)),
  );
}

function evaluateFilter<T>(item: T, filter: FilterCriteria): boolean {
  const fieldValue = getFieldValue(item, filter.field);

  switch (filter.operator) {
    case "equals":
      return fieldValue === filter.value;
    case "not_equals":
      return fieldValue !== filter.value;
    case "greater_than":
      return typeof fieldValue === "number" && typeof filter.value === "number" && fieldValue > filter.value;
    case "less_than":
      return typeof fieldValue === "number" && typeof filter.value === "number" && fieldValue < filter.value;
    case "contains":
      if (typeof fieldValue === "string" && typeof filter.value === "string") {
        return fieldValue.toLowerCase().includes(filter.value.toLowerCase());
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(filter.value);
      }
      return false;
    case "starts_with":
      return typeof fieldValue === "string" && typeof filter.value === "string" && fieldValue.toLowerCase().startsWith(filter.value.toLowerCase());
    case "ends_with":
      return typeof fieldValue === "string" && typeof filter.value === "string" && fieldValue.toLowerCase().endsWith(filter.value.toLowerCase());
    case "exists":
      return filter.value ? fieldValue !== undefined && fieldValue !== null : fieldValue === undefined || fieldValue === null;
    case "in":
      return Array.isArray(filter.value) && filter.value.includes(fieldValue);
    case "between":
      if (typeof fieldValue === "number" && Array.isArray(filter.value) && filter.value.length === 2) {
        return fieldValue >= (filter.value[0] as number) && fieldValue <= (filter.value[1] as number);
      }
      return false;
    case "regex":
      if (typeof fieldValue === "string" && typeof filter.value === "string") {
        try {
          return new RegExp(filter.value).test(fieldValue);
        } catch {
          return false;
        }
      }
      return false;
    default:
      return false;
  }
}

function getFieldValue<T>(item: T, field: string): unknown {
  const parts = field.split(".");
  let current: unknown = item;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === "object") {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
}

export function createFilter(field: string, operator: FilterOperator, value: unknown): FilterCriteria {
  return { field, operator, value };
}

export function combineFilters(filterGroups: FilterCriteria[][], combinator: "and" | "or" = "and"): FilterCriteria[][] {
  return filterGroups;
}

export function hasActiveFilters(filters: FilterCriteria[]): boolean {
  return filters.length > 0;
}
