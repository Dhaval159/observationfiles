import type { Validator } from "./base-validator";
import type { ValidationResult } from "../models/validation-result";
import type { FullTimelineEvent } from "../../types/timeline";
import { createValidationResult, createValidationError, createValidationWarning } from "../models/validation-result";

export class TimelineValidator implements Validator<FullTimelineEvent[]> {
  getValidatorId(): string {
    return "timeline-validator";
  }

  supports(input: unknown): boolean {
    return Array.isArray(input);
  }

  validate(input: FullTimelineEvent[], _context: Record<string, unknown> = {}): ValidationResult {
    const errors = [];
    const warnings = [];

    const ids = new Set<string>();

    for (const event of input) {
      if (!event.id || event.id.trim().length === 0) {
        errors.push(createValidationError("TIMELINE_EVENT_NO_ID", "Timeline event must have an id", "events[].id", `events[${input.indexOf(event)}].id`));
      }

      if (ids.has(event.id)) {
        errors.push(createValidationError("TIMELINE_DUPLICATE_ID", `Duplicate event id: ${event.id}`, "events[].id", `events[${input.indexOf(event)}].id`));
      }
      if (event.id) ids.add(event.id);

      if (!event.title || event.title.trim().length === 0) {
        errors.push(createValidationError("TIMELINE_EVENT_NO_TITLE", `Timeline event ${event.id} has no title`, "events[].title", `events[${input.indexOf(event)}].title`));
      }

      if (!event.timestamp) {
        errors.push(createValidationError("TIMELINE_EVENT_NO_TIMESTAMP", `Timeline event ${event.id} has no timestamp`, "events[].timestamp", `events[${input.indexOf(event)}].timestamp`));
      }

      if (event.dependencies && event.dependencies.length > 0) {
        const resolvedIds = new Set(input.map((e) => e.id));
        for (const dep of event.dependencies) {
          if (!resolvedIds.has(dep.dependsOn)) {
            warnings.push(createValidationWarning("TIMELINE_UNRESOLVED_DEPENDENCY", `Event ${event.id} depends on unknown event ${dep.dependsOn}`, "events[].dependencies", `events[${input.indexOf(event)}].dependencies`));
          }
        }
      }
    }

    return createValidationResult(errors, warnings);
  }
}
