import type { ObservationEntry, ObservationSearchCriteria } from "../types";
import { search, rankSearchResults } from "@/domain/utils/searching";

export class ObservationSearch {
  search(
    entries: ObservationEntry[],
    criteria: ObservationSearchCriteria,
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

    if (criteria.tags) {
      const tags = Array.isArray(criteria.tags) ? criteria.tags : [criteria.tags];
      results = results.filter((e) => tags.some((t) => e.definition.tags.includes(t)));
    }

    if (criteria.group) {
      const groups = Array.isArray(criteria.group) ? criteria.group : [criteria.group];
      results = results.filter((e) => groups.some((g) => e.groupIds.includes(g)));
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

    if (criteria.discoveredAfter) {
      results = results.filter(
        (e) => e.discoveredAt && e.discoveredAt!.unix >= criteria.discoveredAfter!.unix,
      );
    }

    if (criteria.observedAfter) {
      results = results.filter(
        (e) => e.observedAt && e.observedAt!.unix >= criteria.observedAfter!.unix,
      );
    }

    if (criteria.query && criteria.query.trim().length > 0) {
      const fields = criteria.fields ?? ["definition.title", "definition.description", "definition.detailedDescription"];
      results = search(results, {
        query: criteria.query,
        fields,
        caseSensitive: false,
        exactMatch: false,
      });
    }

    return results;
  }

  rank(
    entries: ObservationEntry[],
    query: string,
    fields?: string[],
  ): Array<{ item: ObservationEntry; score: number }> {
    const searchFields = fields ?? ["definition.title", "definition.description", "definition.tags"];
    return rankSearchResults(entries, query, searchFields);
  }

  suggest(
    entries: ObservationEntry[],
    query: string,
    limit: number = 5,
  ): ObservationEntry[] {
    if (!query || query.trim().length === 0) return [];
    const ranked = this.rank(entries, query);
    return ranked.slice(0, limit).map((r) => r.item);
  }
}
