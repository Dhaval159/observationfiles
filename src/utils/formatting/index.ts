export function capitalize(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + suffix;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function formatScore(score: number): string {
  return `${score.toLocaleString("en-US")} pts`;
}

export function formatNumber(n: number, decimals?: number): string {
  if (decimals !== undefined) {
    return n.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return n.toLocaleString("en-US");
}

export function formatPercentage(value: number, decimals?: number): string {
  const d = decimals ?? 1;
  return `${(value * 100).toFixed(d)}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  const formatted = i === 0 ? size.toString() : size.toFixed(1).replace(/\.0$/, "");
  return `${formatted} ${units[i]}`;
}

export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => (word.length > 0 ? capitalize(word) : word))
    .join(" ");
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

export function snakeToTitle(str: string): string {
  return str
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, (entity) => {
    const map: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&nbsp;": " ",
    };
    return map[entity] ?? entity;
  });
}

export function highlightMatches(text: string, query: string): { text: string; match: boolean }[] {
  if (!query) return [{ text, match: false }];

  const result: { text: string; match: boolean }[] = [];
  const lower = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let lastIndex = 0;

  for (let i = 0; i <= lower.length - lowerQuery.length; i++) {
    if (lower.slice(i, i + lowerQuery.length) === lowerQuery) {
      if (i > lastIndex) {
        result.push({ text: text.slice(lastIndex, i), match: false });
      }
      result.push({
        text: text.slice(i, i + lowerQuery.length),
        match: true,
      });
      lastIndex = i + lowerQuery.length;
      i += lowerQuery.length - 1;
    }
  }

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), match: false });
  }

  return result;
}

export function ordinal(n: number): string {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

export function padNumber(n: number, width: number): string {
  return n.toString().padStart(width, "0");
}
