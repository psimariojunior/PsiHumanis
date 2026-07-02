"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { useBiometricAuth } from "@/hooks/use-biometric-auth"
import { Capacitor } from "@capacitor/core"
import { useTheme } from "next-themes"
import toast from "react-hot-toast"
import { Eye, EyeOff, Loader2, LogIn, Sun, Moon, Fingerprint } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = usePatientAuth()
  const { theme, setTheme } = useTheme()
  const { isAvailable: biometricAvailable, isEnabled: biometricEnabled, authenticate, hasStoredToken } = useBiometricAuth()
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    if (isNative && biometricAvailable && biometricEnabled && hasStoredToken()) {
      authenticate().then((success) => {
        if (success) {
          const token = localStorage.getItem("patient_token")
          if (token) {
            fetch("/api/pacientes/me", { headers: { Authorization: `Bearer ${token}` } })
              .then((r) => r.json())
              .then((patient) => {
                login(token, patient)
                router.push("/paciente")
              })
              .catch(() => {})
          }
        }
      })
    }
  }, [isNative, biometricAvailable, biometricEnabled])

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

      login(data.token, data.patient)
      router.push("/paciente")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao entrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
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
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
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

                {isNative && biometricAvailable && biometricEnabled && hasStoredToken() && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 text-base font-semibold"
                    onClick={async () => {
                      const success = await authenticate()
                      if (success) {
                        const token = localStorage.getItem("patient_token")
                        if (token) {
                          try {
                            const res = await fetch("/api/pacientes/me", { headers: { Authorization: `Bearer ${token}` } })
                            const patient = await res.json()
                            login(token, patient)
                            router.push("/paciente")
                          } catch { toast.error("Erro ao autenticar") }
                        }
                      } else {
                        toast.error("Autenticação biométrica falhou")
                      }
                    }}
                  >
                    <Fingerprint className="h-5 w-5 mr-2" />
                    Entrar com biometria
                  </Button>
                )}

                <div className="text-center text-sm">
                  <Link href="/paciente/recuperar-senha" className="text-muted-foreground hover:text-primary transition-colors">
                    Esqueci minha senha
                  </Link>
                </div>
              </form>
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
