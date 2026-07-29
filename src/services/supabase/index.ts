import { getSupabase } from "@/lib/supabase";
import type { Database } from "@/types/database/supabase";
import type { ApiResponse } from "@/types/api";
import { isSupabaseConfigured } from "@/config/environment";

export const supabaseService = {
  getClient() {
    return getSupabase();
  },

  get client() {
    return getSupabase();
  },

  isAvailable(): boolean {
    return isSupabaseConfigured();
  },

  from<T extends keyof Database["public"]["Tables"]>(table: T) {
    const supabase = getSupabase();
    if (!supabase) throw new Error("Supabase is not configured");
    return supabase.from(table);
  },

  async getUser() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  },

  async getSession() {
    const supabase = getSupabase();
    if (!supabase) return null;
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error || !session) return null;
    return session;
  },

  async signIn(email: string, password: string) {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string, metadata?: Record<string, unknown>) {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
    return supabase.auth.signUp({
      email,
      password,
      options: metadata ? { data: metadata } : undefined,
    });
  },

  async signOut() {
    const supabase = getSupabase();
    if (!supabase) return;
    return supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
    return supabase.auth.resetPasswordForEmail(email);
  },

  async uploadFile(bucket: string, path: string, file: File) {
    const supabase = getSupabase();
    if (!supabase) return { data: null, error: new Error("Supabase is not configured") };
    return supabase.storage.from(bucket).upload(path, file);
  },

  getPublicUrl(bucket: string, path: string) {
    const supabase = getSupabase();
    if (!supabase) return "";
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void): () => void {
    const supabase = getSupabase();
    if (!supabase) return () => {};
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
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
