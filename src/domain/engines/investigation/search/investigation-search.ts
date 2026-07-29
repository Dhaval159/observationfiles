import type { InvestigationContext, DiscoveryEntry, ActivityEntry, LogEntry } from "../types";
import type { SearchResult } from "@/domain/models/search-result";
import type { Objective } from "@/domain/models/objective";
import { search as genericSearch, rankSearchResults } from "@/domain/utils/searching";
import { applyFilters, type FilterCriteria } from "@/domain/utils/filtering";
import { sortByScore, sortByDateField, sortByKey, sortByString } from "@/domain/utils/sorting";

export class InvestigationSearch {
  searchDiscoveries(
    ctx: InvestigationContext,
    discoveries: DiscoveryEntry[],
    query: string,
  ): DiscoveryEntry[] {
    return genericSearch(discoveries, {
      query,
      fields: ["name", "description", "tags"],
    });
  }

  searchObjectives(objectives: Objective[], query: string): Objective[] {
    return genericSearch(objectives, {
      query,
      fields: ["description", "detailedDescription", "tags"],
    }) as Objective[];
  }

  searchActivities(
    ctx: InvestigationContext,
    query: string,
  ): ActivityEntry[] {
    return genericSearch(ctx.activityHistory, {
      query,
      fields: ["actionType", "source", "targetId"],
    });
  }

  searchLog(ctx: InvestigationContext, query: string): LogEntry[] {
    return genericSearch(ctx.investigationLog, {
      query,
      fields: ["message", "category"],
    });
  }

  globalSearch(
    ctx: InvestigationContext,
    query: string,
    discoveryEntries: DiscoveryEntry[],
    objectives: Objective[],
  ): {
    discoveries: DiscoveryEntry[];
    objectives: Objective[];
    activities: ActivityEntry[];
    logEntries: LogEntry[];
  } {
    return {
      discoveries: this.searchDiscoveries(ctx, discoveryEntries, query),
      objectives: this.searchObjectives(objectives, query),
      activities: this.searchActivities(ctx, query),
      logEntries: this.searchLog(ctx, query),
    };
  }

  rankResults<T>(items: T[], query: string, fields: string[]): Array<{ item: T; score: number }> {
    return rankSearchResults(items, query, fields);
  }

  applyFilters<T extends Record<string, unknown>>(
    items: T[],
    filters: FilterCriteria[],
  ): T[] {
    return applyFilters(items, filters);
  }

  sortResults<T>(
    items: T[],
    sortBy: string,
    direction: "asc" | "desc" = "asc",
  ): T[] {
    return sortByKey(items, sortBy as keyof T, direction);
  }

  buildResult<T>(
    items: T[],
    options: {
      query: string;
      limit: number;
      offset: number;
      filters: Record<string, unknown>;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      startTime: number;
    },
  ): SearchResult<T> {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / options.limit));
    const paginatedItems = items.slice(options.offset, options.offset + options.limit);

    return {
      items: paginatedItems,
      total,
      query: options.query,
      filters: options.filters,
      sortBy: options.sortBy ?? null,
      sortOrder: options.sortOrder ?? "asc",
      limit: options.limit,
      offset: options.offset,
      page: Math.floor(options.offset / options.limit) + 1,
      totalPages,
      hasMore: options.offset + options.limit < total,
      searchTimeMs: Date.now() - options.startTime,
    };
  }
}
