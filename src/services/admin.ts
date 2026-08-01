/**
 * Admin-only data access. Every call here relies on RLS: the Supabase client
 * carries the logged-in admin's session, and the `*_admin_write` policies in
 * supabase/migrations/0008_rls_policies.sql check public.is_admin() — a
 * non-admin session gets a permission-denied error straight from Postgres,
 * regardless of what the UI shows.
 */
import { createClient } from "@/lib/supabase/client";
import type { Database, AppRole, MaterialType, QuestionDifficulty, EventType } from "@/types/database";

type Tables = Database["public"]["Tables"];

const supabase = () => createClient();

async function logAction(action: string, targetTable?: string, targetId?: string, details?: Record<string, unknown>) {
  const db = supabase();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return;
  await db.from("admin_logs").insert({
    admin_id: user.id,
    action,
    target_table: targetTable,
    target_id: targetId,
    details,
  });
}

// ---------------------------------------------------------------------------
// Overview / stats
// ---------------------------------------------------------------------------
export const adminStatsService = {
  async getOverview() {
    const db = supabase();
    const [users, activeSubs, lessons, materials, questions, payments] = await Promise.all([
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("subscriptions").select("id", { count: "exact", head: true }).in("status", ["active", "authorized"]),
      db.from("lessons").select("id", { count: "exact", head: true }),
      db.from("materials").select("id", { count: "exact", head: true }),
      db.from("questions").select("id", { count: "exact", head: true }),
      db
        .from("payments")
        .select("amount_cents, paid_at")
        .eq("status", "approved")
        .gte("paid_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    ]);

    const revenueCentsThisMonth = (payments.data ?? []).reduce((sum, p) => sum + p.amount_cents, 0);

    return {
      totalUsers: users.count ?? 0,
      activeSubscriptions: activeSubs.count ?? 0,
      totalLessons: lessons.count ?? 0,
      totalMaterials: materials.count ?? 0,
      totalQuestions: questions.count ?? 0,
      revenueCentsThisMonth,
    };
  },
};

// ---------------------------------------------------------------------------
// Subjects
// ---------------------------------------------------------------------------
export const adminSubjectsService = {
  async list() {
    const { data, error } = await supabase().from("subjects").select("*").order("order", { ascending: true });
    if (error) throw error;
    return data;
  },
  async create(input: Tables["subjects"]["Insert"]) {
    const { data, error } = await supabase().from("subjects").insert(input).select("*").single();
    if (error) throw error;
    await logAction("create_subject", "subjects", data.id, { name: data.name });
    return data;
  },
  async update(id: string, input: Tables["subjects"]["Update"]) {
    const { data, error } = await supabase().from("subjects").update(input).eq("id", id).select("*").single();
    if (error) throw error;
    await logAction("update_subject", "subjects", id);
    return data;
  },
  async remove(id: string) {
    const { error } = await supabase().from("subjects").delete().eq("id", id);
    if (error) throw error;
    await logAction("delete_subject", "subjects", id);
  },
};

// ---------------------------------------------------------------------------
// Courses (+ subject links)
// ---------------------------------------------------------------------------
export const adminCoursesService = {
  async list() {
    const { data, error } = await supabase()
      .from("courses")
      .select("*, course_subjects(subject_id)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async create(input: Tables["courses"]["Insert"], subjectIds: string[]) {
    const { data, error } = await supabase().from("courses").insert(input).select("*").single();
    if (error) throw error;
    if (subjectIds.length) {
      const { error: linkError } = await supabase()
        .from("course_subjects")
        .insert(subjectIds.map((subject_id) => ({ course_id: data.id, subject_id })));
      if (linkError) throw linkError;
    }
    await logAction("create_course", "courses", data.id, { name: data.name });
    return data;
  },
  async update(id: string, input: Tables["courses"]["Update"], subjectIds: string[]) {
    const { data, error } = await supabase().from("courses").update(input).eq("id", id).select("*").single();
    if (error) throw error;

    const { error: deleteError } = await supabase().from("course_subjects").delete().eq("course_id", id);
    if (deleteError) throw deleteError;
    if (subjectIds.length) {
      const { error: linkError } = await supabase()
        .from("course_subjects")
        .insert(subjectIds.map((subject_id) => ({ course_id: id, subject_id })));
      if (linkError) throw linkError;
    }
    await logAction("update_course", "courses", id);
    return data;
  },
  async remove(id: string) {
    const { error } = await supabase().from("courses").delete().eq("id", id);
    if (error) throw error;
    await logAction("delete_course", "courses", id);
  },
};

// ---------------------------------------------------------------------------
// Lessons (videoaulas)
// ---------------------------------------------------------------------------
export const adminLessonsService = {
  async list() {
    const { data, error } = await supabase()
      .from("lessons")
      .select("*, subjects(name), courses(name)")
      .order("order", { ascending: true });
    if (error) throw error;
    return data;
  },
  async create(input: Tables["lessons"]["Insert"]) {
    const { data, error } = await supabase().from("lessons").insert(input).select("*").single();
    if (error) throw error;
    await logAction("create_lesson", "lessons", data.id, { title: data.title });
    return data;
  },
  async update(id: string, input: Tables["lessons"]["Update"]) {
    const { data, error } = await supabase().from("lessons").update(input).eq("id", id).select("*").single();
    if (error) throw error;
    await logAction("update_lesson", "lessons", id);
    return data;
  },
  async remove(id: string) {
    const { error } = await supabase().from("lessons").delete().eq("id", id);
    if (error) throw error;
    await logAction("delete_lesson", "lessons", id);
  },
};

// ---------------------------------------------------------------------------
// Materials (PDFs / mapas mentais)
// ---------------------------------------------------------------------------
export const adminMaterialsService = {
  async list() {
    const { data, error } = await supabase()
      .from("materials")
      .select("*, subjects(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async create(input: Tables["materials"]["Insert"]) {
    const { data, error } = await supabase().from("materials").insert(input).select("*").single();
    if (error) throw error;
    await logAction("create_material", "materials", data.id, { name: data.name });
    return data;
  },
  async update(id: string, input: Tables["materials"]["Update"]) {
    const { data, error } = await supabase().from("materials").update(input).eq("id", id).select("*").single();
    if (error) throw error;
    await logAction("update_material", "materials", id);
    return data;
  },
  async remove(id: string) {
    const { error } = await supabase().from("materials").delete().eq("id", id);
    if (error) throw error;
    await logAction("delete_material", "materials", id);
  },
};

// ---------------------------------------------------------------------------
// Questions (banco de questões)
// ---------------------------------------------------------------------------
export const adminQuestionsService = {
  async list() {
    const { data, error } = await supabase()
      .from("questions")
      .select("*, subjects(name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async create(input: Tables["questions"]["Insert"]) {
    const { data, error } = await supabase().from("questions").insert(input).select("*").single();
    if (error) throw error;
    await logAction("create_question", "questions", data.id);
    return data;
  },
  async update(id: string, input: Tables["questions"]["Update"]) {
    const { data, error } = await supabase().from("questions").update(input).eq("id", id).select("*").single();
    if (error) throw error;
    await logAction("update_question", "questions", id);
    return data;
  },
  async remove(id: string) {
    const { error } = await supabase().from("questions").delete().eq("id", id);
    if (error) throw error;
    await logAction("delete_question", "questions", id);
  },
};

// ---------------------------------------------------------------------------
// Users (profiles) + role management
// ---------------------------------------------------------------------------
export const adminUsersService = {
  async list() {
    const { data, error } = await supabase().from("profiles").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async setRole(id: string, role: AppRole) {
    const { data, error } = await supabase().from("profiles").update({ role }).eq("id", id).select("*").single();
    if (error) throw error;
    await logAction("set_user_role", "profiles", id, { role });
    return data;
  },
};

// ---------------------------------------------------------------------------
// Subscriptions & payments (read-only here; writes happen via Edge Functions
// synced with Mercado Pago — see Fase 5)
// ---------------------------------------------------------------------------
export const adminBillingService = {
  async listSubscriptions() {
    const { data, error } = await supabase()
      .from("subscriptions")
      .select("*, profiles(name, email), plans(name, price_cents, interval)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
  async listPayments() {
    const { data, error } = await supabase()
      .from("payments")
      .select("*, profiles(name, email)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data;
  },
  async listPlans() {
    const { data, error } = await supabase().from("plans").select("*").order("price_cents", { ascending: true });
    if (error) throw error;
    return data;
  },
};

// ---------------------------------------------------------------------------
// Notifications (broadcast or targeted)
// ---------------------------------------------------------------------------
export const adminNotificationsService = {
  async list() {
    const { data, error } = await supabase()
      .from("notifications")
      .select("*, profiles(name)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data;
  },
  async send(input: { title: string; message: string; userId?: string }) {
    const { data, error } = await supabase()
      .from("notifications")
      .insert({ title: input.title, message: input.message, user_id: input.userId ?? null })
      .select("*")
      .single();
    if (error) throw error;
    await logAction("send_notification", "notifications", data.id, { broadcast: !input.userId });
    return data;
  },
};

export type { AppRole, MaterialType, QuestionDifficulty, EventType };
