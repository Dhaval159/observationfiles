import type { ObservationEntry, ObservationSortField, ObservationSortOption } from "../types";

export class ObservationSort {
  sort(
    entries: ObservationEntry[],
    options: ObservationSortOption[],
  ): ObservationEntry[] {
    if (options.length === 0) {
      return this._sortByField(entries, "order", "asc");
    }

    return [...entries].sort((a, b) => {
      for (const option of options) {
        const result = this._compare(a, b, option.field);
        if (result !== 0) {
          return option.direction === "asc" ? result : -result;
        }
      }
      return 0;
    });
  }

  sortBySingle(
    entries: ObservationEntry[],
    field: ObservationSortField,
    direction: "asc" | "desc" = "asc",
  ): ObservationEntry[] {
    return this.sort(entries, [{ field, direction }]);
  }

  sortAlphabetical(entries: ObservationEntry[], direction: "asc" | "desc" = "asc"): ObservationEntry[] {
    return this._sortByField(entries, "title", direction);
  }

  sortByDiscoveryOrder(entries: ObservationEntry[], direction: "asc" | "desc" = "asc"): ObservationEntry[] {
    return this._sortByField(entries, "discoveredAt", direction);
  }

  sortByPriority(entries: ObservationEntry[], direction: "desc" | "asc" = "desc"): ObservationEntry[] {
    return this._sortByField(entries, "priority", direction);
  }

  sortByDifficulty(entries: ObservationEntry[], direction: "asc" | "desc" = "asc"): ObservationEntry[] {
    return this._sortByField(entries, "difficulty", direction);
  }

  sortByConfidence(entries: ObservationEntry[], direction: "desc" | "asc" = "desc"): ObservationEntry[] {
    return this._sortByField(entries, "confidence", direction);
  }

  sortByRecent(entries: ObservationEntry[], direction: "desc" | "asc" = "desc"): ObservationEntry[] {
    return this._sortByField(entries, "updatedAt", direction);
  }

  sortByOldest(entries: ObservationEntry[], direction: "asc" | "desc" = "asc"): ObservationEntry[] {
    return this._sortByField(entries, "createdAt", direction);
  }

  sortWithComparator(
    entries: ObservationEntry[],
    comparator: (a: ObservationEntry, b: ObservationEntry) => number,
  ): ObservationEntry[] {
    return [...entries].sort(comparator);
  }

  private _sortByField(
    entries: ObservationEntry[],
    field: ObservationSortField,
    direction: "asc" | "desc",
  ): ObservationEntry[] {
    return [...entries].sort((a, b) => {
      const result = this._compare(a, b, field);
      return direction === "asc" ? result : -result;
    });
  }

  private _compare(a: ObservationEntry, b: ObservationEntry, field: ObservationSortField): number {
    switch (field) {
      case "id":
        return a.id.localeCompare(b.id);
      case "title":
        return a.definition.title.localeCompare(b.definition.title);
      case "category":
        return a.definition.category.localeCompare(b.definition.category);
      case "discoveredAt": {
        const aTime = a.discoveredAt?.unix ?? 0;
        const bTime = b.discoveredAt?.unix ?? 0;
        return aTime - bTime;
      }
      case "observedAt": {
        const aTime = a.observedAt?.unix ?? 0;
        const bTime = b.observedAt?.unix ?? 0;
        return aTime - bTime;
      }
      case "priority":
        return a.definition.priority.numericValue - b.definition.priority.numericValue;
      case "difficulty":
        return a.definition.difficulty.numericValue - b.definition.difficulty.numericValue;
      case "confidence":
        return a.confidence.value - b.confidence.value;
      case "order":
        return a.definition.order - b.definition.order;
      case "updatedAt":
        return a.updatedAt.unix - b.updatedAt.unix;
      case "createdAt":
        return a.createdAt.unix - b.createdAt.unix;
      default:
        return 0;
    }
  }
}
