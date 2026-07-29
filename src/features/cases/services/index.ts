import type { GameEngine, EventEmitter } from "@/types/engine";
import type {
  CaseDefinition,
  CaseMetadata,
  CaseObjective,
  CaseLocation,
  CaseChapter,
  CaseSolution,
} from "@/types/case";
import type { InvestigationState } from "@/types/investigation";

export class CaseEngine implements GameEngine<CaseDefinition, InvestigationState> {
  readonly id: string;
  readonly name = "CaseEngine";

  private currentCase: CaseDefinition | null = null;
  private currentChapterIndex = 0;
  private state: InvestigationState | null = null;
  private emitter: EventEmitter;

  constructor(emitter: EventEmitter) {
    this.id = `case-engine-${Math.random().toString(36).slice(2, 9)}`;
    this.emitter = emitter;
  }

  loadCase(caseDef: CaseDefinition): void {
    this.currentCase = caseDef;
    this.currentChapterIndex = 0;

    this.state = {
      caseId: caseDef.id,
      userId: "",
      phase: "briefing",
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      timePlayed: 0,
      discoveredEvidence: new Set(),
      discoveredObservations: new Set(),
      discoveredLocations: new Set(),
      interrogatedNPCs: new Set(),
      completedObjectives: [],
      activeObjectives: caseDef.objectives.filter((o) => o.type !== "hidden").map((o) => o.id),
      hiddenDiscoveries: [],
      currentLocation: "",
      currentChapter: 0,
      currentObjective: null,
      unlockedActions: [],
      actionHistory: [],
      globalFlags: {},
      completionPercentage: 0,
      isPaused: false,
      isComplete: false,
    };

    this.emitter.emit("case_loaded", { caseId: caseDef.id });
  }

  getCase(): CaseDefinition | null {
    return this.currentCase;
  }

  getMetadata(): CaseMetadata {
    if (!this.currentCase) {
      throw new Error("No case loaded");
    }
    return { ...this.currentCase.metadata } as CaseMetadata;
  }

  getObjectives(includeHidden = false): CaseObjective[] {
    if (!this.currentCase) return [];
    const allObjectives = this.currentCase.objectives as CaseObjective[];

    if (includeHidden) return allObjectives;

    const hiddenIds = this.state?.hiddenDiscoveries ?? [];
    return allObjectives.filter((o) => o.type !== "hidden" || hiddenIds.includes(o.id));
  }

  getLocations(): CaseLocation[] {
    if (!this.currentCase) return [];
    return this.currentCase.locations as unknown as CaseLocation[];
  }

  getCurrentChapter(): CaseChapter | null {
    if (!this.currentCase || this.currentCase.chapters.length === 0) return null;
    return this.currentCase.chapters[this.currentChapterIndex] as CaseChapter | null;
  }

  advanceChapter(): boolean {
    if (!this.currentCase) return false;
    const nextIndex = this.currentChapterIndex + 1;
    if (nextIndex >= this.currentCase.chapters.length) return false;

    const nextChapter = this.currentCase.chapters[nextIndex];
    if (!nextChapter) return false;

    const unlockCondition = (
      nextChapter as { unlockCondition?: { type: string; config: Record<string, unknown> } | null }
    ).unlockCondition;
    if (unlockCondition && !this.evaluateCondition(unlockCondition)) {
      return false;
    }

    this.currentChapterIndex = nextIndex;
    if (this.state) {
      this.state.currentChapter = nextIndex;
    }

    const chapterObjectives = (nextChapter as { objectives?: { id: string }[] }).objectives;
    if (chapterObjectives && this.state) {
      const objectiveIds = chapterObjectives.map((o) => o.id);
      this.state.activeObjectives = objectiveIds;
    }

    this.emitter.emit("chapter_advanced", {
      caseId: this.currentCase.id,
      chapter: nextIndex,
      title: (nextChapter as { title?: string }).title,
    });

    return true;
  }

  getChapters(): CaseChapter[] {
    if (!this.currentCase) return [];
    return this.currentCase.chapters as unknown as CaseChapter[];
  }

  getSolution(): CaseSolution {
    if (!this.currentCase) {
      throw new Error("No case loaded");
    }
    return this.currentCase.solution;
  }

  isUnlocked(caseId: string, progress: { completedCases: string[]; totalScore: number }): boolean {
    if (!this.currentCase || this.currentCase.id !== caseId) return false;

    const condition = this.currentCase.unlockCondition;
    if (!condition) return true;

    return this.evaluateUnlockCondition(condition, progress);
  }

