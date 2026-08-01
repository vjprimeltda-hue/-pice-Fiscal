"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, GraduationCap, Lock, Mail, ShieldCheck, TrendingUp, Video } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  link_invalido: "O link usado é inválido ou expirou. Solicite um novo.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const errorCode = searchParams.get("error");
    if (errorCode) {
      showToast(AUTH_ERROR_MESSAGES[errorCode] ?? "Ocorreu um erro. Tente novamente.", "error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Informe seu email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Email inválido.";
    if (!password) next.password = "Informe sua senha.";
    else if (password.length < 6) next.password = "A senha deve ter ao menos 6 caracteres.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password, remember);
      showToast("Login realizado com sucesso. Bem-vindo de volta!", "success");
      router.push(searchParams.get("next") ?? "/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível entrar. Verifique suas credenciais.";
      showToast(
        message === "Invalid login credentials" ? "Email ou senha incorretos." : message,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-navy via-navy to-navy-light text-white p-12 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 size-72 rounded-full bg-accent-light/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="size-11 rounded-xl bg-gradient-to-br from-accent to-accent-light grid place-items-center">
            <GraduationCap className="size-6 text-navy" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-2xl tracking-tight">Ápice Fiscal</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Sua aprovação começa com <span className="text-accent-light">disciplina</span> e o material certo.
          </h1>
          <p className="mt-4 text-white/70 text-lg">
            Videoaulas, materiais completos e acompanhamento de desempenho em uma única plataforma premium.
          </p>

          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/10 grid place-items-center shrink-0">
                <Video className="size-5 text-accent-light" />
              </div>
              <span className="text-sm text-white/80">Videoaulas organizadas por matéria e professor</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/10 grid place-items-center shrink-0">
                <TrendingUp className="size-5 text-accent-light" />
              </div>
              <span className="text-sm text-white/80">Dashboard com evolução real do seu estudo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white/10 grid place-items-center shrink-0">
                <ShieldCheck className="size-5 text-accent-light" />
              </div>
              <span className="text-sm text-white/80">Planejamento e revisões que cabem na sua rotina</span>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-white/40">© 2026 Ápice Fiscal. Todos os direitos reservados.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="size-10 rounded-xl bg-gradient-to-br from-navy to-navy-light grid place-items-center">
              <GraduationCap className="size-5 text-accent-light" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-xl text-foreground tracking-tight">Ápice Fiscal</span>
          </div>

          <h2 className="text-2xl font-bold text-foreground">Entrar na plataforma</h2>
          <p className="text-muted text-sm mt-1.5 mb-8">
            Continue de onde parou rumo à sua aprovação.
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Senha
                </label>
                <Link href="/esqueci-senha" className="text-xs font-medium text-accent hover:underline">
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-xl border border-border bg-surface pl-10 pr-11 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-smooth"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-smooth"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 rounded border-border accent-[--color-accent]"
              />
              <span className="text-sm text-muted">Lembrar-me</span>
            </label>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-muted mt-8">
            Ainda não tem conta?{" "}
            <Link href="/criar-conta" className="text-accent font-semibold hover:underline">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
