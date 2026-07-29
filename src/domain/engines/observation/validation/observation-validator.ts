import type {
  ObservationObjectDefinition,
  ObservationValidationResult,
  ObservationValidationError,
  ObservationValidationWarning,
  ObservationGroupDefinition,
  ObservationDependencyDefinition,
} from "../types";
import type { ObservationContext } from "../types";
import { DependencyGraph } from "../dependencies/dependency-graph";

export class ObservationValidator {
  validateDefinition(def: ObservationObjectDefinition): ObservationValidationResult {
    const errors: ObservationValidationError[] = [];
    const warnings: ObservationValidationWarning[] = [];

    if (!def.id || def.id.trim().length === 0) {
      errors.push({
        code: "OBS_NO_ID",
        message: "Observation must have a non-empty id",
        field: "id",
      });
    }

    if (!def.caseId || def.caseId.trim().length === 0) {
      errors.push({
        code: "OBS_NO_CASE_ID",
        message: "Observation must have a caseId",
        field: "caseId",
      });
    }

    if (!def.title || def.title.trim().length === 0) {
      errors.push({
        code: "OBS_NO_TITLE",
        message: "Observation must have a title",
        field: "title",
      });
    }

    if (!def.category) {
      errors.push({
        code: "OBS_NO_CATEGORY",
        message: "Observation must have a category",
        field: "category",
      });
    }

    if (def.maxObservationCount !== undefined && def.maxObservationCount < 1) {
      errors.push({
        code: "OBS_INVALID_MAX_COUNT",
        message: "maxObservationCount must be at least 1",
        field: "maxObservationCount",
      });
    }

    if (def.xpReward !== undefined && def.xpReward < 0) {
      errors.push({
        code: "OBS_INVALID_XP",
        message: "xpReward must be non-negative",
        field: "xpReward",
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateGroup(group: ObservationGroupDefinition): ObservationValidationResult {
    const errors: ObservationValidationError[] = [];
    const warnings: ObservationValidationWarning[] = [];

    if (!group.id || group.id.trim().length === 0) {
      errors.push({ code: "GRP_NO_ID", message: "Group must have a non-empty id", field: "id" });
    }

    if (!group.name || group.name.trim().length === 0) {
      errors.push({ code: "GRP_NO_NAME", message: "Group must have a name", field: "name" });
    }

    if (group.requiredCount < 0) {
      errors.push({
        code: "GRP_INVALID_REQUIRED_COUNT",
        message: "requiredCount must be non-negative",
        field: "requiredCount",
      });
    }

    if (group.parentGroupId === group.id) {
      errors.push({
        code: "GRP_SELF_PARENT",
        message: "Group cannot be its own parent",
        field: "parentGroupId",
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateDependency(
    dep: ObservationDependencyDefinition,
    existingIds: Set<string>,
  ): ObservationValidationResult {
    const errors: ObservationValidationError[] = [];
    const warnings: ObservationValidationWarning[] = [];

    if (!dep.dependsOnId || dep.dependsOnId.trim().length === 0) {
      errors.push({
        code: "DEP_NO_TARGET",
        message: "Dependency must have a target id",
        field: "dependsOnId",
      });
    }

    if (existingIds.size > 0 && !existingIds.has(dep.dependsOnId)) {
      warnings.push({
        code: "DEP_MISSING_TARGET",
        message: `Dependency target '${dep.dependsOnId}' not found in registered definitions`,
        field: "dependsOnId",
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateContext(ctx: ObservationContext): ObservationValidationResult {
    const errors: ObservationValidationError[] = [];
    const warnings: ObservationValidationWarning[] = [];

    for (const [id, entry] of ctx.entries) {
      if (!entry.definition) {
        errors.push({
          code: "CTX_MISSING_DEF",
          message: `Entry '${id}' has no definition`,
          field: "definition",
          observationId: id,
        });
      }

      for (const dep of entry.dependencies.dependencies) {
        if (dep.isMandatory && !ctx.entries.has(dep.dependsOnId)) {
          warnings.push({
            code: "CTX_BROKEN_DEP",
            message: `Entry '${id}' has broken mandatory dependency to '${dep.dependsOnId}'`,
            field: "dependencies",
            observationId: id,
          });
        }
      }
    }

    for (const [groupId, group] of ctx.groups) {
      if (group.parentGroupId && !ctx.groups.has(group.parentGroupId)) {
        warnings.push({
          code: "CTX_BROKEN_PARENT_GROUP",
          message: `Group '${groupId}' references non-existent parent '${group.parentGroupId}'`,
          field: "parentGroupId",
        });
      }

      for (const obsId of group.observationIds) {
        if (!ctx.entries.has(obsId) && !ctx.definitions.has(obsId)) {
          warnings.push({
            code: "CTX_GROUP_OBS_MISSING",
            message: `Group '${groupId}' references unknown observation '${obsId}'`,
            field: "observationIds",
          });
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateCircularDependencies(ctx: ObservationContext): ObservationValidationResult {
    const errors: ObservationValidationError[] = [];
    const warnings: ObservationValidationWarning[] = [];

    const graph = new DependencyGraph();
    for (const [id, entry] of ctx.entries) {
      graph.addNode(id, entry.dependencies.dependencies);
    }

    const cycles = graph.detectCycles();
    for (const cycle of cycles) {
      errors.push({
        code: "DEP_CIRCULAR",
        message: `Circular dependency detected: ${cycle.join(" -> ")}`,
        field: "dependencies",
        observationId: cycle[0],
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  validateAll(ctx: ObservationContext): ObservationValidationResult {
    const errors: ObservationValidationError[] = [];
    const warnings: ObservationValidationWarning[] = [];

    for (const [, def] of ctx.definitions) {
      const defResult = this.validateDefinition(def);
      errors.push(...defResult.errors);
      warnings.push(...defResult.warnings);
    }

    for (const [, group] of ctx.groups) {
      const groupResult = this.validateGroup(group);
      errors.push(...groupResult.errors);
      warnings.push(...groupResult.warnings);
    }

    const ctxResult = this.validateContext(ctx);
    errors.push(...ctxResult.errors);
    warnings.push(...ctxResult.warnings);

    const cycleResult = this.validateCircularDependencies(ctx);
    errors.push(...cycleResult.errors);
    warnings.push(...cycleResult.warnings);

    return { isValid: errors.length === 0, errors, warnings };
  }
}
