"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, CreditCard, PlayCircle, FileText, ListChecks, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminStatsService } from "@/services/admin";
import { formatCurrencyFromCents } from "@/utils/format";

interface Overview {
  totalUsers: number;
  activeSubscriptions: number;
  totalLessons: number;
  totalMaterials: number;
  totalQuestions: number;
  revenueCentsThisMonth: number;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminStatsService
      .getOverview()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas."));
  }, []);

  const cards = stats
    ? [
        { label: "Alunos cadastrados", value: stats.totalUsers, icon: Users, href: "/admin/usuarios" },
        { label: "Assinaturas ativas", value: stats.activeSubscriptions, icon: CreditCard, href: "/admin/assinaturas" },
        { label: "Receita no mês", value: formatCurrencyFromCents(stats.revenueCentsThisMonth), icon: DollarSign, href: "/admin/assinaturas" },
        { label: "Videoaulas publicadas", value: stats.totalLessons, icon: PlayCircle, href: "/admin/videoaulas" },
        { label: "Materiais publicados", value: stats.totalMaterials, icon: FileText, href: "/admin/materiais" },
        { label: "Questões no banco", value: stats.totalQuestions, icon: ListChecks, href: "/admin/questoes" },
      ]
    : [];

  return (
    <div>
      <AdminPageHeader title="Visão geral" description="Resumo da plataforma em tempo real." />

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {!stats && !error
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : cards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.label} href={card.href}>
                  <Card className="hover:border-accent/40 transition-smooth h-full">
                    <div className="flex items-center justify-between">
                      <div className="size-11 rounded-xl bg-accent-soft grid place-items-center">
                        <Icon className="size-5 text-accent" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-foreground mt-4">{card.value}</p>
                    <p className="text-sm text-muted mt-1">{card.label}</p>
                  </Card>
                </Link>
              );
            })}
      </div>
    </div>
  );
}
