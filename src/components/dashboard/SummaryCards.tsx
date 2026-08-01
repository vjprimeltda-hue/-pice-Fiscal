import type { LucideIcon } from "lucide-react";
import { Clock, Target, Flame, CheckCircle2, ListChecks } from "lucide-react";
import type { Progress } from "@/types";
import { Card } from "@/components/ui/Card";

interface StatDef {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
}

export function SummaryCards({ progress }: { progress: Progress }) {
  const stats: StatDef[] = [
    {
      label: "Horas estudadas hoje",
      value: `${progress.hoursStudiedToday.toFixed(1)}h`,
      icon: Clock,
      tone: "text-accent bg-accent-soft",
    },
    {
      label: "Meta diária",
      value: `${progress.dailyGoalHours}h`,
      icon: Target,
      tone: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      label: "Dias consecutivos",
      value: `${progress.streakDays} dias`,
      icon: Flame,
      tone: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
    },
    {
      label: "Conteúdos concluídos",
      value: `${progress.contentsCompleted}`,
      icon: CheckCircle2,
      tone: "text-navy bg-navy/5 dark:text-white dark:bg-white/10",
    },
    {
      label: "Questões resolvidas",
      value: `${progress.questionsAnswered}`,
      icon: ListChecks,
      tone: "text-accent bg-accent-soft",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 sm:p-5">
          <div className={`size-10 rounded-xl grid place-items-center ${stat.tone}`}>
            <stat.icon className="size-5" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-3">{stat.value}</p>
          <p className="text-xs text-muted mt-0.5 leading-tight">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
