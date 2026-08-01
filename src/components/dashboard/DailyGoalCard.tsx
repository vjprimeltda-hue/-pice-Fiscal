import { Target } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { Progress } from "@/types";

export function DailyGoalCard({ progress }: { progress: Progress }) {
  const percent = Math.min(100, Math.round((progress.hoursStudiedToday / progress.dailyGoalHours) * 100));
  const remainingHours = Math.max(0, progress.dailyGoalHours - progress.hoursStudiedToday);
  const remainingLabel =
    remainingHours === 0
      ? "Meta concluída! 🎉"
      : `Faltam ${remainingHours.toFixed(1).replace(".0", "")}h para bater a meta`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meta diária</CardTitle>
        <div className="size-9 rounded-xl bg-accent-soft grid place-items-center text-accent">
          <Target className="size-4" />
        </div>
      </CardHeader>

      <div className="flex items-end justify-between mb-3">
        <span className="text-3xl font-bold text-foreground">{percent}%</span>
        <span className="text-sm text-muted mb-1">
          {progress.hoursStudiedToday.toFixed(1)}h / {progress.dailyGoalHours}h
        </span>
      </div>

      <ProgressBar percent={percent} className="h-3" />

      <p className="text-sm text-muted mt-3">{remainingLabel}</p>
    </Card>
  );
}
