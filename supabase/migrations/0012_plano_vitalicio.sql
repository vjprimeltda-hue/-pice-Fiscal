-- ============================================================================
-- 0012_plano_vitalicio.sql
-- Replaces the Mensal/Anual (Mercado Pago, recurring) plans with a single
-- one-time-payment plan sold via Kirvano. Old plans are deactivated rather
-- than deleted so existing subscriptions/payments keep a valid plan_id.
-- ============================================================================

update public.plans
set active = false
where id in (
  '33333333-3333-3333-3333-333333333301', -- Mensal
  '33333333-3333-3333-3333-333333333302'  -- Anual
);

insert into public.plans (name, description, price_cents, interval, kirvano_product_id, features, active)
values (
  'Acesso Vitalício',
  'Acesso completo e permanente à plataforma, pagamento único.',
  49700,
  'unica',
  'ab0a5899-2a86-4a78-a397-8cb2c4cb3814',
  '["Videoaulas ilimitadas", "Materiais em PDF", "Mapas mentais", "Banco de questões", "Suporte por e-mail", "Acesso vitalício, sem mensalidade"]'::jsonb,
  true
);
