"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";
import type { Progress } from "@/types";

export function MonthlyChart({ data }: { data: Progress["monthly"] }) {
  const total = data.reduce((sum, d) => sum + d.hours, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução mensal</CardTitle>
        <Badge tone="accent">{total}h no mês</Badge>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20 }}>
            <defs>
              <linearGradient id="monthlyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="week" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-accent)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="var(--color-accent)"
              strokeWidth={2.5}
              fill="url(#monthlyFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
