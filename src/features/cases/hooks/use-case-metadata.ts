"use client";

import { useCallback, useEffect, useState } from "react";
import { getCaseEngine } from "../services/case-engine-service";
import type { CaseMetadata } from "@/types/case";

export function useCaseMetadata(caseId: string | null) {
  const [metadata, setMetadata] = useState<CaseMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMetadata = useCallback(async () => {
    if (!caseId) return;

    setIsLoading(true);
    try {
      const engine = getCaseEngine();
      const result = await engine.getCaseDefinition(caseId);
      if (result.success) {
        setMetadata(result.data.metadata);
      }
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMetadata();
    }, 0);
    return () => clearTimeout(timer);
  }, [caseId, loadMetadata]);

  return {
    metadata,
    isLoading,
    loadMetadata,
  };
}
