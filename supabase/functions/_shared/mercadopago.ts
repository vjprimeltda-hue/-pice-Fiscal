const MP_API = "https://api.mercadopago.com";

function accessToken() {
  const token = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
  if (!token) throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado (supabase secrets set).");
  return token;
}

async function mpFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Mercado Pago ${path} falhou (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

export interface CreatePreapprovalInput {
  reason: string;
  externalReference: string;
  payerEmail: string;
  transactionAmount: number;
  frequency: number;
  frequencyType: "days" | "months";
  backUrl: string;
}

/** Creates a Mercado Pago subscription (preapproval) and returns the checkout URL. */
export async function createPreapproval(input: CreatePreapprovalInput) {
  return mpFetch("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: input.reason,
      external_reference: input.externalReference,
      payer_email: input.payerEmail,
      back_url: input.backUrl,
      auto_recurring: {
        frequency: input.frequency,
        frequency_type: input.frequencyType,
        transaction_amount: input.transactionAmount,
        currency_id: "BRL",
      },
      status: "pending",
    }),
  }) as Promise<{ id: string; init_point: string; status: string }>;
}

export async function getPreapproval(id: string) {
  return mpFetch(`/preapproval/${id}`) as Promise<{
    id: string;
    status: string;
    external_reference: string;
    payer_id: number;
    date_created: string;
    next_payment_date?: string;
    auto_recurring?: { transaction_amount: number };
  }>;
}

export async function updatePreapproval(id: string, status: "cancelled" | "paused" | "authorized") {
  return mpFetch(`/preapproval/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export async function getPayment(id: string) {
  return mpFetch(`/v1/payments/${id}`) as Promise<{
    id: number;
    status: string;
    status_detail: string;
    transaction_amount: number;
    currency_id: string;
    payment_method_id: string;
    external_reference: string;
    date_approved: string | null;
  }>;
}

/**
 * Verifies the `x-signature` header Mercado Pago sends with every webhook
 * call, per https://www.mercadopago.com.br/developers/en/docs/checkout-api/webhooks#editor_5
 * Prevents spoofed requests from mutating billing state.
 */
export async function verifyWebhookSignature(req: Request, dataId: string): Promise<boolean> {
  const secret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");
  if (!secret) return true; // signature validation not configured (e.g. local dev) — allow through.

  const signatureHeader = req.headers.get("x-signature");
  const requestId = req.headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const computed = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === v1;
}
