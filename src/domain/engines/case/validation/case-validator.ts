import type { CaseValidationResult } from "../types";
import type { CaseDefinition, CaseUnlockCondition } from "@/types/case";
import type { ValidationError, ValidationWarning } from "@/domain/models/validation-result";
import {
  createValidationResult,
  createValidationError,
  createValidationWarning,
} from "@/domain/models/validation-result";

interface ValidatableChapter {
  id: string;
  title: string;
  description: string;
  order: number;
  unlockCondition: CaseUnlockCondition | null;
}

interface ValidatableLocation {
  id: string;
  name: string;
  description: string;
  connectedLocations: string[];
  unlockCondition: CaseUnlockCondition | null;
}

export class CaseValidator {
  validateDefinition(definition: CaseDefinition): CaseValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const sections: string[] = [];

    this._validateMetadata(definition, errors, warnings, sections);
    this._validateStructure(definition, errors, warnings, sections);
    this._validateObjectives(definition, errors, warnings, sections);
    this._validateLocations(definition, errors, warnings, sections);
    this._validateReferences(definition, errors, warnings, sections);
    this._validateUnlockChains(definition, errors, warnings, sections);
    this._validateDependencies(definition, errors, warnings, sections);

    const totalChecks = sections.length;
    const passedChecks = sections.length - errors.length;
    const failedChecks = errors.length > 0 ? Math.min(errors.length, totalChecks) : 0;

    const baseResult = createValidationResult(errors, warnings);

