import type { EventEmitter } from "@/types/engine";
import type {
  InvestigationState,
  InvestigationPhase,
  InvestigationAction,
  ActionRecord,
} from "@/types/investigation";

export class InvestigationEngine {
  readonly id: string;

  private state: InvestigationState | null = null;
  private emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.id = `investigation-engine-${Math.random().toString(36).slice(2, 9)}`;
    this.emitter = emitter;
  }

  startInvestigation(caseId: string, userId: string): InvestigationState {
    this.state = {
      caseId,
      userId,
      phase: "briefing",
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      timePlayed: 0,
      discoveredEvidence: new Set(),
      discoveredObservations: new Set(),
      discoveredLocations: new Set(),
      interrogatedNPCs: new Set(),
      completedObjectives: [],
      activeObjectives: [],
      hiddenDiscoveries: [],
      currentLocation: "",
      currentChapter: 0,
      currentObjective: null,
      unlockedActions: ["move_to_location", "examine_scene", "review_case_file"],
      actionHistory: [],
      globalFlags: {},
      completionPercentage: 0,
      isPaused: false,
      isComplete: false,
    };

    this.emitter.emit("investigation_started", { caseId, userId });
    return this.state;
  }

  getState(): InvestigationState {
    if (!this.state) {
      throw new Error("No investigation started");
    }
    return this.state;
  }

  advancePhase(phase: InvestigationPhase): void {
    if (!this.state) throw new Error("No investigation started");
    if (!this.canAdvanceToPhase(phase)) {
      throw new Error(`Cannot advance from ${this.state.phase} to ${phase}`);
    }

    const previousPhase = this.state.phase;
    this.state.phase = phase;
    this.state.lastActivityAt = new Date().toISOString();

    if (phase === "complete") {
      this.state.isComplete = true;
      this.state.completionPercentage = 100;
    }

    this.emitter.emit("phase_change", {
      from: previousPhase,
      to: phase,
      caseId: this.state.caseId,
    });
  }

  moveToLocation(locationId: string): void {
    if (!this.state) throw new Error("No investigation started");

    const previousLocation = this.state.currentLocation;
    this.state.currentLocation = locationId;
    this.state.discoveredLocations.add(locationId);
    this.state.lastActivityAt = new Date().toISOString();

    this.recordAction("move_to_location", locationId, { previousLocation });

    this.emitter.emit("location_change", {
      from: previousLocation,
      to: locationId,
      caseId: this.state.caseId,
    });
  }

  collectEvidence(evidenceId: string): void {
    if (!this.state) throw new Error("No investigation started");

    this.state.discoveredEvidence.add(evidenceId);
    this.state.lastActivityAt = new Date().toISOString();

    this.recordAction("collect_evidence", evidenceId);

    this.emitter.emit("evidence_collected", {
      evidenceId,
      caseId: this.state.caseId,
    });
  }

  discoverObservation(observationId: string): void {
    if (!this.state) throw new Error("No investigation started");

    this.state.discoveredObservations.add(observationId);
    this.state.lastActivityAt = new Date().toISOString();

    this.recordAction("make_observation", observationId);

    this.emitter.emit("observation_discovered", {
      observationId,
      caseId: this.state.caseId,
    });
  }

  markNPCInterrogated(npcId: string): void {
    if (!this.state) throw new Error("No investigation started");

    this.state.interrogatedNPCs.add(npcId);
    this.state.lastActivityAt = new Date().toISOString();

    this.recordAction("interrogate_suspect", npcId);

    this.emitter.emit("npc_interrogated", {
      npcId,
      caseId: this.state.caseId,
    });
  }

  completeObjective(objectiveId: string): void {
    if (!this.state) throw new Error("No investigation started");

    if (this.state.completedObjectives.includes(objectiveId)) return;

    this.state.completedObjectives.push(objectiveId);
    this.state.activeObjectives = this.state.activeObjectives.filter((id) => id !== objectiveId);
    this.state.lastActivityAt = new Date().toISOString();

    this.recordAction("complete_objective", objectiveId);

    this.emitter.emit("objective_completed", {
      objectiveId,
      caseId: this.state.caseId,
    });
  }

  unlockAction(actionId: string): void {
    if (!this.state) throw new Error("No investigation started");

    if (this.state.unlockedActions.includes(actionId)) return;

    this.state.unlockedActions.push(actionId);
    this.state.lastActivityAt = new Date().toISOString();
  }

  unlockDiscovery(discoveryId: string): void {
    if (!this.state) throw new Error("No investigation started");

    if (this.state.hiddenDiscoveries.includes(discoveryId)) return;

    this.state.hiddenDiscoveries.push(discoveryId);
    this.state.lastActivityAt = new Date().toISOString();

    this.recordAction("unlock_discovery", discoveryId);

    this.emitter.emit("discovery_unlocked", {
      discoveryId,
      caseId: this.state.caseId,
    });
  }

  recordAction(
    type: InvestigationAction,
    targetId: string,
    metadata: Record<string, unknown> = {},
  ): void {
    if (!this.state) throw new Error("No investigation started");

    const record: ActionRecord = {
      id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      timestamp: new Date().toISOString(),
      targetId,
      metadata,
    };

    this.state.actionHistory.push(record);

    this.emitter.emit("action_performed", { record, caseId: this.state.caseId });
  }

  setGlobalFlag(key: string, value: unknown): void {
    if (!this.state) throw new Error("No investigation started");
    this.state.globalFlags[key] = value;
  }

  getGlobalFlag<T>(key: string): T | null {
    if (!this.state) throw new Error("No investigation started");
    return (this.state.globalFlags[key] as T) ?? null;
  }

  getCompletionPercentage(): number {
    if (!this.state) return 0;

    const state = this.state;

    const totalObjectives = state.completedObjectives.length + state.activeObjectives.length;
    const objectiveScore =
      totalObjectives > 0 ? state.completedObjectives.length / totalObjectives : 1;

    const maxEvidence = 10;
    const evidenceScore = Math.min(state.discoveredEvidence.size / maxEvidence, 1);

    const maxObservations = 10;
    const observationScore = Math.min(state.discoveredObservations.size / maxObservations, 1);

    const maxInterrogations = 5;
    const interrogationScore = Math.min(state.interrogatedNPCs.size / maxInterrogations, 1);

    const percentage =
      objectiveScore * 0.3 +
      evidenceScore * 0.25 +
      observationScore * 0.25 +
      interrogationScore * 0.2;

    return Math.min(Math.round(percentage * 100), 100);
  }

  isPhaseComplete(phase: InvestigationPhase): boolean {
    if (!this.state) return false;
    const phaseOrder = this.getPhaseOrder(phase);
    const currentOrder = this.getPhaseOrder(this.state.phase);
    return currentOrder > phaseOrder || this.state.isComplete;
  }

  getAvailableActions(): InvestigationAction[] {
    if (!this.state) return [];

    const actions = new Set<InvestigationAction>();

    for (const actionId of this.state.unlockedActions) {
      if (this.isValidAction(actionId)) {
        actions.add(actionId as InvestigationAction);
      }
    }

    return Array.from(actions);
  }

  canAdvanceToPhase(phase: InvestigationPhase): boolean {
    if (!this.state) return false;
    return isValidPhaseTransition(this.state.phase, phase);
  }

  setCurrentObjective(objectiveId: string | null): void {
    if (!this.state) throw new Error("No investigation started");
    this.state.currentObjective = objectiveId;
  }

  pause(): void {
    if (!this.state) throw new Error("No investigation started");
    this.state.isPaused = true;
    this.emitter.emit("investigation_paused", { caseId: this.state.caseId });
  }

  resume(): void {
    if (!this.state) throw new Error("No investigation started");
    this.state.isPaused = false;
    this.state.lastActivityAt = new Date().toISOString();
    this.emitter.emit("investigation_resumed", { caseId: this.state.caseId });
  }

  serialize(): string {
    if (!this.state) return "{}";
    const serializable = {
      ...this.state,
      discoveredEvidence: Array.from(this.state.discoveredEvidence),
      discoveredObservations: Array.from(this.state.discoveredObservations),
      discoveredLocations: Array.from(this.state.discoveredLocations),
      interrogatedNPCs: Array.from(this.state.interrogatedNPCs),
    };
    return JSON.stringify(serializable);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.state = {
      caseId: parsed.caseId,
      userId: parsed.userId,
      phase: parsed.phase,
      startedAt: parsed.startedAt,
      lastActivityAt: parsed.lastActivityAt,
      timePlayed: parsed.timePlayed,
      discoveredEvidence: new Set(parsed.discoveredEvidence),
      discoveredObservations: new Set(parsed.discoveredObservations),
      discoveredLocations: new Set(parsed.discoveredLocations),
      interrogatedNPCs: new Set(parsed.interrogatedNPCs),
      completedObjectives: parsed.completedObjectives,
      activeObjectives: parsed.activeObjectives,
      hiddenDiscoveries: parsed.hiddenDiscoveries,
      currentLocation: parsed.currentLocation,
      currentChapter: parsed.currentChapter,
      currentObjective: parsed.currentObjective,
      unlockedActions: parsed.unlockedActions,
      actionHistory: parsed.actionHistory,
      globalFlags: parsed.globalFlags,
      completionPercentage: parsed.completionPercentage,
      isPaused: parsed.isPaused,
      isComplete: parsed.isComplete,
    };
  }

  reset(): void {
    if (this.state) {
      this.emitter.emit("investigation_reset", { caseId: this.state.caseId });
    }
    this.state = null;
  }

  private getPhaseOrder(phase: InvestigationPhase): number {
    return phasesInOrder.indexOf(phase);
  }

  private isValidAction(actionId: string): boolean {
    const validActions: InvestigationAction[] = [
      "move_to_location",
      "examine_scene",
      "collect_evidence",
      "analyze_evidence",
      "make_observation",
      "interview_witness",
      "interrogate_suspect",
      "present_evidence",
      "review_case_file",
      "check_timeline",
      "update_theory_board",
      "use_hint",
      "make_accusation",
      "complete_objective",
      "unlock_discovery",
    ];
    return validActions.includes(actionId as InvestigationAction);
  }
}

const phasesInOrder: InvestigationPhase[] = [
  "briefing",
  "scene_examination",
  "evidence_collection",
  "witness_interviews",
  "analysis",
  "interrogation",
  "theory_construction",
  "confrontation",
  "resolution",
  "complete",
];

function isValidPhaseTransition(from: InvestigationPhase, to: InvestigationPhase): boolean {
  const fromIndex = phasesInOrder.indexOf(from);
  const toIndex = phasesInOrder.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) return false;

  return toIndex === fromIndex + 1 || toIndex > fromIndex;
}
