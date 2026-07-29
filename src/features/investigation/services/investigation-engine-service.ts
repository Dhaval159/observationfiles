import { InvestigationEngine } from "@/domain/engines/investigation/investigation-engine";
import type { EventBus } from "@/domain/events/base-event";
import type { InvestigationEngineConfig } from "@/domain/engines/investigation/investigation-engine";

let _engine: InvestigationEngine | null = null;

export function getInvestigationEngine(): InvestigationEngine {
  if (!_engine) {
    _engine = new InvestigationEngine();
  }
  return _engine;
}

export function initializeInvestigationEngine(
  config?: Partial<InvestigationEngineConfig>,
  eventBus?: EventBus,
): InvestigationEngine {
  _engine = new InvestigationEngine(config);
  if (eventBus) {
    _engine.setEventBus(eventBus);
  }
  return _engine;
}

export function resetInvestigationEngine(): void {
  _engine = null;
}
