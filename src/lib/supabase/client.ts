"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";
import { getRememberMe } from "@/lib/supabase/remember";

/**
 * Storage adapter that reads/writes from localStorage or sessionStorage
 * depending on the "lembrar-me" flag captured at login time. Falling back
 * to localStorage keeps an already-open tab working even if the flag is
 * cleared mid-session.
 */
const rememberAwareStorage = {
  getItem(key: string) {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(key) ?? window.localStorage.getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === "undefined") return;
    if (getRememberMe()) {
      window.localStorage.setItem(key, value);
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
      window.localStorage.removeItem(key);
    }
  },
  removeItem(key: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Singleton Supabase client for use in Client Components. */
export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient<Database>(supabaseUrl(), supabaseAnonKey(), {
      auth: {
        storage: rememberAwareStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return browserClient;
}
