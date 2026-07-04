import { useState, useEffect, useCallback } from "react"
import { Capacitor } from "@capacitor/core"
import { BiometricAuth } from "@aparajita/capacitor-biometric-auth"

const BIOMETRIC_PSY_ENABLED_KEY = "psihumanis-psy-biometric-enabled"
const PSY_ACCOUNTS_KEY = "psihumanis-psy-accounts"

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
    localStorage.removeItem(PSY_ACCOUNTS_KEY)
    setIsEnabled(false)
  }, [])

  const saveCredentials = useCallback((email: string, password: string) => {
    if (!Capacitor.isNativePlatform()) return
    const accounts = getAllAccounts()
    const existing = accounts.findIndex(a => a.email.toLowerCase() === email.toLowerCase())
    if (existing >= 0) {
      accounts[existing] = { email, password }
    } else {
      accounts.push({ email, password })
    }
    localStorage.setItem(PSY_ACCOUNTS_KEY, JSON.stringify(accounts))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getAllAccounts = useCallback((): PsyCredentials[] => {
    const raw = localStorage.getItem(PSY_ACCOUNTS_KEY)
    if (!raw) return []
    try {
      return JSON.parse(raw)
    } catch {
      return []
    }
  }, [])

  const getStoredCredentials = useCallback((): PsyCredentials | null => {
    const accounts = getAllAccounts()
    return accounts.length > 0 ? accounts[accounts.length - 1] : null
  }, [getAllAccounts])

  const getAccountByEmail = useCallback((email: string): PsyCredentials | null => {
    const accounts = getAllAccounts()
    return accounts.find(a => a.email.toLowerCase() === email.toLowerCase()) || null
  }, [getAllAccounts])

  const removeAccount = useCallback((email: string) => {
    const accounts = getAllAccounts().filter(a => a.email.toLowerCase() !== email.toLowerCase())
    if (accounts.length === 0) {
      localStorage.removeItem(PSY_ACCOUNTS_KEY)
      localStorage.removeItem(BIOMETRIC_PSY_ENABLED_KEY)
      setIsEnabled(false)
    } else {
      localStorage.setItem(PSY_ACCOUNTS_KEY, JSON.stringify(accounts))
    }
  }, [getAllAccounts])

  const hasStoredCredentials = useCallback((): boolean => {
    return getAllAccounts().length > 0
  }, [getAllAccounts])

  return {
    isAvailable,
    isEnabled,
    isAuthenticating,
    authenticate,
    enable,
    disable,
    saveCredentials,
    getStoredCredentials,
    getAccountByEmail,
    getAllAccounts,
    removeAccount,
    hasStoredCredentials,
  }
}
