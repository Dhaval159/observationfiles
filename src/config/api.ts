export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  timeout: 10000,
  retryCount: 3,
  retryDelay: 1000,
  endpoints: {
    auth: {
      login: "/api/auth/login",
      signup: "/api/auth/signup",
      logout: "/api/auth/logout",
      session: "/api/auth/session",
    },
    cases: {
      list: "/api/cases",
      detail: (id: string) => `/api/cases/${id}` as const,
      start: (id: string) => `/api/cases/${id}/start` as const,
      complete: (id: string) => `/api/cases/${id}/complete` as const,
    },
    evidence: {
      list: (caseId: string) => `/api/cases/${caseId}/evidence` as const,
      collect: (caseId: string, evidenceId: string) =>
        `/api/cases/${caseId}/evidence/${evidenceId}/collect` as const,
      analyze: (caseId: string, evidenceId: string) =>
        `/api/cases/${caseId}/evidence/${evidenceId}/analyze` as const,
    },
    observations: {
      list: (caseId: string) => `/api/cases/${caseId}/observations` as const,
      discover: (caseId: string, observationId: string) =>
        `/api/cases/${caseId}/observations/${observationId}/discover` as const,
    },
    timeline: {
      list: (caseId: string) => `/api/cases/${caseId}/timeline` as const,
      update: (caseId: string) => `/api/cases/${caseId}/timeline/update` as const,
      validate: (caseId: string) => `/api/cases/${caseId}/timeline/validate` as const,
    },
    theoryBoard: {
      get: (caseId: string) => `/api/cases/${caseId}/theory-board` as const,
      save: (caseId: string) => `/api/cases/${caseId}/theory-board/save` as const,
    },
    interrogation: {
      list: (caseId: string) => `/api/cases/${caseId}/interrogations` as const,
      start: (caseId: string, interrogationId: string) =>
        `/api/cases/${caseId}/interrogations/${interrogationId}/start` as const,
      respond: (caseId: string, interrogationId: string) =>
        `/api/cases/${caseId}/interrogations/${interrogationId}/respond` as const,
    },
    contradictions: {
      list: (caseId: string) => `/api/cases/${caseId}/contradictions` as const,
      check: (caseId: string) => `/api/cases/${caseId}/contradictions/check` as const,
    },
    hints: {
      request: (caseId: string) => `/api/cases/${caseId}/hints/request` as const,
      list: (caseId: string) => `/api/cases/${caseId}/hints` as const,
    },
    scoring: {
      get: (caseId: string) => `/api/cases/${caseId}/score` as const,
      finalize: (caseId: string) => `/api/cases/${caseId}/score/finalize` as const,
    },
    achievements: {
      list: "/api/achievements",
      stats: "/api/achievements/stats",
      progress: "/api/achievements/progress",
    },
    saves: {
      list: "/api/saves",
      create: "/api/saves",
      load: (saveId: string) => `/api/saves/${saveId}/load` as const,
      delete: (saveId: string) => `/api/saves/${saveId}` as const,
    },
    analytics: {
      track: "/api/analytics/track",
      flush: "/api/analytics/flush",
    },
    profile: {
      get: "/api/profile",
      update: "/api/profile",
      stats: "/api/profile/stats",
    },
  },
} as const;
