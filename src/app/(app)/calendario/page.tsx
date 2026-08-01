"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { EventModal } from "@/components/calendario/EventModal";
import { EventItem } from "@/components/calendario/EventItem";
import { FilterChips } from "@/components/ui/FilterChips";
import { agendaService } from "@/services";
import { useToast } from "@/context/ToastContext";
import { addDays, getMonthGridDays, monthLabels, startOfWeek, toISODate, weekdayLabels } from "@/utils/calendar";
import { cn } from "@/utils/cn";
import type { AgendaEvent } from "@/types";

type ViewMode = "dia" | "semana" | "mes";

export default function CalendarioPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [view, setView] = useState<ViewMode>("mes");
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toISODate(new Date()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);

  useEffect(() => {
    agendaService.list().then(setEvents);
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    return map;
  }, [events]);

  const monthDays = useMemo(() => getMonthGridDays(cursor.getFullYear(), cursor.getMonth()), [cursor]);
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(selectedDate + "T00:00:00"));
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const goPrev = () => {
    if (view === "mes") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
    else if (view === "semana") setSelectedDate(toISODate(addDays(new Date(selectedDate + "T00:00:00"), -7)));
    else setSelectedDate(toISODate(addDays(new Date(selectedDate + "T00:00:00"), -1)));
  };
  const goNext = () => {
    if (view === "mes") setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
    else if (view === "semana") setSelectedDate(toISODate(addDays(new Date(selectedDate + "T00:00:00"), 7)));
    else setSelectedDate(toISODate(addDays(new Date(selectedDate + "T00:00:00"), 1)));
  };
  const goToday = () => {
    const today = new Date();
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toISODate(today));
  };

  const handleSave = (data: Omit<AgendaEvent, "id" | "completed"> & { id?: string }) => {
    if (data.id) {
      setEvents((prev) => prev.map((e) => (e.id === data.id ? { ...e, ...data } : e)));
      showToast("Tarefa atualizada com sucesso.", "success");
    } else {
      const newEvent: AgendaEvent = { ...data, id: crypto.randomUUID(), completed: false };
      setEvents((prev) => [...prev, newEvent]);
      showToast("Tarefa criada com sucesso.", "success");
    }
    setModalOpen(false);
    setEditingEvent(null);
  };

  const handleToggleComplete = (id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)));
  };

  const handleDelete = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showToast("Tarefa excluída.", "info");
  };

  const openCreate = (date: string) => {
    setEditingEvent(null);
    setSelectedDate(date);
    setModalOpen(true);
  };

  const openEdit = (event: AgendaEvent) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const selectedDayEvents = eventsByDate.get(selectedDate) ?? [];
  const todayIso = toISODate(new Date());

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted text-sm mt-1">Organize seus estudos, revisões, simulados e provas.</p>
        </div>
        <button
          onClick={() => openCreate(selectedDate)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-smooth"
        >
          <Plus className="size-4" /> Nova tarefa
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <FilterChips
          value={view}
          onChange={setView}
          options={[
            { value: "dia", label: "Diário" },
            { value: "semana", label: "Semanal" },
            { value: "mes", label: "Mensal" },
          ]}
        />
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="size-9 rounded-lg border border-border grid place-items-center hover:bg-surface-2 transition-smooth">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={goToday} className="h-9 px-3 rounded-lg border border-border text-sm font-medium hover:bg-surface-2 transition-smooth">
            Hoje
          </button>
          <button onClick={goNext} className="size-9 rounded-lg border border-border grid place-items-center hover:bg-surface-2 transition-smooth">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {view === "mes" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-4">
            <p className="font-semibold text-foreground mb-4">
              {monthLabels[cursor.getMonth()]} {cursor.getFullYear()}
            </p>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted mb-2">
              {weekdayLabels.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day) => {
                const iso = toISODate(day);
                const inMonth = day.getMonth() === cursor.getMonth();
                const dayEvents = eventsByDate.get(iso) ?? [];
                return (
                  <button
                    key={iso}
                    onClick={() => setSelectedDate(iso)}
                    className={cn(
                      "aspect-square rounded-lg p-1.5 text-left flex flex-col gap-0.5 border transition-smooth",
                      selectedDate === iso ? "border-accent bg-accent-soft" : "border-transparent hover:bg-surface-2",
                      !inMonth && "opacity-35"
                    )}
                  >
                    <span
                      className={cn(
                        "text-xs font-semibold size-5 rounded-full grid place-items-center",
                        iso === todayIso && "bg-navy text-white"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <div className="flex flex-wrap gap-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} className="size-1.5 rounded-full bg-accent" />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card p-5">
            <p className="font-semibold text-foreground mb-4">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "long",
              })}
            </p>
            <div className="space-y-2">
              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-muted py-6 text-center">Nenhuma tarefa para este dia.</p>
              ) : (
                selectedDayEvents.map((event) => (
                  <EventItem
                    key={event.id}
                    event={event}
                    onToggleComplete={handleToggleComplete}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {view === "semana" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const iso = toISODate(day);
            const dayEvents = eventsByDate.get(iso) ?? [];
            return (
              <div key={iso} className={cn("card p-3", iso === todayIso && "ring-2 ring-accent/40")}>
                <button onClick={() => setSelectedDate(iso)} className="w-full text-left mb-2">
                  <p className="text-xs font-semibold text-muted">{weekdayLabels[day.getDay()]}</p>
                  <p className="text-sm font-bold text-foreground">{day.getDate()}</p>
                </button>
                <div className="space-y-1.5">
                  {dayEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => openEdit(event)}
                      className={cn(
                        "w-full text-left text-xs px-2 py-1.5 rounded-lg bg-accent-soft text-accent font-medium truncate",
                        event.completed && "opacity-50 line-through"
                      )}
                    >
                      {event.startTime} · {event.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "dia" && (
        <div className="max-w-xl card p-5">
          <p className="font-semibold text-foreground mb-4">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <div className="space-y-2">
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-muted py-6 text-center">Nenhuma tarefa para este dia.</p>
            ) : (
              selectedDayEvents.map((event) => (
                <EventItem
                  key={event.id}
                  event={event}
                  onToggleComplete={handleToggleComplete}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      )}

      <EventModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSave}
        initialEvent={editingEvent}
        defaultDate={selectedDate}
      />
    </div>
  );
}
