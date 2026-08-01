"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";
import type { Progress } from "@/types";

export function WeeklyChart({ data }: { data: Progress["weekly"] }) {
  const total = data.reduce((sum, d) => sum + d.hours, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução semanal</CardTitle>
        <Badge tone="accent">{total.toFixed(1)}h na semana</Badge>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="day" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--surface-2)" }} />
            <Bar dataKey="hours" fill="var(--color-accent)" radius={[8, 8, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
