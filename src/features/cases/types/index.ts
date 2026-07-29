import type { CaseDefinition } from "@/types/case";
import type { ValidationResult } from "@/types/engine";
import type { CaseEngine } from "../services";

export interface CaseLoadResult {
  case: CaseDefinition;
  engine: CaseEngine;
  validation: ValidationResult;
}

export interface ChapterProgress {
  chapterId: string;
  title: string;
  isComplete: boolean;
  objectivesComplete: number;
  totalObjectives: number;
}

export interface CaseObjectiveStatus {
  objectiveId: string;
  type: "primary" | "secondary" | "hidden";
  description: string;
  isComplete: boolean;
  isVisible: boolean;
  isHidden: boolean;
}
