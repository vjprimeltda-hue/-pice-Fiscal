// Public endpoint (verify_jwt = false in supabase/config.toml) — Mercado
// Pago calls this directly, it can't send a Supabase user JWT. Authenticity
// is instead established via the x-signature HMAC check below. Deploy with:
//   supabase functions deploy mercadopago-webhook --no-verify-jwt
// and register this URL in Mercado Pago > Sua integração > Webhooks.
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/supabase.ts";
import { getPayment, getPreapproval, verifyWebhookSignature } from "../_shared/mercadopago.ts";

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const url = new URL(req.url);
  const body = await req.json().catch(() => ({}));

  // Mercado Pago sends the resource id both as a query param (`data.id`) and
  // in the JSON body, depending on notification type/version.
  const type: string | undefined = body.type ?? url.searchParams.get("type") ?? undefined;
  const dataId: string | undefined = body.data?.id ?? url.searchParams.get("data.id") ?? undefined;

  if (!type || !dataId) {
    // Mercado Pago also pings with empty/test bodies; ack with 200 so it stops retrying.
    return jsonResponse({ ok: true, ignored: true });
  }

  const validSignature = await verifyWebhookSignature(req, dataId);
  if (!validSignature) {
    console.error("mercadopago-webhook: assinatura inválida", { type, dataId });
    return jsonResponse({ error: "invalid_signature" }, 401);
  }

  const supabase = createServiceClient();

  try {
    if (type === "preapproval" || type === "subscription_preapproval") {
      const preapproval = await getPreapproval(dataId);
      const userId = preapproval.external_reference;

      const status =
        preapproval.status === "authorized"
          ? "active"
          : (preapproval.status as "pending" | "authorized" | "paused" | "cancelled" | "expired");

      const { error } = await supabase
        .from("subscriptions")
        .update({
          status,
          mercado_pago_payer_id: String(preapproval.payer_id),
          current_period_start: preapproval.date_created,
          current_period_end: preapproval.next_payment_date ?? null,
        })
        .eq("mercado_pago_subscription_id", preapproval.id);

      if (error) throw error;
      console.log("mercadopago-webhook: preapproval sincronizada", { userId, status });
    } else if (type === "payment") {
      const payment = await getPayment(dataId);
      const userId = payment.external_reference;

      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .in("status", ["active", "authorized", "pending"])
        .maybeSingle();

      const { error } = await supabase.from("payments").upsert(
        {
          mercado_pago_payment_id: String(payment.id),
          user_id: userId,
          subscription_id: subscription?.id ?? null,
          amount_cents: Math.round(payment.transaction_amount * 100),
          currency: payment.currency_id,
          status: payment.status as
            | "pending"
            | "approved"
            | "authorized"
            | "in_process"
            | "in_mediation"
            | "rejected"
            | "cancelled"
            | "refunded"
            | "charged_back",
          payment_method: payment.payment_method_id,
          raw_payload: payment as unknown as Record<string, unknown>,
          paid_at: payment.date_approved,
        },
        { onConflict: "mercado_pago_payment_id" }
      );

      if (error) throw error;
      console.log("mercadopago-webhook: pagamento sincronizado", { userId, status: payment.status });
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("mercadopago-webhook: erro ao processar", err);
    // Still 200 so Mercado Pago doesn't hammer retries for a bug on our side while we look at logs;
    // change to 500 if you'd rather rely on their retry policy during rollout.
    return jsonResponse({ ok: false, error: String(err) }, 200);
  }
});
