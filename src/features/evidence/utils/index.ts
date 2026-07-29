import type { FullEvidence, EvidenceRelationship } from "@/types/evidence";
import type { EvidenceFilters, EvidenceSortField } from "../types";

export function filterEvidenceItems(
  evidence: FullEvidence[],
  filters: Partial<EvidenceFilters>,
): FullEvidence[] {
  return evidence.filter((item) => {
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(item.type)) return false;
    }

    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(item.category)) return false;
    }

    if (filters.collected !== null && filters.collected !== undefined) {
      const isCollected = item.collectedAt !== null;
      if (isCollected !== filters.collected) return false;
    }

    if (filters.analyzed !== null && filters.analyzed !== undefined) {
      const isAnalyzed = item.analyzedAt !== null;
      if (isAnalyzed !== filters.analyzed) return false;
    }

    if (filters.isKey !== null && filters.isKey !== undefined) {
      if (item.isKey !== filters.isKey) return false;
    }

    if (filters.location && item.location !== filters.location) {
      return false;
    }

    if (filters.tags && filters.tags.length > 0) {
      const itemTagNames = item.tags.map((t) => t.name);
      const hasTag = filters.tags.some((tag) => itemTagNames.includes(tag));
      if (!hasTag) return false;
    }

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(q);
      const matchesDesc = item.description.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc) return false;
    }

    return true;
  });
}

export function sortEvidenceItems(
  evidence: FullEvidence[],
  field: EvidenceSortField,
  order: "asc" | "desc",
): FullEvidence[] {
  const sorted = [...evidence];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      case "collectedAt": {
        const aTime = a.collectedAt ?? "";
        const bTime = b.collectedAt ?? "";
        comparison = aTime.localeCompare(bTime);
        break;
      }
      case "analyzedAt": {
        const aTime = a.analyzedAt ?? "";
        const bTime = b.analyzedAt ?? "";
        comparison = aTime.localeCompare(bTime);
        break;
      }
      case "confidenceLevel":
        comparison = a.confidenceLevel - b.confidenceLevel;
        break;
      default:
        comparison = 0;
    }

    return order === "asc" ? comparison : -comparison;
  });

  return sorted;
}

export function searchEvidenceItems(evidence: FullEvidence[], query: string): FullEvidence[] {
  if (!query) return evidence;

  const q = query.toLowerCase();
  return evidence.filter(
    (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q),
  );
}

export function getEvidenceChain(
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

export function categorizeEvidence(evidence: FullEvidence[]): Record<string, FullEvidence[]> {
  const result: Record<string, FullEvidence[]> = {};

  for (const item of evidence) {
    const category = item.category;
    if (!result[category]) {
      result[category] = [];
    }
    result[category]!.push(item);
  }

  return result;
}

export function getEvidenceTimeline(evidence: FullEvidence[]): FullEvidence[] {
  return [...evidence].sort((a, b) => {
    const aTime = a.collectedAt ?? "";
    const bTime = b.collectedAt ?? "";
    return aTime.localeCompare(bTime);
  });
}

export function validateEvidenceLink(
  source: FullEvidence,
  target: FullEvidence,
  relationshipType: string,
): boolean {
  if (source.id === target.id) return false;

  const validTypes = [
    "supports",
    "contradicts",
    "relates_to",
    "proves",
    "disproves",
    "duplicates",
    "mentions",
  ];

  if (!validTypes.includes(relationshipType)) return false;

  const alreadyLinked = source.relatedEvidence.some((r) => r.targetId === target.id);
  if (alreadyLinked) return false;

  return true;
}
