import type { ObservationEntry, ObservationObjectDefinition, ObservationContext } from "../types";
import type { Result } from "@/domain/results/result";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { success, failure } from "@/domain/results/result";
import { ObservationNotFoundError } from "@/domain/errors/domain-error";
import { now } from "@/domain/value-objects/timestamp";
import { ObservationCache } from "../cache/observation-cache";
import { generateUuid } from "@/domain/utils/id-generator";

export interface ObservationPersistenceAdapter {
  save(ctx: ObservationContext): Promise<Result<void>>;
  load(caseId: string, playerId: string): Promise<Result<ObservationContext | null>>;
  delete(caseId: string, playerId: string): Promise<Result<void>>;
}

export class InMemoryObservationRepository {
  private _cache: ObservationCache;
  private _persistence: ObservationPersistenceAdapter | null = null;
  private _contexts: Map<string, ObservationContext> = new Map();

  constructor() {
    this._cache = new ObservationCache();
  }

  setPersistence(adapter: ObservationPersistenceAdapter): void {
    this._persistence = adapter;
  }

  private _contextKey(caseId: string, playerId: string): string {
    return `${caseId}:${playerId}`;
  }

  getContext(caseId: string, playerId: string): ObservationContext | undefined {
    return this._contexts.get(this._contextKey(caseId, playerId));
  }

  setContext(ctx: ObservationContext): void {
    this._contexts.set(this._contextKey(ctx.caseId, ctx.playerId), ctx);
  }

  deleteContext(caseId: string, playerId: string): void {
    this._contexts.delete(this._contextKey(caseId, playerId));
  }

  getEntry(ctx: ObservationContext, observationId: string): Result<ObservationEntry> {
    const entry = ctx.entries.get(observationId);
    if (!entry) {
      return failure(new ObservationNotFoundError(`Observation '${observationId}' not found`));
    }
    return success(entry);
  }

  getAllEntries(ctx: ObservationContext): ObservationEntry[] {
    return Array.from(ctx.entries.values());
  }

  saveEntry(ctx: ObservationContext, entry: ObservationEntry): void {
    ctx.entries.set(entry.id, entry);
    this._cache.set(entry.id, entry);
  }

  getDefinition(
    ctx: ObservationContext,
    observationId: string,
  ): Result<ObservationObjectDefinition> {
    const def = ctx.definitions.get(observationId);
    if (!def) {
      return failure(
        new ObservationNotFoundError(`Definition for '${observationId}' not found`),
      );
    }
    return success(def);
  }

  getAllDefinitions(ctx: ObservationContext): ObservationObjectDefinition[] {
    return Array.from(ctx.definitions.values());
  }

  saveDefinition(ctx: ObservationContext, def: ObservationObjectDefinition): void {
    ctx.definitions.set(def.id, def);
    this._cache.cacheDefinition(def);
  }

  async save(ctx: ObservationContext): Promise<Result<void>> {
    if (this._persistence) {
      return this._persistence.save(ctx);
    }
    return success(undefined);
  }

  async load(caseId: string, playerId: string): Promise<Result<ObservationContext | null>> {
    if (this._persistence) {
      return this._persistence.load(caseId, playerId);
    }
    return success(this.getContext(caseId, playerId) ?? null);
  }

  async deletePersisted(caseId: string, playerId: string): Promise<Result<void>> {
    if (this._persistence) {
      return this._persistence.delete(caseId, playerId);
    }
    return success(undefined);
  }

  createEntry(
    def: ObservationObjectDefinition,
    dependencies: import("../types").ObservationDependencyDefinition[],
    groupIds: string[],
    timestamp?: DomainTimestamp,
  ): ObservationEntry {
    const ts = timestamp ?? now();
    return {
      id: def.id,
      caseId: def.caseId,
      definition: def,
      lifecycleState: def.isHidden ? "hidden" : "available",
      lifecycleHistory: [],
      confidence: {
        observationId: def.id,
        value: 0.5,
        percentage: 50,
        category: "medium",
        isMediumOrHigher: true,
        isHigh: false,
        history: [{ value: 0.5, source: "creation", timestamp: ts }],
        lastUpdated: ts,
      },
      dependencies: {
        observationId: def.id,
        dependencies: [...dependencies],
        dependents: [],
        isSatisfied: false,
        satisfiedAt: null,
      },
      groupIds: [...groupIds],
      discoveredAt: null,
      observedAt: null,
      verifiedAt: null,
      rejectedAt: null,
      lockedAt: null,
      archivedAt: null,
      playerNotes: "",
      observationCount: 0,
      isPinned: false,
      runtimeMetadata: {},
      createdAt: ts,
      updatedAt: ts,
    };
  }
}
