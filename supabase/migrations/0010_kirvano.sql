-- ============================================================================
-- 0010_kirvano.sql
-- Adds Kirvano as a second checkout provider alongside Mercado Pago. Unlike
-- Mercado Pago (where the user already has an account before subscribing),
-- Kirvano sales happen on an external checkout page with no prior signup —
-- the kirvano-webhook Edge Function creates the account (via Supabase Auth
-- invite) and the subscription together when a sale is approved.
-- ============================================================================

-- Links a plan to the corresponding Kirvano product/offer, so the webhook
-- can resolve which plan a sale belongs to.
alter table public.plans
  add column kirvano_product_id text unique;

alter table public.subscriptions
  add column kirvano_sale_id text unique;

alter table public.payments
  add column kirvano_transaction_id text unique;
