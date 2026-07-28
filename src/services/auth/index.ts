import { getSupabase } from "@/lib/supabase";
import type { AuthResponse, LoginRequest, SignupRequest } from "@/types/auth";
import type { ApiResponse } from "@/types/api";

export const authService = {
  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword(data);
    if (error) {
      return { data: null, error: { code: error.status?.toString() ?? "AUTH_ERROR", message: error.message }, status: 401 };
    }
    return this.getSession();
  },

  async signup(data: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { username: data.username } },
    });
    if (error) {
      return { data: null, error: { code: error.status?.toString() ?? "AUTH_ERROR", message: error.message }, status: 400 };
    }
    return this.getSession();
  },

  async logout(): Promise<ApiResponse<null>> {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { data: null, error: { code: "AUTH_ERROR", message: error.message }, status: 500 };
    }
    return { data: null, error: null, status: 200 };
  },

  async getSession(): Promise<ApiResponse<AuthResponse>> {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return { data: null, error: { code: "AUTH_ERROR", message: error?.message ?? "No session" }, status: 401 };
    }
    return {
      data: {
        user: data.session.user as unknown as AuthResponse["user"],
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at ?? 0,
        },
      },
      error: null,
      status: 200,
    };
  },
};
