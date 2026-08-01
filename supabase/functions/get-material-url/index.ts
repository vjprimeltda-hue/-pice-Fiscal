// Authenticated endpoint (verify_jwt = true) — the student's download button
// calls this instead of hitting Storage directly, so subscription gating is
// enforced in one place server-side (RLS on `materials` only checks
// `published`, not billing status).
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

  const { materialId } = await req.json().catch(() => ({ materialId: null }));
  if (!materialId) {
    return jsonResponse({ error: "materialId é obrigatório" }, 400);
  }

  const supabase = createServiceClient();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    const { data: hasActive } = await supabase.rpc("has_active_subscription", { check_user_id: user.id });
    if (!hasActive) {
      return jsonResponse({ error: "Assinatura ativa necessária para baixar materiais." }, 403);
    }
  }

  const { data: material, error: materialError } = await supabase
    .from("materials")
    .select("file_path, published")
    .eq("id", materialId)
    .single();
  if (materialError || !material || !material.published) {
    return jsonResponse({ error: "Material não encontrado." }, 404);
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("materials")
    .createSignedUrl(material.file_path, 120);
  if (signError || !signed) {
    return jsonResponse({ error: "Não foi possível gerar o link de download." }, 500);
  }

  return jsonResponse({ url: signed.signedUrl });
});
