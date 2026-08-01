-- ============================================================================
-- 0005_billing.sql
-- Subscription plans, subscriptions and payments, synced with Mercado Pago
-- via the mercadopago-webhook Edge Function.
-- ============================================================================

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  interval public.billing_interval not null default 'monthly',
  mercado_pago_plan_id text, -- preapproval_plan id in Mercado Pago
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_plans_updated_at
  before update on public.plans
  for each row
  execute function public.set_updated_at();

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status public.subscription_status not null default 'pending',
  mercado_pago_subscription_id text unique, -- preapproval id
  mercado_pago_payer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_idx on public.subscriptions (user_id);
create index subscriptions_status_idx on public.subscriptions (status);
create unique index subscriptions_one_active_per_user
  on public.subscriptions (user_id)
  where status in ('active', 'authorized', 'pending');

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  mercado_pago_payment_id text unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'BRL',
  status public.payment_status not null default 'pending',
  payment_method text,
  raw_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_user_idx on public.payments (user_id);
create index payments_subscription_idx on public.payments (subscription_id);
create index payments_status_idx on public.payments (status);

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;

-- ----------------------------------------------------------------------------
-- has_active_subscription(): true when the given user has a currently valid
-- subscription. Used to gate premium content in RLS policies.
-- ----------------------------------------------------------------------------
create or replace function public.has_active_subscription(check_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = check_user_id
      and status in ('active', 'authorized')
      and (current_period_end is null or current_period_end > now())
  );
$$;
