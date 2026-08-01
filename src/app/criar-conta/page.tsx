"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, User } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const SIGNUP_ERROR_MESSAGES: Record<string, string> = {
  "User already registered": "Já existe uma conta com este email.",
};

export default function CreateAccountPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Informe seu nome completo.";
    if (!email.trim()) next.email = "Informe seu email.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Email inválido.";
    if (password.length < 8) next.password = "A senha deve ter ao menos 8 caracteres.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { needsEmailConfirmation } = await signUp({ name, email, password });
      if (needsEmailConfirmation) {
        showToast("Conta criada! Verifique seu email para confirmar o cadastro.", "success");
        router.push("/login");
      } else {
        showToast("Conta criada com sucesso! Bem-vindo(a).", "success");
        router.push("/dashboard");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Não foi possível criar a conta.";
      showToast(SIGNUP_ERROR_MESSAGES[message] ?? message, "error");
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

        <h2 className="text-2xl font-bold text-foreground text-center">Criar conta</h2>
        <p className="text-muted text-sm mt-1.5 mb-8 text-center">
          Comece sua preparação rumo à aprovação.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Nome completo"
            icon={<User className="size-4" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Senha"
            type="password"
            icon={<Lock className="size-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Criar conta
          </Button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Já tem conta?{" "}
          <Link href="/login" className="text-accent font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
