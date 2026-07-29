export interface DomainColor {
  readonly hex: string;
  readonly rgb: { r: number; g: number; b: number };
  readonly hsl: { h: number; s: number; l: number };
  readonly isLight: boolean;
  readonly isDark: boolean;
  toCSS(alpha?: number): string;
  lighten(amount: number): DomainColor;
  darken(amount: number): DomainColor;
  equals(other: DomainColor): boolean;
}

export function createColor(hex: string): DomainColor {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return {
    hex: `#${clean}`,
    rgb: { r, g, b },
    get hsl(): { h: number; s: number; l: number } {
      const rn = r / 255;
      const gn = g / 255;
      const bn = b / 255;
      const max = Math.max(rn, gn, bn);
      const min = Math.min(rn, gn, bn);
      const l = (max + min) / 2;
      let h = 0;
      let s = 0;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
        else if (max === gn) h = ((bn - rn) / d + 2) * 60;
        else h = ((rn - gn) / d + 4) * 60;
      }
      return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    },
    get isLight(): boolean {
      return luminance > 0.5;
    },
    get isDark(): boolean {
      return luminance <= 0.5;
    },
    toCSS(alpha?: number): string {
      return alpha !== undefined
        ? `rgba(${r}, ${g}, ${b}, ${alpha})`
        : `#${clean}`;
    },
    lighten(amount: number): DomainColor {
      const factor = 1 + amount;
      return createColor(
        `#${Math.min(255, Math.round(r * factor)).toString(16).padStart(2, "0")}${Math.min(255, Math.round(g * factor)).toString(16).padStart(2, "0")}${Math.min(255, Math.round(b * factor)).toString(16).padStart(2, "0")}`,
      );
    },
    darken(amount: number): DomainColor {
      const factor = 1 - amount;
      return createColor(
        `#${Math.max(0, Math.round(r * factor)).toString(16).padStart(2, "0")}${Math.max(0, Math.round(g * factor)).toString(16).padStart(2, "0")}${Math.max(0, Math.round(b * factor)).toString(16).padStart(2, "0")}`,
      );
    },
    equals(other: DomainColor): boolean {
      return this.hex === other.hex;
    },
  };
}
