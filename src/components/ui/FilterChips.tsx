import { cn } from "@/utils/cn";

interface FilterChipsProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function FilterChips<T extends string>({ options, value, onChange }: FilterChipsProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-smooth",
            value === opt.value
              ? "bg-navy text-white border-navy"
              : "bg-surface text-muted border-border hover:bg-surface-2"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
