import { useState, useEffect, useCallback, useMemo } from "react";
import type { EventEmitter } from "@/types/engine";
import type {
  TheoryNode,
  TheoryConnection,
  TheoryBoardValidationResult,
} from "@/types/theory-board";
import { TheoryBoardEngine } from "../services";

function createEventEmitter(): EventEmitter {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
  return {
    on(event: string, handler: (...args: unknown[]) => void): () => void {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(handler);
      return () => {
        listeners.get(event)?.delete(handler);
      };
    },
    off(event: string, handler: (...args: unknown[]) => void): void {
      listeners.get(event)?.delete(handler);
    },
    emit(event: string, ...args: unknown[]): void {
      listeners.get(event)?.forEach((handler) => handler(...args));
    },
    once(event: string, handler: (...args: unknown[]) => void): void {
      const wrapper = (...args: unknown[]) => {
        handler(...args);
        listeners.get(event)?.delete(wrapper);
      };
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(wrapper);
    },
    listenerCount(event: string): number {
      return listeners.get(event)?.size ?? 0;
    },
  };
}

let emitterInstance: EventEmitter | null = null;
let engineInstance: TheoryBoardEngine | null = null;

export function getTheoryBoardEmitter(): EventEmitter {
  if (!emitterInstance) {
    emitterInstance = createEventEmitter();
  }
  return emitterInstance;
}

export function getTheoryBoardEngine(): TheoryBoardEngine {
  if (!engineInstance) {
    const emitter = getTheoryBoardEmitter();
    engineInstance = new TheoryBoardEngine(emitter);
  }
  return engineInstance;
}

export function useTheoryBoardEngine(): TheoryBoardEngine {
  return useMemo(() => getTheoryBoardEngine(), []);
}

export function useTheoryBoard(caseId: string): {
  nodes: TheoryNode[];
  connections: TheoryConnection[];
  isLoading: boolean;
  refresh: () => void;
} {
  const engine = useTheoryBoardEngine();
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const emitter = getTheoryBoardEmitter();
    const unsub1 = emitter.on("board_loaded", refresh);
    const unsub2 = emitter.on("board_changed", refresh);
    const unsub3 = emitter.on("board_deserialized", refresh);
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [caseId, engine, refresh]);

  const nodes = useMemo(() => engine.getAllNodes(), [engine]);
  const connections = useMemo(() => engine.getAllConnections(), [engine]);

  return { nodes, connections, isLoading: false, refresh };
}

export function useTheoryNode(nodeId: string): {
  node: TheoryNode | null;
  connections: TheoryConnection[];
  connectedNodes: TheoryNode[];
  refresh: () => void;
} {
  const engine = useTheoryBoardEngine();
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const emitter = getTheoryBoardEmitter();
    const unsub1 = emitter.on("node_updated", refresh);
    const unsub2 = emitter.on("node_moved", refresh);
    const unsub3 = emitter.on("node_pinned", refresh);
    const unsub4 = emitter.on("node_unpinned", refresh);
    const unsub5 = emitter.on("board_changed", refresh);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
    };
  }, [engine, refresh]);

  const node = useMemo(() => engine.getNode(nodeId), [engine, nodeId]);
  const connections = useMemo(() => engine.getNodeConnections(nodeId), [engine, nodeId]);
  const connectedNodes = useMemo(() => engine.getConnectedNodes(nodeId), [engine, nodeId]);

  return { node, connections, connectedNodes, refresh };
}

export function useNodeConnections(nodeId: string): {
  connections: TheoryConnection[];
  nodeCount: number;
} {
  const engine = useTheoryBoardEngine();
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const emitter = getTheoryBoardEmitter();
    const unsub1 = emitter.on("connection_added", refresh);
    const unsub2 = emitter.on("connection_removed", refresh);
    const unsub3 = emitter.on("connection_updated", refresh);
    const unsub4 = emitter.on("board_changed", refresh);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, [engine, refresh]);

  const connections = useMemo(() => engine.getNodeConnections(nodeId), [engine, nodeId]);
  const nodeCount = useMemo(() => engine.getConnectedNodes(nodeId).length, [engine, nodeId]);

  return { connections, nodeCount };
}

export function useTheoryBoardValidation(): {
  results: TheoryBoardValidationResult[];
  validate: () => TheoryBoardValidationResult[];
} {
  const engine = useTheoryBoardEngine();
  const [results, setResults] = useState<TheoryBoardValidationResult[]>([]);

  const validate = useCallback(() => {
    const result = engine.validate();
    setResults(result);
    return result;
  }, [engine]);

  return { results, validate };
}

export function useTheoryBoardProgress(): {
  progress: ReturnType<TheoryBoardEngine["getBoardProgress"]>;
  refresh: () => void;
} {
  const engine = useTheoryBoardEngine();
  const [, setTick] = useState(0);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    const emitter = getTheoryBoardEmitter();
    const unsub1 = emitter.on("board_changed", refresh);
    const unsub2 = emitter.on("board_loaded", refresh);
    return () => {
      unsub1();
      unsub2();
    };
  }, [engine, refresh]);

  const progress = useMemo(() => engine.getBoardProgress(), [engine]);

  return { progress, refresh };
}
