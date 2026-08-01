-- ============================================================================
-- 0002_profiles.sql
-- Public profile row mirrored 1:1 with auth.users, holding app-specific data.
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  avatar_url text,
  city text,
  state text,
  goal text,
  target_exam text,
  role public.app_role not null default 'aluno',
  daily_goal_hours numeric(4, 2) not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Application profile data for each auth.users row.';

create index profiles_role_idx on public.profiles (role);

alter table public.profiles enable row level security;

-- ----------------------------------------------------------------------------
-- updated_at trigger helper (reused by every table with an updated_at column)
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- is_admin() helper used throughout RLS policies. SECURITY DEFINER + a fixed
-- search_path avoids recursive-RLS lookups and search_path hijacking.
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------------------
-- handle_new_user(): creates the profile row automatically when a user signs
-- up via Supabase Auth (email/password, magic link, OAuth, etc.).
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
