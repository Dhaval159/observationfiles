import type { Command } from "./base-command";
import type { DomainTimestamp } from "../value-objects/timestamp";
import type { CaseDifficulty, NodeType, TheoryConnectionType } from "../enums";

export interface LoadCaseCommand extends Command {
  readonly type: "LOAD_CASE";
  readonly payload: {
    readonly caseId: string;
    readonly playerId: string;
    readonly difficulty?: CaseDifficulty;
  };
}

export interface CollectEvidenceCommand extends Command {
  readonly type: "COLLECT_EVIDENCE";
  readonly payload: {
    readonly caseId: string;
    readonly evidenceId: string;
    readonly locationId: string;
    readonly playerId: string;
  };
}

export interface AnalyzeEvidenceCommand extends Command {
  readonly type: "ANALYZE_EVIDENCE";
  readonly payload: {
    readonly caseId: string;
    readonly evidenceId: string;
    readonly playerId: string;
  };
}

export interface MakeObservationCommand extends Command {
  readonly type: "MAKE_OBSERVATION";
  readonly payload: {
    readonly caseId: string;
    readonly observationId: string;
    readonly objectId: string;
    readonly locationId: string;
    readonly playerId: string;
  };
}

export interface UnlockTaskCommand extends Command {
  readonly type: "UNLOCK_TASK";
  readonly payload: {
    readonly caseId: string;
    readonly taskId: string;
    readonly unlockCondition: Record<string, unknown>;
    readonly playerId: string;
  };
}

export interface CompleteObjectiveCommand extends Command {
  readonly type: "COMPLETE_OBJECTIVE";
  readonly payload: {
    readonly caseId: string;
    readonly objectiveId: string;
    readonly playerId: string;
  };
}

export interface SaveProgressCommand extends Command {
  readonly type: "SAVE_PROGRESS";
  readonly payload: {
    readonly saveId: string;
    readonly caseId: string;
    readonly playerId: string;
    readonly data: Record<string, unknown>;
  };
}

export interface LoadProgressCommand extends Command {
  readonly type: "LOAD_PROGRESS";
  readonly payload: {
    readonly saveId: string;
    readonly caseId: string;
    readonly playerId: string;
  };
}

export interface AddTimelineEventCommand extends Command {
  readonly type: "ADD_TIMELINE_EVENT";
  readonly payload: {
    readonly caseId: string;
    readonly event: {
      readonly title: string;
      readonly description: string;
      readonly timestamp: DomainTimestamp;
      readonly duration: number | null;
      readonly location: string | null;
      readonly participants: string[];
      readonly evidenceIds: string[];
      readonly certainty: "confirmed" | "likely" | "uncertain" | "disputed";
    };
    readonly playerId: string;
  };
}

export interface ConnectTheoryNodesCommand extends Command {
  readonly type: "CONNECT_THEORY_NODES";
  readonly payload: {
    readonly caseId: string;
    readonly sourceNodeId: string;
    readonly targetNodeId: string;
    readonly connectionType: TheoryConnectionType;
    readonly label: string;
    readonly playerId: string;
  };
}

export interface CreateTheoryNodeCommand extends Command {
  readonly type: "CREATE_THEORY_NODE";
  readonly payload: {
    readonly caseId: string;
    readonly nodeType: NodeType;
    readonly label: string;
    readonly description: string;
    readonly x: number;
    readonly y: number;
    readonly playerId: string;
  };
}

export interface UseHintCommand extends Command {
  readonly type: "USE_HINT";
  readonly payload: {
    readonly caseId: string;
    readonly hintId: string;
    readonly playerId: string;
  };
}

export interface FinishCaseCommand extends Command {
  readonly type: "FINISH_CASE";
  readonly payload: {
    readonly caseId: string;
    readonly playerId: string;
    readonly solution: {
      readonly suspectId: string;
      readonly motiveId: string;
      readonly explanation: string;
    };
  };
}

export interface ResetCaseCommand extends Command {
  readonly type: "RESET_CASE";
  readonly payload: {
    readonly caseId: string;
    readonly playerId: string;
  };
}

export type GameCommand =
  | LoadCaseCommand
  | CollectEvidenceCommand
  | AnalyzeEvidenceCommand
  | MakeObservationCommand
  | UnlockTaskCommand
  | CompleteObjectiveCommand
  | SaveProgressCommand
  | LoadProgressCommand
  | AddTimelineEventCommand
  | ConnectTheoryNodesCommand
  | CreateTheoryNodeCommand
  | UseHintCommand
  | FinishCaseCommand
  | ResetCaseCommand;

export type GameCommandType = GameCommand["type"];
