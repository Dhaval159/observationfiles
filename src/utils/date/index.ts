export function formatTimestamp(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString();
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function parseGameTime(timeStr: string): Date {
  const iso = Date.parse(timeStr);
  if (!Number.isNaN(iso)) return new Date(iso);

  const patterns: [RegExp, (match: RegExpMatchArray) => Date][] = [
    [
      /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})$/,
      (m) => new Date(+m[1]!, +m[2]! - 1, +m[3]!, +m[4]!, +m[5]!),
    ],
    [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/,
      (m) => new Date(+m[3]!, +m[1]! - 1, +m[2]!, +m[4]!, +m[5]!),
    ],
    [
      /^(\w+)\s+(\d{1,2}),?\s+(\d{4})\s*[-–]\s*(\d{1,2}):(\d{2})$/,
      (m) => new Date(`${m[1]!} ${m[2]!}, ${m[3]!} ${m[4]!}:${m[5]!}`),
    ],
  ];

  for (const [pattern, build] of patterns) {
    const match = timeStr.match(pattern);
    if (match) {
      const parsed = build(match);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  return new Date(timeStr);
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatGameTime(date: Date): string {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${month} ${day}, ${year} - ${hours}:${minutes}`;
}

export function formatGameDate(date: Date): string {
  const month = MONTHS[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function formatGameTimeShort(date: Date): string {
  const month = MONTHS_SHORT[date.getMonth()];
  const day = date.getDate();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${month} ${day}, ${hours}:${minutes}`;
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (parts.length === 0 || s > 0) parts.push(`${s}s`);

  return parts.join(" ");
}

export function formatDurationShort(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  return `${h}:${pad(m)}:${pad(s)}`;
}

export function timeAgo(date: Date, now: Date = new Date()): string {
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function isBetween(date: Date, start: Date, end: Date): boolean {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function differenceInMinutes(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (60 * 1000));
}

export function differenceInHours(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (60 * 60 * 1000));
}

export function differenceInDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function compareDates(a: Date, b: Date): number {
  const aTime = a.getTime();
  const bTime = b.getTime();
  if (aTime < bTime) return -1;
  if (aTime > bTime) return 1;
  return 0;
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
}

export function fromISODate(str: string): Date {
  const d = new Date(`${str}T00:00:00`);
  return d;
}
