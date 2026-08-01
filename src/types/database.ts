/**
 * Hand-written mirror of the Supabase schema (supabase/migrations/*.sql).
 * Regenerate with the CLI once the project is linked, and this file can be
 * replaced by the generated output without touching call sites:
 *
 *   supabase gen types typescript --linked > src/types/database.ts
 */

export type AppRole = "aluno" | "admin";
export type MaterialType = "pdf" | "mapa-mental" | "resumo" | "lei" | "exercicios";
export type QuestionDifficulty = "facil" | "medio" | "dificil";
export type EventType = "estudo" | "revisao" | "simulado" | "prova" | "outro";
export type FavoriteContentType = "video" | "pdf" | "exercicio" | "mapa-mental";
export type SubscriptionStatus = "pending" | "authorized" | "active" | "paused" | "cancelled" | "expired";
export type PaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";
export type BillingInterval = "monthly" | "quarterly" | "yearly";

type Table<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type ProfileRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  goal: string | null;
  target_exam: string | null;
  role: AppRole;
  daily_goal_hours: number;
  created_at: string;
  updated_at: string;
};

type SubjectRow = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  order: number;
  created_at: string;
  updated_at: string;
};

type CourseRow = {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
};

type CourseSubjectRow = { course_id: string; subject_id: string };

type LessonRow = {
  id: string;
  subject_id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  professor: string;
  video_url: string;
  video_provider: "external" | "storage" | "mux" | "youtube" | "vimeo";
  thumbnail_url: string | null;
  duration_minutes: number;
  order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type MaterialRow = {
  id: string;
  subject_id: string;
  name: string;
  description: string | null;
  type: MaterialType;
  file_path: string;
  size_kb: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type QuestionRow = {
  id: string;
  subject_id: string;
  statement: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  difficulty: QuestionDifficulty;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type LessonProgressRow = {
  user_id: string;
  lesson_id: string;
  completed: boolean;
  watched_seconds: number;
  completed_at: string | null;
  updated_at: string;
};

type QuestionAttemptRow = {
  id: string;
  user_id: string;
  question_id: string;
  selected_index: number;
  is_correct: boolean;
  answered_at: string;
};

type FavoriteRow = {
  id: string;
  user_id: string;
  content_id: string;
  content_type: FavoriteContentType;
  created_at: string;
};

type AgendaEventRow = {
  id: string;
  user_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string | null;
  type: EventType;
  completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type NotificationRow = {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

type StudySessionRow = {
  id: string;
  user_id: string;
  session_date: string;
  minutes: number;
  created_at: string;
};

type PlanRow = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  interval: BillingInterval;
  mercado_pago_plan_id: string | null;
  features: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  mercado_pago_subscription_id: string | null;
  mercado_pago_payer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

type PaymentRow = {
  id: string;
  subscription_id: string | null;
  user_id: string;
  mercado_pago_payment_id: string | null;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  raw_payload: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
};

type AdminLogRow = {
  id: string;
  admin_id: string;
  action: string;
  target_table: string | null;
  target_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Partial<ProfileRow> & { id: string; name: string; email: string }>;
      subjects: Table<SubjectRow, Partial<SubjectRow> & { name: string }>;
      courses: Table<CourseRow, Partial<CourseRow> & { name: string }>;
      course_subjects: Table<CourseSubjectRow, CourseSubjectRow>;
      lessons: Table<
        LessonRow,
        Partial<LessonRow> & { subject_id: string; title: string; professor: string; video_url: string }
      >;
      materials: Table<
        MaterialRow,
        Partial<MaterialRow> & { subject_id: string; name: string; type: MaterialType; file_path: string }
      >;
      questions: Table<
        QuestionRow,
        Partial<QuestionRow> & { subject_id: string; statement: string; options: string[]; correct_index: number }
      >;
      lesson_progress: Table<LessonProgressRow, Partial<LessonProgressRow> & { user_id: string; lesson_id: string }>;
      question_attempts: Table<
        QuestionAttemptRow,
        Partial<QuestionAttemptRow> & {
          user_id: string;
          question_id: string;
          selected_index: number;
          is_correct: boolean;
        }
      >;
      favorites: Table<
        FavoriteRow,
        Partial<FavoriteRow> & { user_id: string; content_id: string; content_type: FavoriteContentType }
      >;
      agenda_events: Table<
        AgendaEventRow,
        Partial<AgendaEventRow> & { user_id: string; title: string; date: string; start_time: string }
      >;
      notifications: Table<NotificationRow, Partial<NotificationRow> & { title: string; message: string }>;
      study_sessions: Table<StudySessionRow, Partial<StudySessionRow> & { user_id: string }>;
      plans: Table<PlanRow, Partial<PlanRow> & { name: string; price_cents: number }>;
      subscriptions: Table<SubscriptionRow, Partial<SubscriptionRow> & { user_id: string; plan_id: string }>;
      payments: Table<PaymentRow, Partial<PaymentRow> & { user_id: string; amount_cents: number }>;
      admin_logs: Table<AdminLogRow, Partial<AdminLogRow> & { admin_id: string; action: string }>;
    };
    Views: Record<string, never>;
    Functions: {
      get_my_course_progress: {
        Args: Record<string, never>;
        Returns: {
          course_id: string;
          course_name: string;
          total_lessons: number;
          completed_lessons: number;
          progress_percent: number;
          last_lesson_title: string | null;
        }[];
      };
      get_my_streak_days: {
        Args: Record<string, never>;
        Returns: number;
      };
      get_my_weekly_hours: {
        Args: Record<string, never>;
        Returns: { day: string; hours: number }[];
      };
      log_study_minutes: {
        Args: { p_minutes: number };
        Returns: undefined;
      };
    };
  };
}
