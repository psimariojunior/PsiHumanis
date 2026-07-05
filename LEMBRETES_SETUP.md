# Setup — Lembretes Automáticos

## 1. Email — SMTP Outlook

### 1.1 Pré-requisito
Você precisa de um email Outlook/Hotmail com **senha de app** (recomendado) ou senha normal.

Para gerar senha de app:
1. Acesse https://account.live.com/ManageSvc
2. Faça login no Hotmail
3. Vá em **Segurança** → **Senhas de app** (se tiver 2FA)
4. Gere uma senha para "Outro aplicativo" — copie

### 1.2 Env vars no Vercel
Já configurado. Se precisar alterar:
- `SMTP_HOST` = smtp-mail.outlook.com
- `SMTP_PORT` = 587
- `SMTP_USER` = seuemail@hotmail.com
- `SMTP_PASS` = senha de app ou senha normal

---

## 2. WhatsApp — Passo a passo completo (~30 min)

### 2.1 Criar Conta Comercial no Meta Business

1. Acesse https://business.facebook.com/overview
2. Clique **"Criar conta"**
3. Nome da conta: **PsiHumanis**
4. Seu nome: **Mário Júnior**
5. Email: use o mesmo do Facebook/Instagram
6. Siga os passos até concluir

### 2.2 Conectar WhatsApp pessoal

1. Dentro do Business Manager, vá em **Configurações** (engrenagem no canto superior direito)
2. Menu lateral: **Contas do WhatsApp**
3. Clique **"Adicionar conta do WhatsApp"**
4. Escolha **"Registrar número de telefone existente"**
5. Digite seu número pessoal com DDD (Ex: 5511999999999)
6. Você receberá um SMS com código de 6 dígitos — insira
7. Pronto: o número agora é uma **Conta do WhatsApp Business**

### 2.3 Criar App no Meta Developers

1. Acesse https://developers.facebook.com/apps/
2. Clique **"Criar aplicativo"** (azul, canto superior direito)
3. Escolha **"Empresa"** como tipo de app
4. Nome: **PsiHumanis**
5. Email de contato: seu email
6. Clique **"Criar aplicativo"**
7. Complete o captcha se pedir

### 2.4 Adicionar produto WhatsApp

1. Na página do app, desça até **"Adicionar produtos"**
2. Encontre **"WhatsApp"** e clique **"Configurar"**

### 2.5 Configurar número e pegar IDs

1. Na página de configuração do WhatsApp, desça até **"Enviar mensagens"**
2. Em **"Números de telefone"**, clique **"Adicionar número"**
3. Selecione o mesmo número que você conectou no passo 2.2
4. Após adicionar, anote:
   - **Phone Number ID** (número, tipo: `123456789012345`)
5. Role até **"Permanente"** abaixo de "Tokens de acesso"
   - Se não aparecer, continue no passo 2.6

### 2.6 Gerar Token de Acesso Permanente

1. Acesse https://developers.facebook.com/tools/accesstoken/
2. Faça login com a mesma conta
3. Selecione o app **PsiHumanis**
4. Clique **"Gerar Token de Acesso"**
5. Permissões: marque `whatsapp_business_messaging` e `whatsapp_business_management`
6. Clique **"Gerar"** — copie o token (começa com `EA...`)
7. Agora vá em https://business.facebook.com/latest/settings/business_users
8. No menu esquerdo, clique **"Usuários do sistema"**
9. Clique **"Adicionar"** → **"Usuário do sistema"**
10. Nome: **PsiHumanisAPI**
11. Função: **Admin**
12. Clique **"Criar usuário"**
13. Na página do usuário, vá em **"Token de acesso"**
14. Clique **"Gerar token"**
15. Selecione o app **PsiHumanis**
16. Permissões: `whats_business_messaging`, `whatsapp_business_management`
17. Clique **"Gerar"**
18. **IMPORTANTE**: Copie o token AGORA — depois de fechar não aparece de novo

### 2.7 Criar template de mensagem

