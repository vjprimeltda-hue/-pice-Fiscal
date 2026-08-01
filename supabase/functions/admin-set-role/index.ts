// Authenticated endpoint (verify_jwt = true).
//
// Two ways to use it:
// 1. Bootstrap: if the platform has zero admins yet, any authenticated user
//    can call this with no body to promote *themselves* — solves the
//    chicken-and-egg problem of needing an admin to create the first admin,
//    without touching the SQL editor.
// 2. Ongoing management: an existing admin can pass { userId, role } to
//    change anyone else's role (mirrors what src/services/admin.ts already
//    does client-side via RLS — this is here mainly for the bootstrap case
//    and for scripted/CI use where a service account calls the function
//    directly instead of going through the browser).
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, getRequestUser } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const user = await getRequestUser(req);
  if (!user) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const supabase = createServiceClient();
  const { userId, role } = await req.json().catch(() => ({ userId: null, role: null }));

  const { count: adminCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (!adminCount) {
    // Bootstrap: no admins exist yet — promote the caller, ignore any userId/role in the body.
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id)
      .select("id, name, role")
      .single();
    if (error) return jsonResponse({ error: error.message }, 500);
    return jsonResponse({ ok: true, profile: data, bootstrap: true });
  }

  // Not a bootstrap call — caller must already be an admin.
  const { data: callerProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (callerProfile?.role !== "admin") {
    return jsonResponse({ error: "Apenas administradores podem alterar papéis." }, 403);
  }
  if (!userId || (role !== "admin" && role !== "aluno")) {
    return jsonResponse({ error: "userId e role ('admin' | 'aluno') são obrigatórios." }, 400);
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id, name, role")
    .single();
  if (error) return jsonResponse({ error: error.message }, 500);

  await supabase.from("admin_logs").insert({
    admin_id: user.id,
    action: "set_user_role",
    target_table: "profiles",
    target_id: userId,
    details: { role },
  });

  return jsonResponse({ ok: true, profile: data, bootstrap: false });
});
