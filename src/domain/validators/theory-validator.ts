import type { Validator } from "./base-validator";
import type { ValidationResult } from "../models/validation-result";
import type { TheoryBoard } from "../../types/theory-board";
import { createValidationResult, createValidationError, createValidationWarning } from "../models/validation-result";

export class TheoryValidator implements Validator<TheoryBoard> {
  getValidatorId(): string {
    return "theory-validator";
  }

  supports(input: unknown): boolean {
    if (!input || typeof input !== "object") return false;
    const obj = input as Record<string, unknown>;
    return typeof obj.id === "string" && Array.isArray(obj.nodes) && Array.isArray(obj.connections);
  }

  validate(input: TheoryBoard, _context: Record<string, unknown> = {}): ValidationResult {
    const errors = [];
    const warnings = [];

    if (!input.id || input.id.trim().length === 0) {
      errors.push(createValidationError("THEORY_NO_ID", "Theory board must have an id", "id", "id"));
    }

    if (!input.caseId || input.caseId.trim().length === 0) {
      errors.push(createValidationError("THEORY_NO_CASE_ID", "Theory board must belong to a case", "caseId", "caseId"));
    }

    const nodeIds = new Set(input.nodes.map((n) => n.id));

    for (const node of input.nodes) {
      if (node.confidence < 0 || node.confidence > 1) {
        errors.push(createValidationError("THEORY_INVALID_CONFIDENCE", `Node ${node.id} has invalid confidence`, "nodes[].confidence", `nodes[${input.nodes.indexOf(node)}].confidence`));
      }
    }

    for (const connection of input.connections) {
      if (!nodeIds.has(connection.sourceNodeId)) {
        errors.push(createValidationError("THEORY_INVALID_SOURCE", `Connection ${connection.id} references unknown source node ${connection.sourceNodeId}`, "connections[].sourceNodeId", `connections[${input.connections.indexOf(connection)}].sourceNodeId`));
      }
      if (!nodeIds.has(connection.targetNodeId)) {
        errors.push(createValidationError("THEORY_INVALID_TARGET", `Connection ${connection.id} references unknown target node ${connection.targetNodeId}`, "connections[].targetNodeId", `connections[${input.connections.indexOf(connection)}].targetNodeId`));
      }
      if (connection.sourceNodeId === connection.targetNodeId) {
        warnings.push(createValidationWarning("THEORY_SELF_REFERENCE", `Connection ${connection.id} connects node to itself`, "connections[].targetNodeId", `connections[${input.connections.indexOf(connection)}].targetNodeId`));
      }
    }

    const nodeCount = input.nodes.length;
    const connectionCount = input.connections.length;

    if (nodeCount > 0 && connectionCount === 0) {
      warnings.push(createValidationWarning("THEORY_NO_CONNECTIONS", "Theory board has nodes but no connections", "connections", "connections"));
    }

    if (nodeCount > 200) {
      warnings.push(createValidationWarning("THEORY_MANY_NODES", `Theory board has ${nodeCount} nodes; performance may be impacted`, "nodes", "nodes"));
    }

    return createValidationResult(errors, warnings);
  }
}
