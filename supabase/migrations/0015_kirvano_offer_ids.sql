-- ============================================================================
-- 0015_kirvano_offer_ids.sql
-- kirvano_product_id only ever matched ONE Kirvano offer per plan, but a
-- single plan can be sold through multiple Kirvano offers (e.g. the "TESTE"
-- offer used for manual QA purchases, in addition to the real sale offer).
-- Replaces it with an array so kirvano-webhook can match a sale against any
-- offer linked to a plan.
-- ============================================================================

alter table public.plans
  add column kirvano_offer_ids text[] not null default '{}';

update public.plans
  set kirvano_offer_ids = array[kirvano_product_id]
  where kirvano_product_id is not null;

-- Links the "TESTE" Kirvano offer (offer_id 760d9e65-0c51-4c45-b9bd-ea5c119b7494,
-- used for the 2026-08-19 manual test purchase) to Acesso Vitalício, so test
-- sales through it grant access the same way a real sale would.
update public.plans
  set kirvano_offer_ids = array_append(kirvano_offer_ids, '760d9e65-0c51-4c45-b9bd-ea5c119b7494')
  where id = 'dd74ea6b-1f32-4749-aae3-7bdaafc26054'
    and not ('760d9e65-0c51-4c45-b9bd-ea5c119b7494' = any(kirvano_offer_ids));

alter table public.plans
  drop column kirvano_product_id;
