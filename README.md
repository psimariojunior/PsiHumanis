# PsiHumanis - Sistema de Gestão para Psicólogos

Sistema completo de gestão para psicólogos, inspirado no PsicoManager, com designer moderno e intuitivo.

## Funcionalidades

### 📋 **Pacientes & Prontuários**
- Cadastro completo de pacientes com dados pessoais, contato e informações clínicas
- Prontuários eletrônicos com tipos: Nota de Sessão, Anamnese, Evolução, Plano Terapêutico
- Registro de sessões com método SOAP (Subjetivo, Objetivo, Avaliação, Plano)
- Controle de documentos e anexos por paciente
- Consentimento LGPD integrado

### 📅 **Agenda Online**
- Calendário interativo com visualização diária, semanal e mensal
- Agendamento de consultas presenciais e online
- Status: Agendado, Confirmado, Em Andamento, Concluído, Cancelado, Faltou
- Bloqueio de horários e horários recorrentes
- Integração com Google Calendar

### 💰 **Controle Financeiro (PsicoBank)**
- Gestão de receitas e despesas
- Controle de contas a receber e a pagar
- Emissão de notas fiscais (NFS-e)
- Concilição bancária
- Relatórios financeiros
- Suporte a múltiplas formas de pagamento

### 🎥 **Sala Virtual**
- Videoconferência para atendimento online (WebRTC)
- Chat em tempo real durante as sessões
- Chamada de voz
- Compartilhamento de tela
- Recursos terapêuticos interativos

### 🔔 **Notificações**
- Lembretes automáticos de consultas
- Múltiplos canais: WhatsApp, E-mail, SMS, Push
- Agendamento de notificações
- Histórico completo de envios

### 📊 **Diário de Emoções**
- Registro diário de humor (escala 1-5)
- Seleção de emoções (ansiedade, tristeza, alegria, etc.)
- Monitoramento de sono e nível de ansiedade
- Acompanhamento da evolução emocional

### 📈 **Relatórios**
- Visão geral com métricas da prática clínica
- Gráficos de sessões por período
- Top pacientes por frequência e receita
- Análise financeira mensal
- Exportação de dados

## 🛡️ **Camadas de Segurança**

### LGPD/GDPR Compliance
- Consentimento explícito do paciente para armazenamento de dados
- Logs de consentimento auditáveis
- Criptografia de dados sensíveis (AES-256-GCM)
- Prontuários confidenciais com acesso restrito
- Política de privacidade integrada

### Autenticação & Autorização
- NextAuth com JWT e sessões seguras
- Autenticação em dois fatores (2FA)
- Roles: Admin, Psicólogo, Recepcionista, Paciente
- Permissões granulares por funcionalidade
- Controle de sessões ativas

### Proteção de Dados
- Sanitização de inputs (XSS prevention)
- Headers de segurança (CSP, X-Frame-Options, etc.)
- Rate limiting nas APIs
- Validação de dados com Zod
- Senhas com hash bcrypt (salt rounds: 12)

### Auditoria
- Logs de auditoria para todas as ações críticas
- Registro de IP e user agent
- Histórico de alterações em prontuários
- Rastreabilidade completa

## 🚀 **Tecnologias**

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript
- **UI:** TailwindCSS, shadcn/ui, Radix UI
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **Formulários:** React Hook Form + Zod
- **Tabelas:** TanStack Table
- **Ícones:** Lucide React
- **WebRTC:** SimplePeer (video/audio)
- **Real-time:** Socket.io
- **Tema:** next-themes (claro/escuro)

## 📦 **Instalação**

```bash
# Clone o repositório
git clone https://github.com/psimariojunior/PsiHumanis.git
cd PsiHumanis

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas configurações

# Configure o banco de dados
npx prisma generate
npx prisma db push

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🔧 **Configuração**

### Banco de Dados
```env
DATABASE_URL="postgresql://user:password@localhost:5432/psihumanis"
```

### Autenticação
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="seu-secret-aqui"
```

### Email (Resend)
```env
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="PsiHumanis <onboarding@resend.dev>"
```

## 🌐 **Estrutura do Projeto**

```
src/
├── app/
│   ├── (auth)/          # Login, Register, Recuperar Senha
│   ├── (dashboard)/     # Dashboard, Pacientes, Agenda, Financeiro...
│   ├── api/             # API Routes (REST)
│   ├── globals.css      # Estilos globais
│   ├── layout.tsx       # Layout raiz
│   └── providers.tsx    # Providers (Session, Theme)
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── layout/          # Sidebar, Header, DashboardLayout
│   ├── dashboard/       # StatsCards, UpcomingAppointments, etc.
│   ├── pacientes/       # PatientList, PatientForm, etc.
│   ├── agenda/          # Calendar, AppointmentForm
│   ├── financeiro/      # FinancialOverview, TransactionList
│   ├── sala-virtual/    # VideoRoom, Chat, VoiceCall
│   ├── prontuarios/     # MedicalRecordForm, SessionNotes
│   ├── notificacoes/    # NotificationForm, History
│   └── shared/          # DataTable, StatusBadge
├── lib/                 # Utils, Prisma, Auth, Security, Validações
├── hooks/               # Custom hooks (useMediaQuery, useDebounce)
├── types/               # TypeScript types
└── middleware.ts        # Route protection & security headers
```

## 📄 **Licença**

Este projeto está sob a licença MIT.

---

**PsiHumanis** - Gestão inteligente para sua prática psicológica.
