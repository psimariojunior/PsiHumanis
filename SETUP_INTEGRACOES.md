# Setup — Google Calendar + Stripe

## 1. Google Calendar (~20 min)

### 1.1 Criar projeto no Google Cloud Console

1. Acesse https://console.cloud.google.com/
2. Faça login com sua conta Google (qualquer uma)
3. Clique no seletor de projeto (topo) → **"Novo Projeto"**
4. Nome: **PsiHumanis**
5. Clique **"Criar"**

### 1.2 Ativar API do Google Calendar

1. No menu ☰ → **"APIs e serviços"** → **"Biblioteca"**
2. Pesquise: `Google Calendar API`
3. Clique no resultado → **"Ativar"**

### 1.3 Criar credenciais OAuth

1. No menu ☰ → **"APIs e serviços"** → **"Credenciais"**
2. Clique **"Criar credenciais"** → **"ID do cliente OAuth"**
3. Se pedir para configurar tela de consentimento:
   - **Tipo de usuário**: Externo
   - **Nome do app**: PsiHumanis
   - **Email de suporte**: seu email
   - **Escopo**: adicione `.../auth/calendar.events`
   - **Usuários de teste**: seu email
4. Após configurar a tela, volte e crie as credenciais:
   - **Tipo**: Aplicativo Web
   - **Nome**: PsiHumanis Web
   - **Origens JavaScript autorizadas**: deixe vazio
    - **URIs de redirecionamento autorizados**:
      ```
      https://psihumanis.com.br/api/integrations/google-calendar/callback
      ```
      (Para testar local: `http://localhost:3000/api/integrations/google-calendar/callback`)
5. Clique **"Criar"**
6. **IMPORTANTE**: Anote o **Client ID** e **Client Secret**

### 1.4 Publicar o app (necessário para produção)

1. No menu ☰ → **"APIs e serviços"** → **"Tela de consentimento OAuth"**
2. Clique **"Publicar aplicativo"** (se não publicar, só seu email consegue usar)
3. Confirme

### 1.5 Env vars no Vercel

| Nome | Valor |
|------|-------|
| `GOOGLE_CALENDAR_CLIENT_ID` | Client ID do passo 1.3 |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Client Secret do passo 1.3 |

---

## 2. Stripe (~15 min)

### 2.1 Criar conta

1. Acesse https://dashboard.stripe.com/register
2. Email: qualquer um (pode ser o mesmo do projeto)
3. Senha: escolha uma
4. Complete os dados do negócio:
   - **País**: Brasil
   - **Nome da empresa**: PsiHumanis
   - **Site**: `https://psihumanis.com.br`
   - **Tipo de negócio**: Profissional liberal / Psicólogo
5. Confirme o email

### 2.2 Obter chaves da API

1. No dashboard, vá em **"Desenvolvedores"** → **"Chaves de API"**
2. Copie:
   - **Chave publicável** (`pk_live_...`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Chave secreta** (`sk_live_...`) → `STRIPE_SECRET_KEY`
   - (Use as chaves **test** (`pk_test_`/`sk_test_`) para testar antes)

### 2.3 Configurar webhook

1. No dashboard, vá em **"Desenvolvedores"** → **"Webhooks"**
2. Clique **"Adicionar endpoint"**
3. **URL do endpoint**:
   ```
   https://psihumanis.com.br/api/pagamentos/webhook
   ```
4. **Eventos para escutar**: marque:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
5. Clique **"Adicionar endpoint"**
6. Na página do webhook, clique **"Revelar"** no **Signing secret**
7. Copie o `whsec_...` → `STRIPE_WEBHOOK_SECRET`

### 2.4 Ativar métodos de pagamento

1. No dashboard, vá em **"Configurações"** → **"Métodos de pagamento"**
2. Ative (se quiser):
   - **Cartão de crédito/débito** (já ativo por padrão)
   - **Boleto** (clique "Ativar")
   - **PIX** (clique "Ativar")
3. Configure os dados necessários para boleto e PIX (informações da empresa)

### 2.5 Env vars no Vercel

| Nome | Valor |
|------|-------|
| `STRIPE_SECRET_KEY` | `sk_live_...` ou `sk_test_...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` ou `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

---

## 3. Adicionar env vars no Vercel

1. Acesse https://vercel.com/psimariojunior/psihumanis/settings/environment-variables
2. Adicione **todas** as variáveis acima (Production)
3. Após adicionar, vá até o deploy mais recente e clique **"Redeploy"**

---

## 4. Testar

### Google Calendar
1. Acesse o PsiHumanis → **Configurações** → aba **Agenda**
2. Clique **"Conectar"** ao lado de Google Calendar
3. Faça login na conta Google
4. Autorize as permissões
5. Após conectar, clique **"Sincronizar Agora"**
6. Verifique se os eventos aparecem no Google Agenda

### Stripe
1. Acesse PsiHumanis → **Financeiro** → **Faturas**
2. Crie uma fatura para um paciente
3. Acesse a área do paciente → **Minhas Faturas**
4. Clique **"Pagar com Cartão / PIX / Boleto"**
5. Faça um pagamento de teste (usar cartão `4242 4242 4242 4242`, qualquer data futura, CVC qualquer)
6. Verifique se a fatura muda para "Pago"
