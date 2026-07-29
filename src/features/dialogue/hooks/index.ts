import { useMemo, useCallback } from "react";
import { DialogueEngine } from "../services";
import type { DialogueState } from "@/types/dialogue";
import type { DialogueNode } from "@/types/interrogation";
import type { ChoiceEvaluation } from "@/features/interrogation/types";
import type { EventEmitter } from "@/types/engine";

const noopEmitter: EventEmitter = {
  on: () => () => {},
  off: () => {},
  emit: () => {},
  once: () => {},
  listenerCount: () => 0,
};

let engineInstance: DialogueEngine | null = null;

export function useDialogue(emitter: EventEmitter): {
  start: (treeId: string) => DialogueState;
  node: DialogueNode | null;
  path: { nodeId: string; choiceId: string }[];
} {
  const engine = useMemo(() => {
    if (!engineInstance) {
      engineInstance = new DialogueEngine(emitter);
    }
    return engineInstance;
  }, [emitter]);

  const start = useCallback(
    (treeId: string) => {
      return engine.startDialogue(treeId);
    },
    [engine],
  );

  return {
    start,
    node: engine.getCurrentNode(),
    path: engine.getDialoguePath(),
  };
}

export function useDialogueNode(): DialogueNode | null {
  const engine = useMemo(() => {
    if (!engineInstance) {
      engineInstance = new DialogueEngine(noopEmitter);
    }
    return engineInstance;
  }, []);

  return engine.getCurrentNode();
}

export function useDialogueChoices(context: Record<string, unknown>): ChoiceEvaluation[] {
  const engine = useMemo(() => {
    if (!engineInstance) {
      engineInstance = new DialogueEngine(noopEmitter);
    }
    return engineInstance;
  }, []);

  return engine.getChoices(context);
}
