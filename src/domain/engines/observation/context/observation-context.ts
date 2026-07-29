import type { ObservationContext, ObservationLifecycleState } from "../types";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { now } from "@/domain/value-objects/timestamp";

export function createObservationContext(
  id: string,
  caseId: string,
  playerId: string,
): ObservationContext {
  const timestamp = now();
  return {
    id,
    caseId,
    playerId,

    entries: new Map(),
    definitions: new Map(),
    groups: new Map(),
    groupStates: new Map(),
    dependencyNodes: new Map(),
    confidenceRecords: new Map(),
    discoveryHistory: [],

    currentObservationId: null,
    lifecycleState: "hidden",
    lifecycleHistory: [],

    runtimeVariables: new Map(),
    playerFlags: new Map(),
    temporaryCache: new Map(),

    isPaused: false,
    isComplete: false,

    createdAt: timestamp,
    updatedAt: timestamp,
    startedAt: null,
    completedAt: null,
  };
}

export function touchContext(ctx: ObservationContext): void {
  ctx.updatedAt = now();
}

export function isObservationDiscovered(
  ctx: ObservationContext,
  observationId: string,
): boolean {
  const entry = ctx.entries.get(observationId);
  if (!entry) return false;
  return entry.lifecycleState !== "hidden";
}

export function isObservationAvailable(
  ctx: ObservationContext,
  observationId: string,
): boolean {
  const entry = ctx.entries.get(observationId);
  if (!entry) return false;
  return entry.lifecycleState === "available" || entry.lifecycleState === "inspecting";
}

export function isObservationComplete(
  ctx: ObservationContext,
  observationId: string,
): boolean {
  const entry = ctx.entries.get(observationId);
  if (!entry) return false;
  return (
    entry.lifecycleState === "observed" ||
    entry.lifecycleState === "verified" ||
    entry.lifecycleState === "rejected"
  );
}

export function getObservationsByState(
  ctx: ObservationContext,
  state: ObservationLifecycleState,
): string[] {
  const result: string[] = [];
  for (const [id, entry] of ctx.entries) {
    if (entry.lifecycleState === state) {
      result.push(id);
    }
  }
  return result;
}

export function getObservationsByLocation(
  ctx: ObservationContext,
  locationId: string,
): string[] {
  const result: string[] = [];
  for (const [id, def] of ctx.definitions) {
    if (def.locationId === locationId) {
      result.push(id);
    }
  }
  return result;
}

export function getObservationsByCategory(
  ctx: ObservationContext,
  category: string,
): string[] {
  const result: string[] = [];
  for (const [id, def] of ctx.definitions) {
    if (def.category === category) {
      result.push(id);
    }
  }
  return result;
}

export function getObservationsByTag(
  ctx: ObservationContext,
  tag: string,
): string[] {
  const result: string[] = [];
  for (const [id, def] of ctx.definitions) {
    if (def.tags.includes(tag)) {
      result.push(id);
    }
  }
  return result;
}

export function getObservationsByGroup(
  ctx: ObservationContext,
  groupId: string,
): string[] {
  const group = ctx.groups.get(groupId);
  if (!group) return [];
  return [...group.observationIds];
}

export function setRuntimeVariable(
  ctx: ObservationContext,
  key: string,
  value: unknown,
): void {
  ctx.runtimeVariables.set(key, value);
  touchContext(ctx);
}

export function getRuntimeVariable(
  ctx: ObservationContext,
  key: string,
): unknown {
  return ctx.runtimeVariables.get(key);
}

export function setPlayerFlag(
  ctx: ObservationContext,
  key: string,
  value: unknown,
): void {
  ctx.playerFlags.set(key, value);
  touchContext(ctx);
}

export function getPlayerFlag(
  ctx: ObservationContext,
  key: string,
): unknown {
  return ctx.playerFlags.get(key);
}

export function setCachedValue(
  ctx: ObservationContext,
  key: string,
  value: unknown,
): void {
  ctx.temporaryCache.set(key, value);
}

export function getCachedValue(
  ctx: ObservationContext,
  key: string,
): unknown {
  return ctx.temporaryCache.get(key);
}

export function clearCache(ctx: ObservationContext): void {
  ctx.temporaryCache.clear();
}
