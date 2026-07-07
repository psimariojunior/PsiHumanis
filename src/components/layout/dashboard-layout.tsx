"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { redirect } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { CommandPalette } from "@/components/command-palette"
import { KeyboardShortcutsHint } from "@/components/keyboard-shortcuts"
import { OnboardingTour } from "@/components/onboarding-tour"
import { GuidedTour } from "@/components/guided-tour"
import { PushNotificationPrompt } from "@/components/push-notification-prompt"
import { ArrivalNotification } from "@/components/recepcao/arrival-notification"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [showTrialBanner, setShowTrialBanner] = useState(true)
  const [trialInfo, setTrialInfo] = useState<{ plan: string; expiresAt: string } | null>(null)
  const [trialExpired, setTrialExpired] = useState(false)
  const [trialExpiredReason, setTrialExpiredReason] = useState("")
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/subscription/check-access")
        .then(r => r.json())
        .then(data => {
          if (!data.allowed) {
            setTrialExpired(true)
            setTrialExpiredReason(data.reason || "Acesso expirado")
          }
        })
        .catch(() => {})

      fetch("/api/subscription/status")
        .then(r => r.json())
        .then(data => {
          if (data.plan === "trial" || data.plan === "free") {
            setTrialInfo({ plan: data.plan, expiresAt: data.expiresAt || "" })
          }
        })
        .catch(() => {})
    }
  }, [status])

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (trialExpired) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50/40 to-slate-50/60 dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto max-w-md text-center p-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Trial Expirado</h1>
          <p className="text-muted-foreground mb-1">{trialExpiredReason}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Para continuar usando o PsiHumanis, escolha um plano que melhor se adapta às suas necessidades.
          </p>
          <Button
            size="lg"
            onClick={() => router.push("/pricing?expired=true")}
            className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg"
          >
            Escolher Plano <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/40 to-slate-50/60 dark:from-slate-950 dark:to-slate-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "transition-all duration-200",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Header onMenuClick={() => setMobileOpen(true)} onPaletteOpen={() => setPaletteOpen(true)} />
        <main className="p-4 lg:p-6">
          {showTrialBanner && trialInfo && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {trialInfo.plan === "trial" ? "Você está no período de trial gratuito" : "Plano gratuito ativo"}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {trialInfo.expiresAt
                      ? `Expira em ${new Date(trialInfo.expiresAt).toLocaleDateString("pt-BR")}`
                      : "Escolha um plano para ter acesso completo"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => router.push("/pricing")} className="bg-amber-600 hover:bg-amber-700 text-white">
                  Escolher Plano <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
                <button onClick={() => setShowTrialBanner(false)} className="text-amber-600 hover:text-amber-800 dark:text-amber-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <KeyboardShortcutsHint />
        <OnboardingTour />
        <GuidedTour />
        <PushNotificationPrompt />
        <ArrivalNotification />
      </div>
    </div>
  )
}
