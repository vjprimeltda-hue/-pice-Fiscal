"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { AgendaEvent, EventType } from "@/types";

const typeOptions: { value: EventType; label: string }[] = [
  { value: "estudo", label: "Estudo" },
  { value: "revisao", label: "Revisão" },
  { value: "simulado", label: "Simulado" },
  { value: "prova", label: "Prova" },
  { value: "outro", label: "Outro" },
];

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<AgendaEvent, "id" | "completed"> & { id?: string }) => void;
  initialEvent?: AgendaEvent | null;
  defaultDate: string;
}

export function EventModal({ open, onClose, onSave, initialEvent, defaultDate }: EventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("");
  const [type, setType] = useState<EventType>("estudo");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDate(initialEvent.date);
      setStartTime(initialEvent.startTime);
      setEndTime(initialEvent.endTime ?? "");
      setType(initialEvent.type);
      setNotes(initialEvent.notes ?? "");
    } else {
      setTitle("");
      setDate(defaultDate);
      setStartTime("08:00");
      setEndTime("");
      setType("estudo");
      setNotes("");
    }
  }, [initialEvent, defaultDate, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !startTime) return;
    onSave({
      id: initialEvent?.id,
      title: title.trim(),
      date,
      startTime,
      endTime: endTime || undefined,
      type,
      notes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="card w-full max-w-md p-6 animate-fade-in max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-foreground">
            {initialEvent ? "Editar tarefa" : "Nova tarefa"}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />

          <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Início" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            <Input label="Fim (opcional)" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full h-11 rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-smooth"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-smooth resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
