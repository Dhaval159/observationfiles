import type { NPCStateDefinition, NPCStateSnapshot } from "../types";
import { now } from "@/domain/value-objects/timestamp";

export class NPCStateManager {
  private _states: Map<string, NPCStateDefinition> = new Map();
  private _history: Map<string, NPCStateSnapshot[]> = new Map();

  initialize(npcId: string, name: string, role: string): NPCStateDefinition {
    if (this._states.has(npcId)) {
      return this._states.get(npcId)!;
    }

    const state: NPCStateDefinition = {
      npcId,
      name,
      role,
      trust: 50,
      stress: 0,
      confidence: 50,
      mood: "neutral",
      suspicion: 0,
      patience: 100,
      cooperation: 50,
      fear: 0,
      anger: 0,
      respect: 50,
      relationship: "neutral",
      emotionalState: "neutral",
      hiddenVariables: new Map(),
      temporaryVariables: new Map(),
      persistentVariables: new Map(),
      history: [],
    };

    this._states.set(npcId, state);
    this._history.set(npcId, []);
    return state;
  }

  getState(npcId: string): NPCStateDefinition | undefined {
    return this._states.get(npcId);
  }

  getAllStates(): NPCStateDefinition[] {
    return Array.from(this._states.values());
  }

  adjustTrust(npcId: string, delta: number, source: string): NPCStateDefinition | undefined {
    return this._adjustNumeric(npcId, "trust", delta, source, 0, 100);
  }

  adjustStress(npcId: string, delta: number, source: string): NPCStateDefinition | undefined {
    return this._adjustNumeric(npcId, "stress", delta, source, 0, 100);
  }

  adjustConfidence(npcId: string, delta: number, source: string): NPCStateDefinition | undefined {
    return this._adjustNumeric(npcId, "confidence", delta, source, 0, 100);
  }

  adjustSuspicion(npcId: string, delta: number, source: string): NPCStateDefinition | undefined {
    return this._adjustNumeric(npcId, "suspicion", delta, source, 0, 100);
  }

  adjustPatience(npcId: string, delta: number, source: string): NPCStateDefinition | undefined {
    return this._adjustNumeric(npcId, "patience", delta, source, 0, 100);
  }

  adjustCooperation(npcId: string, delta: number, source: string): NPCStateDefinition | undefined {
    return this._adjustNumeric(npcId, "cooperation", delta, source, 0, 100);
  }

  adjustFear(npcId: string, delta: number, source: string): NPCStateDefinition | undefined {
    return this._adjustNumeric(npcId, "fear", delta, source, 0, 100);
  }

  adjustAnger(npcId: string, delta: number, source: string): NPCStateDefinition | undefined {
    return this._adjustNumeric(npcId, "anger", delta, source, 0, 100);
  }

  adjustRespect(npcId: string, delta: number, source: string): NPCStateDefinition | undefined {
    return this._adjustNumeric(npcId, "respect", delta, source, 0, 100);
  }

  setEmotionalState(
    npcId: string,
    emotionalState: string,
    source: string,
  ): NPCStateDefinition | undefined {
    const state = this._states.get(npcId);
    if (!state) return undefined;

    const previousValue = state.emotionalState;
    const updated: NPCStateDefinition = {
      ...state,
      emotionalState,
    };

    this._states.set(npcId, updated);
    this._recordSnapshot(npcId, "emotionalState", previousValue, emotionalState, source);
    return updated;
  }

  setMood(npcId: string, mood: string, source: string): NPCStateDefinition | undefined {
    const state = this._states.get(npcId);
    if (!state) return undefined;

    const previousValue = state.mood;
    const updated: NPCStateDefinition = {
      ...state,
      mood,
    };

    this._states.set(npcId, updated);
    this._recordSnapshot(npcId, "mood", previousValue, mood, source);
    return updated;
  }

  setRelationship(
    npcId: string,
    relationship: string,
    source: string,
  ): NPCStateDefinition | undefined {
    const state = this._states.get(npcId);
    if (!state) return undefined;

    const previousValue = state.relationship;
    const updated: NPCStateDefinition = {
      ...state,
      relationship,
    };

    this._states.set(npcId, updated);
    this._recordSnapshot(npcId, "relationship", previousValue, relationship, source);
    return updated;
  }

  setHiddenVariable(npcId: string, key: string, value: unknown): NPCStateDefinition | undefined {
    const state = this._states.get(npcId);
    if (!state) return undefined;

    state.hiddenVariables.set(key, value);
    return state;
  }

  getHiddenVariable(npcId: string, key: string): unknown {
    return this._states.get(npcId)?.hiddenVariables.get(key);
  }

  setTemporaryVariable(npcId: string, key: string, value: unknown): NPCStateDefinition | undefined {
    const state = this._states.get(npcId);
    if (!state) return undefined;

    state.temporaryVariables.set(key, value);
    return state;
  }

  setPersistentVariable(
    npcId: string,
    key: string,
    value: unknown,
  ): NPCStateDefinition | undefined {
    const state = this._states.get(npcId);
    if (!state) return undefined;

    state.persistentVariables.set(key, value);
    return state;
  }

  getHistory(npcId: string): NPCStateSnapshot[] {
    return this._history.get(npcId) ?? [];
  }

  reset(npcId: string): void {
    this._states.delete(npcId);
    this._history.delete(npcId);
  }

  clearAll(): void {
    this._states.clear();
    this._history.clear();
  }

  private _adjustNumeric(
    npcId: string,
    field: keyof NPCStateDefinition,
    delta: number,
    source: string,
    min: number,
    max: number,
  ): NPCStateDefinition | undefined {
    const state = this._states.get(npcId);
    if (!state) return undefined;

    const previousValue = state[field] as number;
    const newValue = Math.max(min, Math.min(max, previousValue + delta));

    if (previousValue === newValue) return state;

    const updated = { ...state, [field]: newValue };
    this._states.set(npcId, updated);
    this._recordSnapshot(npcId, field, previousValue, newValue, source);
    return updated;
  }

  private _recordSnapshot(
    npcId: string,
    field: string,
    previousValue: number | string,
    newValue: number | string,
    source: string,
  ): void {
    const snapshot: NPCStateSnapshot = {
      timestamp: now(),
      field,
      previousValue,
      newValue,
      source,
    };

    const history = this._history.get(npcId) ?? [];
    history.push(snapshot);
    this._history.set(npcId, history);
  }
}
