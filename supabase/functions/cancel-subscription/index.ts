// Authenticated endpoint (verify_jwt = true) — called from the student's
// "Cancelar assinatura" button in /configuracoes.
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, getRequestUser } from "../_shared/supabase.ts";
import { updatePreapproval } from "../_shared/mercadopago.ts";

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

  const { data: subscription, error: findError } = await supabase
    .from("subscriptions")
    .select("id, mercado_pago_subscription_id, status")
    .eq("user_id", user.id)
    .in("status", ["active", "authorized", "pending"])
    .maybeSingle();

  if (findError || !subscription) {
    return jsonResponse({ error: "Nenhuma assinatura ativa encontrada." }, 404);
  }

  try {
    if (subscription.mercado_pago_subscription_id) {
      await updatePreapproval(subscription.mercado_pago_subscription_id, "cancelled");
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancel_at_period_end: false })
      .eq("id", subscription.id);
    if (updateError) throw updateError;

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("cancel-subscription: erro", err);
    return jsonResponse({ error: "Não foi possível cancelar a assinatura. Tente novamente." }, 500);
  }
});
