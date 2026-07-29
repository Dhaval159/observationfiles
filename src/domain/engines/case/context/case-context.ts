import type { CaseContext, CaseSession, VariableValue } from "../types";
import type { FullCase, CaseDefinition } from "@/types/case";
import type { Objective } from "@/domain/models/objective";
import type { CaseProgress } from "@/domain/repositories/progress-repository";
import type { DomainTimestamp } from "@/domain/value-objects/timestamp";
import { now } from "@/domain/value-objects/timestamp";
import { generateUuid } from "@/domain/utils/id-generator";

export function createCaseContext(
  playerId: string,
  session: CaseSession,
  options?: {
    caseDefinition?: CaseDefinition | null;
    activeCase?: FullCase | null;
    objectives?: Objective[];
    progress?: CaseProgress | null;
  },
): CaseContext {
  const timestamp = now();
  return {
    id: generateUuid(),
    playerId,
    session,
    caseDefinition: options?.caseDefinition ?? null,
    activeCase: options?.activeCase ?? null,
    lifecycleState: "unloaded",
    lifecycleHistory: [],
    objectives: options?.objectives ?? [],
    flags: new Map(),
    variables: new Map(),
    unlockStates: new Map(),
    dependencyGraph: null,
    progress: options?.progress ?? null,
    errors: [],
    metadata: new Map(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateContextTimestamp(context: CaseContext, timestamp?: DomainTimestamp): void {
  context.updatedAt = timestamp ?? now();
}

export function addContextError(context: CaseContext, error: Error): void {
  context.errors.push(error);
  updateContextTimestamp(context);
}

export function clearContextErrors(context: CaseContext): void {
  context.errors = [];
  updateContextTimestamp(context);
}

export function setContextFlag(context: CaseContext, key: string, value: unknown): void {
  context.flags.set(key, value);
  updateContextTimestamp(context);
}

export function getContextFlag(context: CaseContext, key: string): unknown {
  return context.flags.get(key);
}

export function hasContextFlag(context: CaseContext, key: string): boolean {
  return context.flags.has(key);
}

export function setContextVariable(context: CaseContext, key: string, value: unknown): void {
  context.variables.set(key, value as VariableValue);
  updateContextTimestamp(context);
}

export function getContextVariable(context: CaseContext, key: string): unknown {
  return context.variables.get(key);
}

export function setContextMetadata(context: CaseContext, key: string, value: unknown): void {
  context.metadata.set(key, value);
  updateContextTimestamp(context);
}

export function getContextMetadata(context: CaseContext, key: string): unknown {
  return context.metadata.get(key);
}

export function cloneContext(context: CaseContext): CaseContext {
  return {
    ...context,
    session: { ...context.session },
    lifecycleHistory: [...context.lifecycleHistory],
    objectives: [...context.objectives],
    flags: new Map(context.flags),
    variables: new Map(context.variables),
    unlockStates: new Map(context.unlockStates),
    errors: [...context.errors],
    metadata: new Map(context.metadata),
  };
}
