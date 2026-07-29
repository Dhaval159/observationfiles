export interface GameEngine<TDefinition, TState> {
  readonly id: string;
  readonly name: string;
  initialize(definition: TDefinition): void;
  getState(): TState;
  reset(): void;
  serialize(): string;
  deserialize(data: string): void;
}

export interface ProgressionEngine extends GameEngine<unknown, unknown> {
  getProgress(): number;
  isComplete(): boolean;
  canAdvance(): boolean;
  advance(): void;
}

export interface EventEmitter {
  on(event: string, handler: (...args: unknown[]) => void): () => void;
  off(event: string, handler: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
  once(event: string, handler: (...args: unknown[]) => void): void;
  listenerCount(event: string): number;
}

export interface Validator<T> {
  validate(input: T, context: Record<string, unknown>): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  code: string;
  message: string;
  path: string;
  severity: "error";
}

export interface ValidationWarning {
  code: string;
  message: string;
  path: string;
  severity: "warning" | "info";
}

export interface DependencyResolver<T> {
  resolve(items: T[], context: Record<string, unknown>): T[];
  getUnmetDependencies(item: T, allItems: T[]): T[];
  getDependents(item: T, allItems: T[]): T[];
}

export interface ConditionEvaluator {
  evaluate(condition: Condition, context: Record<string, unknown>): boolean;
  evaluateAll(conditions: Condition[], context: Record<string, unknown>): boolean;
  evaluateAny(conditions: Condition[], context: Record<string, unknown>): boolean;
}

export interface Condition {
  type: string;
  target?: string;
  operator?: string;
  value?: unknown;
  config?: Record<string, unknown>;
}

export interface SearchCriteria {
  query?: string;
  filters?: Record<string, unknown>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
