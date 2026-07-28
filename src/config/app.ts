export const appConfig = {
  name: "The Observation Files",
  tagline: "Every detail matters.",
  description: "A detective game web application",
  version: "0.1.0",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
