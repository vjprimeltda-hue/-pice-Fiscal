// Promotes a user to admin using the service-role key (bypasses RLS) —
// alternative to the SQL editor or to calling the admin-set-role Edge
// Function from the browser.
//
// Usage: node scripts/promote-admin.mjs someone@example.com

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

const email = process.argv[2];
if (!email) {
  console.error("Uso: node scripts/promote-admin.mjs email@exemplo.com");
  process.exit(1);
}

const env = loadEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase
  .from("profiles")
  .update({ role: "admin" })
  .eq("email", email)
  .select("id, name, email, role")
  .maybeSingle();

if (error) {
  console.error("Erro:", error.message);
  process.exit(1);
}
if (!data) {
  console.error(`Nenhum usuário encontrado com o email ${email}. Confirme se a conta já foi criada e o email confirmado.`);
  process.exit(1);
}

console.log(`✓ ${data.name} (${data.email}) agora é ${data.role}.`);
