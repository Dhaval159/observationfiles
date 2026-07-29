import { supabaseService } from "../supabase";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user";
import type { AuthStatus } from "@/types/auth";
import { isSupabaseConfigured } from "@/config/environment";

function mapSupabaseUserToUser(supabaseUser: Record<string, unknown>): User {
  const raw = supabaseUser as {
    id: string;
    email: string;
    user_metadata?: {
      username?: string;
      display_name?: string;
      avatar_url?: string;
    };
    created_at: string;
    updated_at: string;
  };

  return {
    id: raw.id,
    email: raw.email,
    username: raw.user_metadata?.username ?? "unknown",
    displayName: raw.user_metadata?.display_name ?? raw.email,
    avatarUrl: raw.user_metadata?.avatar_url ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export class AuthService {
  private initialized = false;

  private requireClient() {
    const client = supabaseService.client;
    if (!client) {
      throw new Error("Supabase is not configured");
    }
    return client;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    if (!isSupabaseConfigured()) {
      useAuthStore.getState().setStatus("unauthenticated");
      useAuthStore.getState().setUser(null);
      this.initialized = true;
      return;
    }

    const client = this.requireClient();
    try {
      const { data, error } = await client.auth.getSession();
      if (error || !data.session) {
        useAuthStore.getState().setStatus("unauthenticated");
        useAuthStore.getState().setUser(null);
        this.initialized = true;
        return;
      }

      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        useAuthStore.getState().setStatus("unauthenticated");
        useAuthStore.getState().setUser(null);
        this.initialized = true;
        return;
      }

      const user = mapSupabaseUserToUser(userData.user as unknown as Record<string, unknown>);
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setStatus("authenticated");
    } catch {
      useAuthStore.getState().setStatus("unauthenticated");
      useAuthStore.getState().setUser(null);
    }

    this.initialized = true;
  }

  async login(email: string, password: string): Promise<User> {
    const client = this.requireClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Login failed");
    }

    const user = mapSupabaseUserToUser(data.user as unknown as Record<string, unknown>);
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setStatus("authenticated");
    return user;
  }

  async signup(email: string, password: string, username: string): Promise<User> {
    const client = this.requireClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Signup failed");
    }

    const user = mapSupabaseUserToUser(data.user as unknown as Record<string, unknown>);
    user.username = username;
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setStatus("authenticated");
    return user;
  }

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabaseService.client) {
      await supabaseService.client.auth.signOut();
    }
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setStatus("unauthenticated");
  }

  async resetPassword(email: string): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message ?? "Password reset failed");
    }
  }

  getCurrentUser(): User | null {
    return useAuthStore.getState().user;
  }

  isAuthenticated(): boolean {
    return useAuthStore.getState().status === "authenticated";
  }

  onAuthChange(callback: (status: AuthStatus, user: User | null) => void): () => void {
    if (!isSupabaseConfigured()) return () => {};

    const client = this.requireClient();

    const handler = async (event: string) => {
      if (event === "SIGNED_IN") {
        const { data } = await client.auth.getUser();
        if (data.user) {
          const user = mapSupabaseUserToUser(data.user as unknown as Record<string, unknown>);
          useAuthStore.getState().setUser(user);
          useAuthStore.getState().setStatus("authenticated");
          callback("authenticated", user);
        }
      } else if (event === "SIGNED_OUT") {
        useAuthStore.getState().setUser(null);
        useAuthStore.getState().setStatus("unauthenticated");
        callback("unauthenticated", null);
      } else if (event === "TOKEN_REFRESHED") {
        const { data } = await client.auth.getUser();
        if (data.user) {
          const user = mapSupabaseUserToUser(data.user as unknown as Record<string, unknown>);
          useAuthStore.getState().setUser(user);
          callback("authenticated", user);
        }
      }
    };

    return supabaseService.onAuthStateChange(handler);
  }
}

export const authService = new AuthService();
