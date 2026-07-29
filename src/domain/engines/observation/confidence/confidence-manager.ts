import type { ObservationConfidenceRecord, ConfidenceSnapshot, ObservationContext } from "../types";
import { now } from "@/domain/value-objects/timestamp";

export type ConfidenceCategory = "very_low" | "low" | "medium" | "high" | "very_high" | "certain";

export class ConfidenceManager {
  private _records: Map<string, ObservationConfidenceRecord> = new Map();

  initialize(observationId: string): void {
    if (this._records.has(observationId)) return;

    const record: ObservationConfidenceRecord = {
      observationId,
      value: 0.5,
      percentage: 50,
      category: "medium",
      isMediumOrHigher: true,
      isHigh: false,
      history: [
        {
          value: 0.5,
          source: "initialization",
          timestamp: now(),
          reason: "Default unknown confidence",
        },
      ],
      lastUpdated: now(),
    };

    this._records.set(observationId, record);
  }

  getConfidence(observationId: string): ObservationConfidenceRecord | undefined {
    return this._records.get(observationId);
  }

  updateConfidence(
    observationId: string,
    delta: number,
    source: string,
    reason?: string,
  ): ObservationConfidenceRecord {
    const record = this._records.get(observationId);
    if (!record) {
      const newRecord = this._createRecord(observationId, 0.5 + delta, source, reason);
      this._records.set(observationId, newRecord);
      return newRecord;
    }

    const newValue = Math.max(0, Math.min(1, record.value + delta));
    const timestamp = now();

    const snapshot: ConfidenceSnapshot = {
      value: newValue,
      source,
      timestamp,
      reason,
    };

    const updated: ObservationConfidenceRecord = {
      observationId,
      value: newValue,
      percentage: Math.round(newValue * 100),
      category: this._getCategory(newValue),
      isMediumOrHigher: newValue >= 0.5,
      isHigh: newValue >= 0.75,
      history: [...record.history, snapshot],
      lastUpdated: timestamp,
    };

    this._records.set(observationId, updated);
    return updated;
  }

  setConfidence(
    observationId: string,
    value: number,
    source: string,
    reason?: string,
  ): ObservationConfidenceRecord {
    const clamped = Math.max(0, Math.min(1, value));
    const timestamp = now();

    const existing = this._records.get(observationId);
    const history = existing
      ? [...existing.history, { value: clamped, source, timestamp, reason }]
      : [{ value: clamped, source, timestamp, reason }];

    const record: ObservationConfidenceRecord = {
      observationId,
      value: clamped,
      percentage: Math.round(clamped * 100),
      category: this._getCategory(clamped),
      isMediumOrHigher: clamped >= 0.5,
      isHigh: clamped >= 0.75,
      history,
      lastUpdated: timestamp,
    };

    this._records.set(observationId, record);
    return record;
  }

  degradeConfidence(
    observationId: string,
    factor: number = 0.95,
    source: string = "time_decay",
  ): ObservationConfidenceRecord | undefined {
    const record = this._records.get(observationId);
    if (!record) return undefined;

    const newValue = Math.max(0, record.value * factor);
    return this.setConfidence(observationId, newValue, source, "Confidence decay");
  }

  getConfidenceCategory(observationId: string): ConfidenceCategory {
    return this._records.get(observationId)?.category ?? "very_low";
  }

  getHistory(observationId: string): ConfidenceSnapshot[] {
    return this._records.get(observationId)?.history ?? [];
  }

  getAll(): ObservationConfidenceRecord[] {
    return Array.from(this._records.values());
  }

  syncToContext(ctx: ObservationContext): void {
    ctx.confidenceRecords.clear();
    for (const [id, record] of this._records) {
      ctx.confidenceRecords.set(id, record);
    }
  }

  syncFromContext(ctx: ObservationContext): void {
    this._records.clear();
    for (const [id, record] of ctx.confidenceRecords) {
      this._records.set(id, record);
    }
  }

  clear(): void {
    this._records.clear();
  }

  private _createRecord(
    observationId: string,
    value: number,
    source: string,
    reason?: string,
  ): ObservationConfidenceRecord {
    const clamped = Math.max(0, Math.min(1, value));
    const timestamp = now();

    return {
      observationId,
      value: clamped,
      percentage: Math.round(clamped * 100),
      category: this._getCategory(clamped),
      isMediumOrHigher: clamped >= 0.5,
      isHigh: clamped >= 0.75,
      history: [{ value: clamped, source, timestamp, reason }],
      lastUpdated: timestamp,
    };
  }

  private _getCategory(value: number): ConfidenceCategory {
    if (value >= 1) return "certain";
    if (value >= 0.9) return "very_high";
    if (value >= 0.7) return "high";
    if (value >= 0.5) return "medium";
    if (value >= 0.3) return "low";
    return "very_low";
  }
}
