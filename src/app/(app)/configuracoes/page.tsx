"use client";

import { useState } from "react";
import { Moon, Sun, Bell, Mail, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/utils/cn";

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full transition-smooth shrink-0",
        checked ? "bg-accent" : "bg-surface-2 border border-border"
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-smooth",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
  );
}

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted text-sm mt-1">Personalize sua experiência na plataforma.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 transition-smooth",
              theme === "light" ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2"
            )}
          >
            <Sun className="size-6 text-accent" />
            <span className="text-sm font-medium text-foreground">Claro</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-4 transition-smooth",
              theme === "dark" ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2"
            )}
          >
            <Moon className="size-6 text-accent" />
            <span className="text-sm font-medium text-foreground">Escuro</span>
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificações</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-accent-soft grid place-items-center text-accent shrink-0">
                <Bell className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Notificações push</p>
                <p className="text-xs text-muted">Novas aulas, lembretes de meta e simulados.</p>
              </div>
            </div>
            <Switch checked={pushNotifications} onChange={setPushNotifications} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-accent-soft grid place-items-center text-accent shrink-0">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Notificações por email</p>
                <p className="text-xs text-muted">Avisos importantes sobre sua conta.</p>
              </div>
            </div>
            <Switch checked={emailNotifications} onChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-accent-soft grid place-items-center text-accent shrink-0">
                <Mail className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Resumo semanal por email</p>
                <p className="text-xs text-muted">Relatório do seu progresso toda segunda-feira.</p>
              </div>
            </div>
            <Switch checked={weeklySummary} onChange={setWeeklySummary} />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conta</CardTitle>
          <div className="size-9 rounded-xl bg-red-500/10 grid place-items-center text-red-500">
            <ShieldAlert className="size-4" />
          </div>
        </CardHeader>
        <p className="text-sm text-muted mb-4">
          Ações sensíveis relacionadas à sua conta na Ápice Fiscal.
        </p>
        <Button
          variant="danger"
          onClick={() => showToast("Solicitação de exclusão de conta registrada.", "info")}
        >
          Excluir minha conta
        </Button>
      </Card>
    </div>
  );
}