  initialize(definition: CaseDefinition): void {
    this.loadCase(definition);
  }

  getState(): InvestigationState {
    if (!this.state) {
      throw new Error("No case loaded");
    }
    return this.state;
  }

  reset(): void {
    this.currentCase = null;
    this.currentChapterIndex = 0;
    this.state = null;
    this.emitter.emit("case_reset");
  }

  serialize(): string {
    if (!this.state) return "{}";
    const serializable = {
      ...this.state,
      discoveredEvidence: Array.from(this.state.discoveredEvidence),
      discoveredObservations: Array.from(this.state.discoveredObservations),
      discoveredLocations: Array.from(this.state.discoveredLocations),
      interrogatedNPCs: Array.from(this.state.interrogatedNPCs),
      currentCaseId: this.currentCase?.id ?? null,
      currentChapterIndex: this.currentChapterIndex,
    };
    return JSON.stringify(serializable);
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    if (parsed.currentCaseId && this.currentCase?.id !== parsed.currentCaseId) {
      return;
    }
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
    this.currentChapterIndex = parsed.currentChapterIndex ?? 0;
  }

  getAvailableLocations(): CaseLocation[] {
    if (!this.currentCase) return [];
    const allLocations = this.currentCase.locations as unknown as (CaseLocation & {
      unlockCondition?: { type: string; config: Record<string, unknown> } | null;
    })[];
    return allLocations.filter((loc) => {
      if (!loc.unlockCondition) return true;
      return this.evaluateCondition(loc.unlockCondition);
    });
  }

  getRequiredEvidence(): string[] {
    if (!this.currentCase) return [];
    return this.currentCase.solution.requiredEvidence;
  }

  getRequiredObservations(): string[] {
    if (!this.currentCase) return [];
    return this.currentCase.solution.requiredObservations;
  }

  validateProgress(state: InvestigationState): { valid: boolean; missing: string[] } {
    const required = this.getRequiredEvidence();
    const missing = required.filter((id) => !state.discoveredEvidence.has(id));

    const requiredObs = this.getRequiredObservations();
    const missingObs = requiredObs.filter((id) => !state.discoveredObservations.has(id));

    return {
      valid: missing.length === 0 && missingObs.length === 0,
      missing: [...missing, ...missingObs],
    };
  }

  private evaluateCondition(condition: { type: string; config: Record<string, unknown> }): boolean {
    if (!this.state) return false;

    switch (condition.type) {
      case "chapter_complete": {
        const chapter = condition.config.chapter as number;
        return this.currentChapterIndex >= chapter;
      }
      case "evidence_collected": {
        const evidenceId = condition.config.evidenceId as string;
        return this.state.discoveredEvidence.has(evidenceId);
      }
      case "observation_made": {
        const observationId = condition.config.observationId as string;
        return this.state.discoveredObservations.has(observationId);
      }
      case "objective_completed": {
        const objectiveId = condition.config.objectiveId as string;
        return this.state.completedObjectives.includes(objectiveId);
      }
      case "npc_interrogated": {
        const npcId = condition.config.npcId as string;
        return this.state.interrogatedNPCs.has(npcId);
      }
      case "all_objectives_complete": {
        const allComplete =
          this.state.activeObjectives.length > 0 &&
          this.state.activeObjectives.every((id) => this.state!.completedObjectives.includes(id));
        return allComplete;
      }
      case "custom": {
        const flag = condition.config.flag as string;
        return !!this.state.globalFlags[flag];
      }
      default:
        return true;
    }
  }

  private evaluateUnlockCondition(
    condition: { type: string; config: Record<string, unknown> },
    progress: { completedCases: string[]; totalScore: number },
  ): boolean {
    switch (condition.type) {
      case "previous_case": {
        const caseId = condition.config.caseId as string;
        return progress.completedCases.includes(caseId);
      }
      case "score_threshold": {
        const threshold = condition.config.threshold as number;
        return progress.totalScore >= threshold;
      }
      case "achievement": {
        const achievementId = condition.config.achievementId as string;
        return (
          (condition.config.unlockedAchievements as string[])?.includes(achievementId) ?? false
        );
      }
      case "date": {
        const date = new Date(condition.config.date as string);
        return new Date() >= date;
      }
      case "custom": {
        const flag = condition.config.flag as string;
        return !!(progress as unknown as Record<string, unknown>)[flag];
      }
      default:
        return true;
    }
  }
}
