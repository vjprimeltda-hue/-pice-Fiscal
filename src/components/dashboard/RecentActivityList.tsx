import { FileText, PlayCircle, ClipboardList, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { RecentActivity } from "@/types";
import { formatRelativeDate } from "@/utils/format";

const iconMap = {
  video: { icon: PlayCircle, tone: "text-accent bg-accent-soft" },
  pdf: { icon: FileText, tone: "text-navy bg-navy/5 dark:text-white dark:bg-white/10" },
  simulado: { icon: ClipboardList, tone: "text-amber-600 bg-amber-500/10 dark:text-amber-400" },
  questoes: { icon: ListChecks, tone: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400" },
} as const;

export function RecentActivityList({ activities }: { activities: RecentActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades recentes</CardTitle>
      </CardHeader>
      <div className="flex flex-col divide-y divide-border">
        {activities.map((activity) => {
          const { icon: Icon, tone } = iconMap[activity.type];
          return (
            <div key={activity.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className={`size-9 rounded-xl grid place-items-center shrink-0 ${tone}`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                <p className="text-xs text-muted truncate">{activity.subtitle}</p>
              </div>
              <span className="text-xs text-muted shrink-0">{formatRelativeDate(activity.date)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
