// NEXT_PUBLIC_* vars must be referenced as static `process.env.X` member
// expressions (not `process.env[name]`) so Next.js's bundler can statically
// replace them at build time — that's how they reach the browser at all,
// since the client never sees a real `process.env` object.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não definida. Copie .env.example para .env.local e preencha os valores do seu projeto Supabase.`
    );
  }
  return value;
}

export const supabaseUrl = () => required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
export const supabaseAnonKey = () =>
  required("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Optional: link to the Kirvano checkout page for the "Acesso Vitalício"
// product, shown as the CTA on /assinatura. Not `required()` since the
// paywall page must still render (without a working buy button) if this
// hasn't been configured yet.
export const kirvanoCheckoutUrl = () => process.env.NEXT_PUBLIC_KIRVANO_CHECKOUT_URL || null;
