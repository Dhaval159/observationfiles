export const themeConfig = {
  defaultTheme: "dark",
  storageKey: "theme",
  themes: ["dark", "light", "system"] as const,
  colors: {
    primary: {
      light: "slate",
      dark: "slate",
    },
    accent: {
      light: "amber",
      dark: "amber",
    },
  },
} as const;

export type Theme = (typeof themeConfig.themes)[number];
