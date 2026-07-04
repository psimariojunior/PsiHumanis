"use client"

import { useEffect, useState } from "react"
import { WifiOff, Wifi } from "lucide-react"
import { useOfflineDetector } from "@/hooks/use-offline-detector"
import { cn } from "@/lib/utils"

export function OfflineIndicator() {
  const { isOffline, justCameBack } = useOfflineDetector()
  const [show, setShow] = useState(false)
  const [showReconnected, setShowReconnected] = useState(false)

  useEffect(() => {
    if (isOffline) {
      setShow(true)
      setShowReconnected(false)
    }
  }, [isOffline])

  useEffect(() => {
    if (justCameBack) {
      setShow(false)
      setShowReconnected(true)
      const timer = setTimeout(() => setShowReconnected(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [justCameBack])

  if (!show && !showReconnected) return null

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300",
          isOffline ? "bg-red-500 text-white translate-y-0" : "-translate-y-full"
        )}
      >
        <WifiOff className="h-4 w-4" />
        Sem conexão com a internet
      </div>
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300",
          showReconnected ? "bg-green-500 text-white translate-y-0" : "-translate-y-full"
        )}
      >
        <Wifi className="h-4 w-4" />
        Conexão restaurada
      </div>
    </>
  )
}