1. Acesse https://business.facebook.com/wa/manage/message-templates/
2. Clique **"Criar template"** (azul, canto superior direito)
3. Dados:
   - **Nome**: `lembrete_consulta` (exatamente este nome)
   - **Idioma**: `Português (Brasil) — pt_BR`
   - **Categoria**: `Utilitário / Utility`
   - **Tipo**: `Texto / Text`
4. No campo **Corpo da mensagem**, digite:
   ```
   Olá {{1}}, passando para lembrar da sua consulta agendada no dia {{2}} às {{3}}. Confirme sua presença!
   ```
5. Clique **"Concluir"** e depois **"Enviar para análise"**
6. A aprovação costuma levar de 5 min a 2 horas

### 2.8 Adicionar env vars no Vercel

1. Acesse https://vercel.com/psimariojunior/psihumanis/settings/environment-variables
2. Adicione duas variáveis (ambas **Production** apenas):

| Nome | Valor |
|------|-------|
| `WHATSAPP_API_TOKEN` | Token permanente gerado no passo 2.6 |
| `WHATSAPP_PHONE_NUMBER_ID` | Phone Number ID do passo 2.5 (só números) |

3. Após adicionar, vá até o deploy mais recente e clique **"Redeploy"**

---

## 3. Cron Job — Disparo Automático (5 min)

O Vercel Hobby **não tem cron nativo**. Use cron-job.org (grátis):

1. Acesse https://cron-job.org
2. Clique **"Sign up"** (canto superior direito)
3. Email: qualquer um (pode ser o mesmo do projeto)
4. Senha: escolha uma
5. Confirme o email (checa spam!)
6. Clique **"Create Cronjob"**
7. Configure:
   - **Title**: `PsiHumanis - Lembretes`
   - **URL**: `https://psihumanis.com.br/api/cron/lembretes`
   - **Execution interval**: `Every 30 minutes`
   - **Request Method**: `GET`
8. Role e clique **"Create"**

---

## 4. Testar tudo

### 4.1 Testar email (já funciona)

1. Acesse o PsiHumanis → **Agenda**
2. Crie uma consulta para **daqui a 2 horas**
3. Abra os detalhes da consulta
4. Clique **"Enviar Lembrete"**
5. Deve aparecer toast: *"Lembrete enviado por EMAIL"*
6. Verifique a caixa de entrada do paciente

### 4.2 Testar WhatsApp (após configurar)

1. Repita os passos acima
2. Desta vez, deve aparecer: *"Lembrete enviado por EMAIL e WHATSAPP"*
3. Verifique o WhatsApp do paciente

### 4.3 Testar o cron

1. Depois de criar uma consulta futura, acesse manualmente:
   https://psihumanis.com.br/api/cron/lembretes
2. Resposta esperada: `{ "ok": true, "processed": 2, "sent": 2, "failed": 0 }`

---

## 5. Estrutura de arquivos (só para referência)

```
src/lib/email.ts          → sendEmail(), sendAppointmentReminderEmail()
src/lib/whatsapp.ts       → sendWhatsAppMessage(), sendAppointmentReminderWhatsApp()
src/lib/notifications.ts  → scheduleReminders(), dispatchNotification(), processPendingNotifications()
src/app/api/cron/lembretes/route.ts  → GET/POST (chamado pelo cron-job.org)
```

---

## 6. Troubleshooting

**"Lembrete enviado por EMAIL" mas paciente não recebeu**
   → Verificar caixa de spam
   → Outlook pode bloquear por segurança → liberar em https://account.live.com/activity

**"Erro ao enviar lembrete"**
   → O paciente não tem email nem WhatsApp cadastrado na ficha
   → Verificar `Pacientes` → editar paciente → email/telefone

**WhatsApp não enviou mesmo com número cadastrado**
   → Template `lembrete_consulta` ainda não foi aprovado
   → Verificar status em https://business.facebook.com/wa/manage/message-templates/
   → Token expirou → gerar novamente

**Token expirou**
   → O token de usuário do sistema (sistema) não expira
   → Se usou token de app normal, refazer passo 2.6
