import { useState, useEffect, useCallback } from "react"
import { Capacitor } from "@capacitor/core"
import { BiometricAuth } from "@aparajita/capacitor-biometric-auth"

const BIOMETRIC_ENABLED_KEY = "psihumanis-biometric-enabled"
const PATIENT_TOKEN_KEY = "patient_token"

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    BiometricAuth.checkBiometry().then((result) => {
      setIsAvailable(result.isAvailable)
      setIsEnabled(localStorage.getItem(BIOMETRIC_ENABLED_KEY) === "true")
    }).catch(() => {})
  }, [])

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isAvailable || !isEnabled) return false
    setIsAuthenticating(true)
    try {
      await BiometricAuth.authenticate({
        reason: "Use sua biometria para acessar o PsiHumanis",
        iosFallbackTitle: "Usar senha",
      })
      return true
    } catch {
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }, [isAvailable, isEnabled])

  const enable = useCallback(async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return false
    try {
      await BiometricAuth.authenticate({
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
