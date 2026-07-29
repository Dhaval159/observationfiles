import type { VariableValue, VariableChangeEvent, CaseContext } from "../types";
import { now } from "@/domain/value-objects/timestamp";

export class VariableSystem {
  private _changeHistory: VariableChangeEvent[] = [];
  private _context: CaseContext | null = null;

  initialize(context: CaseContext): void {
    this._context = context;
    this._changeHistory = [];
  }

  set(key: string, value: VariableValue, source: string = "system"): void {
    const oldValue = this._getCurrentValue(key);
    const newValue = value;

    if (this._context) {
      this._context.variables.set(key, newValue);
    }

    const event: VariableChangeEvent = {
      variable: key,
      oldValue,
      newValue,
      timestamp: now(),
      source,
    };

    this._changeHistory.push(event);
  }

  get<T extends VariableValue = VariableValue>(key: string): T | undefined {
    return this._getCurrentValue(key) as T | undefined;
  }

  has(key: string): boolean {
    return this._context?.variables.has(key) ?? false;
  }

  remove(key: string): void {
    this._context?.variables.delete(key);
  }

  clear(): void {
    this._context?.variables.clear();
  }

  getAll(): Record<string, VariableValue> {
    if (!this._context) return {};
    return Object.fromEntries(this._context.variables) as Record<string, VariableValue>;
  }

  getBoolean(key: string): boolean {
    const value = this._getCurrentValue(key);
    return Boolean(value);
  }

  getNumber(key: string): number {
    const value = this._getCurrentValue(key);
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  getString(key: string): string {
    const value = this._getCurrentValue(key);
    return String(value ?? "");
  }

  getArray(key: string): unknown[] {
    const value = this._getCurrentValue(key);
    return Array.isArray(value) ? value : [];
  }

  increment(key: string, amount: number = 1): number {
    const current = this.getNumber(key);
    const newValue = current + amount;
    this.set(key, newValue);
    return newValue;
  }

  decrement(key: string, amount: number = 1): number {
    return this.increment(key, -amount);
  }

  push<T = unknown>(key: string, item: T): void {
    const current = this.getArray(key);
    current.push(item);
    this.set(key, current);
  }

  toggle(key: string): boolean {
    const current = this.getBoolean(key);
    this.set(key, !current);
    return !current;
  }

  count(): number {
    return this._context?.variables.size ?? 0;
  }

  getHistory(key: string): VariableChangeEvent[] {
    return this._changeHistory.filter((e) => e.variable === key);
  }

  private _getCurrentValue(key: string): VariableValue {
    return (this._context?.variables.get(key) as VariableValue | undefined) ?? null;
  }
}
