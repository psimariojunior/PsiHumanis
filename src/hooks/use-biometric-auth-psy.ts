import { useState, useEffect, useCallback } from "react"
import { Capacitor } from "@capacitor/core"
import { BiometricAuth } from "@aparajita/capacitor-biometric-auth"

const BIOMETRIC_PSY_ENABLED_KEY = "psihumanis-psy-biometric-enabled"
const PSY_CREDENTIALS_KEY = "psihumanis-psy-credentials"

interface PsyCredentials {
  email: string
  password: string
}

export function useBiometricAuthPsychologist() {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    BiometricAuth.checkBiometry().then((result) => {
      setIsAvailable(result.isAvailable)
      setIsEnabled(localStorage.getItem(BIOMETRIC_PSY_ENABLED_KEY) === "true")
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
        reason: "Ative a biometria para acesso rápido do psicólogo",
        iosFallbackTitle: "Usar senha",
      })
      localStorage.setItem(BIOMETRIC_PSY_ENABLED_KEY, "true")
      setIsEnabled(true)
      return true
    } catch {
      return false
    }
  }, [])

  const disable = useCallback(() => {
    localStorage.removeItem(BIOMETRIC_PSY_ENABLED_KEY)
    localStorage.removeItem(PSY_CREDENTIALS_KEY)
    setIsEnabled(false)
  }, [])

  const saveCredentials = useCallback((email: string, password: string) => {
    if (!Capacitor.isNativePlatform()) return
    localStorage.setItem(PSY_CREDENTIALS_KEY, JSON.stringify({ email, password }))
  }, [])

  const getStoredCredentials = useCallback((): PsyCredentials | null => {
    const raw = localStorage.getItem(PSY_CREDENTIALS_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }, [])

  const hasStoredCredentials = useCallback((): boolean => {
    return !!localStorage.getItem(PSY_CREDENTIALS_KEY)
  }, [])

  return {
    isAvailable,
    isEnabled,
    isAuthenticating,
    authenticate,
    enable,
    disable,
    saveCredentials,
    getStoredCredentials,
    hasStoredCredentials,
  }
}
