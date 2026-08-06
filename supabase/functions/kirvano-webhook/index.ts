// Public endpoint (verify_jwt = false in supabase/config.toml) — Kirvano
// calls this directly for every sale/refund event, it can't send a Supabase
// user JWT. Authenticity is instead established via the shared-secret token
// check below. Deploy with:
//   supabase functions deploy kirvano-webhook --no-verify-jwt
// and register this URL in Kirvano > Integrações > Webhooks.
//
// Unlike Mercado Pago (mercadopago-webhook), a Kirvano sale has no
// pre-existing Supabase user — the buyer paid on an external checkout page.
// On SALE_APPROVED we create the account via Auth's invite flow (which also
// sends the "set your password" email) and open the subscription in the
// same request.
//
// NOTE: confirm the exact header name Kirvano sends the security token in
// (Kirvano dashboard > Integrações > Webhooks) — this checks `security-token`
// and falls back to a `?token=` query param, but adjust `getProvidedToken`
// below if Kirvano's docs show a different header for your account.
import { handleCors, jsonResponse } from "../_shared/cors.ts";
import { createServiceClient, findUserByEmail } from "../_shared/supabase.ts";

function getProvidedToken(req: Request, url: URL): string | null {
  return req.headers.get("security-token") ?? url.searchParams.get("token");
}

function verifyToken(req: Request, url: URL): boolean {
  const expected = Deno.env.get("KIRVANO_WEBHOOK_TOKEN");
  if (!expected) return true; // not configured (e.g. local dev) — allow through.
  const provided = getProvidedToken(req, url);
  return provided === expected;
}

function toCents(value: unknown): number {
  const n = typeof value === "string" ? parseFloat(value) : typeof value === "number" ? value : 0;
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

Deno.serve(async (req) => {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const url = new URL(req.url);
  if (!verifyToken(req, url)) {
    console.error("kirvano-webhook: token inválido");
    return jsonResponse({ error: "invalid_token" }, 401);
  }

  const body = await req.json().catch(() => ({}));
  const event: string | undefined = body.event ?? body.type;

  const customer = body.customer ?? {};
  const email: string | undefined = customer.email ?? body.email;
  const name: string | undefined = customer.name ?? body.customer_name;
  const saleId: string | undefined = body.sale_id ?? body.id;
  const productId: string | undefined =
    body.product?.id ?? body.products?.[0]?.offer_id ?? body.products?.[0]?.id ?? body.offer_id;

  if (!event || !saleId) {
    // Kirvano may ping with test/empty bodies; ack with 200 so it doesn't retry.
    return jsonResponse({ ok: true, ignored: true });
  }

  const supabase = createServiceClient();

  try {
    if (event === "SALE_APPROVED") {
      if (!email) {
        console.error("kirvano-webhook: venda sem email", { saleId });
        return jsonResponse({ ok: true, ignored: true });
      }

      const { data: plan } = await supabase
        .from("plans")
        .select("id")
        .eq("kirvano_product_id", productId ?? "")
        .maybeSingle();

      if (!plan) {
        console.error("kirvano-webhook: nenhum plano vinculado a este produto Kirvano", {
          saleId,
          productId,
        });
        return jsonResponse({ ok: true, ignored: true });
      }

      const siteUrl = Deno.env.get("SITE_URL") ?? "http://localhost:3000";
      const { data: invited, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { name: name ?? email.split("@")[0] },
        redirectTo: `${siteUrl}/redefinir-senha`,
      });

      let userId = invited?.user?.id;
      if (!userId) {
        // Already registered (repeat customer, or account created some other way).
        const existing = await findUserByEmail(email);
        if (!existing) {
          console.error("kirvano-webhook: falha ao criar/encontrar usuário", { email, inviteError });
          return jsonResponse({ ok: false, error: "user_creation_failed" }, 200);
        }
        userId = existing.id;
      }

      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: userId,
            plan_id: plan.id,
            status: "active",
            kirvano_sale_id: saleId,
            current_period_start: new Date().toISOString(),
          },
          { onConflict: "kirvano_sale_id" }
        )
        .select("id")
        .single();
      if (subError) throw subError;

      const { error: paymentError } = await supabase.from("payments").upsert(
        {
          kirvano_transaction_id: saleId,
          user_id: userId,
          subscription_id: subscription.id,
          amount_cents: toCents(body.total_price ?? body.amount),
          currency: "BRL",
          status: "approved",
          payment_method: body.payment_method,
          raw_payload: body,
          paid_at: new Date().toISOString(),
        },
        { onConflict: "kirvano_transaction_id" }
      );
      if (paymentError) throw paymentError;

      console.log("kirvano-webhook: assinatura ativada", { userId, saleId });
    } else if (event === "SALE_REFUSED" || event === "SALE_CHARGEBACK" || event === "SUBSCRIPTION_CANCELED") {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("kirvano_sale_id", saleId);
      if (error) throw error;
      console.log("kirvano-webhook: assinatura cancelada", { saleId, event });
    } else {
      console.log("kirvano-webhook: evento ignorado", { event, saleId });
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    console.error("kirvano-webhook: erro ao processar", err);
    // Still 200 so Kirvano doesn't hammer retries for a bug on our side while we look at logs.
    return jsonResponse({ ok: false, error: String(err) }, 200);
  }
});
