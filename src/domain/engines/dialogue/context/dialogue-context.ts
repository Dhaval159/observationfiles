import type { DialogueContext, ConversationLifecycleState } from "../types";
import { now } from "@/domain/value-objects/timestamp";

export function createDialogueContext(
  id: string,
  caseId: string,
  playerId: string,
): DialogueContext {
  const timestamp = now();
  return {
    id,
    caseId,
    playerId,

    conversations: new Map(),
    treeDefinitions: new Map(),
    topicDefinitions: new Map(),
    categoryDefinitions: new Map(),
    npcStates: new Map(),

    currentConversationId: null,
    lifecycleState: "unavailable",

    runtimeVariables: new Map(),
    playerFlags: new Map(),
    temporaryCache: new Map(),

    isPaused: false,
    isComplete: false,

    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function touchContext(ctx: DialogueContext): void {
  ctx.updatedAt = now();
}

export function setRuntimeVariable(
  ctx: DialogueContext,
  key: string,
  value: unknown,
): void {
  ctx.runtimeVariables.set(key, value);
  touchContext(ctx);
}

export function getRuntimeVariable(
  ctx: DialogueContext,
  key: string,
): unknown {
  return ctx.runtimeVariables.get(key);
}

export function setPlayerFlag(
  ctx: DialogueContext,
  key: string,
  value: unknown,
): void {
  ctx.playerFlags.set(key, value);
  touchContext(ctx);
}

export function getPlayerFlag(
  ctx: DialogueContext,
  key: string,
): unknown {
  return ctx.playerFlags.get(key);
}

export function getConversationsByState(
  ctx: DialogueContext,
  state: ConversationLifecycleState,
): string[] {
  const result: string[] = [];
  for (const [id, entry] of ctx.conversations) {
    if (entry.lifecycleState === state) {
      result.push(id);
    }
  }
  return result;
}

export function getConversationsByNPC(
  ctx: DialogueContext,
  npcId: string,
): string[] {
  const result: string[] = [];
  for (const [id, entry] of ctx.conversations) {
    if (entry.npcId === npcId) {
      result.push(id);
    }
  }
  return result;
}
