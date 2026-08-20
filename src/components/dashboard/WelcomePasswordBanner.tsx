"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, X } from "lucide-react";

/**
 * Shown once when a buyer lands on the dashboard via the "bemvindo=1" magic
 * link from kirvano-webhook — they're already authenticated but have no
 * password set yet, so a future login needs a fresh link unless they create
 * one now.
 */
export function WelcomePasswordBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
      <KeyRound className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-700 dark:text-amber-300 flex-1">
        Bem-vindo(a)! Você já está logado(a). Para entrar mais rápido da próxima vez, crie uma
        senha em{" "}
        <Link href="/perfil" className="underline font-medium">
          Perfil
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dispensar"
        className="text-amber-600 dark:text-amber-400 hover:opacity-70 transition-smooth shrink-0"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
