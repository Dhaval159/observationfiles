import type { InvestigationPhase } from "@/types/investigation";

export interface InvestigationEvent {
  type:
    | "investigation_started"
    | "investigation_paused"
    | "investigation_resumed"
    | "investigation_reset"
    | "phase_change"
    | "location_change"
    | "evidence_collected"
    | "observation_discovered"
    | "npc_interrogated"
    | "objective_completed"
    | "discovery_unlocked"
    | "action_performed";
  payload: Record<string, unknown>;
}

export interface PhaseTransitionRule {
  from: InvestigationPhase;
  to: InvestigationPhase;
  conditions?: Record<string, unknown>;
}

export interface LocationState {
  id: string;
  name: string;
  description: string;
  connectedLocations: string[];
  evidenceHere: string[];
  observationsHere: string[];
  npcsHere: string[];
}

export interface InvestigationSummary {
  caseId: string;
  phase: InvestigationPhase;
  progress: number;
  timePlayed: number;
  evidenceFound: number;
  observationsMade: number;
  interrogationsCompleted: number;
}

export interface ProgressReport {
  overall: number;
  byCategory: {
    evidence: ProgressCategory;
    observations: ProgressCategory;
    interrogations: ProgressCategory;
    timeline: ProgressCategory;
    theoryBoard: ProgressCategory;
    objectives: ProgressCategory;
    contradictions: ProgressCategory;
  };
  hiddenDiscoveries: number;
  optionalCompleted: number;
  optionalTotal: number;
  estimatedTimeRemaining: number;
  recommendations: string[];
}

export interface ProgressCategory {
  completed: number;
  total: number;
  percentage: number;
  label: string;
}

export interface DiscoverySummary {
  id: string;
  name: string;
  type: "hidden" | "optional" | "achievement";
  discoveredAt: string;
  description: string;
}
