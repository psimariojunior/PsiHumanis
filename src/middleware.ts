import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

const LIVEKIT_WS = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gestao-de-psicologia-0khxxf01.livekit.cloud"

const publicPages = [
  "/", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest",
  "/termos", "/privacidade", "/login", "/register", "/recuperar-senha",
  "/pricing", "/blog", "/sobre", "/avaliacoes", "/status",
]

const publicPrefixes = [
  "/reset-password", "/sala-virtual/entrar", "/agendar", "/paciente", "/blog",
  "/.well-known",
]

const publicApiPrefixes = [
  "/api/auth", "/api/livekit", "/api/disponibilidade/public",
  "/api/agendamentos/public", "/api/pacientes/auth",
  "/api/pacientes/agendamentos", "/api/pacientes/diario",
  "/api/pacientes/me",   "/api/pacientes/invoices", "/api/pacientes/auth/refresh",
  "/api/pacientes/questionarios", "/api/pacientes/anamnese", "/api/pacientes/tarefas",
  "/api/pacientes/protocolos-crise",
  "/api/cron", "/api/health", "/api/seed-questionarios", "/api/seed-avaliacoes", "/api/seed-blog", "/api/hermes", "/api/cron/backup",
  "/api/cron/weekly-reports", "/api/cron/automation-triggers",
  "/api/recibos", "/api/lista-espera",
  "/api/consentimento", "/api/recursos-terapeuticos", "/api/relatorios",
  "/api/integrations/google-calendar", "/api/pagamentos/webhook",
  "/api/pagamentos/public-checkout",
  "/api/avaliacoes", "/api/referrals/validate",
  "/api/push/vapid", "/api/push/subscribe",
  "/api/avatar", "/api/blog",
]

const staticPrefixes = ["/_next", "/static"]
const staticExtensions = /\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|json|mp3|mp4|wav|ogg|woff2?|ttf|otf|eot)$/

function isPublic(pathname: string): boolean {
  if (publicPages.includes(pathname)) return true
  if (publicPrefixes.some((p) => pathname.startsWith(p))) return true
  if (staticExtensions.test(pathname)) return true
  return false
}

function isPublicApi(pathname: string): boolean {
  if (publicApiPrefixes.some((p) => pathname.startsWith(p))) return true
  return false
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (!token && !isPublic(pathname) && !isPublicApi(pathname)) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    const response = NextResponse.next()

    if (pathname === "/" || pathname === "/en") {
      response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate")
      response.headers.set("Pragma", "no-cache")
      response.headers.set("Expires", "0")
    }

    const origin = req.headers.get("origin") || ""
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, ""),
      "https://psihumanis.com.br",
      "http://localhost:3000",
    ].filter(Boolean) as string[]
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin)
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
      response.headers.set("Access-Control-Max-Age", "86400")
    }

    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("X-XSS-Protection", "1; mode=block")
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.set(
      "Permissions-Policy",
      "camera=(self), microphone=(self), geolocation=()"
    )
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://*.stripe.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        `connect-src 'self' ${LIVEKIT_WS} https://gestao-de-psicologia-0khxxf01.livekit.cloud wss://gestao-de-psicologia-0khxxf01.livekit.cloud https://api.sendgrid.com https://api.resend.com https://graph.facebook.com https://api.livekit.cloud https://api.stripe.com https://www.googletagmanager.com https://www.google-analytics.com`,
        "media-src 'self' blob: mediastream:",
        "worker-src 'self' blob:",
        "child-src 'self' blob:",
        "frame-ancestors 'none'",
        "frame-src 'self' https://js.stripe.com https://*.stripe.com",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ")
    )

    if (process.env.NODE_ENV === "production") {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      )
    }

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        if (isPublicApi(pathname) || staticPrefixes.some((p) => pathname.startsWith(p)) || isPublic(pathname)) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
}
