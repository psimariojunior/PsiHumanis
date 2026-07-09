"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"
import { Capacitor } from "@capacitor/core"
import { useTheme } from "next-themes"
import toast from "react-hot-toast"
import { Eye, EyeOff, Loader2, LogIn, Sun, Moon, Fingerprint, ArrowLeft, X } from "lucide-react"

const PATIENT_CREDS_KEY = "psihumanis-patient-creds"
const BIOMETRIC_KEY = "psihumanis-biometric-enabled"

interface StoredCreds { email: string; password: string }

function getStoredCreds(): StoredCreds | null {
  try { return JSON.parse(localStorage.getItem(PATIENT_CREDS_KEY) || "null") } catch { return null }
}
function saveCreds(email: string, password: string) {
  localStorage.setItem(PATIENT_CREDS_KEY, JSON.stringify({ email, password }))
}
function removeCreds() {
  localStorage.removeItem(PATIENT_CREDS_KEY)
  localStorage.removeItem(BIOMETRIC_KEY)
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = usePatientAuth()
  const { theme, setTheme } = useTheme()
  const { vibrateNotification } = useHapticFeedback()
  const [isNative, setIsNative] = useState(false)
  const [biometricReady, setBiometricReady] = useState(false)
  const [storedCreds, setStoredCreds] = useState<StoredCreds | null>(null)

  useEffect(() => {
    try { setIsNative(Capacitor.isNativePlatform()) } catch {}
  }, [])

  useEffect(() => {
    if (!isNative) return
    ;(async () => {
      try {
        const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth")
        const result = await BiometricAuth.checkBiometry()
        if (result.isAvailable) {
          setBiometricReady(true)
          setStoredCreds(getStoredCreds())
        }
      } catch {}
    })()
  }, [isNative])

  async function handleBiometricLogin() {
    if (!storedCreds) {
      toast.error("Faça login com email e senha uma vez para ativar a biometria")
      return
    }
    setLoading(true)
    try {
      const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth")
      await BiometricAuth.authenticate({
        reason: "Use sua biometria para acessar o PsiHumanis",
        iosFallbackTitle: "Usar senha",
      })
      const res = await fetch("/api/pacientes/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: storedCreds.email, password: storedCreds.password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao entrar")
      vibrateNotification()
      login(data.token, data.patient)
      router.push("/paciente")
    } catch (e) {
      if (e instanceof Error && e.message !== "User cancelled") {
        removeCreds()
        setStoredCreds(null)
        toast.error("Credenciais expiradas. Faça login com email e senha novamente")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/pacientes/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao entrar")

      vibrateNotification()
      saveCreds(email.trim(), password)
      setStoredCreds(getStoredCreds())

      if (isNative && biometricReady) {
        try {
          const { BiometricAuth } = await import("@aparajita/capacitor-biometric-auth")
          await BiometricAuth.authenticate({
            reason: "Ative a biometria para acesso rápido",
            iosFallbackTitle: "Usar senha",
          })
          localStorage.setItem(BIOMETRIC_KEY, "true")
          toast.success("Biometria ativada!")
        } catch {}
      }

      login(data.token, data.patient)
      router.push("/paciente")
    } catch (e) {
      vibrateNotification()
      toast.error(e instanceof Error ? e.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="flex flex-col items-center gap-2 text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Entrar</h1>
            <p className="text-muted-foreground text-sm">Acesse sua área do paciente</p>
          </div>

          <Card>
            <CardHeader className="relative">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="absolute right-4 top-4 flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                aria-label="Alternar tema"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </button>
              <CardTitle>Entrar</CardTitle>
              <CardDescription>Informe seu email e senha para acessar</CardDescription>
            </CardHeader>
            <CardContent>
              {isNative && biometricReady && storedCreds ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleBiometricLogin}
                    disabled={loading}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shrink-0">
                      {loading ? <Loader2 className="h-4 w-4 text-white animate-spin" /> : <Fingerprint className="h-5 w-5 text-white" />}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{storedCreds.email}</p>
                      <p className="text-xs text-muted-foreground">Toque para entrar com biometria</p>
                    </div>
                    <Fingerprint className="h-4 w-4 text-teal-500 shrink-0" />
                  </button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">ou</span></div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <Input id="email" type="email" placeholder="Outro email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <div className="relative">
                      <Input id="password" type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="Mostrar senha">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                      Entrar com outra conta
                    </Button>
                  </form>
                  <button
                    onClick={() => { removeCreds(); setStoredCreds(null); toast.success("Biometria desativada") }}
                    className="w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors py-1"
                  >
                    <X className="h-3 w-3" /> Remover biometria
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold"
                    disabled={loading || !email.trim() || !password.trim()}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5 mr-2" />}
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              )}

              <div className="text-center text-sm mt-4">
                <Link href="/paciente/recuperar-senha" className="text-muted-foreground hover:text-primary transition-colors">
                  Esqueci minha senha
                </Link>
              </div>
            </CardContent>
          </Card>

          <p className="text-center mt-6">
            <Link href="/paciente/cadastro" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Não tem conta? Cadastre-se
            </Link>
          </p>

          <p className="text-center mt-4">
            <Link href="/sala-virtual/entrar" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Clique aqui para acessar a sala virtual
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
