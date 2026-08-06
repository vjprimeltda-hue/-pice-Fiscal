-- ============================================================================
-- 0011_billing_interval_unica.sql
-- Adds a one-time-payment interval, for plans sold as a single upfront
-- charge (e.g. "Acesso Vitalício" via Kirvano) rather than a recurring
-- subscription. Split into its own migration because Postgres forbids using
-- a freshly added enum value inside the same transaction that adds it.
-- ============================================================================

alter type public.billing_interval add value if not exists 'unica';
