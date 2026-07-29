import type {
  ObservationDefinition,
  ObservationState,
  ObservationSearchCriteria,
} from "@/types/observation";

export function filterObservations(
  observations: ObservationDefinition[],
  criteria: ObservationSearchCriteria,
  getState?: (id: string) => ObservationState | undefined,
): ObservationDefinition[] {
  return observations.filter((obs) => {
    if (criteria.query) {
      const q = criteria.query.toLowerCase();
      const matchesTitle = obs.title.toLowerCase().includes(q);
      const matchesDesc = obs.description.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc) return false;
    }

    if (criteria.categories && criteria.categories.length > 0) {
      if (!criteria.categories.includes(obs.category)) return false;
    }

    if (criteria.tags && criteria.tags.length > 0) {
      const hasTag = criteria.tags.some((tag) => obs.tags.includes(tag));
      if (!hasTag) return false;
    }

    if (criteria.locationId !== undefined) return false;
    if (criteria.objectId && obs.objectId !== criteria.objectId) return false;
    if (criteria.isCritical !== undefined && obs.isCritical !== criteria.isCritical) return false;

    if (
      getState &&
      (criteria.discovered !== undefined ||
        criteria.analyzed !== undefined ||
        criteria.minConfidence !== undefined)
    ) {
      const state = getState(obs.id);

      if (criteria.discovered !== undefined) {
        const isDiscovered = state?.isDiscovered ?? false;
        if (isDiscovered !== criteria.discovered) return false;
      }

      if (criteria.analyzed !== undefined) {
        const isAnalyzed = state?.isAnalyzed ?? false;
        if (isAnalyzed !== criteria.analyzed) return false;
      }

      if (criteria.minConfidence !== undefined) {
        const confidence = state?.confidenceLevel ?? 0;
        if (confidence < criteria.minConfidence) return false;
      }
    }

    return true;
  });
}

export function sortObservations(
  observations: ObservationDefinition[],
  sortBy: "title" | "category" | "confidence" | "order",
  order: "asc" | "desc",
): ObservationDefinition[] {
  const sorted = [...observations];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      case "confidence":
        comparison = a.confidenceGain - b.confidenceGain;
        break;
      case "order":
        comparison = a.order - b.order;
        break;
      default:
        comparison = 0;
    }

    return order === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export function getCriticalObservations(
  observations: ObservationDefinition[],
): ObservationDefinition[] {
  return observations.filter((obs) => obs.isCritical);
}

export function getObservationDependencyTree(
  observationId: string,
  allObservations: Map<string, ObservationDefinition>,
): ObservationDefinition[] {
  const result: ObservationDefinition[] = [];
  const visited = new Set<string>();

  function traverse(id: string): void {
    if (visited.has(id)) return;
    visited.add(id);

    const observation = allObservations.get(id);
    if (!observation) return;

    for (const dep of observation.dependencies) {
      if (dep.dependencyType === "requires") {
        traverse(dep.dependsOn);
      }
    }

    result.push(observation);
  }

  traverse(observationId);
  return result;
}

export function getDeductionsFromObservation(
  observationId: string,
  allObservations: ObservationDefinition[],
): string[] {
  const observation = allObservations.find((o) => o.id === observationId);
  if (!observation) return [];
  return observation.unlocksDeductions;
}

export function calculateObservationConfidence(
  state: ObservationState,
  baseConfidence: number,
): number {
  let confidence = baseConfidence;

  if (state.isDiscovered) {
    confidence += 5;
  }

  if (state.isAnalyzed) {
    confidence += 15;
  }

  if (state.isPinned) {
    confidence += 5;
  }

  return confidence;
}
