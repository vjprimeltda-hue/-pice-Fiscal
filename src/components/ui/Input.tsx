import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground placeholder:text-muted",
              "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-smooth",
              icon && "pl-10",
              error && "border-red-500 focus:ring-red-500/30 focus:border-red-500",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
