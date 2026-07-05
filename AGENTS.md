# PsiHumanis — Session Log

## Goal
Professional psychology practice website + management platform. Public landing page, SEO optimized, full patient portal, video call, billing, dashboard analytics, Hermes Agent integration.

## Hermes Agent (MCP — 2026-06-14)
- **Installed**: `%LOCALAPPDATA%\hermes\hermes-agent` com venv em `.venv`
- **MCP**: Configurado no `opencode.json` na raiz do projeto via `python.exe hermes mcp serve`
- **Deps**: PyYAML, python-dotenv, rich, mcp, etc instalados via uv sync + uv pip
- **Acesso CLI**: `hermes` (alias via PowerShell profile) ou `& "$env:LOCALAPPDATA\hermes\hermes-agent\.venv\Scripts\python.exe" "$env:LOCALAPPDATA\hermes\hermes-agent\hermes" <comando>`
- **Provider**: OpenRouter (modelo: `openrouter/free` — gratuito)
- **Working dir**: `C:\Users\miche\Desktop\PsiHumanis-Completo`
- **Alias PowerShell**: `function hermes { ... }` adicionado ao `$PROFILE.CurrentUserAllHosts`

## Architecture
- **Auth**: NextAuth (Credentials) — psychologist only; patient bypasses auth via `?patient=true` on token API
- **Video**: LiveKit Cloud (`livekit.io`) — JWT tokens generated server-side; `@livekit/components-react` on frontend
- **DB**: Neon PostgreSQL via Prisma — stores users, sessions, closed rooms
- **Deploy**: Vercel (Hobby) + Neon free tier
- **Patient flow**: Welcome (room code) → Pre-join (camera preview + toggles) → Video call (LiveKitRoom)
- **Public pages**: `/` (landing page), `/agendar` (booking), `/termos`, `/privacidade`
- **Dashboard**: `/dashboard` (authenticated), all other routes in `(dashboard)/` group

## Key Decisions & History

## Key Decisions & History

### Room closing (ClosedRoom model)
- `prisma/schema.prisma` has `ClosedRoom` model (roomName PK, psychologistId, closedAt)
- `POST /api/livekit/rooms` → deletes room from LiveKit (best-effort) + upserts ClosedRoom
- `GET /api/livekit/rooms` → lists closed rooms (diagnostics)
- `GET /api/livekit/token` → checks ClosedRoom table, returns 410 if room was closed
- After "Encerrar Sala", a fresh room name is auto-generated in the input field

### Camera preview fix (critical)
- **Problem**: preview camera worked but video call had no camera
- **Root cause**: preview stream was still active (holding camera) when LiveKitRoom tried `getUserMedia`, OR preview was stopped too early (cleanup ran before LiveKitRoom mounted)
- **Fix**: `handleConnect` explicitly stops preview stream (`streamRef.current?.getTracks().forEach(t => t.stop())`) before `setToken()`, freeing camera for LiveKit
- **Secondary fix**: preview `getUserMedia` failure no longer sets `cameraOn=false` — LiveKitRoom still requests `video={cameraOn}` (toast only)

### UX Improvements (2026-06-08 / 2026-06-09)
- **In-call**: room name badge (top-left, translucent), "Sair" button (top-right, destructive)
- **Aguardando psicólogo**: overlay with spinner when no remote participant present; tracks via `ParticipantWatcher` component using `useRemoteParticipants` hook
- **Disconnect screen**: "Conexão encerrada" with "Entrar em outra sala" button (instead of jumping to welcome)
- **Patient name**: passed to token API (`?name=...`) and shown in LiveKit participant list
- **Token API**: accepts `name` query param from patients (defaults to "Paciente")
- **TS fix (2026-06-09)**: `@livekit/components-react` v2.9.21 `onConnected` expects `() => void` (no room arg); removed `onParticipantConnected`/`onParticipantDisconnected` props (not in LiveKitRoomProps) → replaced with `ParticipantWatcher` component

### Pre-join camera preview design
- Welcome → "Continuar" → `setStep("prejoin")` → effect calls `startCamera()` via `getUserMedia`
- Direct URL (`?room=...`) → starts in prejoin, effect calls `getUserMedia` (may fail without gesture; toast shown)
- Toggle buttons enable/disable tracks on the preview stream
- "Entrar na Sala" → stops preview stream, fetches token, mounts LiveKitRoom
- Camera preview uses `videoRef` always in DOM (hidden by CSS until stream ready)

