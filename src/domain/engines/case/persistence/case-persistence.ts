import type { CasePersistence, CaseContext, VariableValue } from "../types";
import type { Result } from "@/domain/results/result";
import { success, failure, tryCatch } from "@/domain/results/result";
import { SaveNotFoundError, SaveCorruptedError, SerializationError } from "@/domain/errors/domain-error";
import { deepClone } from "@/domain/utils/deep-clone";
import { createDomainTimestamp } from "@/domain/value-objects/timestamp";

interface SerializedSession {
  id: string;
  caseId: string;
  playerId: string;
  currentLocationId: string | null;
  visitedLocationIds: string[];
  discoveredEvidenceIds: string[];
  discoveredObservationIds: string[];
  completedObjectiveIds: string[];
  activeObjectiveIds: string[];
  unlockedContentIds: string[];
  playerNotes: Record<string, string>;
  temporaryVariables: Record<string, unknown>;
  currentScreen: string | null;
  openedPanels: string[];
  startedAt: string;
  lastActivityAt: string;
  playTimeSeconds: number;
  pauseStartTime: string | null;
  totalPausedTimeSeconds: number;
}

interface SerializedContext {
  id: string;
  playerId: string;
  session: SerializedSession;
  lifecycleState: string;
  lifecycleHistory: Array<{ type: string; previousState: string; timestamp: string; metadata?: Record<string, unknown> }>;
  flags: Record<string, unknown>;
  variables: Record<string, unknown>;
  unlockStates: Record<string, boolean>;
  errors: Array<{ name: string; message: string }>;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export class InMemoryCasePersistence implements CasePersistence {
  private _saves: Map<string, Map<string, string>> = new Map();

  private _getPlayerSaves(playerId: string): Map<string, string> {
    if (!this._saves.has(playerId)) {
      this._saves.set(playerId, new Map());
    }
    return this._saves.get(playerId)!;
  }

  async save(context: CaseContext): Promise<Result<CaseContext>> {
    return tryCatch(() => {
      const serialized = this._serializeContext(context);
      const saves = this._getPlayerSaves(context.playerId);
      saves.set(context.session.caseId, serialized);
      return deepClone(context);
    });
  }

  async restore(playerId: string, caseId: string): Promise<Result<CaseContext>> {
    const saves = this._getPlayerSaves(playerId);
    const serialized = saves.get(caseId);
    if (!serialized) {
      return failure(new SaveNotFoundError(`${playerId}_${caseId}`));
    }
    return tryCatch(() => this._deserializeContext(serialized));
  }

  async autoSave(context: CaseContext): Promise<Result<CaseContext>> {
    return this.save(context);
  }

  async listSaves(playerId: string): Promise<Result<string[]>> {
    const saves = this._getPlayerSaves(playerId);
    return success([...saves.keys()]);
  }

  async deleteSave(playerId: string, caseId: string): Promise<Result<void>> {
    const saves = this._getPlayerSaves(playerId);
    saves.delete(caseId);
    return success(undefined);
  }

  async hasSave(playerId: string, caseId: string): Promise<Result<boolean>> {
    const saves = this._getPlayerSaves(playerId);
    return success(saves.has(caseId));
  }

  private _serializeContext(context: CaseContext): string {
    try {
      const data: SerializedContext = {
        id: context.id,
        playerId: context.playerId,
        session: {
          id: context.session.id,
          caseId: context.session.caseId,
          playerId: context.session.playerId,
          currentLocationId: context.session.currentLocationId,
          visitedLocationIds: [...context.session.visitedLocationIds],
          discoveredEvidenceIds: [...context.session.discoveredEvidenceIds],
          discoveredObservationIds: [...context.session.discoveredObservationIds],
          completedObjectiveIds: [...context.session.completedObjectiveIds],
          activeObjectiveIds: [...context.session.activeObjectiveIds],
          unlockedContentIds: [...context.session.unlockedContentIds],
          playerNotes: context.session.playerNotes,
          temporaryVariables: context.session.temporaryVariables,
          currentScreen: context.session.currentScreen,
          openedPanels: [...context.session.openedPanels],
          startedAt: context.session.startedAt.toISOString(),
          lastActivityAt: context.session.lastActivityAt.toISOString(),
          playTimeSeconds: context.session.playTimeSeconds,
          pauseStartTime: context.session.pauseStartTime?.toISOString() ?? null,
          totalPausedTimeSeconds: context.session.totalPausedTimeSeconds,
        },
        lifecycleState: context.lifecycleState,
        lifecycleHistory: context.lifecycleHistory.map((e) => ({
          type: e.type,
          previousState: e.previousState,
          timestamp: e.timestamp.toISOString(),
          metadata: e.metadata,
        })),
        flags: Object.fromEntries(context.flags),
        variables: Object.fromEntries(context.variables),
        unlockStates: Object.fromEntries(context.unlockStates),
        errors: context.errors.map((e) => ({ name: e.name, message: e.message })),
        metadata: Object.fromEntries(context.metadata),
        createdAt: context.createdAt.toISOString(),
        updatedAt: context.updatedAt.toISOString(),
      };
      return JSON.stringify(data);
    } catch (err) {
      throw new SerializationError(
        `Failed to serialize case context: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private _deserializeContext(serialized: string): CaseContext {
    try {
      const data = JSON.parse(serialized) as SerializedContext;
      const session = data.session;

      return {
        id: data.id,
        playerId: data.playerId,
        session: {
          id: session.id,
          caseId: session.caseId,
          playerId: session.playerId,
          currentLocationId: session.currentLocationId,
          visitedLocationIds: new Set(session.visitedLocationIds),
          discoveredEvidenceIds: new Set(session.discoveredEvidenceIds),
          discoveredObservationIds: new Set(session.discoveredObservationIds),
          completedObjectiveIds: new Set(session.completedObjectiveIds),
          activeObjectiveIds: new Set(session.activeObjectiveIds),
          unlockedContentIds: new Set(session.unlockedContentIds),
          playerNotes: session.playerNotes,
          temporaryVariables: session.temporaryVariables,
          currentScreen: session.currentScreen,
          openedPanels: new Set(session.openedPanels),
          startedAt: createDomainTimestamp(session.startedAt),
          lastActivityAt: createDomainTimestamp(session.lastActivityAt),
          playTimeSeconds: session.playTimeSeconds,
          pauseStartTime: session.pauseStartTime ? createDomainTimestamp(session.pauseStartTime) : null,
          totalPausedTimeSeconds: session.totalPausedTimeSeconds,
        },
        caseDefinition: null,
        activeCase: null,
        lifecycleState: data.lifecycleState as CaseContext["lifecycleState"],
        lifecycleHistory: [],
        objectives: [],
        flags: new Map(Object.entries(data.flags ?? {})),
        variables: new Map(Object.entries(data.variables ?? {})) as Map<string, VariableValue>,
        unlockStates: new Map(Object.entries(data.unlockStates ?? {})),
        dependencyGraph: null,
        progress: null,
        errors: [],
        metadata: new Map(Object.entries(data.metadata ?? {})),
        createdAt: createDomainTimestamp(data.createdAt),
        updatedAt: createDomainTimestamp(data.updatedAt),
      };
    } catch (err) {
      throw new SaveCorruptedError(
        "unknown",
        `Failed to deserialize case context: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
