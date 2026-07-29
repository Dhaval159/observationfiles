import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database/supabase";
import { env, isSupabaseConfigured } from "@/config/environment";

function createSupabaseClient() {
  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}

let client: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabase(): ReturnType<typeof createSupabaseClient> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}

export function getSupabaseOrThrow(): ReturnType<typeof createSupabaseClient> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment.",
    );
  }
  return supabase;
}
