import { cn } from "@/utils/cn";

interface ProgressBarProps {
  percent: number;
  className?: string;
  trackClassName?: string;
  barClassName?: string;
  animated?: boolean;
}

export function ProgressBar({ percent, className, trackClassName, barClassName, animated = true }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className={cn("h-2 w-full rounded-full bg-surface-2 overflow-hidden", trackClassName, className)}>
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-accent to-accent-light",
          animated && "transition-[width] duration-700 ease-out",
          barClassName
        )}
        style={{ width: `${clamped}%` }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
