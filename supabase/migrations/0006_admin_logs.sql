-- ============================================================================
-- 0006_admin_logs.sql
-- Audit trail for administrative actions taken from the admin panel.
-- ============================================================================

create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index admin_logs_admin_idx on public.admin_logs (admin_id);
create index admin_logs_created_idx on public.admin_logs (created_at desc);

alter table public.admin_logs enable row level security;
