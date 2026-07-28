"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import type { User } from "@/types/user";

interface SupabaseContextValue {
  supabase: ReturnType<typeof getSupabase>;
  user: User | null;
  isLoading: boolean;
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);
  const supabase = getSupabase();

  useEffect(() => {
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
