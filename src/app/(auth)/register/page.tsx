"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Loader2, CheckCircle2, AlertCircle, Gift, ArrowLeft } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"
import { trackRegister } from "@/lib/analytics"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [referralValid, setReferralValid] = useState<{ valid: boolean; referrerName?: string } | null>(null)
  const [referralLoading, setReferralLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    crp: "",
    referralCode: searchParams.get("ref") || "",
  })
  const [acceptTerms, setAcceptTerms] = useState(false)

  useEffect(() => {
    const code = searchParams.get("ref")
    if (code) {
      setFormData((prev) => ({ ...prev, referralCode: code }))
      setReferralLoading(true)
      fetch(`/api/referrals/validate?code=${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((data) => setReferralValid(data))
        .catch(() => setReferralValid({ valid: false }))
        .finally(() => setReferralLoading(false))
    }
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Senhas não conferem")
        return
      }

      if (!acceptTerms) {
        toast.error("Você precisa aceitar os Termos de Uso e a Política de Privacidade")
        return
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          crp: formData.crp,
          referralCode: formData.referralCode || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erro ao cadastrar")
        return
      }

      toast.success("Conta criada com sucesso! Vamos configurar seu perfil.")
      trackRegister("email")
      router.push("/onboarding")
    } catch {
      toast.error("Erro ao cadastrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 shadow-2xl shadow-teal-500/30 ring-4 ring-teal-500/20 mb-1">
            <Image src="/logo.png" alt="PsiHumanis" width={80} height={80} className="w-full h-full object-cover" priority />
          </div>
          <h1 className="text-3xl font-bold">Criar Conta</h1>
          <p className="text-sm text-muted-foreground">
            Comece a gerenciar sua clínica
          </p>
        </div>

        {step === 1 ? (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informe seus dados para criar sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 p-4 space-y-2">
                <p className="text-sm font-medium text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                  <Gift className="h-4 w-4" /> 14 dias de trial gratuito
                </p>
                <ul className="text-xs text-teal-600 dark:text-teal-400 space-y-1">
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Agenda online e prontuários digitais</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Sala virtual com videochamada segura</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Lembretes automáticos por WhatsApp e email</li>
                  <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3" /> Sem cartão de crédito necessário</li>
                </ul>
              </div>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crp">CRP (opcional)</Label>
                  <Input
                    id="crp"
                    placeholder="00/00000"
                    value={formData.crp}
                    onChange={(e) => setFormData({ ...formData, crp: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referralCode" className="flex items-center gap-1.5">
                    <Gift className="h-3.5 w-3.5 text-emerald-600" />
                    Código de indicação (opcional)
                  </Label>
                  <Input
                    id="referralCode"
                    placeholder="Ex: AB-123456"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                    disabled={!!referralValid?.valid}
                    className={referralValid?.valid ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : ""}
                  />
                  {referralLoading && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Verificando código...
                    </p>
                  )}
                  {referralValid?.valid && referralValid.referrerName && (
                    <p className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Indicado por <strong>{referralValid.referrerName}</strong> — vocês ganham 1 mês grátis!
                    </p>
                  )}
                  {referralValid && !referralValid.valid && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      Código inválido ou expirado
                    </p>
                  )}
                </div>
                <Button onClick={() => setStep(2)} className="w-full">
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Crie uma senha forte para sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <div className="flex gap-2 text-xs">
                    <span className={formData.password.length >= 8 ? "text-teal-500" : "text-muted-foreground"}>
                      <CheckCircle2 className="mr-1 inline h-3 w-3" />
                      8+ caracteres
                    </span>
                    <span className={/[A-Z]/.test(formData.password) ? "text-teal-500" : "text-muted-foreground"}>
                      Maiúscula
                    </span>
                    <span className={/[0-9]/.test(formData.password) ? "text-teal-500" : "text-muted-foreground"}>
                      Número
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      Senhas não conferem
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Checkbox
                    id="acceptTerms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="acceptTerms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    Li e aceito os{" "}
                    <Link href="/termos" className="text-primary hover:underline" target="_blank">Termos de Uso</Link>
                    {" "}e a{" "}
                    <Link href="/privacidade" className="text-primary hover:underline" target="_blank">Política de Privacidade</Link>.
                    Entendo que meus dados serão tratados conforme a LGPD.
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Voltar
                  </Button>
                  <Button type="submit" disabled={loading || !acceptTerms} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
