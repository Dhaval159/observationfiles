export type Result<T, E = DomainError> = Success<T> | Failure<E>;

export interface Success<T> {
  readonly success: true;
  readonly data: T;
  map<U>(fn: (data: T) => U): Result<U>;
  flatMap<U>(fn: (data: T) => Result<U>): Result<U>;
  fold<R>(onSuccess: (data: T) => R, _onFailure: (error: DomainError) => R): R;
  getOrElse(_default: T): T;
  getOrThrow(): T;
  toJSON(): Record<string, unknown>;
}

export interface Failure<E = DomainError> {
  readonly success: false;
  readonly error: E;
  map<U>(_fn: (data: never) => U): Result<U>;
  flatMap<U>(_fn: (data: never) => Result<U>): Result<U>;
  fold<R>(_onSuccess: (data: never) => R, onFailure: (error: E) => R): R;
  getOrElse<U>(defaultValue: U): U;
  getOrThrow(): never;
  toJSON(): Record<string, unknown>;
}

import type { DomainError } from "../errors/domain-error";

export function success<T>(data: T): Success<T> {
  return {
    success: true,
    data,
    map<U>(fn: (d: T) => U): Result<U> {
      return success(fn(this.data));
    },
    flatMap<U>(fn: (d: T) => Result<U>): Result<U> {
      return fn(this.data);
    },
    fold<R>(onSuccess: (d: T) => R, _onFailure: (error: DomainError) => R): R {
      return onSuccess(this.data);
    },
    getOrElse(_default: T): T {
      return this.data;
    },
    getOrThrow(): T {
      return this.data;
    },
    toJSON(): Record<string, unknown> {
      return { success: true, data: this.data };
    },
  };
}

export function failure<E = DomainError>(error: E): Failure<E> {
  return {
    success: false,
    error,
    map<U>(_fn: (data: never) => U): Result<U> {
      return failure(this.error) as unknown as Result<U>;
    },
    flatMap<U>(_fn: (data: never) => Result<U>): Result<U> {
      return failure(this.error) as unknown as Result<U>;
    },
    fold<R>(_onSuccess: (data: never) => R, onFailure: (error: E) => R): R {
      return onFailure(this.error);
    },
    getOrElse<U>(defaultValue: U): U {
      return defaultValue;
    },
    getOrThrow(): never {
      throw this.error instanceof Error ? this.error : new Error(String(this.error));
    },
    toJSON(): Record<string, unknown> {
      return {
        success: false,
        error: this.error instanceof Error ? this.error.message : String(this.error),
      };
    },
  };
}

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}

export function combineResults<T extends [Result<unknown>, ...Result<unknown>[]]>(
  results: T,
): Result<{ [K in keyof T]: T[K] extends Result<infer U> ? U : never }> {
  const data: unknown[] = [];
  for (const result of results) {
    if (!result.success) {
      return result as Result<never>;
    }
    data.push(result.data);
  }
  return success(data as { [K in keyof T]: T[K] extends Result<infer U> ? U : never });
}

export function fromPromise<T>(promise: Promise<T>): Promise<Result<T>> {
  return promise.then(success).catch((err: unknown) => {
    const error =
      err instanceof Error ? err : new Error(typeof err === "string" ? err : "Unknown error");
    return failure(error as DomainError);
  });
}

export function tryCatch<T>(fn: () => T): Result<T> {
  try {
    return success(fn());
  } catch (err) {
    const error =
      err instanceof Error ? err : new Error(typeof err === "string" ? err : "Unknown error");
    return failure(error as DomainError);
  }
}

export type AsyncResult<T, E = DomainError> = Promise<Result<T, E>>;
