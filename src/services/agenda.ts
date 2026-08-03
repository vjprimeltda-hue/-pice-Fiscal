/**
 * Real Supabase-backed agenda (calendário) — replaces the mock agendaService
 * from src/data/mock.ts. Every event is owned by the logged-in student (RLS
 * enforces user_id = auth.uid()).
 */
import { createClient } from "@/lib/supabase/client";
import type { AgendaEvent } from "@/types";

async function requireUserId(supabase: ReturnType<typeof createClient>): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");
  return user.id;
}

function fromRow(row: {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string | null;
  type: AgendaEvent["type"];
  completed: boolean;
  notes: string | null;
}): AgendaEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time ?? undefined,
    type: row.type,
    completed: row.completed,
    notes: row.notes ?? undefined,
  };
}

export const agendaService = {
  async list(): Promise<AgendaEvent[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from("agenda_events").select("*").order("date", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(fromRow);
  },

  async create(input: Omit<AgendaEvent, "id" | "completed">): Promise<AgendaEvent> {
    const supabase = createClient();
    const userId = await requireUserId(supabase);
    const { data, error } = await supabase
      .from("agenda_events")
      .insert({
        user_id: userId,
        title: input.title,
        date: input.date,
        start_time: input.startTime,
        end_time: input.endTime ?? null,
        type: input.type,
        notes: input.notes ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  async update(id: string, input: Omit<AgendaEvent, "id" | "completed">): Promise<AgendaEvent> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("agenda_events")
      .update({
        title: input.title,
        date: input.date,
        start_time: input.startTime,
        end_time: input.endTime ?? null,
        type: input.type,
        notes: input.notes ?? null,
      })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return fromRow(data);
  },

  async setCompleted(id: string, completed: boolean): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("agenda_events").update({ completed }).eq("id", id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("agenda_events").delete().eq("id", id);
    if (error) throw error;
  },
};
