"use client"

import { useState, useEffect } from "react"

export function useOfflineDetector() {
  const [isOffline, setIsOffline] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      if (wasOffline) {
        setWasOffline(false)
      }
    }
    const handleOffline = () => {
      setIsOffline(true)
      setWasOffline(true)
    }

    setIsOffline(!navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [wasOffline])

  return { isOffline, wasOffline, justCameBack: wasOffline && !isOffline }
}
