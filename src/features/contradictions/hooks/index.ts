import { useMemo } from "react";
import { ContradictionEngine } from "../services";
import type { Contradiction } from "@/types/contradiction";
import type { EventEmitter } from "@/types/engine";

const noopEmitter: EventEmitter = {
  on: () => () => {},
  off: () => {},
  emit: () => {},
  once: () => {},
  listenerCount: () => 0,
};

let engineInstance: ContradictionEngine | null = null;

export function useContradictionEngine(emitter: EventEmitter): ContradictionEngine {
  return useMemo(() => {
    if (!engineInstance) {
      engineInstance = new ContradictionEngine(emitter);
    }
    return engineInstance;
  }, [emitter]);
}

export function useContradictions(): Contradiction[] {
  const engine = useContradictionEngine(noopEmitter);
  return engine.getAllContradictions();
}

export function useStatementContradictions(statementId: string): Contradiction[] {
  const engine = useContradictionEngine(noopEmitter);
  return engine.getContradictionsForStatement(statementId);
}

export function useContradiction(contradictionId: string): Contradiction | null {
  const engine = useContradictionEngine(noopEmitter);
  return engine.getContradiction(contradictionId);
}

export function useContradictionDiscovery(): {
  discovered: Contradiction[];
  undiscovered: Contradiction[];
  total: number;
  score: number;
} {
  const engine = useContradictionEngine(noopEmitter);
  const discovered = engine.getDiscoveredContradictions();
  const undiscovered = engine.getUndiscoveredContradictions();

  return {
    discovered,
    undiscovered,
    total: discovered.length + undiscovered.length,
    score: engine.getContradictionScore(),
  };
}
