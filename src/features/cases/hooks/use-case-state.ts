"use client";

import { useCallback, useEffect, useState } from "react";
import { getCaseEngine } from "../services/case-engine-service";
import { useEngineCaseStore, type EngineLifecycleState } from "@/stores/engine-case-store";

export function useCaseState(playerId: string | null) {
  const [lifecycleState, setLocalLifecycleState] = useState<string>("unloaded");
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const storeState = useEngineCaseStore.getState().lifecycleState;

  const refreshState = useCallback(() => {
    if (!playerId) return;

    const engine = getCaseEngine();
    const stateResult = engine.getLifecycleState(playerId);
    if (stateResult.success) {
      setLocalLifecycleState(stateResult.data);
    }

    setIsActive(engine.isCaseActive(playerId));
  }, [playerId]);

  const pause = useCallback(async () => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getCaseEngine();
      await engine.pauseCase(playerId);
      refreshState();
    } finally {
      setIsLoading(false);
    }
  }, [playerId, refreshState]);

  const resume = useCallback(async () => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getCaseEngine();
      await engine.resumeCase(playerId);
      refreshState();
    } finally {
      setIsLoading(false);
    }
  }, [playerId, refreshState]);

  const complete = useCallback(async () => {
    if (!playerId) return;
    setIsLoading(true);
    try {
      const engine = getCaseEngine();
      await engine.completeCase(playerId, playerId);
      refreshState();
    } finally {
      setIsLoading(false);
    }
  }, [playerId, refreshState]);

  useEffect(() => {
    refreshState();
  }, [playerId, refreshState]);

  return {
    lifecycleState: lifecycleState as EngineLifecycleState,
    isActive,
    isLoading,
    refreshState,
    pause,
    resume,
    complete,
  };
}
