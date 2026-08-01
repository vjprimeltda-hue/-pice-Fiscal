import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Tone = "accent" | "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  accent: "bg-accent-soft text-accent",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  neutral: "bg-surface-2 text-muted",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
