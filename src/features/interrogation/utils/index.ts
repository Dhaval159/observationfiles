import type {
  DialogueCondition,
  DialogueChoice,
  DialogueAction,
  DialogueNode,
  InterrogationDefinition,
  InterrogationSession,
  NPCInterrogationState,
} from "@/types/interrogation";
import type { ValidationResult } from "@/types/engine";
import type { ChoiceEvaluation } from "../types";

export function evaluateDialogueCondition(
  condition: DialogueCondition,
  context: Record<string, unknown>,
): boolean {
  const current = context[condition.target];
  const targetValue = condition.value;

  switch (condition.operator) {
    case "==":
      return current === targetValue;
    case "!=":
      return current !== targetValue;
    case ">=":
      return (current as number) >= (targetValue as number);
    case "<=":
      return (current as number) <= (targetValue as number);
    case ">":
      return (current as number) > (targetValue as number);
    case "<":
      return (current as number) < (targetValue as number);
    case "contains": {
      if (Array.isArray(current)) {
        return current.includes(targetValue);
      }
      return false;
    }
    default:
      return false;
  }
}

export function evaluateConditions(
  conditions: DialogueCondition[],
  context: Record<string, unknown>,
): boolean {
  if (conditions.length === 0) return true;
  return conditions.every((c) => evaluateDialogueCondition(c, context));
}

export function executeDialogueAction(
  action: DialogueAction,
  context: Record<string, unknown>,
): Record<string, unknown> {
  const updated = { ...context };

  switch (action.type) {
    case "adjust_trust": {
      const key = `trust_${action.target}`;
      const current = (updated[key] as number) ?? 50;
      updated[key] = Math.max(0, Math.min(100, current + (action.value as number)));
      break;
    }
    case "adjust_pressure": {
      const key = `pressure_${action.target}`;
      const current = (updated[key] as number) ?? 0;
      updated[key] = Math.max(0, Math.min(100, current + (action.value as number)));
      break;
    }
    case "set_emotional_state":
      updated[`emotion_${action.target}`] = action.value;
      break;
    case "unlock_observation":
      updated[`unlocked_observation_${action.target}`] = true;
      break;
    case "reveal_evidence":
      updated[`revealed_evidence_${action.target}`] = true;
      break;
    case "unlock_question":
      updated[`unlocked_question_${action.target}`] = true;
      break;
    case "complete_objective":
      updated[`objective_${action.target}`] = "completed";
      break;
    case "add_score":
      updated["score"] = ((updated["score"] as number) ?? 0) + (action.value as number);
      break;
    case "trigger_event":
      updated[`event_${action.target}`] = action.value;
      break;
    case "unlock_interrogation":
      updated[`unlocked_interrogation_${action.target}`] = true;
      break;
    case "custom":
      updated[`custom_${action.target}`] = action.value;
      break;
  }

  return updated;
}

export function getAvailableChoices(
  node: DialogueNode,
  context: Record<string, unknown>,
): ChoiceEvaluation[] {
  return node.choices.map((choice) => {
    if (choice.isLocked) {
      return { choice, isAvailable: false, lockedReason: choice.lockedReason };
    }
    const conditionsMet = evaluateConditions(choice.conditions, context);
    return {
      choice,
      isAvailable: conditionsMet,
      lockedReason: conditionsMet ? null : "Conditions not met",
    };
  });
}

export function validateInterrogationDefinition(def: InterrogationDefinition): ValidationResult {
  const errors: { code: string; message: string; path: string; severity: "error" }[] = [];
  const warnings: { code: string; message: string; path: string; severity: "warning" | "info" }[] =
    [];

  if (!def.id) {
    errors.push({
      code: "MISSING_ID",
      message: "Interrogation id is required",
      path: "id",
      severity: "error",
    });
  }
  if (!def.caseId) {
    errors.push({
      code: "MISSING_CASE_ID",
      message: "caseId is required",
      path: "caseId",
      severity: "error",
    });
  }
  if (!def.npcId) {
    errors.push({
      code: "MISSING_NPC_ID",
      message: "npcId is required",
      path: "npcId",
      severity: "error",
    });
  }
  if (!def.startingDialogueNodeId) {
    errors.push({
      code: "MISSING_START",
      message: "startingDialogueNodeId is required",
      path: "startingDialogueNodeId",
      severity: "error",
    });
  }
  if (!def.dialogueNodes || def.dialogueNodes.length === 0) {
    errors.push({
      code: "NO_NODES",
      message: "dialogueNodes must not be empty",
      path: "dialogueNodes",
      severity: "error",
    });
  }

  const nodeIds = new Set(def.dialogueNodes?.map((n) => n.id) ?? []);
  if (def.startingDialogueNodeId && !nodeIds.has(def.startingDialogueNodeId)) {
    errors.push({
      code: "INVALID_START",
      message: "startingDialogueNodeId not found in dialogueNodes",
      path: "startingDialogueNodeId",
      severity: "error",
    });
  }

  for (const node of def.dialogueNodes ?? []) {
    if (node.nextNodeId && !nodeIds.has(node.nextNodeId)) {
      warnings.push({
        code: "INVALID_NEXT",
        message: `nextNodeId "${node.nextNodeId}" in node "${node.id}" not found in dialogueNodes`,
        path: `dialogueNodes.${node.id}.nextNodeId`,
        severity: "warning",
      });
    }
    for (const choice of node.choices) {
      if (!nodeIds.has(choice.nextNodeId)) {
        warnings.push({
          code: "INVALID_CHOICE_TARGET",
          message: `Choice "${choice.id}" in node "${node.id}" references non-existent nextNodeId "${choice.nextNodeId}"`,
          path: `dialogueNodes.${node.id}.choices.${choice.id}.nextNodeId`,
          severity: "warning",
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function createInterrogationSession(
  interrogationId: string,
  npcId: string,
  caseId: string,
  startingNodeId: string,
): InterrogationSession {
  const now = new Date().toISOString();
  const state: NPCInterrogationState = {
    npcId,
    emotionalState: "neutral",
    trustLevel: 50,
    pressureLevel: 0,
    questionsUnlocked: [],
    questionsAsked: [],
    contradictionsFound: [],
    evidencePresented: [],
    currentNodeId: startingNodeId,
    visitedNodeIds: [startingNodeId],
    choiceHistory: [],
    isComplete: false,
    completedAt: null,
  };

  return {
    id: `${interrogationId}-${Date.now()}`,
    caseId,
    interrogationId,
    npcId,
    state,
    startedAt: now,
    endedAt: null,
    isReplaying: false,
    replaySpeed: 1,
  };
}
