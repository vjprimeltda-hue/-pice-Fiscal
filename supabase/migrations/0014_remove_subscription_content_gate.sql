-- ============================================================================
-- 0014_remove_subscription_content_gate.sql
-- Reverts 0013_gate_content_by_subscription.sql: lessons/materials/questions
-- go back to being readable by any authenticated user once published,
-- without checking public.has_active_subscription(). Product decision:
-- billing enforcement is not live yet, so the subscription check was only
-- locking real students (with no subscription row) out of published content.
-- ============================================================================

drop policy "lessons_read_published_or_admin" on public.lessons;
create policy "lessons_read_published_or_admin"
  on public.lessons for select to authenticated
  using (published or public.is_admin());

drop policy "materials_read_published_or_admin" on public.materials;
create policy "materials_read_published_or_admin"
  on public.materials for select to authenticated
  using (published or public.is_admin());

drop policy "questions_read_published_or_admin" on public.questions;
create policy "questions_read_published_or_admin"
  on public.questions for select to authenticated
  using (published or public.is_admin());
