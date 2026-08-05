"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await sendPasswordReset(email);
      // Sempre mostra sucesso, mesmo se o email não existir na base — evita
      // que o formulário seja usado para descobrir emails cadastrados.
      setSent(true);
    } catch {
      showToast("Não foi possível enviar o email agora. Tente novamente.", "error");
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

        {sent ? (
          <div className="card p-6 text-center">
            <p className="text-foreground font-semibold">Verifique seu email</p>
            <p className="text-muted text-sm mt-2">
              Enviamos um link de recuperação de senha para <strong>{email}</strong>.
            </p>
            <Link href="/login" className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold mt-5 hover:underline">
              <ArrowLeft className="size-4" /> Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-foreground text-center">Esqueci minha senha</h2>
            <p className="text-muted text-sm mt-1.5 mb-8 text-center">
              Informe seu email para receber o link de recuperação.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                icon={<Mail className="size-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Enviar link de recuperação
              </Button>
            </form>
            <Link href="/login" className="flex items-center justify-center gap-1.5 text-muted text-sm mt-6 hover:text-foreground">
              <ArrowLeft className="size-4" /> Voltar para o login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
