import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full h-11 rounded-xl border border-border bg-surface pl-3.5 pr-9 text-sm text-foreground appearance-none",
              "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-smooth",
              error && "border-red-500 focus:ring-red-500/30 focus:border-red-500",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
