import type { CaseLoader } from "../types";
import type { CaseRegistry } from "../types";
import type { CaseDefinition, FullCase } from "@/types/case";
import type { Result } from "@/domain/results/result";
import { success, failure } from "@/domain/results/result";
import { CaseNotFoundError } from "@/domain/errors/domain-error";

export class RegistryCaseLoader implements CaseLoader {
  readonly name = "RegistryCaseLoader";
  readonly priority = 100;

  constructor(private readonly _registry: CaseRegistry) {}

  canLoad(caseId: string, _source?: string): boolean {
    return this._registry.has(caseId);
  }

  async loadDefinition(caseId: string, _source?: string): Promise<Result<CaseDefinition>> {
    const result = this._registry.get(caseId);
    if (!result.success) {
      return failure(new CaseNotFoundError(caseId));
    }
    return success(result.data);
  }

  async loadFullCase(_caseId: string, _playerId: string, _source?: string): Promise<Result<FullCase>> {
    return failure(new CaseNotFoundError(_caseId));
  }

  async listAvailableCases(): Promise<Result<string[]>> {
    const listResult = this._registry.list();
    if (!listResult.success) return listResult;
    return success(listResult.data.map((d) => d.id));
  }
}
