import { useMemo, useState, useEffect, useCallback } from "react";
import type {
  ObservationEntry,
  ObservationGroupDefinition,
  ObservationSearchCriteria,
  ObservationFilterCriteria,
  ObservationLifecycleState,
  ObservationObjectDefinition,
} from "@/domain/engines/observation/types";
import { ObservationEngine } from "@/domain/engines/observation/observation-engine";
import { useEngineObservationStore } from "@/stores/engine-observation-store";
import { poisonedPinotCase } from "../../cases/data/poisoned-pinot";

let engineInstance: ObservationEngine | null = null;
const changeListeners = new Set<() => void>();

export function notifyObservationChange() {
  changeListeners.forEach((l) => l());
}

function ensureEngine(): ObservationEngine {
  if (!engineInstance) {
    engineInstance = new ObservationEngine();

    // Convert and register Poisoned Pinot observations
    const caseId = poisonedPinotCase.id;
    const mappedDefs: ObservationObjectDefinition[] = poisonedPinotCase.observations.map((obs) => {
      const obj =
        poisonedPinotCase.observationObjects.find((o) => o.observationIds.includes(obs.id)) ||
        poisonedPinotCase.observationObjects[0]!;

      return {
        id: obs.id,
        caseId: caseId,
        sourceObjectId: obs.objectId,
        locationId: obj.locationId,
        category: obs.category as import("@/domain/enums").ObservationCategory,
        title: obs.title,
        description: obs.description,
        detailedDescription: obs.detailedDescription,
        visibility: obs.visibility as import("@/domain/enums").ObservationVisibility,
        requirements: { requirements: [], sets: [], requiredCount: 0, combinator: "all" },
        dependencyDefs: obs.dependencies.map((dep) => ({
          id: `${obs.id}_dep_${dep.dependsOn}`,
          dependsOnId: dep.dependsOn,
          dependencyType: dep.dependencyType as
            "requires" | "enhances" | "contradicts" | "supersedes" | "precedes" | "follows",
          description: dep.description,
          isBidirectional: false,
          isMandatory: true,
        })),
        confidenceGain: obs.confidenceGain,
        unlocksObservations: obs.unlocksDeductions,
        tags: obs.tags,
        order: obs.order,
        priority: "normal" as unknown as import("@/domain/value-objects/priority").Priority,
        difficulty:
          "medium" as unknown as import("@/domain/value-objects/difficulty").DomainDifficulty,
        isCritical: obs.isCritical,
        xpReward: obs.xpReward,
        maxObservationCount: 1,
        isHidden: obs.visibility === "hidden",
        hiddenRequirements: { requirements: [], sets: [], requiredCount: 0, combinator: "all" },
        interactionPrompt: "Examine",
        relatedEvidenceIds: [],
        relatedStatementIds: [],
        relatedTimelineIds: [],
        relatedTheoryIds: [],
        metadata: {},
      };
    });

    engineInstance.registerObservations(mappedDefs);
  }
  return engineInstance;
}

export function useObservationEngine(): ObservationEngine {
  return useMemo(() => ensureEngine(), []);
}

export function useObservation(
  caseId: string,
  observationId: string,
  playerId: string,
): {
  entry: ObservationEntry | null;
  isLoading: boolean;
  error: string | null;
} {
  const engine = useObservationEngine();
  const initial = engine.getEntry(caseId, observationId, playerId);
  const [entry, setEntry] = useState<ObservationEntry | null>(
    initial.success ? initial.data : null,
  );
  const [error, setError] = useState<string | null>(initial.success ? null : initial.error.message);
  const [, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    changeListeners.add(refresh);
    return () => {
      changeListeners.delete(refresh);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = engine.getEntry(caseId, observationId, playerId);
      if (result.success) {
        setEntry(result.data);
        setError(null);
      } else {
        setEntry(null);
        setError(result.error.message);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [engine, caseId, observationId, playerId]);

  return { entry, isLoading: false, error };
}

export function useObservations(
  caseId: string,
  playerId: string,
  options?: {
    state?: ObservationLifecycleState;
    category?: string;
    location?: string;
    group?: string;
    tags?: string[];
  },
): {
  entries: ObservationEntry[];
  isLoading: boolean;
  count: number;
} {
  const engine = useObservationEngine();
  const { state, category, location, group, tags } = options ?? {};
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    changeListeners.add(refresh);
    return () => {
      changeListeners.delete(refresh);
    };
  }, []);

  return useMemo(() => {
    void tick;
    let entries = engine.getAll(caseId, playerId);

    if (state) {
      entries = engine.getByState(caseId, state, playerId);
    }
    if (category) {
      entries = entries.filter((e) => e.definition.category === category);
    }
    if (location) {
      entries = entries.filter((e) => e.definition.locationId === location);
    }
    if (group) {
      entries = engine.getByGroup(caseId, group, playerId);
    }
    if (tags && tags.length > 0) {
      entries = entries.filter((e) => tags.some((t) => e.definition.tags.includes(t)));
    }

    return { entries, isLoading: false, count: entries.length };
  }, [engine, caseId, playerId, state, category, location, group, tags, tick]);
}

