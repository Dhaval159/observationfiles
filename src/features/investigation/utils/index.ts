import type { InvestigationState, InvestigationPhase } from "@/types/investigation";
import type { CaseDefinition } from "@/types/case";
import type { ProgressReport, ProgressCategory } from "../types";

export const phasesInOrder: InvestigationPhase[] = [
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

export function getPhaseOrder(phase: InvestigationPhase): number {
  return phasesInOrder.indexOf(phase);
}

export function calculatePhaseCompletion(
  state: InvestigationState,
  caseDef: CaseDefinition,
): number {
  const allObjectives = caseDef.objectives;
  const phaseObjectives = allObjectives.filter((o) => {
    const objectiveType = o.type;
    switch (state.phase) {
      case "briefing":
        return objectiveType === "primary";
      case "scene_examination":
        return objectiveType === "primary";
      case "evidence_collection":
        return true;
      case "witness_interviews":
        return objectiveType === "primary" || objectiveType === "secondary";
      case "analysis":
        return true;
      case "interrogation":
        return objectiveType === "primary";
      case "theory_construction":
        return true;
      case "confrontation":
        return objectiveType === "primary";
      case "resolution":
        return true;
      case "complete":
        return true;
    }
  });

  if (phaseObjectives.length === 0) return 100;

  const completed = phaseObjectives.filter((o) => state.completedObjectives.includes(o.id)).length;

  return Math.round((completed / phaseObjectives.length) * 100);
}

export function isValidPhaseTransition(from: InvestigationPhase, to: InvestigationPhase): boolean {
  const fromIndex = phasesInOrder.indexOf(from);
  const toIndex = phasesInOrder.indexOf(to);

  if (fromIndex === -1 || toIndex === -1) return false;

  return toIndex === fromIndex + 1 || toIndex > fromIndex;
}

function makeCategory(completed: number, total: number, label: string): ProgressCategory {
  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    label,
  };
}

export function generateProgressReport(
  investigation: InvestigationState,
  evidenceProgress: {
    collected: number;
    total: number;
    keyCollected: number;
    keyTotal: number;
  },
  observationProgress: { discovered: number; total: number },
  timelineProgress: { discovered: number; total: number },
  theoryBoardProgress: { nodeCount: number; totalNodes: number },
  objectives: {
    completed: number;
    total: number;
    optionalCompleted: number;
    optionalTotal: number;
  },
  contradictionsCount: number,
): ProgressReport {
  const evidenceCat = makeCategory(evidenceProgress.collected, evidenceProgress.total, "Evidence");
  const observationsCat = makeCategory(
    observationProgress.discovered,
    observationProgress.total,
    "Observations",
  );
  const interrogationsCat = makeCategory(
    investigation.interrogatedNPCs.size,
    Math.max(investigation.interrogatedNPCs.size + 3, 5),
    "Interrogations",
  );
  const timelineCat = makeCategory(timelineProgress.discovered, timelineProgress.total, "Timeline");
  const theoryBoardCat = makeCategory(
    theoryBoardProgress.nodeCount,
    theoryBoardProgress.totalNodes,
    "Theory Board",
  );
  const objectivesCat = makeCategory(objectives.completed, objectives.total, "Objectives");
  const contradictionsCat = makeCategory(
    contradictionsCount,
    Math.max(contradictionsCount + 3, 5),
    "Contradictions",
  );

  const categories = [
    evidenceCat,
    observationsCat,
    interrogationsCat,
    timelineCat,
    theoryBoardCat,
    objectivesCat,
    contradictionsCat,
  ];

  const overall = calculateOverallProgress(categories);

  const report: ProgressReport = {
    overall,
    byCategory: {
      evidence: evidenceCat,
      observations: observationsCat,
      interrogations: interrogationsCat,
      timeline: timelineCat,
      theoryBoard: theoryBoardCat,
      objectives: objectivesCat,
      contradictions: contradictionsCat,
    },
    hiddenDiscoveries: investigation.hiddenDiscoveries.length,
    optionalCompleted: objectives.optionalCompleted,
    optionalTotal: objectives.optionalTotal,
    estimatedTimeRemaining: 0,
    recommendations: [],
  };

  const avgPerMinute = 2;
  const remainingItems =
    evidenceProgress.total -
    evidenceProgress.collected +
    (observationProgress.total - observationProgress.discovered) +
    (timelineProgress.total - timelineProgress.discovered) +
    (objectives.total - objectives.completed);

  report.estimatedTimeRemaining =
    avgPerMinute > 0 ? Math.max(Math.round(remainingItems / avgPerMinute), 1) : 0;

  report.recommendations = getRecommendations(report);

  return report;
}

export function calculateOverallProgress(categories: ProgressCategory[]): number {
  if (categories.length === 0) return 0;

  const weights: Record<string, number> = {
    Evidence: 0.2,
    Observations: 0.2,
    Interrogations: 0.15,
    Timeline: 0.15,
    "Theory Board": 0.1,
    Objectives: 0.15,
    Contradictions: 0.05,
  };

  let totalWeight = 0;
  let weightedSum = 0;

  for (const cat of categories) {
    const weight = weights[cat.label] ?? 1 / categories.length;
    weightedSum += cat.percentage * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

export function getRecommendations(report: ProgressReport): string[] {
  const recs: string[] = [];

  const cats = [
    { key: "evidence" as const, label: "evidence" },
    { key: "observations" as const, label: "observations" },
    { key: "interrogations" as const, label: "interrogations" },
    { key: "timeline" as const, label: "timeline events" },
    { key: "theoryBoard" as const, label: "theory board nodes" },
    { key: "objectives" as const, label: "objectives" },
    { key: "contradictions" as const, label: "contradictions" },
  ];

  for (const { key, label } of cats) {
    const cat = report.byCategory[key];
    if (cat.percentage < 30 && cat.completed < cat.total) {
      recs.push(`Focus on collecting ${label}`);
    } else if (cat.percentage < 70 && cat.completed < cat.total) {
      recs.push(`Continue working on ${label}`);
    }
  }

  const priorities = cats.filter(({ key }) => {
    const cat = report.byCategory[key];
    return cat.percentage < 50 && cat.completed < cat.total;
  });

  if (priorities.length > 0) {
    recs.push("Consider reviewing case notes for missed clues");
  }

  if (report.hiddenDiscoveries === 0) {
    recs.push("Explore less obvious connections for hidden discoveries");
  }

  if (report.optionalCompleted < report.optionalTotal) {
    recs.push("Complete optional objectives for bonus score");
  }

  return recs.length > 0 ? recs : ["All areas are well progressed. Review your theory"];
}
