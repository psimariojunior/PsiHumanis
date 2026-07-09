"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof Notification === "undefined") return
    if (Notification.permission !== "default") return
    const dismissed = localStorage.getItem("push-prompt-dismissed")
    if (dismissed && Date.now() - Number(dismissed) < 7 * 86400000) return
    setVisible(true)
  }, [])

  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted" && "serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready
        const resp = await fetch("/api/push/vapid").then((r) => r.json())
        if (resp.publicKey) {
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(resp.publicKey) as any,
          })
          await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sub.toJSON()),
          })
        }
      }
    } catch {}
    setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem("push-prompt-dismissed", String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 sm:left-auto sm:right-4 z-[100] max-w-sm rounded-2xl border bg-card p-4 shadow-2xl shadow-black/10 backdrop-blur-xl animate-in slide-in-from-bottom-5 fade-in duration-300">
      <button onClick={handleDismiss} className="absolute right-2 top-2 rounded-lg p-1 text-muted-foreground hover:text-foreground" aria-label="Fechar">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">Receba notificações</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Fique por dentro de consultas, mensagens e lembretes importantes.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleAllow} className="flex-1 text-xs h-8">Ativar</Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="flex-1 text-xs h-8">Agora não</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const arr = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i)
  return arr
}
