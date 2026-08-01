"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/context/ToastContext";
import { adminBillingService } from "@/services/admin";
import { formatCurrencyFromCents, formatDatePtBr } from "@/utils/format";
import type { Database, SubscriptionStatus, PaymentStatus } from "@/types/database";

type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"] & {
  profiles: { name: string; email: string } | null;
  plans: { name: string; price_cents: number; interval: string } | null;
};
type Payment = Database["public"]["Tables"]["payments"]["Row"] & { profiles: { name: string; email: string } | null };

const subscriptionTone: Record<SubscriptionStatus, "success" | "warning" | "danger" | "neutral"> = {
  active: "success",
  authorized: "success",
  pending: "warning",
  paused: "warning",
  cancelled: "danger",
  expired: "neutral",
};

const paymentTone: Record<PaymentStatus, "success" | "warning" | "danger" | "neutral"> = {
  approved: "success",
  authorized: "success",
  pending: "warning",
  in_process: "warning",
  in_mediation: "warning",
  rejected: "danger",
  cancelled: "neutral",
  refunded: "neutral",
  charged_back: "danger",
};

export default function AdminBillingPage() {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[] | null>(null);
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [tab, setTab] = useState<"subscriptions" | "payments">("subscriptions");

  useEffect(() => {
    adminBillingService
      .listSubscriptions()
      .then((data) => setSubscriptions(data as unknown as Subscription[]))
      .catch(() => showToast("Erro ao carregar assinaturas.", "error"));
    adminBillingService
      .listPayments()
      .then((data) => setPayments(data as unknown as Payment[]))
      .catch(() => showToast("Erro ao carregar pagamentos.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Assinaturas"
        description="Sincronizadas com o Mercado Pago via webhook (Fase 5 conecta as ações de cobrança)."
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("subscriptions")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${tab === "subscriptions" ? "bg-navy text-white" : "bg-surface-2 text-muted hover:text-foreground"}`}
        >
          Assinaturas
        </button>
        <button
          onClick={() => setTab("payments")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-smooth ${tab === "payments" ? "bg-navy text-white" : "bg-surface-2 text-muted hover:text-foreground"}`}
        >
          Pagamentos
        </button>
      </div>

      {tab === "subscriptions" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-3 font-medium">Aluno</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Vigência</th>
              </tr>
            </thead>
            <tbody>
              {!subscriptions &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={4}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}
              {subscriptions?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    Nenhuma assinatura ainda.
                  </td>
                </tr>
              )}
              {subscriptions?.map((sub) => (
                <tr key={sub.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{sub.profiles?.name ?? "—"}</p>
                    <p className="text-xs text-muted">{sub.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {sub.plans?.name} {sub.plans && `— ${formatCurrencyFromCents(sub.plans.price_cents)}`}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={subscriptionTone[sub.status]}>{sub.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {sub.current_period_end ? formatDatePtBr(sub.current_period_end) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "payments" && (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-3 font-medium">Aluno</th>
                <th className="px-4 py-3 font-medium">Valor</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {!payments &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3" colSpan={4}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))}
              {payments?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    Nenhum pagamento registrado ainda.
                  </td>
                </tr>
              )}
              {payments?.map((payment) => (
                <tr key={payment.id} className="border-b border-border last:border-0 hover:bg-surface-2/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{payment.profiles?.name ?? "—"}</p>
                    <p className="text-xs text-muted">{payment.profiles?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatCurrencyFromCents(payment.amount_cents)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={paymentTone[payment.status]}>{payment.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDatePtBr(payment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
