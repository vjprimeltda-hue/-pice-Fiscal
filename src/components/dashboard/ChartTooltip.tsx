"use client";

interface TooltipProps {
  active?: boolean;
  payload?: { value: number; name?: string; color?: string }[];
  label?: string;
  suffix?: string;
}

export function ChartTooltip({ active, payload, label, suffix = "h" }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-0.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.value}
          {suffix}
        </p>
      ))}
    </div>
  );
}
