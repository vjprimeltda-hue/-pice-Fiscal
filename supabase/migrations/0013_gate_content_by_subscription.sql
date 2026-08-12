-- ============================================================================
-- 0013_gate_content_by_subscription.sql
-- lessons/materials/questions were readable by any authenticated user once
-- published, with no check on public.has_active_subscription() despite that
-- function existing since 0005_billing.sql specifically to gate premium
-- content. Combined with public self-signup, this let anyone read all paid
-- content for free. Now requires an active subscription (or admin).
-- ============================================================================

drop policy "lessons_read_published_or_admin" on public.lessons;
create policy "lessons_read_published_or_admin"
  on public.lessons for select to authenticated
  using ((published and public.has_active_subscription(auth.uid())) or public.is_admin());

drop policy "materials_read_published_or_admin" on public.materials;
create policy "materials_read_published_or_admin"
  on public.materials for select to authenticated
  using ((published and public.has_active_subscription(auth.uid())) or public.is_admin());

drop policy "questions_read_published_or_admin" on public.questions;
create policy "questions_read_published_or_admin"
  on public.questions for select to authenticated
  using ((published and public.has_active_subscription(auth.uid())) or public.is_admin());
