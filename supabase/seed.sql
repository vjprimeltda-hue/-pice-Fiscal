-- ============================================================================
-- seed.sql
-- Development-only seed data. Run automatically by `supabase db reset`.
-- Creates sample subjects, a course, lessons, materials, questions and a
-- default subscription plan. Does NOT create auth users — sign up normally
-- through the app, then promote yourself to admin with:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================================

insert into public.subjects (id, name, icon, color, "order") values
  ('11111111-1111-1111-1111-111111111101', 'Direito Tributário', 'scale', '#2563eb', 1),
  ('11111111-1111-1111-1111-111111111102', 'Direito Constitucional', 'landmark', '#7c3aed', 2),
  ('11111111-1111-1111-1111-111111111103', 'Contabilidade Geral', 'calculator', '#059669', 3),
  ('11111111-1111-1111-1111-111111111104', 'Auditoria Fiscal', 'search', '#d97706', 4)
on conflict (id) do nothing;

insert into public.courses (id, name, description) values
  ('22222222-2222-2222-2222-222222222201', 'Preparatório Auditor Fiscal 2026', 'Curso completo para concursos de auditoria fiscal.')
on conflict (id) do nothing;

insert into public.course_subjects (course_id, subject_id) values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111102'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111103'),
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111104')
on conflict do nothing;

insert into public.lessons (subject_id, course_id, title, professor, video_url, video_provider, duration_minutes, "order") values
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 'Introdução ao Sistema Tributário Nacional', 'Profa. Ana Souza', 'https://www.youtube.com/watch?v=example1', 'youtube', 48, 1),
  ('11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 'Competência Tributária', 'Profa. Ana Souza', 'https://www.youtube.com/watch?v=example2', 'youtube', 55, 2),
  ('11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222201', 'Princípios Fundamentais da CF/88', 'Prof. Carlos Lima', 'https://www.youtube.com/watch?v=example3', 'youtube', 62, 1),
  ('11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222201', 'Plano de Contas e Escrituração', 'Prof. Diego Alves', 'https://www.youtube.com/watch?v=example4', 'youtube', 40, 1);

insert into public.questions (subject_id, statement, options, correct_index, explanation, difficulty) values
  ('11111111-1111-1111-1111-111111111101',
   'Segundo o CTN, a competência tributária é:',
   '["Delegável a qualquer pessoa jurídica de direito privado", "Indelegável, ressalvadas as funções de arrecadar ou fiscalizar", "Sempre exclusiva da União", "Renunciável por lei ordinária"]'::jsonb,
   1,
   'Art. 7º do CTN: a competência tributária é indelegável, salvo atribuição das funções de arrecadar ou fiscalizar tributos.',
   'medio'),
  ('11111111-1111-1111-1111-111111111102',
   'É cláusula pétrea da Constituição Federal de 1988:',
   '["A forma federativa de Estado", "O sistema tributário nacional", "A obrigatoriedade do voto", "O número de ministros do STF"]'::jsonb,
   0,
   'Art. 60, §4º, I da CF/88 veda emenda tendente a abolir a forma federativa de Estado.',
   'facil');

insert into public.plans (id, name, description, price_cents, interval, features, active) values
  ('33333333-3333-3333-3333-333333333301', 'Mensal', 'Acesso completo à plataforma, renovação mensal.', 9990, 'monthly', '["Videoaulas ilimitadas", "Materiais em PDF", "Mapas mentais", "Banco de questões", "Suporte por e-mail"]'::jsonb, true),
  ('33333333-3333-3333-3333-333333333302', 'Anual', 'Acesso completo à plataforma, renovação anual com desconto.', 89900, 'yearly', '["Videoaulas ilimitadas", "Materiais em PDF", "Mapas mentais", "Banco de questões", "Suporte prioritário", "2 meses grátis"]'::jsonb, true)
on conflict (id) do nothing;
