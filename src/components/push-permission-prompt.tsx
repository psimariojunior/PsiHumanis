"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, X } from "lucide-react"
import { Capacitor } from "@capacitor/core"
import { PushNotifications } from "@capacitor/push-notifications"

export function PushPermissionPrompt() {
  const [show, setShow] = useState(false)
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    if (!isNative) return
    const dismissed = localStorage.getItem("psihumanis-push-prompt-dismissed")
    if (dismissed) return

    const timer = setTimeout(() => {
      PushNotifications.checkPermissions().then((result) => {
        if (result.receive === "prompt") {
          setShow(true)
        }
      }).catch(() => {})
    }, 5000)

    return () => clearTimeout(timer)
  }, [isNative])

  async function handleAllow() {
    try {
      await PushNotifications.requestPermissions()
      localStorage.setItem("psihumanis-push-prompt-dismissed", "true")
    } catch {}
    setShow(false)
  }

  function handleDismiss() {
    localStorage.setItem("psihumanis-push-prompt-dismissed", "true")
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9998] animate-slide-up">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 max-w-sm mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Ativar notificações?
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Receba lembretes de consultas e novidades do seu psicólogo.
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleAllow} className="bg-teal-600 hover:bg-teal-700 text-white h-8 px-3">
                Ativar
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8 px-3 text-muted-foreground">
                Agora não
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
