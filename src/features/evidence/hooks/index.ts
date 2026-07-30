import { create } from "zustand";
import { useEffect, useMemo, useState } from "react";
import type { EventEmitter } from "@/types/engine";
import type { FullEvidence, EvidenceRelationship } from "@/types/evidence";
import { EvidenceEngine } from "../services";
import type { EvidenceEngineState, EvidenceFilters } from "../types";
import { poisonedPinotCase } from "../../cases/data/poisoned-pinot";

interface EngineStore {
  engine: EvidenceEngine | null;
  state: EvidenceEngineState | null;
  version: number;
  bump: () => void;
  setEngine: (engine: EvidenceEngine) => void;
  refreshState: (state: EvidenceEngineState) => void;
}

const useEvidenceEngineStore = create<EngineStore>((set) => ({
  engine: null,
  state: null,
  version: 0,
  bump: () => set((s) => ({ version: s.version + 1 })),
  setEngine: (engine: EvidenceEngine) => set({ engine, state: engine.getState() }),
  refreshState: (state: EvidenceEngineState) => set((s) => ({ state, version: s.version + 1 })),
}));

function createEventEmitter(): EventEmitter {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  return {
    on(event: string, handler: (...args: unknown[]) => void): () => void {
      if (!listeners.has(event)) listeners.set(event, new Set());
      const handlers = listeners.get(event);
      if (handlers) handlers.add(handler);
      return () => {
        const h = listeners.get(event);
        if (h) h.delete(handler);
      };
    },
    off(event: string, handler: (...args: unknown[]) => void): void {
      const handlers = listeners.get(event);
      if (handlers) handlers.delete(handler);
    },
    emit(event: string, ...args: unknown[]): void {
      const handlers = listeners.get(event);
      if (handlers) {
        for (const handler of handlers) {
          handler(...args);
        }
      }
    },
    once(event: string, handler: (...args: unknown[]) => void): void {
      const wrapper = (...args: unknown[]) => {
        handler(...args);
        const handlers = listeners.get(event);
        if (handlers) handlers.delete(wrapper);
      };
      const handlers = listeners.get(event);
      if (!handlers) {
        listeners.set(event, new Set([wrapper]));
      } else {
        handlers.add(wrapper);
      }
    },
    listenerCount(event: string): number {
      const handlers = listeners.get(event);
      return handlers?.size ?? 0;
    },
  };
}

function ensureEngine(): EvidenceEngine {
  const existing = useEvidenceEngineStore.getState().engine;
  if (existing) return existing;

  const emitter = createEventEmitter();
  const engine = new EvidenceEngine(emitter);

  // Load Poisoned Pinot evidence items
  engine.loadEvidence(poisonedPinotCase.evidenceItems);

  const refresh = () => {
    useEvidenceEngineStore.getState().refreshState(engine.getState());
  };

  emitter.on("evidence_collected", refresh);
  emitter.on("evidence_analyzed", refresh);
  emitter.on("evidence_linked", refresh);

  useEvidenceEngineStore.getState().setEngine(engine);
  return engine;
}

export function useEvidenceEngine(): EvidenceEngine {
  const storeEngine = useEvidenceEngineStore((s) => s.engine);
  const [engine] = useState(() => storeEngine ?? ensureEngine());

  useEffect(() => {
    const current = ensureEngine();
    useEvidenceEngineStore.getState().setEngine(current);
  }, []);

  return engine;
}

export function useEvidence(evidenceId: string): { evidence: FullEvidence | null } {
  const engine = useEvidenceEngine();
  const version = useEvidenceEngineStore((s) => s.version);

  return useMemo(() => {
    void version;
    const evidence = engine.getEvidence(evidenceId);
    return { evidence };
  }, [engine, evidenceId, version]);
}

export function useEvidenceList(filters: EvidenceFilters): FullEvidence[] {
  const engine = useEvidenceEngine();
  const version = useEvidenceEngineStore((s) => s.version);

  return useMemo(() => {
    void version;
    return engine.filterEvidence(filters);
  }, [engine, filters, version]);
}

export function useEvidenceInventory(): FullEvidence[] {
  const engine = useEvidenceEngine();
  const version = useEvidenceEngineStore((s) => s.version);

  return useMemo(() => {
    void version;
    return engine.getInventory();
  }, [engine, version]);
}

export function useEvidenceProgress(): {
  collected: number;
  total: number;
  percentage: number;
  keyCollected: number;
  keyTotal: number;
  analyzed: number;
} {
  const engine = useEvidenceEngine();
  const version = useEvidenceEngineStore((s) => s.version);

  return useMemo(() => {
    void version;
    return engine.getEvidenceProgress();
  }, [engine, version]);
}

export function useCollectibleEvidence(context: Record<string, unknown>): FullEvidence[] {
  const engine = useEvidenceEngine();
  const version = useEvidenceEngineStore((s) => s.version);

  return useMemo(() => {
    void version;
    return engine.getCollectibleEvidence(context);
  }, [engine, context, version]);
}

export function useRelatedEvidence(evidenceId: string): {
  evidence: FullEvidence | null;
  relationships: EvidenceRelationship[];
  chain: FullEvidence[];
} {
  const engine = useEvidenceEngine();
  const version = useEvidenceEngineStore((s) => s.version);

  return useMemo(() => {
    void version;
    const evidence = engine.getEvidence(evidenceId);
    const relationships = evidence ? engine.getRelatedEvidence(evidenceId) : [];
    const allEvidence = engine.getState().evidence;
    const chain =
      engine.getRelatedEvidence(evidenceId).length > 0
        ? traverseChain(evidenceId, relationships, allEvidence)
        : [];

    return { evidence, relationships, chain };
  }, [engine, evidenceId, version]);
}

function traverseChain(
  evidenceId: string,
  relationships: EvidenceRelationship[],
  allEvidence: Map<string, FullEvidence>,
): FullEvidence[] {
  const result: FullEvidence[] = [];
  const visited = new Set<string>();

  function traverse(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);

    const evidence = allEvidence.get(id);
    if (evidence) {
      result.push(evidence);
    }

    const related = relationships.filter((r) => r.sourceId === id);
    for (const rel of related) {
      traverse(rel.targetId);
    }
  }

  traverse(evidenceId);
  return result;
}
