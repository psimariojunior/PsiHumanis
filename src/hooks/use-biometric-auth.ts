import { useState, useEffect, useCallback } from "react"

const BIOMETRIC_ENABLED_KEY = "psihumanis-biometric-enabled"
const PATIENT_TOKEN_KEY = "patient_token"

let biometricModule: any = null
let loadPromise: Promise<void> | null = null
let isNative = false

async function loadBiometric() {
  if (biometricModule) return
  if (loadPromise) return loadPromise
  loadPromise = (async () => {
    try {
      const { Capacitor } = await import("@capacitor/core")
      isNative = Capacitor.isNativePlatform()
      if (!isNative) return
      const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth")
      biometricModule = BiometricAuth
    } catch {
      // Web or missing native plugin
    }
  })()
  return loadPromise
}

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await loadBiometric()
      if (!mounted || !biometricModule) return
      try {
        const result = await biometricModule.checkBiometry()
        if (mounted) {
          setIsAvailable(result.isAvailable)
          setIsEnabled(localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true")
        }
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) return false
    setIsAuthenticating(true)
    try {
      await biometricModule?.authenticate({
        reason: "Use sua biometria para acessar o PsiHumanis",
        iosFallbackTitle: "Usar senha",
      })
      return true
    } catch {
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }, [isAvailable])

  const enable = useCallback(async (): Promise<boolean> => {
    if (!isNative || !biometricModule) return false
    try {
      await biometricModule.authenticate({
        reason: "Ative a biometria para acesso rápido",
        iosFallbackTitle: "Usar senha",
      })
      localStorage.setItem(BIOMETRIC_ENABLED_KEY, "true")
      setIsEnabled(true)
      return true
    } catch {
      return false
    }
  }, [])

  const disable = useCallback(() => {
    localStorage.removeItem(BIOMETRIC_ENABLED_KEY)
    setIsEnabled(false)
  }, [])

  const hasStoredToken = useCallback((): boolean => {
    return !!localStorage.getItem(PATIENT_TOKEN_KEY)
  }, [])

  return {
    isAvailable,
    isEnabled,
    isAuthenticating,
    authenticate,
    enable,
    disable,
    hasStoredToken,
  }
}
