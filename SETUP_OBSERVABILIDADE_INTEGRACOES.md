# Setup: Google Calendar e Sentry

## Google Calendar

O código da integração já está implementado. Para ativar em produção:

1. Crie ou abra um projeto no Google Cloud Console.
2. Ative a API `Google Calendar API`.
3. Crie credenciais OAuth 2.0 do tipo `Web application`.
4. Configure o redirect URI autorizado:
   `https://psihumanis.com.br/api/integrations/google-calendar/callback`
5. Adicione no Vercel Production:
   `GOOGLE_CALENDAR_CLIENT_ID`
   `GOOGLE_CALENDAR_CLIENT_SECRET`
   `NEXT_PUBLIC_APP_URL=https://psihumanis.com.br`
6. No PsiHumanis, acesse `Configurações > Agenda > Google Calendar` e clique em `Conectar`.

## Sentry

O runtime Sentry já existe em:

- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

O `next.config.js` agora só aplica `withSentryConfig` quando `NEXT_PUBLIC_SENTRY_DSN` está definido. Isso evita quebrar o dev local sem DSN.

Para ativar em produção:

1. Crie projeto Next.js no Sentry.
2. Copie o DSN público.
3. Adicione no Vercel Production:
   `NEXT_PUBLIC_SENTRY_DSN=<dsn>`
4. Opcional para upload de sourcemaps/release tracking:
   `SENTRY_AUTH_TOKEN`
   `SENTRY_ORG`
   `SENTRY_PROJECT`
