import { useMemo, useCallback, useState, useEffect } from "react";
import { InterrogationEngine } from "../services";
import type { ChoiceEvaluation, NodeEvaluation } from "../types";
import type { DialogueNode, NPCInterrogationState } from "@/types/interrogation";
import type { EventEmitter } from "@/types/engine";

const noopEmitter: EventEmitter = {
  on: () => () => {},
  off: () => {},
  emit: () => {},
  once: () => {},
  listenerCount: () => 0,
};

let engineInstance: InterrogationEngine | null = null;

export function useInterrogationEngine(
  emitter: EventEmitter,
  evidenceInventory?: Set<string>,
): InterrogationEngine {
  return useMemo(() => {
    if (!engineInstance) {
      engineInstance = new InterrogationEngine(emitter, evidenceInventory);
    }
    return engineInstance;
  }, [emitter, evidenceInventory]);
}

export function useInterrogation(interrogationId: string): {
  start: (npcId: string, caseId: string) => void;
  end: () => void;
  isComplete: boolean;
} {
  const engine = useInterrogationEngine(noopEmitter);

  const start = useCallback(
    (npcId: string, caseId: string) => {
      engine.startInterrogation(interrogationId, npcId, caseId);
    },
    [engine, interrogationId],
  );

  const end = useCallback(() => {
    engine.endInterrogation();
  }, [engine]);

  const isComplete = engine.isComplete();

  return { start, end, isComplete };
}

export function useCurrentNode(): {
  node: DialogueNode | null;
  nodeEvaluation: NodeEvaluation | null;
} {
  const [node, setNode] = useState<DialogueNode | null>(null);

  const engine = useInterrogationEngine(noopEmitter);

  useEffect(() => {
    const current = engine.getCurrentNode();
    setNode(current);
  }, [engine]);

  return { node, nodeEvaluation: null };
}

export function useCurrentChoices(context: Record<string, unknown>): ChoiceEvaluation[] {
  const engine = useInterrogationEngine(noopEmitter);
  return engine.getCurrentChoices(context);
}

export function useNPCState(npcId: string): NPCInterrogationState | null {
  const engine = useInterrogationEngine(noopEmitter);
  const state = engine.getCurrentNPCState();

  if (state && state.npcId === npcId) {
    return state;
  }

  return null;
}

export function useInterrogationHistory(): {
  nodeId: string;
  choiceId: string;
  timestamp: string;
}[] {
  const engine = useInterrogationEngine(noopEmitter);
  const state = engine.getCurrentNPCState();
  return state?.choiceHistory ?? [];
}
