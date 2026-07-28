export const featureFlags = {
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  achievements: process.env.NEXT_PUBLIC_ENABLE_ACHIEVEMENTS !== "false",
  multiplayer: false,
} as const;
