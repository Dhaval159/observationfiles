import type { Validator } from "./base-validator";
import type { ValidationResult } from "../models/validation-result";
import type { SaveData } from "../models/save-data";
import { createValidationResult, createValidationError, createValidationWarning } from "../models/validation-result";

export class SaveValidator implements Validator<SaveData> {
  getValidatorId(): string {
    return "save-validator";
  }

  supports(input: unknown): boolean {
    if (!input || typeof input !== "object") return false;
    const obj = input as Record<string, unknown>;
    return typeof obj.id === "string" && typeof obj.playerId === "string";
  }

  validate(input: SaveData, _context: Record<string, unknown> = {}): ValidationResult {
    const errors = [];
    const warnings = [];

    if (!input.id || input.id.trim().length === 0) {
      errors.push(createValidationError("SAVE_NO_ID", "Save must have an id", "id", "id"));
    }

    if (!input.playerId || input.playerId.trim().length === 0) {
      errors.push(createValidationError("SAVE_NO_PLAYER", "Save must have a player id", "playerId", "playerId"));
    }

    if (input.slotIndex < 0) {
      errors.push(createValidationError("SAVE_INVALID_SLOT", "Save slot index cannot be negative", "slotIndex", "slotIndex"));
    }

    if (!input.gameData) {
      warnings.push(createValidationWarning("SAVE_NO_DATA", "Save has no game data", "gameData", "gameData"));
    }

    if (input.version < 0) {
      errors.push(createValidationError("SAVE_INVALID_VERSION", "Save version cannot be negative", "version", "version"));
    }

    if (input.playTimeSeconds < 0) {
      errors.push(createValidationError("SAVE_NEGATIVE_PLAYTIME", "Play time cannot be negative", "playTimeSeconds", "playTimeSeconds"));
    }

    return createValidationResult(errors, warnings);
  }
}
