import { getSupabase } from "@/lib/supabase";
import type { Database } from "@/types/database/supabase";
import type { ApiResponse } from "@/types/api";

export const supabaseService = {
  getClient() {
    return getSupabase();
  },

  get client() {
    return getSupabase();
  },

  from<T extends keyof Database["public"]["Tables"]>(table: T) {
    return getSupabase().from(table);
  },

  async getUser() {
    const {
      data: { user },
      error,
    } = await getSupabase().auth.getUser();
    if (error || !user) return null;
    return user;
  },

  async getSession() {
    const {
      data: { session },
      error,
    } = await getSupabase().auth.getSession();
    if (error || !session) return null;
    return session;
  },

  async signIn(email: string, password: string) {
    return getSupabase().auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    return getSupabase().auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });
  },

  async signOut() {
    return getSupabase().auth.signOut();
  },

  async resetPassword(email: string) {
    return getSupabase().auth.resetPasswordForEmail(email);
  },

  async uploadFile(bucket: string, path: string, file: File) {
    return getSupabase().storage.from(bucket).upload(path, file);
  },

  getPublicUrl(bucket: string, path: string) {
    const { data } = getSupabase().storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void): () => void {
    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return () => {
      subscription.unsubscribe();
    };
  },

  async handleResponse<T>(
    promise: Promise<{ data: T | null; error: unknown }>,
  ): Promise<ApiResponse<T>> {
    const { data, error } = await promise;

    if (error) {
      return {
        data: null,
        error: { code: "DATABASE_ERROR", message: (error as Error).message },
        status: 500,
      };
    }

    return {
      data: data as T,
      error: null,
      status: 200,
    };
  },
};
