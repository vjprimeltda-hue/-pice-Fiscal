import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseUrl } from "@/lib/supabase/env";

/**
 * Service-role client — bypasses RLS entirely. Only import this from trusted
 * server code (Route Handlers, Server Functions) that itself re-implements
 * the necessary authorization checks, e.g. verifying `public.is_admin()` or
 * a webhook signature before touching data. Never import from Client
 * Components or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não definida — necessária para operações administrativas no servidor.");
  }

  return createSupabaseClient<Database>(supabaseUrl(), serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
