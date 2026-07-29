import type { EventEmitter } from "@/types/engine";
import type { ScoreBreakdown, ScoringConfig, ScoreResult, StarRating } from "@/types/scoring";
import type { ScoringEngineState, ScoreUpdateEvent } from "../types";
import {
  calculateStarRating,
  calculateRank,
  calculateTimeBonus,
  calculatePenaltyMultiplier,
  createDefaultScoringConfig,
} from "../utils";

export class ScoringEngine {
  private emitter: EventEmitter;
  private state: ScoringEngineState;
  private userId: string;
  private caseId: string;
  private previousHighScore: number;

  constructor(emitter: EventEmitter, config?: ScoringConfig) {
    this.emitter = emitter;
    this.userId = "";
    this.caseId = "";
    this.previousHighScore = 0;

    const defaultConfig = config ?? createDefaultScoringConfig();

    this.state = {
      config: defaultConfig,
      currentScores: {
        observationScore: 0,
        evidenceScore: 0,
        logicScore: 0,
        timelineAccuracy: 0,
        contradictionsFound: 0,
        interrogationScore: 0,
        theoryBoardAccuracy: 0,
        hintsPenalty: 0,
        wrongAccusationsPenalty: 0,
        timeBonus: 0,
        optionalBonus: 0,
        hiddenDiscoveryBonus: 0,
      },
      hintsUsed: 0,
      wrongAccusations: 0,
      startTime: new Date().toISOString(),
      completionTime: null,
      isComplete: false,
    };
  }

  setConfig(config: ScoringConfig): void {
    this.state.config = config;
  }

  setUserContext(userId: string, caseId: string, previousHighScore?: number): void {
    this.userId = userId;
    this.caseId = caseId;
    this.previousHighScore = previousHighScore ?? 0;
  }

  startScoring(): void {
    this.state.startTime = new Date().toISOString();
    this.state.isComplete = false;
    this.state.completionTime = null;
  }

  private updateCategory(category: keyof ScoreBreakdown, points: number, reason?: string): void {
    const oldValue = this.state.currentScores[category] ?? 0;
    const newValue = oldValue + points;
    this.state.currentScores[category] = newValue;

    const event: ScoreUpdateEvent = {
      category,
      oldValue,
      newValue,
      delta: points,
      reason: reason ?? `Added ${points} points to ${category}`,
    };

    this.emitter.emit("score_updated", event);
  }

  addObservationScore(points: number, reason?: string): void {
    this.updateCategory("observationScore", points, reason);
  }

  addEvidenceScore(points: number, reason?: string): void {
    this.updateCategory("evidenceScore", points, reason);
  }

  addLogicScore(points: number, reason?: string): void {
    this.updateCategory("logicScore", points, reason);
  }

  addTimelineAccuracy(points: number, reason?: string): void {
    this.updateCategory("timelineAccuracy", points, reason);
  }

  addContradictionScore(points: number, reason?: string): void {
    this.updateCategory("contradictionsFound", points, reason);
  }

  addInterrogationScore(points: number, reason?: string): void {
    this.updateCategory("interrogationScore", points, reason);
  }

  addTheoryBoardScore(points: number, reason?: string): void {
    this.updateCategory("theoryBoardAccuracy", points, reason);
  }

  addOptionalBonus(points: number): void {
    this.updateCategory("optionalBonus", points, "Optional objective bonus");
  }

  addHiddenDiscoveryBonus(points: number): void {
    this.updateCategory("hiddenDiscoveryBonus", points, "Hidden discovery bonus");
  }

  recordHintUsed(): void {
    this.state.hintsUsed++;
    const penalty = Math.round(
      this.state.config.hintPenaltyPerHint * calculatePenaltyMultiplier(this.state.hintsUsed),
    );
    this.updateCategory("hintsPenalty", penalty, `Hint used (#${this.state.hintsUsed})`);
  }

