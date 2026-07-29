import type { DomainTimestamp } from "../value-objects/timestamp";

export interface Command {
  readonly id: string;
  readonly type: string;
  readonly timestamp: DomainTimestamp;
  readonly source: string;
  readonly correlationId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface CommandHandler<TCommand extends Command, TResult = void> {
  readonly commandType: string;
  canHandle(command: Command): command is TCommand;
  execute(command: TCommand): Promise<TResult>;
  validate?(command: TCommand): boolean;
}

export interface CommandBus {
  register<TCommand extends Command, TResult>(
    handler: CommandHandler<TCommand, TResult>,
  ): void;
  unregister(commandType: string): void;
  execute<TCommand extends Command, TResult>(command: TCommand): Promise<TResult>;
  getHandlers(): ReadonlyArray<CommandHandler<Command, unknown>>;
}

export interface CommandResult {
  readonly commandId: string;
  readonly success: boolean;
  readonly data?: unknown;
  readonly error?: string;
  readonly duration: number;
  readonly timestamp: DomainTimestamp;
}

export function createCommand(
  id: string,
  type: string,
  source: string,
  timestamp: DomainTimestamp,
  options?: {
    correlationId?: string;
    metadata?: Record<string, unknown>;
  },
): Command {
  return {
    id,
    type,
    source,
    timestamp,
    correlationId: options?.correlationId,
    metadata: options?.metadata,
  };
}
