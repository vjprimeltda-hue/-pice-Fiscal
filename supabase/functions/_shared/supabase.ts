import { createClient } from "npm:@supabase/supabase-js@2";

/** Service-role client — bypasses RLS. Only for use after the caller's identity/authorization has been established. */
export function createServiceClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Looks up an existing auth.users row by email via the GoTrue admin REST API
 * (supabase-js's `admin.listUsers()` doesn't expose an email filter). Used
 * by kirvano-webhook to reuse an account when inviteUserByEmail reports the
 * address is already registered.
 */
export async function findUserByEmail(email: string) {
  const res = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
    {
      headers: {
        apikey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
    }
  );
  if (!res.ok) return null;
  const body = await res.json().catch(() => null);
  const users = body?.users ?? [];
  return users.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
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
