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
    },
    evidence: {
      list: (caseId: string) => `/api/cases/${caseId}/evidence` as const,
    },
  },
} as const;
