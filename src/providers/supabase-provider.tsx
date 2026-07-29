"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { isSupabaseConfigured } from "@/config/environment";
import type { User } from "@/types/user";

interface SupabaseContextValue {
  supabase: ReturnType<typeof getSupabase>;
  user: User | null;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  const [isLoading, setIsLoading] = useState(() => {
    if (!isSupabaseConfigured() || !supabase) return false;
    return true;
  });
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setStatus("unauthenticated");
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user as unknown as User);
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
      setIsLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase, setUser, setStatus]);

  return (
    <SupabaseContext.Provider value={{ supabase, user, isLoading }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase(): SupabaseContextValue {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