### LiveKit Cloud setup
- URL: `wss://gestao-de-psicologia-sx5sdgua.livekit.cloud`
- API Key: `APIShuBgp6j9SpS`
- Secrets set as Vercel env vars (Production only)

### Vercel deployment
- Git repo: `https://github.com/psimariojunior/PsiHumanis`
- Production URL: `https://psihumanis.com.br`
- Build command: `prisma db push --accept-data-loss && next build` (vercel.json)
- `POSTGRES_PRISMA_URL` env (non-pooled) for DDL via prisma db push
- Vercel env vars: nextauth vars, LIVEKIT_API_KEY/SECRET, LIVEKIT_URL, DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, ENCRYPTION_KEY, NEXTAUTH_URL, WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, RESEND_API_KEY, EMAIL_FROM, GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- Middleware allows unauthenticated access to `/sala-virtual/entrar`, `/api/livekit/*`, and `/api/cron/*`
- **SSO Protection**: foi desativado no projeto Vercel (impedia acesso do paciente sem login Vercel)

## Recentes (2026-06-10) — Lembretes Automáticos

### O que foi implementado
- **Email**: `sendEmail()` genérico + template HTML de lembrete de consulta em `src/lib/email.ts`; via Resend API
- **WhatsApp**: Cliente Meta Cloud API em `src/lib/whatsapp.ts`; envia template `lembrete_consulta` com nome/data/hora
- **Engine de notificações** (`src/lib/notifications.ts`):
  - `scheduleReminders()` — cria notificações PENDING para 24h e 1h antes da consulta
  - `cancelPendingReminders()` — cancela pendentes ao cancelar consulta
  - `dispatchNotification()` — envia email ou WhatsApp e marca SENT/FAILED
  - `processPendingNotifications()` — processa todos PENDING com scheduledAt <= agora
- **Cron**: `/api/cron/lembretes` (GET + POST) — público, para ser chamado por cron-job.org a cada 30min
- **Integração na agenda**:
  - `POST /api/agendamentos` → agenda reminders automaticamente na criação
  - `PUT /api/agendamentos/[id]` → agenda ao confirmar, cancela ao cancelar/deletar
  - `DELETE /api/agendamentos/[id]` → cancela pendentes
- **Botão "Enviar Lembrete"**: no diálogo de detalhes da consulta (disparo imediato)
- **`POST /api/notificacoes`**: dispara imediatamente quando `sendAt` não é informado
- **Schema Prisma**: Notification ganhou campos `scheduledAt` (DateTime?), `appointmentId` (FK para Appointment), e relação `appointment`

### Para fazer o WhatsApp funcionar
1. Criar template `lembrete_consulta` no WhatsApp Manager (Meta Business)
2. Gerar token permanente no Graph API Explorer
3. Adicionar `WHATSAPP_API_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` nas env vars do Vercel

### Para o cron automático
1. Criar conta em https://cron-job.org
2. Job 1 — Lembretes: `https://psihumanis.com.br/api/cron/lembretes` a cada 30 min
3. Job 2 — Automações: `https://psihumanis.com.br/api/cron/automation-triggers` diário às 08:00 (Brasília)
4. Ambos os jobs usam header `Authorization: Bearer <CRON_SECRET>`

### Lembretes automáticos agendados (2026-06-10)
- `prisma/schema.prisma`: Notification ganhou campo `scheduledAt` (DateTime?) para agendamento
- `scheduleReminders()` em `src/lib/notifications.ts`: cria notificações PENDING para 24h e 1h antes da consulta
- `cancelPendingReminders()` em `src/lib/notifications.ts`: cancela notificações pendentes de uma consulta
- `processPendingNotifications()` agora filtra por `scheduledAt <= now` em vez de `createdAt`
- Integrado em:
  - `POST /api/agendamentos` → agenda ao criar
  - `PUT /api/agendamentos/[id]` → agenda ao confirmar, cancela ao cancelar
  - `DELETE /api/agendamentos/[id]` → cancela pendentes
- `vercel.json`: build command volta a executar `prisma db push --accept-data-loss` para atualizar Neon
- Cron endpoint (`/api/cron/lembretes`) continua processando a cada 30min

