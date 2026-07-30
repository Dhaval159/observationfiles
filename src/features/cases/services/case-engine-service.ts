import { CaseEngine } from "@/domain/engines/case/case-engine";
import type { EventBus } from "@/domain/events/base-event";
import { poisonedPinotCase } from "../data/poisoned-pinot";

let _engine: CaseEngine | null = null;

function setupEngine(engine: CaseEngine) {
  // Register in memory registry
  engine.registerCase(poisonedPinotCase.definition);

  // Register in JSON loader
  const jsonLoader = engine.loader.findLoader("JsonCaseLoader") as
    | {
        registerFullCase: (c: unknown) => void;
        registerDefinition: (d: unknown) => void;
      }
    | undefined;
  if (jsonLoader) {
    jsonLoader.registerFullCase(poisonedPinotCase.fullCase);
    jsonLoader.registerDefinition(poisonedPinotCase.definition);
  }
}

export function getCaseEngine(): CaseEngine {
  if (!_engine) {
    _engine = new CaseEngine();
    setupEngine(_engine);
  }
  return _engine;
}

export function initializeCaseEngine(eventBus?: EventBus): CaseEngine {
  _engine = new CaseEngine();
  if (eventBus) {
    _engine.setEventBus(eventBus);
  }
  setupEngine(_engine);
  return _engine;
}

export function resetCaseEngine(): void {
  _engine = null;
}
