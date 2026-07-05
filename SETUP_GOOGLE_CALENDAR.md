# Google Calendar — Guia de Ativação

A integração com Google Calendar já está 100% implementada no código.
Para ativar, siga os passos abaixo.

## 1. Criar projeto no Google Cloud Console

1. Acesse https://console.cloud.google.com
2. Crie um novo projeto (ou selecione existente)
3. Ative a **Google Calendar API**:
   - Biblioteca de APIs → Pesquise "Google Calendar API" → Ativar

## 2. Criar credenciais OAuth 2.0

1. APIs e Serviços → Credenciais → Criar Credenciais → ID do cliente OAuth
2. Tipo: **Aplicativo Web**
3. Nome: "PsiHumanis Web Client"
4. **Origens JavaScript autorizadas** (adicionar):
   - `https://psihumanis.com.br`
   - `http://localhost:3000`
5. **URIs de redirecionamento autorizados** (adicionar):
   - `https://psihumanis.com.br/api/integrations/google-calendar/callback`
   - `http://localhost:3000/api/integrations/google-calendar/callback`
6. Clique em "Criar"
7. Copie o **ID do cliente** e a **Chave secreta do cliente**

## 3. Adicionar ao Vercel

No dashboard Vercel → Settings → Environment Variables:

```
GOOGLE_CALENDAR_CLIENT_ID=<seu_client_id>
GOOGLE_CALENDAR_CLIENT_SECRET=<sua_client_secret>
NEXT_PUBLIC_APP_URL=https://psihumanis.com.br
```

## 4. Testar

1. Faça login como psicólogo
2. Acesse **Configurações → Agenda → Google Calendar**
3. Clique em **Conectar**
4. Autorize o acesso com sua conta Google
5. Após o redirect, o status deve mudar para "Conectado"
6. Clique em **Sincronizar Agora** para enviar consultas futuras ao Google Agenda

## Observações

- O callback redirect é `/api/integrations/google-calendar/callback`
- O OAuth usa acesso offline com `prompt=consent` para garantir refresh token
- A sincronização automática acontece ao criar/editar/cancelar consultas
- As videochamadas geram link Google Meet automaticamente
- Timezone padrão: `America/Sao_Paulo`
