import { createClient } from "npm:@supabase/supabase-js@2";

/** Service-role client — bypasses RLS. Only for use after the caller's identity/authorization has been established. */
export function createServiceClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Resolves the authenticated user from the request's Authorization header (the caller's own JWT, RLS still applies). */
export async function getRequestUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;

  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
  } = await client.auth.getUser();
  return user;
}
