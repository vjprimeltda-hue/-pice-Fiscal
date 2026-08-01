# Banco de dados Supabase — Ápice Fiscal

Local: `apice-fiscal/supabase/`

## Estrutura

```
supabase/
  config.toml               # config do Supabase CLI (local dev + edge functions)
  seed.sql                  # dados de exemplo (assuntos, curso, aulas, questões, planos)
  migrations/
    0001_extensions_and_types.sql   # extensões + enums (app_role, material_type, ...)
    0002_profiles.sql               # profiles + trigger handle_new_user + is_admin()
    0003_content.sql                # subjects, courses, lessons, materials, questions
    0004_activity.sql               # lesson_progress, question_attempts, favorites,
                                     # agenda_events, notifications, study_sessions
    0005_billing.sql                # plans, subscriptions, payments + has_active_subscription()
    0006_admin_logs.sql             # auditoria de ações do admin
    0007_storage.sql                # buckets avatars / lesson-thumbnails / materials + policies
    0008_rls_policies.sql           # todas as políticas RLS de tabelas
    0009_progress_functions.sql     # RPCs de progresso (dashboard do aluno)
  functions/
    _shared/                        # cors.ts, supabase.ts, mercadopago.ts (helpers)
    mercadopago-webhook/            # público (verify_jwt=false) — sincroniza pagamentos/assinaturas
    create-subscription/            # autenticado — cria preapproval no Mercado Pago
    cancel-subscription/            # autenticado — cancela a assinatura do usuário
    get-material-url/               # autenticado — URL assinada de material, gateada por assinatura ativa
    admin-set-role/                 # autenticado — bootstrap do 1º admin + gestão de papéis
```

## Edge Functions

Deploy (não precisa de Docker rodando):

```bash
supabase functions deploy mercadopago-webhook --no-verify-jwt
supabase functions deploy create-subscription
supabase functions deploy cancel-subscription
supabase functions deploy get-material-url
supabase functions deploy admin-set-role
```

Segredos usados pelas functions (nunca commitados — configure com `supabase secrets set`):

```bash
supabase secrets set MERCADO_PAGO_ACCESS_TOKEN=xxx
supabase secrets set MERCADO_PAGO_WEBHOOK_SECRET=xxx
supabase secrets set SITE_URL=https://seu-dominio.com
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` já existem automaticamente no runtime das Edge Functions — não precisam ser configurados.

Registre a URL do webhook no painel do Mercado Pago (Sua integração → Webhooks):
`https://<project-ref>.functions.supabase.co/mercadopago-webhook`

### Bootstrap do primeiro admin

Em vez de usar o SQL editor, qualquer usuário logado pode chamar `admin-set-role` sem corpo
enquanto **não existir nenhum admin** na base — a function promove o próprio caller automaticamente:

```js
const { data, error } = await supabase.functions.invoke("admin-set-role");
```

Depois que já existe pelo menos 1 admin, a function passa a exigir que o caller já seja admin
e recebe `{ userId, role }` no corpo para alterar outros usuários.

## Como aplicar

Pré-requisitos: [Supabase CLI](https://supabase.com/docs/guides/cli) instalado e Docker rodando (para desenvolvimento local).

```bash
cd apice-fiscal

# 1. Login e link com o projeto criado no dashboard supabase.com
supabase login
supabase link --project-ref <SEU_PROJECT_REF>

# 2. Ambiente local (opcional, roda Postgres + Studio em Docker)
supabase start

# 3. Aplica todas as migrations (local)
supabase db reset          # dropa, recria e roda migrations + seed.sql

# 4. Aplica as migrations no projeto remoto (produção/staging)
supabase db push
```

## Criando o primeiro administrador

Nenhum usuário nasce admin — todo cadastro entra como `aluno` via trigger `handle_new_user`.
Depois de criar sua conta pelo app, promova-a manualmente no SQL editor do Supabase:

```sql
update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
```

## Modelo de dados (resumo)

- **profiles** — 1:1 com `auth.users`, guarda nome/telefone/avatar/role/meta diária de estudo.
- **subjects / courses / course_subjects** — catálogo de matérias e cursos.
- **lessons** — videoaulas (vinculadas a matéria e, opcionalmente, curso).
- **materials** — PDFs e mapas mentais (arquivo real fica no bucket `materials`).
- **questions** — banco de questões (alternativas em `jsonb`).
- **lesson_progress / question_attempts / study_sessions** — progresso do aluno.
- **favorites** — favoritos (vídeo, pdf, exercício, mapa mental).
- **agenda_events** — calendário de estudos do aluno.
- **notifications** — notificações pessoais ou broadcast (`user_id is null`).
- **plans / subscriptions / payments** — assinatura e cobrança via Mercado Pago.
- **admin_logs** — auditoria de ações administrativas.

Todas as tabelas têm RLS habilitada; a função `public.is_admin()` (SECURITY DEFINER)
é usada em todas as políticas para liberar acesso total ao papel `admin`.
