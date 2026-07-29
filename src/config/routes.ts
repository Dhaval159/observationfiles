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
    investigate: (caseId: string) => `/cases/${caseId}/investigate` as const,
    evidence: (caseId: string) => `/cases/${caseId}/evidence` as const,
    timeline: (caseId: string) => `/cases/${caseId}/timeline` as const,
    theoryBoard: (caseId: string) => `/cases/${caseId}/theory-board` as const,
    interrogate: (caseId: string, npcId: string) =>
      `/cases/${caseId}/interrogate/${npcId}` as const,
    observations: (caseId: string) => `/cases/${caseId}/observations` as const,
  },
  achievements: "/achievements",
  results: "/results",
} as const;

export type Route = (typeof routes)[keyof typeof routes];
