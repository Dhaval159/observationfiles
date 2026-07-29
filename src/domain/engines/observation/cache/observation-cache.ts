import type { ObservationEntry, ObservationObjectDefinition, ObservationContext } from "../types";

export class ObservationCache {
  private _byId: Map<string, ObservationEntry> = new Map();
  private _byLocation: Map<string, Set<string>> = new Map();
  private _byCategory: Map<string, Set<string>> = new Map();
  private _byTag: Map<string, Set<string>> = new Map();
  private _byGroup: Map<string, Set<string>> = new Map();
  private _byState: Map<string, Set<string>> = new Map();
  private _bySourceObject: Map<string, Set<string>> = new Map();
  private _definitionCache: Map<string, ObservationObjectDefinition> = new Map();

  set(id: string, entry: ObservationEntry): void {
    this._byId.set(id, entry);
    this._indexByLocation(id, entry);
    this._indexByCategory(id, entry);
    this._indexByTags(id, entry);
    this._indexByGroups(id, entry);
    this._indexByState(id, entry);
    this._indexBySourceObject(id, entry);
  }

  get(id: string): ObservationEntry | undefined {
    return this._byId.get(id);
  }

  delete(id: string): void {
    const entry = this._byId.get(id);
    if (!entry) return;

    this._removeFromIndex(this._byLocation, entry.definition.locationId, id);
    this._removeFromIndex(this._byCategory, entry.definition.category, id);
    for (const tag of entry.definition.tags) {
      this._removeFromIndex(this._byTag, tag, id);
    }
    for (const groupId of entry.groupIds) {
      this._removeFromIndex(this._byGroup, groupId, id);
    }
    this._removeFromIndex(this._byState, entry.lifecycleState, id);
    this._removeFromIndex(this._bySourceObject, entry.definition.sourceObjectId, id);
    this._byId.delete(id);
  }

  getByLocation(locationId: string): ObservationEntry[] {
    return this._getFromIndex(this._byLocation, locationId);
  }

  getByCategory(category: string): ObservationEntry[] {
    return this._getFromIndex(this._byCategory, category);
  }

  getByTag(tag: string): ObservationEntry[] {
    return this._getFromIndex(this._byTag, tag);
  }

  getByGroup(groupId: string): ObservationEntry[] {
    return this._getFromIndex(this._byGroup, groupId);
  }

  getByState(state: string): ObservationEntry[] {
    return this._getFromIndex(this._byState, state);
  }

  getBySourceObject(objectId: string): ObservationEntry[] {
    return this._getFromIndex(this._bySourceObject, objectId);
  }

  getByTags(tags: string[]): ObservationEntry[] {
    if (tags.length === 0) return [];
    const ids = new Set<string>();
    for (const tag of tags) {
      const tagIds = this._byTag.get(tag);
      if (tagIds) {
        for (const id of tagIds) ids.add(id);
      }
    }
    return this._getByIds(ids);
  }

  updateState(id: string, newState: string): void {
    const entry = this._byId.get(id);
    if (!entry) return;

    this._removeFromIndex(this._byState, entry.lifecycleState, id);

    if (!this._byState.has(newState)) {
      this._byState.set(newState, new Set([id]));
    } else {
      this._byState.get(newState)!.add(id);
    }

    const updatedEntry: ObservationEntry = {
      ...entry,
      lifecycleState: newState as ObservationEntry["lifecycleState"],
    };
    this._byId.set(id, updatedEntry);
  }

  cacheDefinition(definition: ObservationObjectDefinition): void {
    this._definitionCache.set(definition.id, definition);
  }

  getDefinition(id: string): ObservationObjectDefinition | undefined {
    return this._definitionCache.get(id);
  }

  getAll(): ObservationEntry[] {
    return Array.from(this._byId.values());
  }

  getAllDefinitions(): ObservationObjectDefinition[] {
    return Array.from(this._definitionCache.values());
  }

  syncToContext(ctx: ObservationContext): void {
    ctx.entries.clear();
    for (const [id, entry] of this._byId) {
      ctx.entries.set(id, entry);
    }
    ctx.definitions.clear();
    for (const [id, def] of this._definitionCache) {
      ctx.definitions.set(id, def);
    }
  }

  syncFromContext(ctx: ObservationContext): void {
    this.clear();
    for (const [id, entry] of ctx.entries) {
      this.set(id, entry);
    }
    for (const def of ctx.definitions.values()) {
      this.cacheDefinition(def);
    }
  }

  clear(): void {
    this._byId.clear();
    this._byLocation.clear();
    this._byCategory.clear();
    this._byTag.clear();
    this._byGroup.clear();
    this._byState.clear();
    this._bySourceObject.clear();
    this._definitionCache.clear();
  }

  get size(): number {
    return this._byId.size;
  }

  private _indexByLocation(id: string, entry: ObservationEntry): void {
    this._addToIndex(this._byLocation, entry.definition.locationId, id);
  }

  private _indexByCategory(id: string, entry: ObservationEntry): void {
    this._addToIndex(this._byCategory, entry.definition.category, id);
  }

  private _indexByTags(id: string, entry: ObservationEntry): void {
    for (const tag of entry.definition.tags) {
      this._addToIndex(this._byTag, tag, id);
    }
  }

  private _indexByGroups(id: string, entry: ObservationEntry): void {
    for (const groupId of entry.groupIds) {
      this._addToIndex(this._byGroup, groupId, id);
    }
  }

  private _indexByState(id: string, entry: ObservationEntry): void {
    this._addToIndex(this._byState, entry.lifecycleState, id);
  }

  private _indexBySourceObject(id: string, entry: ObservationEntry): void {
    this._addToIndex(this._bySourceObject, entry.definition.sourceObjectId, id);
  }

  private _addToIndex(index: Map<string, Set<string>>, key: string, id: string): void {
    if (!index.has(key)) {
      index.set(key, new Set([id]));
    } else {
      index.get(key)!.add(id);
    }
  }

  private _removeFromIndex(index: Map<string, Set<string>>, key: string, id: string): void {
    const ids = index.get(key);
    if (ids) {
      ids.delete(id);
      if (ids.size === 0) {
        index.delete(key);
      }
    }
  }

  private _getFromIndex(index: Map<string, Set<string>>, key: string): ObservationEntry[] {
    const ids = index.get(key);
    if (!ids) return [];
    return this._getByIds(ids);
  }

  private _getByIds(ids: Set<string>): ObservationEntry[] {
    const results: ObservationEntry[] = [];
    for (const id of ids) {
      const entry = this._byId.get(id);
      if (entry) results.push(entry);
    }
    return results;
  }
}
