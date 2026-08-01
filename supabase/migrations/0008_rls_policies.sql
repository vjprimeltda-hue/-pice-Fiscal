-- ============================================================================
-- 0008_rls_policies.sql
-- Row Level Security policies for every application table.
-- Convention: students can read/manage their own rows; admins (public.is_admin())
-- can read/manage everything.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
create policy "profiles_select_own_or_admin"
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Row creation happens exclusively via the handle_new_user() trigger
-- (SECURITY DEFINER), so no insert policy is granted to regular clients.
create policy "profiles_admin_insert"
  on public.profiles for insert to authenticated
  with check (public.is_admin());

create policy "profiles_admin_delete"
  on public.profiles for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- subjects / courses / course_subjects: published catalog, readable by any
-- authenticated user, writable only by admins.
-- ----------------------------------------------------------------------------
create policy "subjects_read_authenticated"
  on public.subjects for select to authenticated
  using (true);

create policy "subjects_admin_write"
  on public.subjects for insert to authenticated
  with check (public.is_admin());

create policy "subjects_admin_update"
  on public.subjects for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "subjects_admin_delete"
  on public.subjects for delete to authenticated
  using (public.is_admin());

create policy "courses_read_authenticated"
  on public.courses for select to authenticated
  using (true);

create policy "courses_admin_write"
  on public.courses for insert to authenticated
  with check (public.is_admin());

create policy "courses_admin_update"
  on public.courses for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "courses_admin_delete"
  on public.courses for delete to authenticated
  using (public.is_admin());

create policy "course_subjects_read_authenticated"
  on public.course_subjects for select to authenticated
  using (true);

create policy "course_subjects_admin_write"
  on public.course_subjects for insert to authenticated
  with check (public.is_admin());

create policy "course_subjects_admin_delete"
  on public.course_subjects for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- lessons: readable by any authenticated user when published; admins see and
-- manage everything (including drafts).
-- ----------------------------------------------------------------------------
create policy "lessons_read_published_or_admin"
  on public.lessons for select to authenticated
  using (published or public.is_admin());

create policy "lessons_admin_write"
  on public.lessons for insert to authenticated
  with check (public.is_admin());

create policy "lessons_admin_update"
  on public.lessons for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "lessons_admin_delete"
  on public.lessons for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- materials
-- ----------------------------------------------------------------------------
create policy "materials_read_published_or_admin"
  on public.materials for select to authenticated
  using (published or public.is_admin());

create policy "materials_admin_write"
  on public.materials for insert to authenticated
  with check (public.is_admin());

create policy "materials_admin_update"
  on public.materials for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "materials_admin_delete"
  on public.materials for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- questions
-- ----------------------------------------------------------------------------
create policy "questions_read_published_or_admin"
  on public.questions for select to authenticated
  using (published or public.is_admin());

create policy "questions_admin_write"
  on public.questions for insert to authenticated
  with check (public.is_admin());

create policy "questions_admin_update"
  on public.questions for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "questions_admin_delete"
  on public.questions for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- lesson_progress: owner-only, admin can read all for analytics.
-- ----------------------------------------------------------------------------
create policy "lesson_progress_select_own_or_admin"
  on public.lesson_progress for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "lesson_progress_insert_own"
  on public.lesson_progress for insert to authenticated
  with check (user_id = auth.uid());

create policy "lesson_progress_update_own"
  on public.lesson_progress for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "lesson_progress_delete_own_or_admin"
  on public.lesson_progress for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- question_attempts: owner inserts/reads own history; admin reads all.
-- ----------------------------------------------------------------------------
create policy "question_attempts_select_own_or_admin"
  on public.question_attempts for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "question_attempts_insert_own"
  on public.question_attempts for insert to authenticated
  with check (user_id = auth.uid());

-- Attempts are immutable once recorded; only admins may prune them.
create policy "question_attempts_delete_admin"
  on public.question_attempts for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- favorites: fully owner-managed.
-- ----------------------------------------------------------------------------
create policy "favorites_select_own_or_admin"
  on public.favorites for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "favorites_insert_own"
  on public.favorites for insert to authenticated
  with check (user_id = auth.uid());

create policy "favorites_delete_own_or_admin"
  on public.favorites for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- agenda_events: fully owner-managed.
-- ----------------------------------------------------------------------------
create policy "agenda_events_select_own_or_admin"
  on public.agenda_events for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "agenda_events_insert_own"
  on public.agenda_events for insert to authenticated
  with check (user_id = auth.uid());

create policy "agenda_events_update_own"
  on public.agenda_events for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "agenda_events_delete_own_or_admin"
  on public.agenda_events for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- notifications: a user sees their own notifications plus broadcasts
-- (user_id is null); only admins create/delete; a user may mark their own
-- as read (update limited to the `read` flag is enforced at the app layer).
-- ----------------------------------------------------------------------------
create policy "notifications_select_own_or_broadcast_or_admin"
  on public.notifications for select to authenticated
  using (user_id = auth.uid() or user_id is null or public.is_admin());

create policy "notifications_admin_insert"
  on public.notifications for insert to authenticated
  with check (public.is_admin());

create policy "notifications_update_own_or_admin"
  on public.notifications for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "notifications_delete_admin"
  on public.notifications for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- study_sessions: owner-managed, used to compute streaks/hours.
-- ----------------------------------------------------------------------------
create policy "study_sessions_select_own_or_admin"
  on public.study_sessions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "study_sessions_insert_own"
  on public.study_sessions for insert to authenticated
  with check (user_id = auth.uid());

create policy "study_sessions_update_own"
  on public.study_sessions for update to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "study_sessions_delete_own_or_admin"
  on public.study_sessions for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- plans: public catalog, admin-managed.
-- ----------------------------------------------------------------------------
create policy "plans_read_active_or_admin"
  on public.plans for select to authenticated
  using (active or public.is_admin());

create policy "plans_admin_write"
  on public.plans for insert to authenticated
  with check (public.is_admin());

create policy "plans_admin_update"
  on public.plans for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "plans_admin_delete"
  on public.plans for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- subscriptions: owner reads own; only service_role (Edge Functions) and
-- admins write, since subscription state must stay in sync with Mercado Pago.
-- ----------------------------------------------------------------------------
create policy "subscriptions_select_own_or_admin"
  on public.subscriptions for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "subscriptions_admin_write"
  on public.subscriptions for insert to authenticated
  with check (public.is_admin());

create policy "subscriptions_admin_update"
  on public.subscriptions for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "subscriptions_admin_delete"
  on public.subscriptions for delete to authenticated
  using (public.is_admin());

-- ----------------------------------------------------------------------------
-- payments: owner reads own; writes are performed by the mercadopago-webhook
-- Edge Function using the service_role key (which bypasses RLS), plus admins.
-- ----------------------------------------------------------------------------
create policy "payments_select_own_or_admin"
  on public.payments for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy "payments_admin_write"
  on public.payments for insert to authenticated
  with check (public.is_admin());

create policy "payments_admin_update"
  on public.payments for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- admin_logs: admin-only, insert-and-read (never mutated/deleted from the app).
-- ----------------------------------------------------------------------------
create policy "admin_logs_select_admin"
  on public.admin_logs for select to authenticated
  using (public.is_admin());

create policy "admin_logs_insert_admin"
  on public.admin_logs for insert to authenticated
  with check (public.is_admin() and admin_id = auth.uid());
