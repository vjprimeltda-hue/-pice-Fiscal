"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { createClient } from "@/lib/supabase/client";

/**
 * Reached after /auth/confirm verifies the recovery link and establishes a
 * (short-lived, recovery-only) session. The user must set a new password to
 * finish; if there's no valid session, the recovery link was invalid/expired.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, logout } = useAuth();
  const { showToast } = useToast();

  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setCheckingSession(false);
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("A senha deve ter ao menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await updatePassword(password);
      showToast("Senha redefinida com sucesso. Faça login novamente.", "success");
      await logout();
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível redefinir a senha.";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="size-10 rounded-xl bg-gradient-to-br from-navy to-navy-light grid place-items-center">
            <GraduationCap className="size-5 text-accent-light" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-xl text-foreground tracking-tight">Ápice Fiscal</span>
        </div>

        {checkingSession ? (
          <div className="flex justify-center py-10">
            <div className="size-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
          </div>
        ) : !hasSession ? (
          <div className="card p-6 text-center">
            <p className="text-foreground font-semibold">Link inválido ou expirado</p>
            <p className="text-muted text-sm mt-2">
              Solicite um novo link de recuperação de senha para continuar.
            </p>
            <Button className="mt-5" onClick={() => router.push("/esqueci-senha")}>
              Solicitar novo link
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-foreground text-center">Definir nova senha</h2>
            <p className="text-muted text-sm mt-1.5 mb-8 text-center">
              Escolha uma nova senha para sua conta.
            </p>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="relative">
                <Input
                  label="Nova senha"
                  type={showPassword ? "text" : "password"}
                  icon={<Lock className="size-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-9 text-muted hover:text-foreground transition-smooth"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <Input
                label="Confirmar nova senha"
                type={showPassword ? "text" : "password"}
                icon={<Lock className="size-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={error}
                autoComplete="new-password"
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Redefinir senha
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
