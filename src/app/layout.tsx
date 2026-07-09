import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Providers } from "./providers"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"
import { SwUpdateNotification } from "@/components/sw-update-notification"
import { CookieConsent } from "@/components/cookie-consent"
import { GoogleAnalytics } from "@/components/google-analytics"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PushPermissionPrompt } from "@/components/push-permission-prompt"
import { SplashProvider } from "@/components/splash-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })

const siteUrl = "https://psihumanis.com.br"
const siteName = "PsiHumanis"
const title = "PsiHumanis — Sistema de Gestão para Psicólogos | Agenda Online, Prontuários e Sala Virtual"
const description = "Sistema completo de gestão para psicólogos. Agende consultas online, emita prontuários, gerencie finanças e realize atendimentos via sala virtual segura. Tudo em um só lugar."

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    "psicologia", "gestão para psicólogos", "agenda online psicólogo",
    "prontuário psicológico", "sala virtual psicologia", "terapia online",
    "atendimento psicológico", "software psicologia", "psicólogo",
    "consulta online", "CRP", "clínica de psicologia",
  ],
  authors: [{ name: "PsiHumanis" }],
  creator: "PsiHumanis",
  publisher: "PsiHumanis",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName,
    title,
    description,
    images: [
      {
        url: "/og?v=2",
        width: 1200,
        height: 630,
        alt: "PsiHumanis - Gestão para Psicólogos",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png?v=2"],
    creator: "@psihumanis",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg?v=3",
    shortcut: "/favicon-32.png?v=3",
    apple: "/apple-touch-icon.png?v=3",
  },
  appleWebApp: {
    capable: true,
    title: "PsiHumanis",
    statusBarStyle: "black-translucent",
    startupImage: ["/pwa-512-v5.png"],
  },
  manifest: "/manifest",
  verification: {
    google: "kvnYGkRrrFIWxX_bxBKS0w8OL1VrhuDcOWqTG0EViQQ",
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "PsiHumanis",
      description: "Plataforma de gest\u00e3o para psic\u00f3logos com agenda online, prontu\u00e1rios digitais, sala virtual e gest\u00e3o financeira.",
      url: siteUrl,
      telephone: "+55-31-99286-3861",
      email: "contato@psihumanis.com.br",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Belo Horizonte",
        addressRegion: "MG",
        addressCountry: "BR",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -19.9167,
        longitude: -43.9345,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      priceRange: "$$",
      image: `${siteUrl}/logo.png`,
      areaServed: "BR",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Servi\u00e7os de Psicologia",
        itemListElement: [
          { "@type": "Offer", name: "Terapia Individual" },
          { "@type": "Offer", name: "Terapia de Casal" },
          { "@type": "Offer", name: "Terapia Online" },
          { "@type": "Offer", name: "Supervis\u00e3o Cl\u00ednica" },
        ],
      },
    }),
    "mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-teal-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white">
          Pular para o conteúdo
        </a>
        <Providers>
          <SplashProvider>
            <OfflineIndicator />
            <PushPermissionPrompt />
            <main id="main-content" className="animate-fade-in">{children}</main>
            <SwUpdateNotification />
            <PwaInstallPrompt />
          </SplashProvider>
        </Providers>
        <Script id="pwa-capture" strategy="beforeInteractive">
          {`
            window.__deferredPwaPrompt = null;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              window.__deferredPwaPrompt = e;
              window.dispatchEvent(new Event('pwa-ready'));
            });
          `}
        </Script>
        <GoogleAnalytics />
        <Script id="pwa-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
              });
            }
          `}
        </Script>
        <CookieConsent />
      </body>
    </html>
  )
}
