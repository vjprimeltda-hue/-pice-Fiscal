-- ============================================================================
-- 0003_content.sql
-- Study content: subjects, courses, lessons (videoaulas), materials (pdfs /
-- mapas mentais), and questions (banco de questões).
-- ============================================================================

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  color text,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_subjects_updated_at
  before update on public.subjects
  for each row
  execute function public.set_updated_at();

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_courses_updated_at
  before update on public.courses
  for each row
  execute function public.set_updated_at();

create table public.course_subjects (
  course_id uuid not null references public.courses (id) on delete cascade,
  subject_id uuid not null references public.subjects (id) on delete cascade,
  primary key (course_id, subject_id)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  description text,
  professor text not null,
  video_url text not null,
  video_provider text not null default 'external' check (video_provider in ('external', 'storage', 'mux', 'youtube', 'vimeo')),
  thumbnail_url text,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  "order" integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lessons_subject_idx on public.lessons (subject_id);
create index lessons_course_idx on public.lessons (course_id);

create trigger set_lessons_updated_at
  before update on public.lessons
  for each row
  execute function public.set_updated_at();

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  name text not null,
  description text,
  type public.material_type not null,
  file_path text not null, -- path inside the 'materials' storage bucket
  size_kb integer not null default 0 check (size_kb >= 0),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index materials_subject_idx on public.materials (subject_id);
create index materials_type_idx on public.materials (type);

create trigger set_materials_updated_at
  before update on public.materials
  for each row
  execute function public.set_updated_at();

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects (id) on delete cascade,
  statement text not null,
  options jsonb not null,
  correct_index integer not null check (correct_index >= 0),
  explanation text,
  difficulty public.question_difficulty not null default 'medio',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint questions_options_is_array check (jsonb_typeof(options) = 'array')
);

create index questions_subject_idx on public.questions (subject_id);
create index questions_difficulty_idx on public.questions (difficulty);

create trigger set_questions_updated_at
  before update on public.questions
  for each row
  execute function public.set_updated_at();

alter table public.subjects enable row level security;
alter table public.courses enable row level security;
alter table public.course_subjects enable row level security;
alter table public.lessons enable row level security;
alter table public.materials enable row level security;
alter table public.questions enable row level security;
