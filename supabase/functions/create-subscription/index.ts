// Authenticated endpoint (verify_jwt = true) — called from the student
// dashboard's "Assinar" button. Creates a Mercado Pago subscription
// (preapproval), records it as `pending` in our DB, and returns the
// checkout URL for the frontend to redirect the user to.
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, getRequestUser } from "../_shared/supabase.ts";
import { createPreapproval } from "../_shared/mercadopago.ts";

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

  const { planId } = await req.json().catch(() => ({ planId: null }));
  if (!planId) {
    return jsonResponse({ error: "planId é obrigatório" }, 400);
  }

  const supabase = createServiceClient();

  const { data: plan, error: planError } = await supabase
    .from("plans")
    .select("*")
    .eq("id", planId)
    .eq("active", true)
    .single();
  if (planError || !plan) {
    return jsonResponse({ error: "Plano não encontrado ou inativo." }, 404);
  }

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, status")
    .eq("user_id", user.id)
    .in("status", ["active", "authorized", "pending"])
    .maybeSingle();
  if (existing) {
    return jsonResponse({ error: "Você já possui uma assinatura em andamento." }, 409);
  }

  const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000";
  const frequencyType = plan.interval === "monthly" ? "months" : plan.interval === "quarterly" ? "months" : "months";
  const frequency = plan.interval === "monthly" ? 1 : plan.interval === "quarterly" ? 3 : 12;

  try {
    const preapproval = await createPreapproval({
      reason: `Ápice Fiscal — ${plan.name}`,
      externalReference: user.id,
      payerEmail: user.email!,
      transactionAmount: plan.price_cents / 100,
      frequency,
      frequencyType,
      backUrl: `${siteUrl}/configuracoes/assinatura`,
    });

    const { error: insertError } = await supabase.from("subscriptions").insert({
      user_id: user.id,
      plan_id: plan.id,
      status: "pending",
      mercado_pago_subscription_id: preapproval.id,
    });
    if (insertError) throw insertError;

    return jsonResponse({ checkoutUrl: preapproval.init_point, subscriptionId: preapproval.id });
  } catch (err) {
    console.error("create-subscription: erro", err);
    return jsonResponse({ error: "Não foi possível iniciar a assinatura. Tente novamente." }, 500);
  }
});
