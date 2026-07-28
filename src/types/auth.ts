import type { User } from "./user";

export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

export interface AuthState {
  user: User | null;
  status: AuthStatus;
  session: Session | null;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
}

export type AuthError = {
  code: string;
  message: string;
};
