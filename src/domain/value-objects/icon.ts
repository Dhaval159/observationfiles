export interface Icon {
  readonly name: string;
  readonly category: IconCategory;
  readonly variant: IconVariant;
  readonly size: IconSize;
  equals(other: Icon): boolean;
}

export type IconCategory = "ui" | "game" | "evidence" | "observation" | "achievement" | "status" | "custom";

export type IconVariant = "solid" | "outline" | "duotone" | "colored";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export function createIcon(
  name: string,
  options?: {
    category?: IconCategory;
    variant?: IconVariant;
    size?: IconSize;
  },
): Icon {
  return {
    name,
    category: options?.category ?? "ui",
    variant: options?.variant ?? "solid",
    size: options?.size ?? "md",
    equals(other: Icon): boolean {
      return this.name === other.name && this.category === other.category && this.variant === other.variant;
    },
  };
}
