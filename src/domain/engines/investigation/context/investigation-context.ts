import type {
  InvestigationContext,
  InvestigationDiscoveries,
  InvestigationObjectiveState,
  InvestigationProgress,
  ActivityEntry,
  InvestigationNotification,
  LogEntry,
  TimerState,
  DiscoveryEntry,
} from "../types";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { createDomainTimestamp, now } from "@/domain/value-objects/timestamp";
import { generateUuid } from "@/domain/utils/id-generator";

export function createInvestigationContext(
  caseId: string,
  playerId: string,
): InvestigationContext {
  const timestamp = now();
  return {
    id: generateUuid(),
    caseId,
    playerId,
    lifecycleState: "not_started",
    lifecycleHistory: [],
    currentLocationId: null,
    visitedLocationIds: new Set(),
    selectedNpcId: null,
    selectedEvidenceId: null,
    selectedObservationId: null,
    discoveries: createEmptyDiscoveries(),
    objectives: [],
    activeSystems: new Set(),
    activityHistory: [],
    notificationQueue: [],
    investigationLog: [],
    progress: createEmptyProgress(timestamp),
    runtimeVariables: new Map(),
    temporaryCache: new Map(),
    sessionTimers: new Map(),
    recentActions: [],
    isPaused: false,
    isComplete: false,
    isFailed: false,
    isAbandoned: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    startedAt: null,
    completedAt: null,
  };
}

export function createEmptyDiscoveries(): InvestigationDiscoveries {
  return {
    discoveredObjects: new Set(),
    discoveredEvidence: new Set(),
    discoveredObservations: new Set(),
    discoveredStatements: new Set(),
    discoveredTimelineEvents: new Set(),
    discoveredTheoryNodes: new Set(),
    discoveredNpcProfiles: new Set(),
    discoveredLocations: new Set(),
    hiddenDiscoveries: [],
    unknownDiscoveries: [],
  };
}

export function createEmptyProgress(timestamp: DomainTimestamp): InvestigationProgress {
  return {
    overall: 0,
    objectives: 0,
    discoveries: 0,
    evidence: 0,
    observations: 0,
    dialogue: 0,
    timeline: 0,
    theory: 0,
    byCategory: {},
    estimatedTimeRemaining: null,
    lastCalculated: timestamp,
  };
}

export function touchContext(ctx: InvestigationContext): void {
  ctx.updatedAt = now();
}

export function addActivity(
  ctx: InvestigationContext,
  entry: ActivityEntry,
): void {
  ctx.activityHistory.push(entry);
  const types = ctx.recentActions;
  types.push(entry.actionType);
  while (types.length > 20) {
    types.shift();
  }
  touchContext(ctx);
}

export function addLogEntry(ctx: InvestigationContext, entry: LogEntry): void {
  ctx.investigationLog.push(entry);
  touchContext(ctx);
}

export function addNotification(
  ctx: InvestigationContext,
  notification: InvestigationNotification,
): void {
  ctx.notificationQueue.push(notification);
  touchContext(ctx);
}

export function markNotificationRead(ctx: InvestigationContext, notificationId: string): void {
  const notification = ctx.notificationQueue.find((n) => n.id === notificationId);
  if (notification) {
    (notification as { isRead: boolean }).isRead = true;
    touchContext(ctx);
  }
}

export function clearNotifications(ctx: InvestigationContext): void {
  ctx.notificationQueue = [];
  touchContext(ctx);
}

export function addDiscovery(
  ctx: InvestigationContext,
  type: keyof InvestigationDiscoveries,
  id: string,
): void {
  const collection = ctx.discoveries[type];
  if (collection instanceof Set) {
    collection.add(id);
  }
  touchContext(ctx);
}

export function isDiscovered(
  ctx: InvestigationContext,
  type: keyof InvestigationDiscoveries,
  id: string,
): boolean {
  const collection = ctx.discoveries[type];
  if (collection instanceof Set) {
    return collection.has(id);
  }
  if (Array.isArray(collection)) {
    return collection.includes(id);
  }
  return false;
}

export function getDiscoveryCount(ctx: InvestigationContext): number {
  let count = 0;
  for (const key of Object.keys(ctx.discoveries)) {
    const value = ctx.discoveries[key as keyof InvestigationDiscoveries];
    if (value instanceof Set) count += value.size;
    if (Array.isArray(value)) count += value.length;
  }
  return count;
}

export function setRuntimeVariable(
  ctx: InvestigationContext,
  key: string,
  value: unknown,
): void {
  ctx.runtimeVariables.set(key, value);
  touchContext(ctx);
}

