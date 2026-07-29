import type { CaseRegistry, CaseRegistryFilter } from "../types";
import type { CaseDefinition } from "@/types/case";
import type { CaseDifficulty } from "@/types/case";
import type { Result } from "@/domain/results/result";
import { success, failure } from "@/domain/results/result";
import { CaseNotFoundError, DuplicateEvidenceError, ValidationError } from "@/domain/errors/domain-error";
import { generateId } from "@/domain/utils/id-generator";

export class InMemoryCaseRegistry implements CaseRegistry {
  private _definitions: Map<string, CaseDefinition> = new Map();
  private _tags: Map<string, Set<string>> = new Map();
  private _byDifficulty: Map<CaseDifficulty, Set<string>> = new Map();
  private _sources: Map<string, Set<string>> = new Map();

  register(definition: CaseDefinition): Result<void> {
    if (this._definitions.has(definition.id)) {
      return failure(
        new DuplicateEvidenceError(definition.id),
      );
    }

    this._definitions.set(definition.id, definition);

    for (const tag of definition.metadata.tags ?? []) {
      if (!this._tags.has(tag)) {
        this._tags.set(tag, new Set());
      }
      this._tags.get(tag)!.add(definition.id);
    }

    const diff = definition.difficulty;
    if (!this._byDifficulty.has(diff)) {
      this._byDifficulty.set(diff, new Set());
    }
    this._byDifficulty.get(diff)!.add(definition.id);

    return success(undefined);
  }

  unregister(caseId: string): Result<void> {
    const definition = this._definitions.get(caseId);
    if (!definition) {
      return failure(new CaseNotFoundError(caseId));
    }

    for (const tag of definition.metadata.tags ?? []) {
      this._tags.get(tag)?.delete(caseId);
    }

    this._byDifficulty.get(definition.difficulty)?.delete(caseId);
    this._definitions.delete(caseId);

    return success(undefined);
  }

  get(caseId: string): Result<CaseDefinition> {
    const definition = this._definitions.get(caseId);
    if (!definition) {
      return failure(new CaseNotFoundError(caseId));
    }
    return success(definition);
  }

  has(caseId: string): boolean {
    return this._definitions.has(caseId);
  }

  list(filters?: CaseRegistryFilter): Result<CaseDefinition[]> {
    let definitions = [...this._definitions.values()];

    if (filters?.difficulty) {
      const ids = this._byDifficulty.get(filters.difficulty);
      if (ids) {
        definitions = definitions.filter((d) => ids.has(d.id));
      } else {
        return success([]);
      }
    }

    if (filters?.tags && filters.tags.length > 0) {
      for (const tag of filters.tags) {
        const ids = this._tags.get(tag);
        if (ids) {
          definitions = definitions.filter((d) => ids.has(d.id));
        } else {
          return success([]);
        }
      }
    }

    return success(definitions);
  }

  search(query: string): Result<CaseDefinition[]> {
    const normalized = query.toLowerCase();
    const results = [...this._definitions.values()].filter(
      (d) =>
        d.title.toLowerCase().includes(normalized) ||
        d.description.toLowerCase().includes(normalized) ||
        d.metadata.genre.toLowerCase().includes(normalized) ||
        d.metadata.tags.some((tag) => tag.toLowerCase().includes(normalized)),
    );
    return success(results);
  }

  count(): number {
    return this._definitions.size;
  }

  getByDifficulty(difficulty: CaseDifficulty): Result<CaseDefinition[]> {
    return this.list({ difficulty });
  }

  validateUniqueness(caseId: string): Result<boolean> {
    if (this._definitions.has(caseId)) {
      return failure(
        new ValidationError(`Case with id '${caseId}' already registered`, {
          [caseId]: ["Duplicate case ID"],
        }),
      );
    }
    return success(true);
  }

  importDefinitions(definitions: CaseDefinition[]): Result<number> {
    let imported = 0;
    for (const def of definitions) {
      const result = this.register(def);
      if (result.success) imported++;
    }
    return success(imported);
  }

  getStats(): {
    totalCases: number;
    byDifficulty: Record<string, number>;
    allTags: string[];
  } {
    const byDifficulty: Record<string, number> = {};
    for (const [diff, ids] of this._byDifficulty) {
      byDifficulty[diff] = ids.size;
    }

    const allTags = [...this._tags.keys()];

    return {
      totalCases: this._definitions.size,
      byDifficulty,
      allTags,
    };
  }

  clear(): void {
    this._definitions.clear();
    this._tags.clear();
    this._byDifficulty.clear();
    this._sources.clear();
  }
}
