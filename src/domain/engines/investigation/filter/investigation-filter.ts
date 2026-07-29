import type { InvestigationContext, DiscoveryEntry, ActivityEntry, LogEntry, InvestigationNotification, DiscoveryType } from "../types";
import type { InvestigationSortOption } from "../types";

export class InvestigationFilter {
  static readonly SORT_OPTIONS: InvestigationSortOption[] = [
    { id: "newest", label: "Newest First", field: "timestamp", direction: "desc" },
    { id: "oldest", label: "Oldest First", field: "timestamp", direction: "asc" },
    { id: "priority", label: "By Priority", field: "priority", direction: "desc" },
    { id: "alphabetical", label: "A-Z", field: "name", direction: "asc" },
    { id: "progress", label: "By Progress", field: "progress", direction: "desc" },
    { id: "relevance", label: "Most Relevant", field: "score", direction: "desc" },
  ];

  filterDiscoveries(
    discoveries: DiscoveryEntry[],
    options: {
      types?: DiscoveryType[];
      isHidden?: boolean;
      isKey?: boolean;
      locationId?: string;
      tags?: string[];
      searchQuery?: string;
      sortBy?: string;
      sortDirection?: "asc" | "desc";
    },
  ): DiscoveryEntry[] {
    let results = [...discoveries];

    if (options.types && options.types.length > 0) {
      results = results.filter((d) => options.types!.includes(d.type));
    }

    if (options.isHidden !== undefined) {
      results = results.filter((d) => d.isHidden === options.isHidden);
    }

    if (options.isKey !== undefined) {
      results = results.filter((d) => d.isKey === options.isKey);
    }

    if (options.locationId) {
      results = results.filter((d) => d.locationId === options.locationId);
    }

    if (options.tags && options.tags.length > 0) {
      results = results.filter((d) =>
        options.tags!.some((t) => d.tags.includes(t)),
      );
    }

    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q),
      );
    }

    if (options.sortBy === "timestamp" || options.sortBy === "discoveredAt") {
      results.sort((a, b) => {
        const diff = a.discoveredAt.unix - b.discoveredAt.unix;
        return options.sortDirection === "desc" ? -diff : diff;
      });
    } else if (options.sortBy === "name") {
      results.sort((a, b) => {
        const cmp = a.name.localeCompare(b.name);
        return options.sortDirection === "desc" ? -cmp : cmp;
      });
    }

    return results;
  }

  filterActivities(
    activities: ActivityEntry[],
    options: {
      actionTypes?: string[];
      locationId?: string;
      targetId?: string;
      source?: string;
      searchQuery?: string;
      sortDirection?: "asc" | "desc";
    },
  ): ActivityEntry[] {
    let results = [...activities];

    if (options.actionTypes && options.actionTypes.length > 0) {
      results = results.filter((a) => options.actionTypes!.includes(a.actionType));
    }

    if (options.locationId) {
      results = results.filter((a) => a.locationId === options.locationId);
    }

    if (options.targetId) {
      results = results.filter((a) => a.targetId === options.targetId);
    }

    if (options.source) {
      results = results.filter((a) => a.source === options.source);
    }

    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      results = results.filter(
        (a) =>
          a.actionType.toLowerCase().includes(q) ||
          (a.targetId ?? "").toLowerCase().includes(q),
      );
    }

    results.sort((a, b) => {
      const diff = a.timestamp.unix - b.timestamp.unix;
      return options.sortDirection === "desc" ? -diff : diff;
    });

    return results;
  }

  filterLog(
    log: LogEntry[],
    options: {
      categories?: string[];
      importance?: string[];
      searchQuery?: string;
      sortDirection?: "asc" | "desc";
    },
  ): LogEntry[] {
    let results = [...log];

    if (options.categories && options.categories.length > 0) {
      results = results.filter((l) => options.categories!.includes(l.category));
    }

    if (options.importance && options.importance.length > 0) {
      results = results.filter((l) => options.importance!.includes(l.importance));
    }

    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      results = results.filter((l) => l.message.toLowerCase().includes(q));
    }

    results.sort((a, b) => {
      const diff = a.timestamp.unix - b.timestamp.unix;
      return options.sortDirection === "desc" ? -diff : diff;
    });

    return results;
  }

  filterNotifications(
    notifications: InvestigationNotification[],
    options: {
      types?: string[];
      isRead?: boolean;
      minPriority?: number;
      sortDirection?: "asc" | "desc";
    },
  ): InvestigationNotification[] {
    let results = [...notifications];

    if (options.types && options.types.length > 0) {
      results = results.filter((n) => options.types!.includes(n.type));
    }

    if (options.isRead !== undefined) {
      results = results.filter((n) => n.isRead === options.isRead);
    }

    if (options.minPriority !== undefined) {
      results = results.filter((n) => n.priority >= options.minPriority!);
    }

    results.sort((a, b) => {
      const diff = a.timestamp.unix - b.timestamp.unix;
      return options.sortDirection === "desc" ? -diff : diff;
    });

    return results;
  }

  filterByTags<T extends { tags?: string[] }>(
    items: T[],
    tags: string[],
  ): T[] {
    if (!tags || tags.length === 0) return items;
    return items.filter(
      (item) => item.tags?.some((t) => tags.includes(t)) ?? false,
    );
  }

  filterByStatus<T extends { status?: string }>(
    items: T[],
    statuses: string[],
  ): T[] {
    if (!statuses || statuses.length === 0) return items;
    return items.filter((item) => item.status && statuses.includes(item.status));
  }

  getSortOptions(): InvestigationSortOption[] {
    return InvestigationFilter.SORT_OPTIONS;
  }
}
