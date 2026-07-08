"use client"

import { useState, useEffect, useCallback } from "react"

let hapticsModule: any = null
let impactStyleEnum: any = null
let loadPromise: Promise<void> | null = null

async function loadHaptics() {
  if (hapticsModule) return
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    try {
      const { Haptics, ImpactStyle } = await import("@capacitor/haptics")
      hapticsModule = Haptics
      impactStyleEnum = ImpactStyle
    } catch {
      // Web or missing native plugin — haptics unavailable
    }
  })()
  return loadPromise
}

export function useHapticFeedback() {
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { Capacitor } = await import("@capacitor/core")
        if (mounted) setIsNative(Capacitor.isNativePlatform())
      } catch {
        // Not in Capacitor — web environment
      }
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (isNative) loadHaptics()
  }, [isNative])

  const vibrate = useCallback(async (style: "light" | "medium" | "heavy" = "medium") => {
    if (!isNative) return
    try {
      await loadHaptics()
      if (!hapticsModule || !impactStyleEnum) return
      const impactStyle = style === "light" ? impactStyleEnum.Light : style === "heavy" ? impactStyleEnum.Heavy : impactStyleEnum.Medium
      await hapticsModule.impact({ style: impactStyle })
    } catch {}
  }, [isNative])

  const vibrateNotification = useCallback(async () => {
    if (!isNative) return
    try {
      await loadHaptics()
      if (!hapticsModule) return
      await hapticsModule.notification({ type: "SUCCESS" })
    } catch {}
  }, [isNative])

  const vibrateSelection = useCallback(async () => {
    if (!isNative) return
    try {
      await loadHaptics()
      if (!hapticsModule) return
      await hapticsModule.selectionStart()
      await hapticsModule.selectionEnd()
    } catch {}
  }, [isNative])

  return { vibrate, vibrateNotification, vibrateSelection }
}
