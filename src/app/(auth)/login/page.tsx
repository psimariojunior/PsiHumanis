"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Eye, EyeOff, Loader2, Shield, Zap, CheckCircle, Heart, Sparkles, Fingerprint } from "lucide-react"
import toast from "react-hot-toast"
import { trackLogin } from "@/lib/analytics"
import { useBiometricAuthPsychologist } from "@/hooks/use-biometric-auth-psy"
import { Capacitor } from "@capacitor/core"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const isNative = Capacitor.isNativePlatform()
  const { isAvailable: biometricAvailable, isEnabled: biometricEnabled, authenticate, saveCredentials, getStoredCredentials, hasStoredCredentials, enable } = useBiometricAuthPsychologist()

  useEffect(() => {
    if (isNative && biometricAvailable && biometricEnabled && hasStoredCredentials()) {
      authenticate().then((success) => {
        if (success) {
          const creds = getStoredCredentials()
          if (creds) {
            setLoading(true)
            signIn("credentials", { email: creds.email, password: creds.password, redirect: false })
              .then((result) => {
                if (result?.error) { setLoading(false); return }
                trackLogin("biometric")
                router.push("/dashboard")
                router.refresh()
              })
              .catch(() => setLoading(false))
          }
        }
      })
    }
  }, [isNative, biometricAvailable, biometricEnabled])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) { toast.error("Email ou senha incorretos"); setLoading(false); return }
      saveCredentials(email, password)
      trackLogin("email")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Erro ao fazer login")
      setLoading(false)
    }
  }

  async function handleBiometricLogin() {
    const success = await authenticate()
    if (!success) {
      toast.error("Autenticação biométrica falhou")
      return
    }
    const creds = getStoredCredentials()
    if (!creds) {
      toast.error("Nenhuma credencial salva. Faça login com email e senha primeiro")
      return
    }
    setLoading(true)
    try {
      const result = await signIn("credentials", { email: creds.email, password: creds.password, redirect: false })
      if (result?.error) { toast.error("Credenciais expiradas. Faça login novamente"); setLoading(false); return }
      trackLogin("biometric")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Erro ao autenticar")
      setLoading(false)
    }
  }

  async function handleEnableBiometric() {
    const ok = await enable()
    if (ok) toast.success("Biometria ativada!")
    else toast.error("Ative a biometria no seu dispositivo")
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center px-4 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-white dark:from-slate-950 dark:to-slate-950" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-teal-500/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-teal-400/5 blur-3xl" />
        <div className="relative w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 shadow-2xl shadow-teal-500/30 ring-4 ring-teal-500/20 mb-2">
              <Image src="/logo.png" alt="PsiHumanis" width={80} height={80} className="w-full h-full object-cover" priority />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">PsiHumanis</h1>
            <p className="text-sm text-muted-foreground">Faça login para acessar o sistema</p>
          </div>

          <Card className="border-0 shadow-2xl shadow-teal-500/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-600" />
            <CardHeader className="pb-4">
              <CardTitle>Entrar</CardTitle>
              <CardDescription>Informe suas credenciais para acessar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/25" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : "Entrar"}
                </Button>

                {isNative && biometricAvailable && biometricEnabled && hasStoredCredentials() && (
                  <Button type="button" variant="outline" className="w-full border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950" onClick={handleBiometricLogin} disabled={loading}>
                    <Fingerprint className="mr-2 h-4 w-4 text-teal-600" />
                    Entrar com biometria
                  </Button>
                )}

                {isNative && biometricAvailable && !biometricEnabled && (
                  <Button type="button" variant="ghost" className="w-full text-sm text-muted-foreground" onClick={handleEnableBiometric}>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    Ativar biometria para próximo acesso
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/recuperar-senha" className="text-sm text-muted-foreground hover:text-primary transition-colors">Esqueceu a senha?</Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Não tem uma conta?</span></div>
          </div>

          <Link href="/register"><Button variant="outline" className="w-full" size="lg">Criar Conta</Button></Link>

          <p className="text-xs text-center text-muted-foreground">
            Ao continuar, você concorda com nossos <Link href="/termos" className="text-primary hover:underline">Termos de Uso</Link> e <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900 items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />
        <div className="relative max-w-md space-y-8 p-12">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-2">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white">Sua clínica na <span className="text-teal-200">palma da sua mão</span></h2>
            <p className="text-lg text-teal-100/80">Gerencie pacientes, agenda, finanças e muito mais em um só lugar. Moderno, seguro e intuitivo.</p>
          </div>
          <div className="grid gap-4">
            {[
              { title: "Agenda Online", desc: "Gerencie seus horários com facilidade", icon: Shield },
              { title: "Prontuários", desc: "Registros clínicos completos e seguros", icon: Zap },
              { title: "Sala Virtual", desc: "Atendimento por vídeo seguro e criptografado", icon: Heart },
              { title: "Financeiro", desc: "Controle de receitas, despesas e notas", icon: CheckCircle },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4 hover:bg-white/15 transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-teal-100/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-teal-200/60">
            <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> LGPD</div>
            <div className="flex items-center gap-1"><Zap className="h-3 w-3" /> Criptografado</div>
            <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> CRP</div>
          </div>
        </div>
      </div>
    </div>
  )
}