export function getRuntimeVariable(
  ctx: InvestigationContext,
  key: string,
): unknown {
  return ctx.runtimeVariables.get(key);
}

export function setTemporaryCache(
  ctx: InvestigationContext,
  key: string,
  value: unknown,
): void {
  ctx.temporaryCache.set(key, value);
  touchContext(ctx);
}

export function getTemporaryCache(
  ctx: InvestigationContext,
  key: string,
): unknown {
  return ctx.temporaryCache.get(key);
}

export function startTimer(
  ctx: InvestigationContext,
  timerId: string,
): void {
  ctx.sessionTimers.set(timerId, {
    id: timerId,
    startedAt: now(),
    pausedAt: null,
    elapsedSeconds: 0,
    isPaused: false,
    isExpired: false,
  });
  touchContext(ctx);
}

export function pauseTimer(
  ctx: InvestigationContext,
  timerId: string,
): void {
  const timer = ctx.sessionTimers.get(timerId);
  if (timer && !timer.isPaused) {
    timer.pausedAt = now();
    timer.isPaused = true;
    touchContext(ctx);
  }
}

export function resumeTimer(
  ctx: InvestigationContext,
  timerId: string,
): void {
  const timer = ctx.sessionTimers.get(timerId);
  if (timer && timer.isPaused && timer.pausedAt) {
    const pauseDuration = now().differenceInSeconds(timer.pausedAt);
    timer.elapsedSeconds += pauseDuration;
    timer.pausedAt = null;
    timer.isPaused = false;
    touchContext(ctx);
  }
}

export function getTimerElapsed(
  ctx: InvestigationContext,
  timerId: string,
): number {
  const timer = ctx.sessionTimers.get(timerId);
  if (!timer) return 0;
  if (timer.isPaused) return timer.elapsedSeconds;
  return timer.elapsedSeconds + now().differenceInSeconds(timer.startedAt);
}

export function expireTimer(
  ctx: InvestigationContext,
  timerId: string,
): void {
  const timer = ctx.sessionTimers.get(timerId);
  if (timer) {
    timer.isExpired = true;
    timer.isPaused = true;
    touchContext(ctx);
  }
}

export function cloneContext(ctx: InvestigationContext): InvestigationContext {
  return {
    ...ctx,
    visitedLocationIds: new Set(ctx.visitedLocationIds),
    discoveries: {
      ...ctx.discoveries,
      discoveredObjects: new Set(ctx.discoveries.discoveredObjects),
      discoveredEvidence: new Set(ctx.discoveries.discoveredEvidence),
      discoveredObservations: new Set(ctx.discoveries.discoveredObservations),
      discoveredStatements: new Set(ctx.discoveries.discoveredStatements),
      discoveredTimelineEvents: new Set(ctx.discoveries.discoveredTimelineEvents),
      discoveredTheoryNodes: new Set(ctx.discoveries.discoveredTheoryNodes),
      discoveredNpcProfiles: new Set(ctx.discoveries.discoveredNpcProfiles),
      discoveredLocations: new Set(ctx.discoveries.discoveredLocations),
      hiddenDiscoveries: [...ctx.discoveries.hiddenDiscoveries],
      unknownDiscoveries: [...ctx.discoveries.unknownDiscoveries],
    },
    objectives: [...ctx.objectives],
    activeSystems: new Set(ctx.activeSystems),
    activityHistory: [...ctx.activityHistory],
    notificationQueue: [...ctx.notificationQueue],
    investigationLog: [...ctx.investigationLog],
    runtimeVariables: new Map(ctx.runtimeVariables),
    temporaryCache: new Map(ctx.temporaryCache),
    sessionTimers: new Map(ctx.sessionTimers),
    recentActions: [...ctx.recentActions],
  };
}

export function getContextSummary(ctx: InvestigationContext): Record<string, unknown> {
  return {
    id: ctx.id,
    caseId: ctx.caseId,
    playerId: ctx.playerId,
    lifecycleState: ctx.lifecycleState,
    currentLocationId: ctx.currentLocationId,
    visitedLocationCount: ctx.visitedLocationIds.size,
    selectedNpcId: ctx.selectedNpcId,
    discoveryCount: getDiscoveryCount(ctx),
    objectiveCount: ctx.objectives.length,
    activeSystemsCount: ctx.activeSystems.size,
    activityCount: ctx.activityHistory.length,
    notificationCount: ctx.notificationQueue.filter((n) => !n.isRead).length,
    logEntryCount: ctx.investigationLog.length,
    progress: ctx.progress.overall,
    isPaused: ctx.isPaused,
    isComplete: ctx.isComplete,
    isFailed: ctx.isFailed,
  };
}