### Email: migrado de SMTP Outlook para Resend (2026-06-10)
- **Problema**: Outlook SMTP aceitava conexão mas descartava emails silenciosamente (FROM não coincidia com SMTP AUTH user)
- **Solução**: Substituído `nodemailer` por `resend` (API HTTP, sem SMTP)
- `src/lib/email.ts` agora usa `new Resend(process.env.RESEND_API_KEY)`
- Env vars antigas removidas: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Env vars novas: `RESEND_API_KEY`, `EMAIL_FROM`
- Setup: criar conta em https://resend.com, verificar domínio (ou usar `onboarding@resend.dev` para testes), gerar API key

### Google Calendar + Stripe + CSP + Cache (2026-06-13)
- **Google Calendar sync**: Serviço completo em `src/lib/google-calendar.ts` (OAuth2, CRUD de eventos, Google Meet); rotas `/api/integrations/google-calendar` (auth, status, disconnect) e `/sync`; UI na aba "Agenda" das configurações. Schema: `googleRefreshToken`, `googleCalendarId` no User
- **Stripe payment gateway**: `src/lib/stripe.ts` (lazy init); `/api/pagamentos/create-checkout` (psicólogo), `/api/pagamentos/public-checkout` (paciente), `/api/pagamentos/webhook` (checkout.session.completed/expired + payment_intent.payment_failed). Schema: `stripeCustomerId` no Patient, `stripeCheckoutSessionId` + `stripePaymentIntentId` no Invoice. UI: botão "Pagar com Cartão / PIX / Boleto" na fatura do paciente
- **CSP**: `'unsafe-eval'` removido do `script-src`; `https://api.stripe.com` adicionado ao `connect-src`
- **Cache headers**: `/api/disponibilidade/public` (public, max-age=30), `/api/health` (no-store), `/api/agendamentos/public` POST (no-store)
- **Deps atualizadas**: Next.js 14.2.35, Prisma 5.22.0, TypeScript 5.7.3
- Setup detalhado em `SETUP_INTEGRACOES.md` na raiz

### Pre-Launch Audit Fixes (2026-06-11)
- **Email**: `src/lib/email.ts` migrado definitivamente para Resend SDK (`resend.emails.send()`) — antes usava `fetch` para SendGrid mas env vars do Vercel tinham `RESEND_API_KEY`
- **Reset password link**: corrigido de `/reset-password?token=...` → `/paciente/reset-password?token=...` (estava dando 404)
- **`NEXT_PUBLIC_APP_URL`**: adicionado no Vercel (`https://psihumanis.com.br`) — antes caía pra `localhost:3000`
- **Login/forgot-password**: agora busca paciente por email em **todos os psicólogos** (antes usava `findFirst` — só funcionava pro primeiro psicólogo cadastrado)
- **Nome do paciente na pré-chamada**: input não era mais `readOnly` — agora o paciente pode digitar o nome
- **Rate limit no forgot-password**: limite de 1 requisição por email a cada 2 minutos (em memória)
- **Modalidade nos lembretes**: corrigido de `"presential"` fixo para `"online"` (todas as consultas são online)
- **Cron route**: `?testbrevo` renomeado para `?testemail`
- **Segurança**: fallback de JWT removido de 5 arquivos — agora joga erro se `ENCRYPTION_KEY` não estiver configurada
- **Mass assignment**: `PUT /api/pacientes/[id]` e `PUT /api/configuracoes` agora usam Zod validation (não aceitam campos não permitidos)
- **Health API**: adicionado `/api/health` no middleware bypass (estava sendo redirecionado para login)
- **Notificação de cancelamento**: psicólogo recebe email quando paciente cancela consulta (com data/hora/motivo)
- **Email híbrido**: psicólogo (`psi_mariojunior@hotmail.com`) via **Resend** (entrega garantida); pacientes via **SendGrid** — `src/lib/email.ts` escolhe baseado no destinatário
- **Consultas recorrentes**: nova opção "Repetir consulta" no diálogo de agendamento — suporta semanal/quinzenal com N repetições; API gera múltiplos appointments automaticamente

