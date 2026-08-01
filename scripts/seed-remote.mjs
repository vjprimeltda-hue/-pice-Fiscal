// One-off seed script for a REMOTE Supabase project, using the service-role
// key over PostgREST (bypasses RLS) — no Postgres password required, unlike
// `psql -f supabase/seed.sql`. Mirrors supabase/seed.sql exactly.
//
// Usage: node scripts/seed-remote.mjs
// Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const content = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
  const env = {};
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não encontrados em .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function upsert(table, rows, onConflict) {
  const { error } = await supabase.from(table).upsert(rows, onConflict ? { onConflict } : undefined);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`✓ ${table} (${rows.length})`);
}

const subjects = [
  { id: "11111111-1111-1111-1111-111111111101", name: "Direito Tributário", icon: "scale", color: "#2563eb", order: 1 },
  { id: "11111111-1111-1111-1111-111111111102", name: "Direito Constitucional", icon: "landmark", color: "#7c3aed", order: 2 },
  { id: "11111111-1111-1111-1111-111111111103", name: "Contabilidade Geral", icon: "calculator", color: "#059669", order: 3 },
  { id: "11111111-1111-1111-1111-111111111104", name: "Auditoria Fiscal", icon: "search", color: "#d97706", order: 4 },
];

const courses = [
  {
    id: "22222222-2222-2222-2222-222222222201",
    name: "Preparatório Auditor Fiscal 2026",
    description: "Curso completo para concursos de auditoria fiscal.",
  },
];

const courseSubjects = subjects.map((s) => ({ course_id: courses[0].id, subject_id: s.id }));

const lessons = [
  {
    subject_id: subjects[0].id,
    course_id: courses[0].id,
    title: "Introdução ao Sistema Tributário Nacional",
    professor: "Profa. Ana Souza",
    video_url: "https://www.youtube.com/watch?v=example1",
    video_provider: "youtube",
    duration_minutes: 48,
    order: 1,
  },
  {
    subject_id: subjects[0].id,
    course_id: courses[0].id,
    title: "Competência Tributária",
    professor: "Profa. Ana Souza",
    video_url: "https://www.youtube.com/watch?v=example2",
    video_provider: "youtube",
    duration_minutes: 55,
    order: 2,
  },
  {
    subject_id: subjects[1].id,
    course_id: courses[0].id,
    title: "Princípios Fundamentais da CF/88",
    professor: "Prof. Carlos Lima",
    video_url: "https://www.youtube.com/watch?v=example3",
    video_provider: "youtube",
    duration_minutes: 62,
    order: 1,
  },
  {
    subject_id: subjects[2].id,
    course_id: courses[0].id,
    title: "Plano de Contas e Escrituração",
    professor: "Prof. Diego Alves",
    video_url: "https://www.youtube.com/watch?v=example4",
    video_provider: "youtube",
    duration_minutes: 40,
    order: 1,
  },
];

const questions = [
  {
    subject_id: subjects[0].id,
    statement: "Segundo o CTN, a competência tributária é:",
    options: [
      "Delegável a qualquer pessoa jurídica de direito privado",
      "Indelegável, ressalvadas as funções de arrecadar ou fiscalizar",
      "Sempre exclusiva da União",
      "Renunciável por lei ordinária",
    ],
    correct_index: 1,
    explanation: "Art. 7º do CTN: a competência tributária é indelegável, salvo atribuição das funções de arrecadar ou fiscalizar tributos.",
    difficulty: "medio",
  },
  {
    subject_id: subjects[1].id,
    statement: "É cláusula pétrea da Constituição Federal de 1988:",
    options: [
      "A forma federativa de Estado",
      "O sistema tributário nacional",
      "A obrigatoriedade do voto",
      "O número de ministros do STF",
    ],
    correct_index: 0,
    explanation: "Art. 60, §4º, I da CF/88 veda emenda tendente a abolir a forma federativa de Estado.",
    difficulty: "facil",
  },
];

const plans = [
  {
    id: "33333333-3333-3333-3333-333333333301",
    name: "Mensal",
    description: "Acesso completo à plataforma, renovação mensal.",
    price_cents: 9990,
    interval: "monthly",
    features: ["Videoaulas ilimitadas", "Materiais em PDF", "Mapas mentais", "Banco de questões", "Suporte por e-mail"],
    active: true,
  },
  {
    id: "33333333-3333-3333-3333-333333333302",
    name: "Anual",
    description: "Acesso completo à plataforma, renovação anual com desconto.",
    price_cents: 89900,
    interval: "yearly",
    features: ["Videoaulas ilimitadas", "Materiais em PDF", "Mapas mentais", "Banco de questões", "Suporte prioritário", "2 meses grátis"],
    active: true,
  },
];

try {
  await upsert("subjects", subjects, "id");
  await upsert("courses", courses, "id");
  await upsert("course_subjects", courseSubjects, "course_id,subject_id");
  await upsert("lessons", lessons);
  await upsert("questions", questions);
  await upsert("plans", plans, "id");
  console.log("\nSeed concluído.");
} catch (err) {
  console.error("Falha ao aplicar seed:", err.message);
  process.exit(1);
}
