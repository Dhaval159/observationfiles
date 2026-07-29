import type {
  DialogueActionDefinition,
  DialogueContext,
  ConversationEntry,
  NPCStateDefinition,
  JournalEntry,
} from "../types";

import { NPCStateManager } from "../npc/npc-state-manager";
import { generateUuid } from "@/domain/utils/id-generator";
import { now } from "@/domain/value-objects/timestamp";

export interface ActionExecutionContext {
  context: DialogueContext;
  conversation: ConversationEntry;
  npcStateManager: NPCStateManager;
  npcState: NPCStateDefinition | null;
}

export function executeAction(
  action: DialogueActionDefinition,
  execCtx: ActionExecutionContext,
): void {
  const { context, conversation, npcStateManager } = execCtx;

  switch (action.type) {
    case "unlock_dialogue":
      context.runtimeVariables.set(`dialogue_unlocked_${action.target}`, true);
      break;

    case "lock_dialogue":
      context.runtimeVariables.set(`dialogue_locked_${action.target}`, true);
      break;

    case "unlock_topic":
      if (!conversation.unlockedTopics.includes(action.target)) {
        conversation.unlockedTopics.push(action.target);
      }
      break;

    case "lock_topic": {
      const idx = conversation.unlockedTopics.indexOf(action.target);
      if (idx >= 0) {
        conversation.unlockedTopics.splice(idx, 1);
      }
      break;
    }

    case "unlock_question":
      if (!conversation.unlockedQuestions.includes(action.target)) {
        conversation.unlockedQuestions.push(action.target);
      }
      break;

    case "lock_question": {
      const qIdx = conversation.unlockedQuestions.indexOf(action.target);
      if (qIdx >= 0) {
        conversation.unlockedQuestions.splice(qIdx, 1);
      }
      break;
    }

    case "unlock_evidence":
      context.runtimeVariables.set(`evidence_unlocked_${action.target}`, true);
      break;

    case "unlock_observation":
      context.runtimeVariables.set(`observation_unlocked_${action.target}`, true);
      break;

    case "unlock_objective":
      context.runtimeVariables.set(`objective_unlocked_${action.target}`, true);
      break;

    case "set_variable":
      context.runtimeVariables.set(action.target, action.value);
      break;

    case "set_flag":
      context.playerFlags.set(action.target, action.value);
      break;

    case "adjust_trust":
      npcStateManager.adjustTrust(
        conversation.npcId ?? "",
        action.value as number,
        "dialogue_action",
      );
      break;

    case "adjust_pressure":
      npcStateManager.adjustPatience(
        conversation.npcId ?? "",
        -(action.value as number),
        "dialogue_action",
      );
      break;

    case "adjust_stress":
      npcStateManager.adjustStress(
        conversation.npcId ?? "",
        action.value as number,
        "dialogue_action",
      );
      break;

    case "adjust_suspicion":
      npcStateManager.adjustSuspicion(
        conversation.npcId ?? "",
        action.value as number,
        "dialogue_action",
      );
      break;

    case "set_emotional_state":
      npcStateManager.setEmotionalState(
        conversation.npcId ?? "",
        action.value as string,
        "dialogue_action",
      );
      break;

    case "set_relationship_status":
      npcStateManager.setRelationship(
        conversation.npcId ?? "",
        action.value as string,
        "dialogue_action",
      );
      break;

    case "reveal_information":
      context.runtimeVariables.set(`revealed_${action.target}`, action.value ?? true);
      break;

    case "hide_information":
      context.runtimeVariables.set(`revealed_${action.target}`, false);
      break;

    case "present_evidence":
      conversation.presentedEvidence.push({
        evidenceId: action.target,
        nodeId: conversation.currentNodeId ?? "",
        timestamp: now(),
        wasRelevant: true,
        npcReaction: (action.metadata?.reaction as string) ?? null,
        outcome: (action.metadata?.outcome as "accepted") ?? "accepted",
      });
      break;

    case "record_contradiction":
      context.runtimeVariables.set(`contradiction_${action.target}`, {
        discovered: true,
        timestamp: now().iso,
      });
      break;

    case "complete_objective":
      context.runtimeVariables.set(`objective_completed_${action.target}`, true);
      break;

    case "trigger_event":
      context.runtimeVariables.set(`event_triggered_${action.target}`, action.value ?? true);
      break;

    case "add_journal_entry": {
      const journalEntry: JournalEntry = {
        id: generateUuid(),
        timestamp: now(),
        type: (action.metadata?.journalType as JournalEntry["type"]) ?? "revealed_fact",
        title: (action.metadata?.title as string) ?? "Note",
        content: action.value as string,
        relatedNodeIds: [conversation.currentNodeId ?? ""],
        relatedEvidenceIds: [],
        relatedObservationIds: [],
        tags: [],
        isImportant: (action.metadata?.isImportant as boolean) ?? false,
      };
      conversation.journalEntries.push(journalEntry);
      break;
    }

    case "update_npc_state": {
      if (action.metadata?.updateType === "hidden_variable") {
        npcStateManager.setHiddenVariable(conversation.npcId ?? "", action.target, action.value);
      } else if (action.metadata?.updateType === "persistent_variable") {
        npcStateManager.setPersistentVariable(
          conversation.npcId ?? "",
          action.target,
          action.value,
        );
      }
      break;
    }

    case "award_points":
      context.runtimeVariables.set(
        "total_score",
        Number(context.runtimeVariables.get("total_score") ?? 0) + (action.value as number),
      );
      break;

    case "custom":
      context.runtimeVariables.set(`custom_action_${action.target}`, action.value);
      break;
  }
}

export function executeActions(
  actions: DialogueActionDefinition[],
  execCtx: ActionExecutionContext,
): void {
  for (const action of actions) {
    if (action.delay > 0) continue;
    executeAction(action, execCtx);
  }
}
