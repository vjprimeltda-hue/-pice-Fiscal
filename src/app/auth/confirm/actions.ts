"use server";

import { redirect } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the OTP from an email link. Only ever called from the button
 * submit on this route's page — never on GET — because email providers
 * (Gmail's Safe Browsing, corporate link scanners, etc.) prefetch every URL
 * in an email to check for malware, which silently burns single-use OTP
 * tokens before the real user clicks. Requiring an actual form submission
 * defeats that prefetch since scanners don't submit forms.
 */
export async function confirmEmailLink(formData: FormData) {
  const token_hash = formData.get("token_hash");
  const type = formData.get("type") as EmailOtpType | null;
  const next = (formData.get("next") as string | null) || "/dashboard";

  if (typeof token_hash === "string" && token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      redirect(type === "recovery" ? "/redefinir-senha" : next);
    }
  }

  redirect("/login?error=link_invalido");
}
