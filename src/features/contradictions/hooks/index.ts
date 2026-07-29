import { useState } from "react";
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

export function useContradictionEngine(emitter: EventEmitter): ContradictionEngine {
  const [engine] = useState(() => new ContradictionEngine(emitter));
  return engine;
}

export function useContradictions(): Contradiction[] {
  return useContradictionEngine(noopEmitter).getAllContradictions();
}

export function useStatementContradictions(statementId: string): Contradiction[] {
  return useContradictionEngine(noopEmitter).getContradictionsForStatement(statementId);
}

export function useContradiction(contradictionId: string): Contradiction | null {
  return useContradictionEngine(noopEmitter).getContradiction(contradictionId);
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
