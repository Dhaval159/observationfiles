import { useCallback, useState, useEffect } from "react";
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

export function useInterrogationEngine(
  emitter: EventEmitter,
  evidenceInventory?: Set<string>,
): InterrogationEngine {
  const [engine] = useState(() => new InterrogationEngine(emitter, evidenceInventory));
  return engine;
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
  const engine = useInterrogationEngine(noopEmitter);
  const [node, setNode] = useState<DialogueNode | null>(() => engine.getCurrentNode());

  useEffect(() => {
    const timer = setTimeout(() => {
      setNode(engine.getCurrentNode());
    }, 0);
    return () => clearTimeout(timer);
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