export function useObservationGroups(
  _caseId: string,
  _playerId: string,
): {
  groups: ObservationGroupDefinition[];
  isLoading: boolean;
} {
  const engine = useObservationEngine();

  return useMemo(() => {
    const groups = engine.manager.groupManager.getAllGroups();
    return { groups, isLoading: false };
  }, [engine]);
}

export function useObservationSearch(
  caseId: string,
  playerId: string,
  criteria: ObservationSearchCriteria,
): {
  results: ObservationEntry[];
  isLoading: boolean;
  total: number;
} {
  const engine = useObservationEngine();
  const criteriaKey = JSON.stringify(criteria);
  const [results, setResults] = useState<ObservationEntry[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const searchResults = engine.search(caseId, criteria, playerId);
      setResults(searchResults);
    }, 150);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, caseId, playerId, criteriaKey]);

  return {
    results,
    isLoading: false,
    total: results.length,
  };
}

export function useObservationFilters(
  caseId: string,
  playerId: string,
  criteria: ObservationFilterCriteria,
): {
  results: ObservationEntry[];
  isLoading: boolean;
  count: number;
} {
  const engine = useObservationEngine();
  const criteriaKey = JSON.stringify(criteria);

  return useMemo(() => {
    const filtered = engine.filter(caseId, criteria, playerId);
    return { results: filtered, isLoading: false, count: filtered.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine, caseId, playerId, criteriaKey]);
}

export function useObservationState(): {
  currentObservationId: string | null;
  selectedObjectId: string | null;
  searchQuery: string;
  activeFilters: Record<string, unknown>;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  lifecycleState: ObservationLifecycleState;
  setCurrentObservationId: (id: string | null) => void;
  setSelectedObjectId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortField: (field: string | null) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
  addFilter: (key: string, value: unknown) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
} {
  const store = useEngineObservationStore();

  return {
    currentObservationId: store.currentObservationId,
    selectedObjectId: store.selectedObjectId,
    searchQuery: store.searchQuery,
    activeFilters: store.activeFilters,
    sortField: store.sortField,
    sortDirection: store.sortDirection,
    lifecycleState: store.lifecycleState,
    setCurrentObservationId: store.setCurrentObservationId,
    setSelectedObjectId: store.setSelectedObjectId,
    setSearchQuery: store.setSearchQuery,
    setSortField: store.setSortField,
    setSortDirection: store.setSortDirection,
    addFilter: store.addFilter,
    removeFilter: store.removeFilter,
    clearFilters: store.clearFilters,
  };
}

export function useObserve(
  caseId: string,
  playerId: string,
): {
  observe: (observationId: string, locationId: string) => void;
  isObserving: boolean;
  lastObservation: ObservationEntry | null;
  error: string | null;
} {
  const engine = useObservationEngine();
  const [isObserving, setIsObserving] = useState(false);
  const [lastObservation, setLastObservation] = useState<ObservationEntry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const observe = useCallback(
    (observationId: string, locationId: string) => {
      setIsObserving(true);
      setError(null);

      try {
        const result = engine.observe(caseId, observationId, locationId, playerId);
        if (result.success) {
          setLastObservation(result.data);
          notifyObservationChange();
        } else {
          setError(result.error.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsObserving(false);
      }
    },
    [engine, caseId, playerId],
  );

  return { observe, isObserving, lastObservation, error };
}

export function useObservationProgress(
  caseId: string,
  playerId: string,
): {
  total: number;
  observed: number;
  verified: number;
  hidden: number;
  available: number;
  percentage: number;
} {
  const engine = useObservationEngine();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    changeListeners.add(refresh);
    return () => {
      changeListeners.delete(refresh);
    };
  }, []);

  return useMemo(() => {
    void tick;
    const all = engine.getAll(caseId, playerId);
    const total = all.length;
    const observed = all.filter(
      (e) => e.lifecycleState === "observed" || e.lifecycleState === "verified",
    ).length;
    const verified = all.filter((e) => e.lifecycleState === "verified").length;
    const hidden = all.filter((e) => e.lifecycleState === "hidden").length;
    const available = all.filter(
      (e) => e.lifecycleState === "available" || e.lifecycleState === "inspecting",
    ).length;

    return {
      total,
      observed,
      verified,
      hidden,
      available,
      percentage: total > 0 ? Math.round((observed / total) * 100) : 0,
    };
  }, [engine, caseId, playerId, tick]);
}
