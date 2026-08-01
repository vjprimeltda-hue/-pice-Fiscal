"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChartTooltip } from "@/components/dashboard/ChartTooltip";
import type { Progress } from "@/types";

export function SubjectPerformanceChart({ data }: { data: Progress["bySubject"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Desempenho por matéria</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="subject"
              tick={{ fill: "var(--foreground)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip content={<ChartTooltip suffix="%" />} cursor={{ fill: "var(--surface-2)" }} />
            <Bar dataKey="percent" fill="var(--color-accent-light)" radius={[0, 8, 8, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
