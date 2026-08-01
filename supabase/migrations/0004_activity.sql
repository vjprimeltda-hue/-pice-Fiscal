-- ============================================================================
-- 0004_activity.sql
-- Per-student activity: lesson progress, question attempts, favorites,
-- agenda events, notifications and daily study sessions (for the
-- dashboard's weekly/monthly charts and streaks).
-- ============================================================================

create table public.lesson_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  watched_seconds integer not null default 0 check (watched_seconds >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index lesson_progress_user_idx on public.lesson_progress (user_id);

create trigger set_lesson_progress_updated_at
  before update on public.lesson_progress
  for each row
  execute function public.set_updated_at();

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected_index integer not null check (selected_index >= 0),
  is_correct boolean not null,
  answered_at timestamptz not null default now()
);

create index question_attempts_user_idx on public.question_attempts (user_id);
create index question_attempts_question_idx on public.question_attempts (question_id);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content_id uuid not null,
  content_type public.favorite_content_type not null,
  created_at timestamptz not null default now(),
  unique (user_id, content_id, content_type)
);

create index favorites_user_idx on public.favorites (user_id);

create table public.agenda_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  date date not null,
  start_time time not null,
  end_time time,
  type public.event_type not null default 'estudo',
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index agenda_events_user_date_idx on public.agenda_events (user_id, date);

create trigger set_agenda_events_updated_at
  before update on public.agenda_events
  for each row
  execute function public.set_updated_at();

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade, -- null = broadcast to all
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_date date not null default current_date,
  minutes integer not null default 0 check (minutes >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, session_date)
);

create index study_sessions_user_idx on public.study_sessions (user_id);

alter table public.lesson_progress enable row level security;
alter table public.question_attempts enable row level security;
alter table public.favorites enable row level security;
alter table public.agenda_events enable row level security;
alter table public.notifications enable row level security;
alter table public.study_sessions enable row level security;