  recordWrongAccusation(): void {
    this.state.wrongAccusations++;
    this.updateCategory(
      "wrongAccusationsPenalty",
      this.state.config.wrongAccusationPenalty,
      `Wrong accusation (#${this.state.wrongAccusations})`,
    );
  }

  getCurrentScores(): ScoreBreakdown {
    return { ...this.state.currentScores };
  }

  getTotalScore(): number {
    const s = this.state.currentScores;
    return (
      s.observationScore +
      s.evidenceScore +
      s.logicScore +
      s.timelineAccuracy +
      s.contradictionsFound +
      s.interrogationScore +
      s.theoryBoardAccuracy +
      s.timeBonus +
      s.optionalBonus +
      s.hiddenDiscoveryBonus -
      s.hintsPenalty -
      s.wrongAccusationsPenalty
    );
  }

  getHintsUsed(): number {
    return this.state.hintsUsed;
  }

  getWrongAccusations(): number {
    return this.state.wrongAccusations;
  }

  finalizeScore(): ScoreResult {
    this.state.completionTime = new Date().toISOString();
    this.state.isComplete = true;

    const elapsedMinutes = this.getTimeElapsed();
    const timeBonus = calculateTimeBonus(
      this.state.config.timeBonusMax,
      this.state.config.timeBonusDecayRate,
      elapsedMinutes,
    );
    this.state.currentScores.timeBonus = timeBonus;

    const totalScore = this.getTotalScore();
    const starRating = this.calculateStarRating(totalScore);
    const rank = this.calculateRank(starRating);

    const result: ScoreResult = {
      userId: this.userId,
      caseId: this.caseId,
      totalScore,
      breakdown: { ...this.state.currentScores },
      starRating,
      isPassing: totalScore >= this.state.config.minPassingScore,
      rank,
      hintsUsed: this.state.hintsUsed,
      wrongAccusations: this.state.wrongAccusations,
      completionTimeMinutes: Math.round(elapsedMinutes * 10) / 10,
      completedAt: this.state.completionTime,
      isNewHighScore: totalScore > this.previousHighScore,
      percentile: null,
    };

    this.emitter.emit("score_finalized", result);
    return result;
  }

  calculateStarRating(score: number): StarRating {
    return calculateStarRating(score, this.state.config.starThresholds);
  }

  calculateRank(starRating: StarRating): "S" | "A" | "B" | "C" | "D" | "F" {
    return calculateRank(starRating);
  }

  getProgress(): { current: number; max: number; percentage: number } {
    const current = this.getTotalScore();
    const max = this.state.config.maxPossibleScore;
    const percentage = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0;
    return { current, max, percentage };
  }

  isPassing(): boolean {
    return this.getTotalScore() >= this.state.config.minPassingScore;
  }

  getTimeElapsed(): number {
    const start = new Date(this.state.startTime).getTime();
    const end = this.state.completionTime
      ? new Date(this.state.completionTime).getTime()
      : Date.now();
    return (end - start) / 60000;
  }

  reset(): void {
    const config = this.state.config;
    this.state = {
      config,
      currentScores: {
        observationScore: 0,
        evidenceScore: 0,
        logicScore: 0,
        timelineAccuracy: 0,
        contradictionsFound: 0,
        interrogationScore: 0,
        theoryBoardAccuracy: 0,
        hintsPenalty: 0,
        wrongAccusationsPenalty: 0,
        timeBonus: 0,
        optionalBonus: 0,
        hiddenDiscoveryBonus: 0,
      },
      hintsUsed: 0,
      wrongAccusations: 0,
      startTime: new Date().toISOString(),
      completionTime: null,
      isComplete: false,
    };
  }

  serialize(): string {
    return JSON.stringify({
      ...this.state,
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.state = {
      config: parsed.config,
      currentScores: parsed.currentScores,
      hintsUsed: parsed.hintsUsed,
      wrongAccusations: parsed.wrongAccusations,
      startTime: parsed.startTime,
      completionTime: parsed.completionTime,
      isComplete: parsed.isComplete,
    };
  }
}
