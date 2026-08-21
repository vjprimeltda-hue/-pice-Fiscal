"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Mail } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

/**
 * Fallback entry point for when the link in an invite/recovery email
 * doesn't survive the trip (email clients/scanners that rewrite or
 * truncate URLs). Both supabase/templates/invite.html and recovery.html
 * print the raw 6-digit OTP next to the button and link here so the user
 * always has a way in, independent of the link's shape or length.
 */
export default function VerifyCodePage() {
  return (
    <Suspense fallback={null}>
      <VerifyCodePageInner />
    </Suspense>
  );
}

function VerifyCodePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyCode } = useAuth();
  const { showToast } = useToast();

  const type = searchParams.get("type") === "invite" ? "invite" : "recovery";
  const next = searchParams.get("next") ?? (type === "recovery" ? "/redefinir-senha" : "/dashboard");

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; code?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Informe seu email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Email inválido.";
    if (!/^\d{6}$/.test(code.trim())) next.code = "Digite o código de 6 dígitos do email.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await verifyCode({ email: email.trim(), code: code.trim(), type });
      router.push(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível verificar o código.";
      showToast(
        message.toLowerCase().includes("expired") || message.toLowerCase().includes("invalid")
          ? "Código inválido ou expirado. Solicite um novo email."
          : message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img src="/logo-wide.png" alt="Ápice Fiscal" className="h-9 w-auto" />
        </div>

        <h2 className="text-2xl font-bold text-foreground text-center">Entrar com código</h2>
        <p className="text-muted text-sm mt-1.5 mb-8 text-center">
          Digite o email e o código de 6 dígitos que enviamos para você.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="voce@email.com"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Código"
            type="text"
            inputMode="numeric"
            name="code"
            placeholder="000000"
            icon={<KeyRound className="size-4" />}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            error={errors.code}
            maxLength={6}
            autoComplete="one-time-code"
          />

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Confirmar
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          <Link href="/login" className="text-accent font-semibold hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
