export { InvestigationEngine } from "./investigation-engine";
export type { InvestigationEngineConfig } from "./investigation-engine";
export { InvestigationLifecycle } from "./lifecycle/investigation-lifecycle";
export { InvestigationFlowManager } from "./flow/investigation-flow-manager";
export { DiscoveryManager } from "./discovery/discovery-manager";
export { ActivityTracker } from "./activity/activity-tracker";
export { ProgressTracker } from "./progress/progress-tracker";
export { UnlockCoordinator } from "./unlock/unlock-coordinator";
export type { UnlockableSystem } from "./unlock/unlock-coordinator";
export { NotificationCoordinator } from "./notification/notification-coordinator";
export { InvestigationSearch } from "./search/investigation-search";
export { InvestigationFilter } from "./filter/investigation-filter";
export {
  createInvestigationContext,
  createEmptyDiscoveries,
  createEmptyProgress,
  touchContext,
  addActivity,
  addLogEntry,
  addNotification,
  markNotificationRead,
  clearNotifications,
  addDiscovery,
  isDiscovered,
  getDiscoveryCount,
  setRuntimeVariable,
  getRuntimeVariable,
  setTemporaryCache,
  getTemporaryCache,
  startTimer,
  pauseTimer,
  resumeTimer,
  getTimerElapsed,
  expireTimer,
  cloneContext,
  getContextSummary,
} from "./context/investigation-context";
export {
  isValidTransition,
  isTerminalState,
  isActiveState,
  isExplorationState,
  getAvailableTransitions,
  getStateLabel,
  INVESTIGATION_STATES,
  VALID_TRANSITIONS,
  TERMINAL_STATES,
  ACTIVE_STATES,
  EXPLORATION_STATES,
} from "./lifecycle/investigation-lifecycle-states";
export type {
  InvestigationLifecycleState,
  InvestigationContext,
  LifecycleSnapshot,
  InvestigationDiscoveries,
  InvestigationObjectiveState,
  ActivityEntry,
  InvestigationNotification,
  NotificationCategory,
  LogEntry,
  LogCategory,
  InvestigationProgress,
  TimerState,
  DiscoveryEntry,
  DiscoveryType,
  InvestigatablePlugin,
  ProgressWeightConfig,
  InvestigationFilter as InvestigationFilterType,
  InvestigationSortOption,
} from "./types";
export { DEFAULT_PROGRESS_WEIGHTS } from "./types";
