export const routes = {
  home: "/",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  profile: "/profile",
  settings: "/settings",
  cases: {
    index: "/cases",
    detail: (caseId: string) => `/cases/${caseId}` as const,
  },
  results: "/results",
} as const;

export type Route = (typeof routes)[keyof typeof routes];
