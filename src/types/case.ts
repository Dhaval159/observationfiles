export interface Case {
  id: string;
  title: string;
  description: string;
  difficulty: CaseDifficulty;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
}

export type CaseDifficulty = "beginner" | "intermediate" | "advanced" | "expert";
export type CaseStatus = "locked" | "available" | "in-progress" | "completed" | "failed";

export interface CaseProgress {
  caseId: string;
  userId: string;
  status: CaseStatus;
  score: number;
  timeSpent: number;
  cluesFound: number;
  totalClues: number;
  startedAt: string | null;
  completedAt: string | null;
}

export interface CaseMetadata {
  author: string;
  genre: string;
  timePeriod: string;
  location: string;
  summary: string;
  coverImageUrl: string | null;
  tags: string[];
  difficulty: CaseDifficulty;
  estimatedTime: number;
  minPlayers: number;
  maxPlayers: number;
}

export interface CaseObjective {
  id: string;
  description: string;
  type: "primary" | "secondary" | "hidden";
  completionCondition: Record<string, unknown>;
  isCompleted: boolean;
  isRevealed: boolean;
}

export interface CaseLocation {
  id: string;
  name: string;
  description: string;
  connectedLocations: string[];
  unlockCondition: CaseUnlockCondition | null;
  initialView: string | null;
}

export interface CaseChapter {
  id: string;
  caseId: string;
  title: string;
  description: string;
  order: number;
  unlockCondition: CaseUnlockCondition | null;
  objectives: CaseObjective[];
}

export interface CaseSolution {
  correctSuspect: string;
  correctMotive: string;
  explanation: string;
  requiredEvidence: string[];
  requiredObservations: string[];
  minimumScore: number;
}

export interface CaseUnlockCondition {
  type: "previous_case" | "score_threshold" | "achievement" | "date" | "custom";
  config: Record<string, unknown>;
}

export interface CaseConfig {
  hint_penalty: number;
  time_bonus: number;
  score_multiplier: number;
  available_hints_max: number;
}

export interface FullCase extends Case {
  metadata: CaseMetadata;
  objectives: CaseObjective[];
  locations: CaseLocation[];
  chapters: CaseChapter[];
  solution: CaseSolution;
  config: CaseConfig;
}

export interface CaseDefinition {
  id: string;
  title: string;
  description: string;
  difficulty: CaseDifficulty;
  metadata: Omit<CaseMetadata, "tags"> & { tags: string[] };
  objectives: Omit<CaseObjective, "isCompleted" | "isRevealed">[];
  locations: (Omit<CaseLocation, "connectedLocations"> & { connectedLocations: string[] })[];
  chapters: (Omit<CaseChapter, "objectives"> &
    { objectives: Omit<CaseObjective, "isCompleted" | "isRevealed">[] })[];
  solution: CaseSolution;
  unlockCondition: CaseUnlockCondition;
  config: CaseConfig;
}
