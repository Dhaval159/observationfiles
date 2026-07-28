import { getSupabase } from "@/lib/supabase";
import { storageConfig } from "@/config/storage";
import type { ApiResponse } from "@/types/api";

export const storageService = {
  async upload(path: string, file: File): Promise<ApiResponse<string>> {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(storageConfig.supabaseBucket)
      .upload(path, file);

    if (error) {
      return { data: null, error: { code: "STORAGE_ERROR", message: error.message }, status: 500 };
    }

    return { data: data.path, error: null, status: 200 };
  },

  async getPublicUrl(path: string): Promise<string> {
    const supabase = getSupabase();
    const { data } = supabase.storage
      .from(storageConfig.supabaseBucket)
      .getPublicUrl(path);
    return data.publicUrl;
  },

  async delete(path: string): Promise<ApiResponse<null>> {
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(storageConfig.supabaseBucket)
      .remove([path]);

    if (error) {
      return { data: null, error: { code: "STORAGE_ERROR", message: error.message }, status: 500 };
    }

    return { data: null, error: null, status: 200 };
  },
};
