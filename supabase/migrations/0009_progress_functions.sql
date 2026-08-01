-- ============================================================================
-- 0009_progress_functions.sql
-- SECURITY INVOKER helper functions that aggregate the current user's
-- progress. They run with the caller's privileges/RLS, so no data leaks
-- across users; they just save the frontend from hand-rolling joins.
-- ============================================================================

-- Per-course progress for the current user (drives the "Meus cursos" cards).
create or replace function public.get_my_course_progress()
returns table (
  course_id uuid,
  course_name text,
  total_lessons bigint,
  completed_lessons bigint,
  progress_percent numeric,
  last_lesson_title text
)
language sql
security invoker
stable
as $$
  with lesson_counts as (
    select
      l.course_id,
      count(*) as total_lessons,
      count(*) filter (where lp.completed) as completed_lessons
    from public.lessons l
    left join public.lesson_progress lp
      on lp.lesson_id = l.id and lp.user_id = auth.uid()
    where l.course_id is not null and l.published
    group by l.course_id
  ),
  last_lesson as (
    select distinct on (l.course_id)
      l.course_id,
      l.title
    from public.lessons l
    join public.lesson_progress lp
      on lp.lesson_id = l.id and lp.user_id = auth.uid() and lp.completed
    where l.course_id is not null
    order by l.course_id, lp.completed_at desc
  )
  select
    c.id as course_id,
    c.name as course_name,
    coalesce(lc.total_lessons, 0) as total_lessons,
    coalesce(lc.completed_lessons, 0) as completed_lessons,
    case when coalesce(lc.total_lessons, 0) = 0 then 0
      else round(100.0 * lc.completed_lessons / lc.total_lessons, 1)
    end as progress_percent,
    ll.title as last_lesson_title
  from public.courses c
  left join lesson_counts lc on lc.course_id = c.id
  left join last_lesson ll on ll.course_id = c.id;
$$;

-- Consecutive-day study streak for the current user, based on study_sessions.
create or replace function public.get_my_streak_days()
returns integer
language sql
security invoker
stable
as $$
  with days as (
    select session_date,
      session_date - (row_number() over (order by session_date desc))::integer as grp
    from public.study_sessions
    where user_id = auth.uid()
      and minutes > 0
      and session_date <= current_date
  ),
  current_streak as (
    select count(*) as streak
    from days
    where grp = (select grp from days order by session_date desc limit 1)
      and session_date >= (select max(session_date) from days) - 365
  )
  select coalesce((
    select streak from current_streak
    where exists (
      select 1 from public.study_sessions
      where user_id = auth.uid() and session_date = current_date and minutes > 0
    ) or exists (
      select 1 from public.study_sessions
      where user_id = auth.uid() and session_date = current_date - 1 and minutes > 0
    )
  ), 0);
$$;

-- Weekly hours (last 7 days) for the current user, for the dashboard chart.
create or replace function public.get_my_weekly_hours()
returns table (day date, hours numeric)
language sql
security invoker
stable
as $$
  select d::date as day, coalesce(round(s.minutes / 60.0, 2), 0) as hours
  from generate_series(current_date - 6, current_date, interval '1 day') d
  left join public.study_sessions s
    on s.user_id = auth.uid() and s.session_date = d::date
  order by day;
$$;

-- Upsert-and-accumulate today's study minutes for the current user.
create or replace function public.log_study_minutes(p_minutes integer)
returns void
language plpgsql
security invoker
as $$
begin
  insert into public.study_sessions (user_id, session_date, minutes)
  values (auth.uid(), current_date, greatest(p_minutes, 0))
  on conflict (user_id, session_date)
  do update set minutes = public.study_sessions.minutes + excluded.minutes;
end;
$$;
