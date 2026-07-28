import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database/supabase";
import { env } from "@/config/environment";

function createSupabaseClient() {
  return createBrowserClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
}

let client: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabase(): ReturnType<typeof createSupabaseClient> {
  if (!client) {
    client = createSupabaseClient();
  }
  return client;
}
