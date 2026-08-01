/**
 * Real Supabase-backed data for the student dashboard — replaces the mock
 * progressService/activityService/coursesService from src/services/index.ts.
 * Every query runs under RLS as the logged-in student, so it only ever sees
 * (and can only ever see) their own rows.
 */
import { createClient } from "@/lib/supabase/client";
import type { Course, Progress, RecentActivity } from "@/types";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function startOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

async function requireUserId(supabase: ReturnType<typeof createClient>): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");
  return user.id;
}

export const progressService = {
  async get(): Promise<Progress> {
    const supabase = createClient();
    const userId = await requireUserId(supabase);

    const [
      profileRes,
      todaySessionRes,
      streakRes,
      weeklyRes,
      monthSessionsRes,
      completedLessonsCountRes,
      questionAttemptsCountRes,
      allLessonsRes,
      myCompletedLessonsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("daily_goal_hours").eq("id", userId).single(),
      supabase.from("study_sessions").select("minutes").eq("user_id", userId).eq("session_date", todayISO()).maybeSingle(),
      supabase.rpc("get_my_streak_days"),
      supabase.rpc("get_my_weekly_hours"),
      supabase.from("study_sessions").select("session_date, minutes").eq("user_id", userId).gte("session_date", startOfMonthISO()),
      supabase.from("lesson_progress").select("lesson_id", { count: "exact", head: true }).eq("user_id", userId).eq("completed", true),
      supabase.from("question_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("lessons").select("id, subject_id, subjects(name)").eq("published", true),
      supabase.from("lesson_progress").select("lesson_id").eq("user_id", userId).eq("completed", true),
    ]);

    const dailyGoalHours = Number(profileRes.data?.daily_goal_hours ?? 2);
    const hoursStudiedToday = (todaySessionRes.data?.minutes ?? 0) / 60;
    const streakDays = typeof streakRes.data === "number" ? streakRes.data : 0;

    const weekly = (weeklyRes.data ?? []).map((row: { day: string; hours: number }) => ({
      day: WEEKDAY_LABELS[new Date(`${row.day}T00:00:00`).getDay()],
      hours: Number(row.hours),
    }));

    const weekBuckets = new Map<number, number>();
    for (const session of monthSessionsRes.data ?? []) {
      const dayOfMonth = new Date(`${session.session_date}T00:00:00`).getDate();
      const bucket = Math.ceil(dayOfMonth / 7);
      weekBuckets.set(bucket, (weekBuckets.get(bucket) ?? 0) + session.minutes / 60);
    }
    const monthly = Array.from(weekBuckets.entries())
      .sort(([a], [b]) => a - b)
      .map(([week, hours]) => ({ week: `Sem ${week}`, hours: Math.round(hours * 10) / 10 }));

    type LessonWithSubject = { id: string; subject_id: string; subjects: { name: string } | null };
    const allLessons = (allLessonsRes.data ?? []) as unknown as LessonWithSubject[];
    const completedLessonIds = new Set((myCompletedLessonsRes.data ?? []).map((r) => r.lesson_id));

    const bySubjectTotals = new Map<string, { name: string; total: number; completed: number }>();
    for (const lesson of allLessons) {
      const key = lesson.subject_id;
      const entry = bySubjectTotals.get(key) ?? { name: lesson.subjects?.name ?? "—", total: 0, completed: 0 };
      entry.total += 1;
      if (completedLessonIds.has(lesson.id)) entry.completed += 1;
      bySubjectTotals.set(key, entry);
    }
    const bySubject = Array.from(bySubjectTotals.values()).map((s) => ({
      subject: s.name,
      percent: s.total === 0 ? 0 : Math.round((s.completed / s.total) * 100),
    }));

    return {
      userId,
      hoursStudiedToday,
      dailyGoalHours,
      streakDays,
      contentsCompleted: completedLessonsCountRes.count ?? 0,
      questionsAnswered: questionAttemptsCountRes.count ?? 0,
      weekly,
      monthly,
      bySubject,
    };
  },
};

export const activityService = {
  async list(): Promise<RecentActivity[]> {
    const supabase = createClient();
    const userId = await requireUserId(supabase);

    const [lessonsRes, attemptsRes] = await Promise.all([
      supabase
        .from("lesson_progress")
        .select("lesson_id, completed_at, lessons(title, professor, subjects(name))")
        .eq("user_id", userId)
        .eq("completed", true)
        .order("completed_at", { ascending: false })
        .limit(5),
      supabase
        .from("question_attempts")
        .select("id, answered_at, is_correct, questions(statement, subjects(name))")
        .eq("user_id", userId)
        .order("answered_at", { ascending: false })
        .limit(5),
    ]);

    type LessonActivityRow = {
      lesson_id: string;
      completed_at: string | null;
      lessons: { title: string; professor: string; subjects: { name: string } | null } | null;
    };
    type AttemptActivityRow = {
      id: string;
      answered_at: string;
      is_correct: boolean;
      questions: { statement: string; subjects: { name: string } | null } | null;
    };

    const lessonActivities: RecentActivity[] = ((lessonsRes.data ?? []) as unknown as LessonActivityRow[])
      .filter((r) => r.lessons && r.completed_at)
      .map((r) => ({
        id: `lesson-${r.lesson_id}`,
        type: "video",
        title: r.lessons!.title,
        subtitle: `${r.lessons!.subjects?.name ?? "—"} · ${r.lessons!.professor}`,
        date: r.completed_at!,
      }));

    const attemptActivities: RecentActivity[] = ((attemptsRes.data ?? []) as unknown as AttemptActivityRow[])
      .filter((r) => r.questions)
      .map((r) => ({
        id: `attempt-${r.id}`,
        type: "questoes",
        title: r.questions!.statement.length > 70 ? `${r.questions!.statement.slice(0, 70)}…` : r.questions!.statement,
        subtitle: `${r.questions!.subjects?.name ?? "—"} · ${r.is_correct ? "Acertou" : "Errou"}`,
        date: r.answered_at,
      }));

    return [...lessonActivities, ...attemptActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  },
};

export const coursesService = {
  async list(): Promise<Course[]> {
    const supabase = createClient();
    await requireUserId(supabase);

    const { data, error } = await supabase.rpc("get_my_course_progress");
    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.course_id,
      name: row.course_name,
      subjectIds: [],
      progressPercent: Math.round(Number(row.progress_percent)),
      lastLessonTitle: row.last_lesson_title ?? "Nenhuma aula concluída ainda",
      totalLessons: Number(row.total_lessons),
      completedLessons: Number(row.completed_lessons),
    }));
  },
};
