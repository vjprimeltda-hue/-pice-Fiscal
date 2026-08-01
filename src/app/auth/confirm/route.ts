import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for every Supabase Auth email link: cadastro (signup),
 * recuperação de senha (recovery) e convites. Supabase's email templates
 * point here with `?token_hash=...&type=...`; we verify the OTP server-side
 * (so the session cookie is set via src/lib/supabase/server.ts) and forward
 * the user to the right screen.
 *
 * Configure isto como o "Redirect URL" dos templates de email no dashboard:
 * Authentication > Email Templates — trocar `{{ .ConfirmationURL }}` por
 * `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next=...`
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      const redirectTo = type === "recovery" ? "/redefinir-senha" : next;
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set("error", "link_invalido");
  return NextResponse.redirect(errorUrl);
}