### Landing page profissional & SEO (2026-06-12)
- **Landing page** em `src/app/page.tsx`: hero com gradiente, seção "Como Funciona" (3 passos), Serviços (6 cards), Sobre o profissional, FAQ (accordion), CTA final, Footer completo
- **SEO completo**: `robots.ts`, `sitemap.ts`, `manifest.ts`, metadados Open Graph + Twitter + JSON-LD no layout raiz
- **Middleware**: permite acesso público a `/`, `/termos`, `/privacidade`, `/agendar`, rotas de paciente e APIs públicas
- **Dashboard movido** para `/dashboard` (sidebar atualizada), landing page ocupa a raiz
- **CSS global**: custom scrollbar, selection color, animações `fade-in`/`slide-up`/`scale-in`, primary color alterada para verde (emerald)
- **Dashboard aprimorado**: cards de métricas com ícones, seção de "Meta do Mês" com barra de progresso, ações rápidas com descrições, layout responsivo
- **Dashboard do paciente**: página inicial após login com saudação, próxima consulta (filtro corrigido de `CONFIRMED` para `!CANCELLED`), grid de acesso rápido (Agenda/Diário/Histórico/Meus Dados)
- **Navbar**: adicionado link "Início" com ícone LayoutDashboard, mudado redirect pós-login de `/paciente/agenda` para `/paciente`
- **Recuperar senha**: `recuperar-senha` e `reset-password` adicionados como páginas públicas no `PatientAuthProvider` (antes redirecionava para login)
- **CTA pós-agendamento público**: botão "Criar conta para gerenciar consultas" na tela de confirmação
- **`h-13` → `h-12`**: classe Tailwind inválida em `booking-flow.tsx` e `prejoin-view.tsx`
- **Código morto**: `/api/webrtc` removido (migrou para LiveKit)
- **Cascade delete paciente**: agora inclui Invoice, EmotionDiary, ConsentLog, FinancialTransaction, Attachment, Notification (antes faltavam 5 modelos com FK)
- **`<a>` → `<Link>`**: 4 links em cadastro, login, reset-password (navegação sem recarregar)
- **`aria-label`**: adicionado em 8 botões de câmera/mic/tela-cheia/sair e navegação de meses
- **Build/lint/deploy**: tudo compilando sem erros, lint limpo

### Setup Details
Ver `LEMBRETES_SETUP.md` na raiz do projeto.

## Relevant Files
- `src/app/(public)/sala-virtual/entrar/page.tsx` — patient flow (welcome → prejoin → call)
- `src/app/(dashboard)/sala-virtual/page.tsx` — psychologist room (link sharing, encerrar sala)
- `src/app/api/livekit/token/route.ts` — JWT generation + closed-room check
- `src/app/api/livekit/rooms/route.ts` — POST (close room) + GET (list closed) + session_completed trigger
- `src/app/(dashboard)/automacoes/page.tsx` — Automation dashboard with visual builder + templates
- `src/app/api/automations/route.ts` — Automations GET/POST API
- `src/app/api/automations/[id]/route.ts` — Automations PUT/DELETE API
- `src/lib/automation-engine.ts` — Core trigger-action engine (fireTrigger, executeAction, replaceVars)
- `src/middleware.ts` — auth bypass for patient routes
- `prisma/schema.prisma` — ClosedRoom + Automation models + PostgreSQL provider
- `next.config.js` — Vercel-compatible config

### Pentest & Security Hardening (2026-06-12)
- **CRITICAL — CRON test bypass**: `?testemail` e `?testwhatsapp` ignoravam o cron secret. Corrigido: secret é obrigatório SEMPRE
- **CRITICAL — XSS Stored**: `POST /api/agendamentos/public` aceitava `<script>` no `name` sem sanitização. Corrigido: `sanitizeHtml()` + Zod schema com length validation + input limits
- **HIGH — ID leakage**: `GET /api/disponibilidade/public` vazava `psychologistId` interno mesmo sem filtro. Corrigido: `psychologistId` só aparece na resposta se foi enviado no request
- **MEDIUM — Patient reg input limits**: registro aceitava nome de 500 chars sem validação. Corrigido: Zod schema com max 120 chars e sanitização
- **MEDIUM — JWT sem jti**: tokens de paciente não tinham nonce para proteção contra replay. Corrigido: `randomUUID()` adicionado como `jti`
- **MEDIUM — Zod gap**: `PUT /api/pacientes/me` não usava Zod schema. Corrigido: migrado para `updatePatientSchema`
- **MEDIUM — Zod gap**: `POST /api/agendamentos/public` não validava tipos. Corrigido: schema Zod + `modality` enum + `psychologistId` validation
- **Build command**: `vercel.json` migrado de `prisma db push --accept-data-loss` para `prisma migrate deploy` com fallback seguro
