import type { InvestigationContext, DiscoveryEntry, DiscoveryType } from "../types";
import type { Result } from "@/domain/results/result";
import { success, failure } from "@/domain/results/result";
import { InvalidProgressError } from "@/domain/errors/domain-error";
import { now } from "@/domain/value-objects/timestamp";
import { generateUuid } from "@/domain/utils/id-generator";
import { addDiscovery, isDiscovered, touchContext } from "../context/investigation-context";
import { sortByDateField, sortByString } from "@/domain/utils/sorting";

export class DiscoveryManager {
  private _discoveryEntries: Map<string, DiscoveryEntry[]> = new Map();

  discover(
    ctx: InvestigationContext,
    entry: DiscoveryEntry,
    eventBus?: { publish: (event: unknown) => Promise<void> },
  ): Result<DiscoveryEntry> {
    const typeMap: Record<DiscoveryType, keyof InvestigationContext["discoveries"]> = {
      object: "discoveredObjects",
      evidence: "discoveredEvidence",
      observation: "discoveredObservations",
      statement: "discoveredStatements",
      timeline_event: "discoveredTimelineEvents",
      theory_node: "discoveredTheoryNodes",
      npc_profile: "discoveredNpcProfiles",
      location: "discoveredLocations",
      hidden: "hiddenDiscoveries",
      unknown: "unknownDiscoveries",
    };

    const key = typeMap[entry.type];
    if (!key) {
      return failure(new InvalidProgressError(`Unknown discovery type: ${entry.type}`));
    }

    if (isDiscovered(ctx, key, entry.id)) {
      return success(entry);
    }

    addDiscovery(ctx, key, entry.id);

    const caseEntries = this._discoveryEntries.get(ctx.caseId) ?? [];
    caseEntries.push(entry);
    this._discoveryEntries.set(ctx.caseId, caseEntries);

    addDiscovery(ctx, key, entry.id);

    if (eventBus) {
      eventBus.publish({
        id: `DISCOVERY_${entry.id}_${Date.now()}`,
        type: "discovery_made",
        source: "DiscoveryManager",
        timestamp: now(),
        metadata: {
          caseId: ctx.caseId,
          playerId: ctx.playerId,
          discoveryId: entry.id,
          discoveryType: entry.type,
          discoveryName: entry.name,
          isHidden: entry.isHidden,
          isKey: entry.isKey,
        },
      }).catch(() => {});
    }

    return success(entry);
  }

  getDiscoveries(ctx: InvestigationContext): DiscoveryEntry[] {
    return this._discoveryEntries.get(ctx.caseId) ?? [];
  }

  getDiscoveriesByType(ctx: InvestigationContext, type: DiscoveryType): DiscoveryEntry[] {
    return this.getDiscoveries(ctx).filter((d) => d.type === type);
  }

  getDiscoveriesByLocation(ctx: InvestigationContext, locationId: string): DiscoveryEntry[] {
    return this.getDiscoveries(ctx).filter((d) => d.locationId === locationId);
  }

  getKeyDiscoveries(ctx: InvestigationContext): DiscoveryEntry[] {
    return this.getDiscoveries(ctx).filter((d) => d.isKey);
  }

  getHiddenDiscoveries(ctx: InvestigationContext): DiscoveryEntry[] {
    return this.getDiscoveries(ctx).filter((d) => d.isHidden);
  }

  getDiscoveryCounts(ctx: InvestigationContext): Record<string, number> {
    const discoveries = this.getDiscoveries(ctx);
    const counts: Record<string, number> = {};
    for (const d of discoveries) {
      counts[d.type] = (counts[d.type] ?? 0) + 1;
    }
    return counts;
  }

  search(
    ctx: InvestigationContext,
    query: string,
    options?: {
      types?: DiscoveryType[];
      isHidden?: boolean;
      isKey?: boolean;
      locationId?: string;
      tags?: string[];
    },
  ): DiscoveryEntry[] {
    let results = this.getDiscoveries(ctx);
    const q = query.toLowerCase();

    if (q) {
      results = results.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    if (options?.types && options.types.length > 0) {
      results = results.filter((d) => options.types!.includes(d.type));
    }

    if (options?.isHidden !== undefined) {
      results = results.filter((d) => d.isHidden === options.isHidden);
    }

    if (options?.isKey !== undefined) {
      results = results.filter((d) => d.isKey === options.isKey);
    }

    if (options?.locationId) {
      results = results.filter((d) => d.locationId === options.locationId);
    }

    if (options?.tags && options.tags.length > 0) {
      results = results.filter((d) =>
        options.tags!.some((t) => d.tags.includes(t)),
      );
    }

    return results;
  }

  getRecentDiscoveries(ctx: InvestigationContext, limit: number = 10): DiscoveryEntry[] {
    return sortByDateField(this.getDiscoveries(ctx), (d) => d.discoveredAt, "desc").slice(0, limit);
  }

  getDiscoveryTimeline(ctx: InvestigationContext): DiscoveryEntry[] {
    return sortByDateField(this.getDiscoveries(ctx), (d) => d.discoveredAt, "asc");
  }

  isLocationFullyDiscovered(
    ctx: InvestigationContext,
    locationId: string,
    expectedCount: number,
  ): boolean {
    const locationDiscoveries = this.getDiscoveriesByLocation(ctx, locationId);
    return locationDiscoveries.length >= expectedCount;
  }
}
