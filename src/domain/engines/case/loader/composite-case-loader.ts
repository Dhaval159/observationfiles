import type { CaseLoader } from "../types";
import type { CaseDefinition, FullCase } from "@/types/case";
import type { Result } from "@/domain/results/result";
import { success, failure } from "@/domain/results/result";
import { CaseNotFoundError } from "@/domain/errors/domain-error";

export class CompositeCaseLoader implements CaseLoader {
  readonly name = "CompositeCaseLoader";
  readonly priority = -1;

  private _loaders: CaseLoader[] = [];

  addLoader(loader: CaseLoader): void {
    this._loaders.push(loader);
    this._loaders.sort((a, b) => b.priority - a.priority);
  }

  removeLoader(loaderName: string): void {
    this._loaders = this._loaders.filter((l) => l.name !== loaderName);
  }

  getLoaders(): readonly CaseLoader[] {
    return this._loaders;
  }

  canLoad(caseId: string, source?: string): boolean {
    return this._loaders.some((l) => l.canLoad(caseId, source));
  }

  async loadDefinition(caseId: string, source?: string): Promise<Result<CaseDefinition>> {
    for (const loader of this._loaders) {
      if (loader.canLoad(caseId, source)) {
        return loader.loadDefinition(caseId, source);
      }
    }
    return failure(new CaseNotFoundError(caseId));
  }

  async loadFullCase(caseId: string, playerId: string, source?: string): Promise<Result<FullCase>> {
    for (const loader of this._loaders) {
      try {
        if (loader.canLoad(caseId, source)) {
          const result = await loader.loadFullCase(caseId, playerId, source);
          if (result.success) return result;
        }
      } catch {
        continue;
      }
    }
    return failure(new CaseNotFoundError(caseId));
  }

  async listAvailableCases(): Promise<Result<string[]>> {
    const caseIds = new Set<string>();
    for (const loader of this._loaders) {
      const result = await loader.listAvailableCases();
      if (result.success) {
        for (const id of result.data) {
          caseIds.add(id);
        }
      }
    }
    return success([...caseIds]);
  }

  findLoader(loaderName: string): CaseLoader | undefined {
    return this._loaders.find((l) => l.name === loaderName);
  }

  clear(): void {
    this._loaders = [];
  }
}
