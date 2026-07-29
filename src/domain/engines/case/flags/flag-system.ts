import type { FlagValue, FlagChangeEvent, CaseContext } from "../types";
import { now } from "@/domain/value-objects/timestamp";

export class FlagSystem {
  private _changeHistory: FlagChangeEvent[] = [];
  private _context: CaseContext | null = null;

  initialize(context: CaseContext): void {
    this._context = context;
    this._changeHistory = [];
  }

  set(flag: string, value: FlagValue, source: string = "system"): void {
    const oldValue = this._getCurrentValue(flag);
    const newValue = value;

    if (this._context) {
      this._context.flags.set(flag, newValue);
    }

    const event: FlagChangeEvent = {
      flag,
      oldValue,
      newValue,
      timestamp: now(),
      source,
    };

    this._changeHistory.push(event);
  }

  get(flag: string): FlagValue {
    return this._getCurrentValue(flag);
  }

  has(flag: string): boolean {
    return this._context?.flags.has(flag) ?? false;
  }

  toggle(flag: string, source: string = "system"): boolean {
    const currentValue = this._getCurrentValue(flag);
    if (typeof currentValue === "boolean") {
      this.set(flag, !currentValue, source);
      return !currentValue;
    }

    const newValue = !currentValue;
    this.set(flag, newValue, source);
    return newValue;
  }

  remove(flag: string): void {
    this._context?.flags.delete(flag);
  }

  clear(): void {
    this._context?.flags.clear();
  }

  getAll(): Record<string, FlagValue> {
    if (!this._context) return {};
    return Object.fromEntries(this._context.flags) as Record<string, FlagValue>;
  }

  getHistory(flag?: string): FlagChangeEvent[] {
    if (flag) {
      return this._changeHistory.filter((e) => e.flag === flag);
    }
    return [...this._changeHistory];
  }

  getChangeCount(flag: string): number {
    return this._changeHistory.filter((e) => e.flag === flag).length;
  }

  isTrue(flag: string): boolean {
    return this._getCurrentValue(flag) === true;
  }

  isFalse(flag: string): boolean {
    return this._getCurrentValue(flag) === false;
  }

  count(): number {
    return this._context?.flags.size ?? 0;
  }

  private _getCurrentValue(flag: string): FlagValue {
    return (this._context?.flags.get(flag) as FlagValue | undefined) ?? null;
  }
}
