"use client"

import { useState, useEffect, useCallback } from "react"
import { Haptics, ImpactStyle } from "@capacitor/haptics"
import { Capacitor } from "@capacitor/core"

export function useHapticFeedback() {
  const isNative = Capacitor.isNativePlatform()

  const vibrate = useCallback(async (style: "light" | "medium" | "heavy" = "medium") => {
    if (!isNative) return
    try {
      const impactStyle = style === "light" ? ImpactStyle.Light : style === "heavy" ? ImpactStyle.Heavy : ImpactStyle.Medium
      await Haptics.impact({ style: impactStyle })
    } catch {}
  }, [isNative])

  const vibrateNotification = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.notification({ type: "SUCCESS" as any })
    } catch {}
  }, [isNative])

  const vibrateSelection = useCallback(async () => {
    if (!isNative) return
    try {
      await Haptics.selectionStart()
      await Haptics.selectionEnd()
    } catch {}
  }, [isNative])

  return { vibrate, vibrateNotification, vibrateSelection }
}
