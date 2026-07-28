import { getSupabase } from "@/lib/supabase";
import type { ApiResponse } from "@/types/api";

export const supabaseService = {
  get client() {
    return getSupabase();
  },

  async handleResponse<T>(promise: Promise<{ data: T | null; error: unknown }>): Promise<ApiResponse<T>> {
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
