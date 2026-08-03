/**
 * Real Supabase-backed data for the student-facing catalog (matérias,
 * videoaulas, materiais, questões, notificações) — replaces the mock
 * subjectsService/lessonsService/materialsService/questionsService/
 * notificationsService from src/data/mock.ts. RLS scopes every query to
 * published content (plus the caller's own notifications).
 */
import { createClient } from "@/lib/supabase/client";
import { getMaterialSignedUrl, getMaterialSignedDownloadUrl } from "@/lib/supabase/storage";
import type { Lesson, Material, Notification, Question, Subject } from "@/types";

async function currentUserId(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const subjectsService = {
  async list(): Promise<Subject[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from("subjects").select("*").order("order", { ascending: true });
    if (error) throw error;
    return (data ?? []).map((s) => ({ id: s.id, name: s.name, icon: s.icon ?? undefined, color: s.color ?? undefined }));
  },
};

export const lessonsService = {
  async list(): Promise<Lesson[]> {
    const supabase = createClient();
    const userId = await currentUserId(supabase);

    const [lessonsRes, progressRes] = await Promise.all([
      supabase.from("lessons").select("*").eq("published", true).order("order", { ascending: true }),
      userId
        ? supabase.from("lesson_progress").select("lesson_id, completed").eq("user_id", userId)
        : Promise.resolve({ data: [], error: null } as const),
    ]);
    if (lessonsRes.error) throw lessonsRes.error;
    if (progressRes.error) throw progressRes.error;

    const completedIds = new Set((progressRes.data ?? []).filter((p) => p.completed).map((p) => p.lesson_id));

    return (lessonsRes.data ?? []).map((l) => ({
      id: l.id,
      subjectId: l.subject_id,
      title: l.title,
      professor: l.professor,
      durationMinutes: l.duration_minutes,
      thumbnailUrl: l.thumbnail_url ?? "",
      order: l.order,
      completed: completedIds.has(l.id),
      favorited: false,
    }));
  },

  /** Marks a lesson as watched/unwatched for the current student. */
  async setCompleted(lessonId: string, completed: boolean): Promise<void> {
    const supabase = createClient();
    const userId = await currentUserId(supabase);
    if (!userId) throw new Error("Usuário não autenticado.");
    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        { user_id: userId, lesson_id: lessonId, completed, completed_at: completed ? new Date().toISOString() : null },
        { onConflict: "user_id,lesson_id" }
      );
    if (error) throw error;
  },

  async getVideoUrl(lessonId: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.from("lessons").select("video_url").eq("id", lessonId).single();
    if (error || !data) throw error ?? new Error("Aula não encontrada.");
    return data.video_url;
  },
};

export const materialsService = {
  async list(): Promise<Material[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from("materials").select("*").eq("published", true).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((m) => ({
      id: m.id,
      subjectId: m.subject_id,
      name: m.name,
      type: m.type,
      sizeKb: m.size_kb,
      favorited: false,
      updatedAt: m.updated_at,
    }));
  },

  async getSignedUrl(materialId: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.from("materials").select("file_path").eq("id", materialId).single();
    if (error || !data) throw error ?? new Error("Material não encontrado.");
    return getMaterialSignedUrl(data.file_path);
  },

  async getSignedDownloadUrl(materialId: string, fileName: string): Promise<string> {
    const supabase = createClient();
    const { data, error } = await supabase.from("materials").select("file_path").eq("id", materialId).single();
    if (error || !data) throw error ?? new Error("Material não encontrado.");
    return getMaterialSignedDownloadUrl(data.file_path, fileName);
  },
};

export const questionsService = {
  async list(): Promise<Question[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from("questions").select("*").eq("published", true).order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((q) => ({
      id: q.id,
      subjectId: q.subject_id,
      statement: q.statement,
      options: q.options,
      correctIndex: q.correct_index,
      difficulty: q.difficulty,
      favorited: false,
    }));
  },

  /** Records a student's answer for dashboard stats/history. */
  async recordAttempt(questionId: string, selectedIndex: number, isCorrect: boolean): Promise<void> {
    const supabase = createClient();
    const userId = await currentUserId(supabase);
    if (!userId) throw new Error("Usuário não autenticado.");
    const { error } = await supabase
      .from("question_attempts")
      .insert({ user_id: userId, question_id: questionId, selected_index: selectedIndex, is_correct: isCorrect });
    if (error) throw error;
  },
};

export const notificationsService = {
  async list(): Promise<Notification[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      createdAt: n.created_at,
      read: n.read,
    }));
  },

  /** Only a user's own targeted notifications can be marked read — broadcasts
   * (user_id null) are shared rows and RLS blocks non-admins from updating them. */
  async markAllRead(): Promise<void> {
    const supabase = createClient();
    const userId = await currentUserId(supabase);
    if (!userId) return;
    const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false).eq("user_id", userId);
    if (error) throw error;
  },
};
