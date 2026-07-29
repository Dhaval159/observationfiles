import type { ObservationEntry, ObservationFilterCriteria } from "../types";

export class ObservationFilter {
  filter(
    entries: ObservationEntry[],
    criteria: ObservationFilterCriteria,
  ): ObservationEntry[] {
    let results = [...entries];

    if (criteria.state) {
      const states = Array.isArray(criteria.state) ? criteria.state : [criteria.state];
      results = results.filter((e) => states.includes(e.lifecycleState));
    }

    if (criteria.category) {
      const categories = Array.isArray(criteria.category) ? criteria.category : [criteria.category];
      results = results.filter((e) => categories.includes(e.definition.category));
    }

    if (criteria.location) {
      const locations = Array.isArray(criteria.location) ? criteria.location : [criteria.location];
      results = results.filter((e) => locations.includes(e.definition.locationId));
    }

    if (criteria.group) {
      const groups = Array.isArray(criteria.group) ? criteria.group : [criteria.group];
      results = results.filter((e) => groups.some((g) => e.groupIds.includes(g)));
    }

    if (criteria.tags) {
      const tags = Array.isArray(criteria.tags) ? criteria.tags : [criteria.tags];
      results = results.filter((e) => tags.some((t) => e.definition.tags.includes(t)));
    }

    if (criteria.priority) {
      results = results.filter((e) => e.definition.priority.value === criteria.priority!.value);
    }

    if (criteria.difficulty) {
      results = results.filter((e) => e.definition.difficulty.value === criteria.difficulty!.value);
    }

    if (criteria.confidence) {
      const { min, max } = criteria.confidence;
      if (min !== undefined) {
        results = results.filter((e) => e.confidence.value >= min);
      }
      if (max !== undefined) {
        results = results.filter((e) => e.confidence.value <= max);
      }
    }

    if (criteria.isCritical !== undefined) {
      results = results.filter((e) => e.definition.isCritical === criteria.isCritical);
    }

    if (criteria.isPinned !== undefined) {
      results = results.filter((e) => e.isPinned === criteria.isPinned);
    }

    if (criteria.discoveredBefore) {
      results = results.filter(
        (e) => e.discoveredAt && e.discoveredAt.unix <= criteria.discoveredBefore!.unix,
      );
    }

    if (criteria.discoveredAfter) {
      results = results.filter(
        (e) => e.discoveredAt && e.discoveredAt.unix >= criteria.discoveredAfter!.unix,
      );
    }

    if (criteria.observedBefore) {
      results = results.filter(
        (e) => e.observedAt && e.observedAt.unix <= criteria.observedBefore!.unix,
      );
    }

    if (criteria.observedAfter) {
      results = results.filter(
        (e) => e.observedAt && e.observedAt.unix >= criteria.observedAfter!.unix,
      );
    }

    if (criteria.custom && criteria.custom.length > 0) {
      results = results.filter((entry) =>
        criteria.custom!.every((c) => this._evaluateCustomFilter(entry, c)),
      );
    }

    return results;
  }

  private _evaluateCustomFilter(
    entry: ObservationEntry,
    filter: { field: string; operator: string; value: unknown },
  ): boolean {
    const value = this._getNestedValue(entry, filter.field);

    switch (filter.operator) {
      case "equals":
        return value === filter.value;
      case "not_equals":
        return value !== filter.value;
      case "contains":
        if (typeof value === "string" && typeof filter.value === "string") {
          return value.toLowerCase().includes(filter.value.toLowerCase());
        }
        if (Array.isArray(value)) {
          return value.includes(filter.value);
        }
        return false;
      case "greater_than":
        return typeof value === "number" && typeof filter.value === "number" && value > filter.value;
      case "less_than":
        return typeof value === "number" && typeof filter.value === "number" && value < filter.value;
      case "exists":
        return filter.value ? value !== undefined && value !== null : value === undefined || value === null;
      case "in":
        return Array.isArray(filter.value) && filter.value.includes(value);
      default:
        return false;
    }
  }

  private _getNestedValue(obj: unknown, path: string): unknown {
    const parts = path.split(".");
    let current: unknown = obj;
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
}
