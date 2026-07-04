"use client"

import { useState, useEffect } from "react"
import { AnimatedSplash } from "@/components/animated-splash"

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const splashSeen = sessionStorage.getItem("psihumanis-splash-seen")
    if (splashSeen) {
      setShowSplash(false)
      setReady(true)
    }
  }, [])

  function handleSplashComplete() {
    sessionStorage.setItem("psihumanis-splash-seen", "true")
    setShowSplash(false)
    setReady(true)
  }

  if (showSplash && !ready) {
    return <AnimatedSplash onComplete={handleSplashComplete} />
  }

  return <>{children}</>
}
