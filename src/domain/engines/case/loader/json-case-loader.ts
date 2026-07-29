import type { CaseLoader } from "../types";
import type { CaseDefinition, FullCase } from "@/types/case";
import type { Result } from "@/domain/results/result";
import { success, failure, tryCatch } from "@/domain/results/result";
import { CaseNotFoundError, SerializationError } from "@/domain/errors/domain-error";

export class JsonCaseLoader implements CaseLoader {
  readonly name = "JsonCaseLoader";
  readonly priority = 50;

  private _definitions: Map<string, CaseDefinition> = new Map();
  private _fullCases: Map<string, FullCase> = new Map();

  registerDefinition(definition: CaseDefinition): void {
    this._definitions.set(definition.id, definition);
  }

  registerFullCase(fullCase: FullCase): void {
    this._fullCases.set(fullCase.id, fullCase);
  }

  loadFromJson(json: string): Result<CaseDefinition> {
    return tryCatch(() => {
      const parsed = JSON.parse(json) as CaseDefinition;
      if (!parsed.id || !parsed.title) {
        throw new SerializationError("Invalid case definition JSON: missing required fields", {
          entityType: "CaseDefinition",
        });
      }
      this._definitions.set(parsed.id, parsed);
      return parsed;
    });
  }

  loadFromJsonString(json: string): Result<CaseDefinition> {
    return this.loadFromJson(json);
  }

  canLoad(caseId: string, _source?: string): boolean {
    return this._definitions.has(caseId) || this._fullCases.has(caseId);
  }

  async loadDefinition(caseId: string, _source?: string): Promise<Result<CaseDefinition>> {
    const definition = this._definitions.get(caseId);
    if (!definition) {
      return failure(new CaseNotFoundError(caseId));
    }
    return success(definition);
  }

  async loadFullCase(caseId: string, _playerId: string, _source?: string): Promise<Result<FullCase>> {
    const fullCase = this._fullCases.get(caseId);
    if (!fullCase) {
      return failure(new CaseNotFoundError(caseId));
    }
    return success(fullCase);
  }

  async listAvailableCases(): Promise<Result<string[]>> {
    return success([...this._definitions.keys()]);
  }

  unloadDefinition(caseId: string): void {
    this._definitions.delete(caseId);
  }

  unloadFullCase(caseId: string): void {
    this._fullCases.delete(caseId);
  }

  clear(): void {
    this._definitions.clear();
    this._fullCases.clear();
  }
}
