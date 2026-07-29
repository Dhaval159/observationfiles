import type {
  ObservationDefinition,
  ObservationState,
  ObservationObjectDefinition,
  ObservationSearchCriteria,
} from "@/types/observation";

export interface ObservationEngineState {
  objects: Map<string, ObservationObjectDefinition>;
  observations: Map<string, ObservationDefinition>;
  playerState: Map<string, ObservationState>;
  discoveredCount: number;
  totalCount: number;
  analyzedCount: number;
  lastDiscoveredAt: string | null;
}

export interface ObservationDiscoveryResult {
  observation: ObservationDefinition;
  wasNew: boolean;
  unlockedDeductions: string[];
  confidenceChange: number;
}

export interface ObservationFilterResult {
  observations: ObservationDefinition[];
  total: number;
  filtered: number;
}

export type {
  ObservationDefinition,
  ObservationState,
  ObservationObjectDefinition,
  ObservationSearchCriteria,
};
