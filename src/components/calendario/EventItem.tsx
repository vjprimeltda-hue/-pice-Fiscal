"use client";

import { CheckCircle2, Circle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/utils/cn";
import type { AgendaEvent, EventType } from "@/types";

const typeTone: Record<EventType, string> = {
  estudo: "bg-accent",
  revisao: "bg-amber-500",
  simulado: "bg-purple-500",
  prova: "bg-red-500",
  outro: "bg-slate-400",
};

const typeLabel: Record<EventType, string> = {
  estudo: "Estudo",
  revisao: "Revisão",
  simulado: "Simulado",
  prova: "Prova",
  outro: "Outro",
};

interface EventItemProps {
  event: AgendaEvent;
  onToggleComplete: (id: string) => void;
  onEdit: (event: AgendaEvent) => void;
  onDelete: (id: string) => void;
}

export function EventItem({ event, onToggleComplete, onEdit, onDelete }: EventItemProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-xl border border-border p-3", event.completed && "opacity-60")}>
      <button onClick={() => onToggleComplete(event.id)} className="shrink-0 text-muted hover:text-accent">
        {event.completed ? <CheckCircle2 className="size-5 text-emerald-500" /> : <Circle className="size-5" />}
      </button>
      <span className={cn("size-2 rounded-full shrink-0", typeTone[event.type])} />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium text-foreground truncate", event.completed && "line-through")}>
          {event.title}
        </p>
        <p className="text-xs text-muted">
          {event.startTime}
          {event.endTime && ` – ${event.endTime}`} · {typeLabel[event.type]}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(event)}
          className="size-8 rounded-lg grid place-items-center text-muted hover:bg-surface-2 transition-smooth"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="size-8 rounded-lg grid place-items-center text-muted hover:bg-red-500/10 hover:text-red-500 transition-smooth"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
