import { createDomainTimestamp, type DomainTimestamp, now } from "../value-objects/timestamp";

export function parseDate(input: string | Date | number): DomainTimestamp {
  return createDomainTimestamp(input);
}

export function formatDate(timestamp: DomainTimestamp, format: "short" | "medium" | "long" | "full" = "medium"): string {
  const d = timestamp.value;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  switch (format) {
    case "short":
      return `${month}/${day}/${year}`;
    case "medium":
      return `${month}/${day}/${year} ${hours}:${minutes}`;
    case "long":
      return `${timestamp.value.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} ${hours}:${minutes}`;
    case "full":
      return `${timestamp.value.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} ${hours}:${minutes}:${seconds}`;
  }
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${Math.round(seconds % 60)}s`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatRelativeTime(timestamp: DomainTimestamp): string {
  const diff = now().differenceInSeconds(timestamp);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return formatDate(timestamp, "short");
}

export function isBefore(a: DomainTimestamp, b: DomainTimestamp): boolean {
  return a.isBefore(b);
}

export function isAfter(a: DomainTimestamp, b: DomainTimestamp): boolean {
  return a.isAfter(b);
}

export function sortByDate<T>(items: T[], accessor: (item: T) => DomainTimestamp, ascending: boolean = true): T[] {
  return [...items].sort((a, b) => {
    const diff = accessor(a).unix - accessor(b).unix;
    return ascending ? diff : -diff;
  });
}

export function daysBetween(a: DomainTimestamp, b: DomainTimestamp): number {
  return Math.abs(a.differenceInSeconds(b) / 86400);
}

export function isToday(timestamp: DomainTimestamp): boolean {
  const today = new Date();
  const date = timestamp.value;
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}
