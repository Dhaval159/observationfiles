import type { CaseSession } from "../types";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { createDomainTimestamp, now } from "@/domain/value-objects/timestamp";
import { generateUuid } from "@/domain/utils/id-generator";

export function createSession(
  caseId: string,
  playerId: string,
  options?: {
    currentLocationId?: string | null;
  },
): CaseSession {
  const timestamp = now();
  return {
    id: generateUuid(),
    caseId,
    playerId,
    currentLocationId: options?.currentLocationId ?? null,
    visitedLocationIds: new Set(),
    discoveredEvidenceIds: new Set(),
    discoveredObservationIds: new Set(),
    completedObjectiveIds: new Set(),
    activeObjectiveIds: new Set(),
    unlockedContentIds: new Set(),
    playerNotes: {},
    temporaryVariables: {},
    currentScreen: null,
    openedPanels: new Set(),
    startedAt: timestamp,
    lastActivityAt: timestamp,
    playTimeSeconds: 0,
    pauseStartTime: null,
    totalPausedTimeSeconds: 0,
  };
}

export function touchSession(session: CaseSession, timestamp?: DomainTimestamp): void {
  session.lastActivityAt = timestamp ?? now();
  updatePlayTime(session);
}

export function updatePlayTime(session: CaseSession): void {
  if (session.pauseStartTime) {
    return;
  }
  const nowTime = now();
  session.playTimeSeconds = nowTime.differenceInSeconds(session.startedAt) - session.totalPausedTimeSeconds;
}

export function pauseSession(session: CaseSession): void {
  if (session.pauseStartTime) return;
  session.pauseStartTime = now();
}

export function resumeSession(session: CaseSession): void {
  if (!session.pauseStartTime) return;
  const pauseDuration = now().differenceInSeconds(session.pauseStartTime);
  session.totalPausedTimeSeconds += pauseDuration;
  session.pauseStartTime = null;
  touchSession(session);
}

export function addVisitedLocation(session: CaseSession, locationId: string): void {
  session.visitedLocationIds.add(locationId);
  session.currentLocationId = locationId;
  touchSession(session);
}

export function discoverEvidence(session: CaseSession, evidenceId: string): void {
  session.discoveredEvidenceIds.add(evidenceId);
  touchSession(session);
}

export function discoverObservation(session: CaseSession, observationId: string): void {
  session.discoveredObservationIds.add(observationId);
  touchSession(session);
}

export function completeObjective(session: CaseSession, objectiveId: string): void {
  session.completedObjectiveIds.add(objectiveId);
  session.activeObjectiveIds.delete(objectiveId);
  touchSession(session);
}

export function activateObjective(session: CaseSession, objectiveId: string): void {
  session.activeObjectiveIds.add(objectiveId);
  touchSession(session);
}

export function setPlayerNote(session: CaseSession, key: string, note: string): void {
  session.playerNotes[key] = note;
  touchSession(session);
}

export function getPlayerNote(session: CaseSession, key: string): string | undefined {
  return session.playerNotes[key];
}

export function setTemporaryVariable(session: CaseSession, key: string, value: unknown): void {
  session.temporaryVariables[key] = value;
  touchSession(session);
}

export function getTemporaryVariable(session: CaseSession, key: string): unknown {
  return session.temporaryVariables[key];
}

export function setCurrentScreen(session: CaseSession, screen: string | null): void {
  session.currentScreen = screen;
  touchSession(session);
}

export function togglePanel(session: CaseSession, panelId: string): void {
  if (session.openedPanels.has(panelId)) {
    session.openedPanels.delete(panelId);
  } else {
    session.openedPanels.add(panelId);
  }
  touchSession(session);
}

export function isPanelOpen(session: CaseSession, panelId: string): boolean {
  return session.openedPanels.has(panelId);
}

export function unlockContent(session: CaseSession, contentId: string): void {
  session.unlockedContentIds.add(contentId);
  touchSession(session);
}

export function isContentUnlocked(session: CaseSession, contentId: string): boolean {
  return session.unlockedContentIds.has(contentId);
}

export function getSessionSummary(session: CaseSession): Record<string, unknown> {
  return {
    id: session.id,
    caseId: session.caseId,
    playerId: session.playerId,
    currentLocationId: session.currentLocationId,
    visitedLocationCount: session.visitedLocationIds.size,
    discoveredEvidenceCount: session.discoveredEvidenceIds.size,
    discoveredObservationCount: session.discoveredObservationIds.size,
    completedObjectiveCount: session.completedObjectiveIds.size,
    activeObjectiveCount: session.activeObjectiveIds.size,
    playTimeSeconds: session.playTimeSeconds,
    currentScreen: session.currentScreen,
    openPanels: [...session.openedPanels],
    startedAt: session.startedAt.toISOString(),
    lastActivityAt: session.lastActivityAt.toISOString(),
  };
}

export function resetSession(session: CaseSession, caseId: string, playerId: string): CaseSession {
  return createSession(caseId, playerId);
}
