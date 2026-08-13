"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, ExternalLink, Lock, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/context/ToastContext";
import { billingService } from "@/services";
import { kirvanoCheckoutUrl } from "@/lib/supabase/env";
import { formatCurrencyFromCents, formatDatePtBr } from "@/utils/format";
import type { Database, SubscriptionStatus } from "@/types/database";

type Plan = Database["public"]["Tables"]["plans"]["Row"];
type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];

const statusCopy: Record<SubscriptionStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral"; icon: typeof CheckCircle2 }> = {
  active: { label: "Assinatura ativa", tone: "success", icon: CheckCircle2 },
  authorized: { label: "Assinatura ativa", tone: "success", icon: CheckCircle2 },
  pending: { label: "Pagamento em análise", tone: "warning", icon: Clock },
  paused: { label: "Assinatura pausada", tone: "warning", icon: Clock },
  cancelled: { label: "Assinatura cancelada", tone: "danger", icon: XCircle },
  expired: { label: "Assinatura expirada", tone: "danger", icon: XCircle },
};

const ROUTE_LABELS: Record<string, string> = {
  "/videoaulas": "as videoaulas",
  "/materiais": "os materiais",
  "/questoes": "o banco de questões",
  "/plano-de-estudos": "o plano de estudos",
};

export default function AssinaturaPage() {
  return (
    <Suspense fallback={null}>
      <AssinaturaPageInner />
    </Suspense>
  );
}

function AssinaturaPageInner() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null | undefined>(undefined);
  const [hasActive, setHasActive] = useState(false);

  const nextRoute = searchParams.get("next");
  const checkoutUrl = kirvanoCheckoutUrl();

  useEffect(() => {
    billingService.listActivePlans().then(setPlans).catch(() => showToast("Erro ao carregar planos.", "error"));
    billingService
      .getMySubscription()
      .then(setSubscription)
      .catch(() => showToast("Erro ao carregar sua assinatura.", "error"));
    billingService.hasActiveSubscription().then(setHasActive).catch(() => setHasActive(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = subscription ? statusCopy[subscription.status] : null;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assinatura</h1>
        <p className="text-muted text-sm mt-1">Gerencie seu acesso ao Ápice Fiscal.</p>
      </div>

      {!hasActive && nextRoute && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-3">
          <Lock className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            É preciso ter o Acesso Vitalício ativo para acessar {ROUTE_LABELS[nextRoute] ?? "essa área"}.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Status da sua conta</CardTitle>
        </CardHeader>
        {subscription === undefined ? (
          <Skeleton className="h-6 w-40" />
        ) : subscription && status ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <status.icon className="size-4" />
              <Badge tone={status.tone}>{status.label}</Badge>
            </div>
            {subscription.current_period_end && (
              <p className="text-xs text-muted">Vigência até {formatDatePtBr(subscription.current_period_end)}</p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <XCircle className="size-4 text-muted" />
            <Badge tone="neutral">Nenhuma assinatura encontrada</Badge>
          </div>
        )}
      </Card>

      {!hasActive && (
        <Card>
          <CardHeader>
            <CardTitle>Garanta seu acesso</CardTitle>
          </CardHeader>

          {!plans ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : plans.length === 0 ? (
            <p className="text-sm text-muted">Nenhum plano disponível no momento. Entre em contato com o suporte.</p>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-baseline justify-between gap-4 mb-1">
                    <p className="font-semibold text-foreground">{plan.name}</p>
                    <p className="text-lg font-bold text-accent">{formatCurrencyFromCents(plan.price_cents)}</p>
                  </div>
                  {plan.description && <p className="text-sm text-muted mb-3">{plan.description}</p>}
                  {plan.features.length > 0 && (
                    <ul className="space-y-1.5 mb-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                  {checkoutUrl ? (
                    <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full" icon={<ExternalLink className="size-4" />}>
                        Garantir acesso
                      </Button>
                    </a>
                  ) : (
                    <Button className="w-full" disabled>
                      Compra indisponível no momento
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted">
                Após a confirmação do pagamento, seu acesso é liberado automaticamente. Se for sua primeira compra, você
                receberá um email para definir sua senha.
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
