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
