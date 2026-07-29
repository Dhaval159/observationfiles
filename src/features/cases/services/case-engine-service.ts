import { CaseEngine } from "@/domain/engines/case/case-engine";
import type { EventBus } from "@/domain/events/base-event";

let _engine: CaseEngine | null = null;

export function getCaseEngine(): CaseEngine {
  if (!_engine) {
    _engine = new CaseEngine();
  }
  return _engine;
}

export function initializeCaseEngine(eventBus?: EventBus): CaseEngine {
  _engine = new CaseEngine();
  if (eventBus) {
    _engine.setEventBus(eventBus);
  }
  return _engine;
}

export function resetCaseEngine(): void {
  _engine = null;
}