    return {
      ...baseResult,
      validatedSections: sections,
      totalChecks,
      passedChecks,
      failedChecks,
    };
  }

  private _validateMetadata(
    definition: CaseDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    sections: string[],
  ): void {
    sections.push("metadata");

    if (!definition.id || definition.id.trim().length === 0) {
      errors.push(createValidationError("MISSING_ID", "Case must have a non-empty id", "id", "id"));
    }

    if (!definition.title || definition.title.trim().length === 0) {
      errors.push(
        createValidationError("MISSING_TITLE", "Case must have a title", "title", "title"),
      );
    }

    if (definition.title && definition.title.trim().length > 200) {
      warnings.push(
        createValidationWarning(
          "LONG_TITLE",
          "Case title exceeds 200 characters",
          "title",
          "title",
        ),
      );
    }

    if (!definition.description || definition.description.trim().length === 0) {
      warnings.push(
        createValidationWarning(
          "MISSING_DESCRIPTION",
          "Case has no description",
          "description",
          "description",
        ),
      );
    }

    if (!definition.metadata) {
      errors.push(
        createValidationError(
          "MISSING_METADATA",
          "Case must have metadata",
          "metadata",
          "metadata",
        ),
      );
    }

    if (definition.metadata && !definition.metadata.author) {
      warnings.push(
        createValidationWarning(
          "MISSING_AUTHOR",
          "Case metadata has no author",
          "metadata.author",
          "metadata.author",
        ),
      );
    }
  }

  private _validateStructure(
    definition: CaseDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    sections: string[],
  ): void {
    sections.push("structure");

    if (!definition.chapters || definition.chapters.length === 0) {
      warnings.push(
        createValidationWarning(
          "NO_CHAPTERS",
          "Case has no chapters defined",
          "chapters",
          "chapters",
        ),
      );
    }

    if (!definition.objectives || definition.objectives.length === 0) {
      warnings.push(
        createValidationWarning(
          "NO_OBJECTIVES",
          "Case has no objectives",
          "objectives",
          "objectives",
        ),
      );
    }

    if (definition.chapters) {
      const chapters = definition.chapters as ValidatableChapter[];
      const chapterIds = new Set<string>();
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        if (!chapter) continue;
        if (chapterIds.has(chapter.id)) {
          errors.push(
            createValidationError(
              "DUPLICATE_CHAPTER_ID",
              `Duplicate chapter id: ${chapter.id}`,
              "chapters",
              `chapters[${i}].id`,
            ),
          );
        }
        chapterIds.add(chapter.id);

        if (chapter.order !== undefined && i > 0) {
          const prevChapter = chapters[i - 1];
          if (prevChapter && prevChapter.order !== undefined && chapter.order !== undefined) {
            if (chapter.order <= prevChapter.order) {
              warnings.push(
                createValidationWarning(
                  "CHAPTER_ORDER",
                  `Chapter ${chapter.id} order (${chapter.order}) should be greater than previous chapter order (${prevChapter.order})`,
                  "chapters",
                  `chapters[${i}].order`,
                ),
              );
            }
          }
        }
      }
    }
  }

  private _validateObjectives(
    definition: CaseDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    sections: string[],
  ): void {
    sections.push("objectives");

    const objIds = new Set<string>();
    for (let i = 0; i < definition.objectives.length; i++) {
      const obj = definition.objectives[i];
      if (!obj) continue;
      if (objIds.has(obj.id)) {
        errors.push(
          createValidationError(
            "DUPLICATE_OBJECTIVE_ID",
            `Duplicate objective id: ${obj.id}`,
            "objectives",
            `objectives[${i}].id`,
          ),
        );
      }
      objIds.add(obj.id);

      if (!obj.description || obj.description.trim().length === 0) {
        warnings.push(
          createValidationWarning(
            "OBJECTIVE_NO_DESCRIPTION",
            `Objective ${obj.id} has no description`,
            "objectives",
            `objectives[${i}].description`,
          ),
        );
      }

      if (!obj.completionCondition || Object.keys(obj.completionCondition).length === 0) {
        warnings.push(
          createValidationWarning(
            "OBJECTIVE_NO_COMPLETION",
            `Objective ${obj.id} has no completion condition`,
            "objectives",
            `objectives[${i}].completionCondition`,
          ),
        );
      }
    }

    const hasPrimary = definition.objectives.some((o) => o.type === "primary");
    if (!hasPrimary && definition.objectives.length > 0) {
      warnings.push(
        createValidationWarning(
          "NO_PRIMARY_OBJECTIVE",
          "Case has no primary objective defined",
          "objectives",
          "objectives",
        ),
      );
    }
  }

  private _validateLocations(
    definition: CaseDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    sections: string[],
  ): void {
    sections.push("locations");

    const locations = definition.locations as ValidatableLocation[];
    const locIds = new Set<string>();
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      if (!loc) continue;
      if (locIds.has(loc.id)) {
        errors.push(
          createValidationError(
            "DUPLICATE_LOCATION_ID",
            `Duplicate location id: ${loc.id}`,
            "locations",
            `locations[${i}].id`,
          ),
        );
      }
      locIds.add(loc.id);
    }

    for (const location of locations) {
      for (const connectedId of location.connectedLocations) {
        if (!locIds.has(connectedId)) {
          warnings.push(
            createValidationWarning(
              "INVALID_CONNECTION",
              `Location ${location.id} connects to unknown location ${connectedId}`,
              "locations",
              `locations.${location.id}.connectedLocations`,
            ),
          );
        }
      }
    }
  }

  private _validateReferences(
    definition: CaseDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    sections: string[],
  ): void {
    sections.push("references");

    if (definition.solution) {
      for (const evidenceId of definition.solution.requiredEvidence) {
        if (!definition.objectives.some((o) => o.completionCondition?.evidenceId === evidenceId)) {
          warnings.push(
            createValidationWarning(
              "UNREFERENCED_EVIDENCE",
              `Solution references evidence ${evidenceId} not found in objectives`,
              "solution.requiredEvidence",
              "solution.requiredEvidence",
            ),
          );
        }
      }
    }
  }

  private _validateUnlockChains(
    definition: CaseDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    sections: string[],
  ): void {
    sections.push("unlock_chains");

    const locations = definition.locations as ValidatableLocation[];
    const locIds = new Set(locations.map((l) => l.id));
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const hasCycles = (locId: string): boolean => {
      if (visiting.has(locId)) return true;
      if (visited.has(locId)) return false;
      visiting.add(locId);

      const location = locations.find((l) => l.id === locId);
      if (location) {
        for (const connectedId of location.connectedLocations) {
          if (hasCycles(connectedId)) {
            errors.push(
              createValidationError(
                "CIRCULAR_REFERENCE",
                `Circular reference detected involving location ${locId}`,
                "locations",
                "locations",
              ),
            );
            return true;
          }
        }
      }

      visiting.delete(locId);
      visited.add(locId);
      return false;
    };

    for (const locId of locIds) {
      hasCycles(locId);
    }
  }

  private _validateDependencies(
    definition: CaseDefinition,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    sections: string[],
  ): void {
    sections.push("dependencies");

    const chapters = definition.chapters as ValidatableChapter[];
    const locations = definition.locations as ValidatableLocation[];

    for (const chapter of chapters) {
      if (chapter.unlockCondition) {
        if (chapter.unlockCondition.type === "custom" && !chapter.unlockCondition.config) {
          warnings.push(
            createValidationWarning(
              "MISSING_UNLOCK_CONFIG",
              `Chapter ${chapter.id} has custom unlock condition without config`,
              "chapters",
              `chapters.${chapter.id}.unlockCondition`,
            ),
          );
        }
      }
    }

    for (const location of locations) {
      if (location.unlockCondition) {
        if (location.unlockCondition.type === "custom" && !location.unlockCondition.config) {
          warnings.push(
            createValidationWarning(
              "MISSING_UNLOCK_CONFIG",
              `Location ${location.id} has custom unlock condition without config`,
              "locations",
              `locations.${location.id}.unlockCondition`,
            ),
          );
        }
      }
    }
  }
}
