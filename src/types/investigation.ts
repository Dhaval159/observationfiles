export type InvestigationPhase =
  | "briefing"
  | "scene_examination"
  | "evidence_collection"
  | "witness_interviews"
  | "analysis"
  | "interrogation"
  | "theory_construction"
  | "confrontation"
  | "resolution"
  | "complete";

export type InvestigationAction =
  | "move_to_location"
  | "examine_scene"
  | "collect_evidence"
  | "analyze_evidence"
  | "make_observation"
  | "interview_witness"
  | "interrogate_suspect"
  | "present_evidence"
  | "review_case_file"
  | "check_timeline"
  | "update_theory_board"
  | "use_hint"
  | "make_accusation"
  | "complete_objective"
  | "unlock_discovery";

export interface InvestigationState {
  caseId: string;
  userId: string;
  phase: InvestigationPhase;
  startedAt: string;
  lastActivityAt: string;
  timePlayed: number;

  discoveredEvidence: Set<string>;
  discoveredObservations: Set<string>;
  discoveredLocations: Set<string>;
  interrogatedNPCs: Set<string>;

  completedObjectives: string[];
  activeObjectives: string[];
  hiddenDiscoveries: string[];

  currentLocation: string;
  currentChapter: number;
  currentObjective: string | null;

  unlockedActions: string[];
  actionHistory: ActionRecord[];

  globalFlags: Record<string, unknown>;

  completionPercentage: number;
  isPaused: boolean;
  isComplete: boolean;
}

export interface ActionRecord {
  id: string;
  type: InvestigationAction;
  timestamp: string;
  targetId: string;
  metadata: Record<string, unknown>;
}

export interface InvestigationConfig {
  autoSave: boolean;
  autoSaveInterval: number;
  maxHintsPerCase: number;
  showProgressBar: boolean;
  allowSkip: boolean;
  confirmAccusations: boolean;
  requireAllKeyEvidence: boolean;
  objectivesVisible: boolean;
}
