"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getInitials } from "@/lib/utils"
import { getLocale, setLocale, t } from "@/lib/i18n"
import { Save, User, Bell, Lock, Globe, Palette, Shield, CreditCard, Users, Loader2, Calendar, CheckCircle, XCircle, ExternalLink, AlertTriangle, Camera, Download, FileJson, FileSpreadsheet, Eye, Gift, Copy, MessageCircle, BookOpen } from "lucide-react"
import { BlogEditor } from "@/components/admin/blog-editor"
import toast from "react-hot-toast"

function GoogleCalendarStatus() {
  const [connected, setConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ synced?: number; failed?: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [configMissing, setConfigMissing] = useState(false)

  useEffect(() => {
    fetch("/api/integrations/google-calendar")
      .then((r) => r.json())
      .then((data) => {
        if (data.connected !== undefined) setConnected(data.connected)
        if (data.configMissing) setConfigMissing(true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleConnect = () => {
    window.location.href = "/api/integrations/google-calendar/auth"
  }

  const handleDisconnect = async () => {
    try {
      const res = await fetch("/api/integrations/google-calendar", { method: "POST" })
      if (res.ok) {
        setConnected(false)
        toast.success("Google Calendar desconectado")
      }
    } catch {
      toast.error("Erro ao desconectar")
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch("/api/integrations/google-calendar/sync", { method: "POST" })
      const data = await res.json()
      setSyncResult(data)
      if (res.ok) {
        toast.success(`${data.synced} consulta(s) sincronizada(s)`)
      }
    } catch {
      toast.error("Erro ao sincronizar")
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Verificando integração...
      </div>
    )
  }

  if (configMissing) {
    return (
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-300">Integração não configurada</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Configure as variáveis de ambiente <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">GOOGLE_CALENDAR_CLIENT_ID</code> e <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">GOOGLE_CALENDAR_CLIENT_SECRET</code> no Vercel para ativar a integração.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (connected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="font-medium text-emerald-700 dark:text-emerald-300">Google Calendar conectado</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Suas consultas serão sincronizadas automaticamente</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950">
            <XCircle className="mr-1 h-4 w-4" /> Desconectar
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
            {syncing ? "Sincronizando..." : "Sincronizar Agora"}
          </Button>
          <Button variant="outline" asChild>
            <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Abrir Google Agenda
            </a>
          </Button>
        </div>

        {syncResult && (
          <div className="rounded-lg border p-3 text-sm space-y-1">
            <p className={syncResult.failed ? "text-amber-500" : "text-emerald-500"}>
              Sincronização concluída: {syncResult.synced} criado(s)
              {syncResult.failed ? `, ${syncResult.failed} falha(s)` : ""}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium">Conectar Google Calendar</p>
          <p className="text-sm text-muted-foreground">Agende consultas diretamente do Google Agenda</p>
        </div>
        <Button onClick={handleConnect}>
          <Calendar className="mr-2 h-4 w-4" /> Conectar
        </Button>
      </div>
    </div>
  )
}

interface ReferralInfo {
  code: string
  inviteLink: string
  referrals: Array<{
    id: string
    name: string
    email: string
    plan: string
    rewardGranted: boolean
    createdAt: string
  }>
  totalReferrals: number
  totalRewards: number
}

function ReferralProgram() {
  const [info, setInfo] = useState<ReferralInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => r.json())
      .then((data) => setInfo(data))
      .catch(() => toast.error("Erro ao carregar indicações"))
      .finally(() => setLoading(false))
  }, [])

  const copy = async (text: string, message: string) => {
    await navigator.clipboard.writeText(text)
    toast.success(message)
  }
  const whatsappText = encodeURIComponent(`Ganhe 14 dias grátis no PsiHumanis usando meu convite: ${info?.inviteLink || ""}`)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!info) return null

  return (
    <div className="space-y-6">
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-background dark:from-emerald-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-emerald-600" />
            Programa de Indicação
          </CardTitle>
          <CardDescription>
            Indique outros psicólogos. Quando um indicado assinar um plano pago, você ganha 1 mês grátis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <Label>Seu código</Label>
              <div className="mt-2 flex gap-2">
                <Input value={info.code} readOnly className="font-mono font-semibold" />
                <Button type="button" variant="outline" onClick={() => copy(info.code, "Código copiado")}> 
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <Label>Link de convite</Label>
              <div className="mt-2 flex gap-2">
                <Input value={info.inviteLink} readOnly className="text-xs" />
                <Button type="button" variant="outline" onClick={() => copy(info.inviteLink, "Link copiado")}> 
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Convide pelo WhatsApp</p>
              <p className="text-sm text-muted-foreground">Compartilhe seu link com colegas e ganhe 1 mês grátis por assinatura ativada.</p>
            </div>
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
              <a href={`https://wa.me/?text=${whatsappText}`} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" /> Compartilhar
              </a>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground">Indicações</p>
              <p className="text-3xl font-bold">{info.totalReferrals}</p>
            </div>
            <div className="rounded-xl border bg-background p-4">
              <p className="text-sm text-muted-foreground">Meses grátis liberados</p>
              <p className="text-3xl font-bold text-emerald-600">{info.totalRewards}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de indicações</CardTitle>
          <CardDescription>A recompensa é liberada quando o indicado ativa um plano pago.</CardDescription>
        </CardHeader>
        <CardContent>
          {info.referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma indicação registrada ainda.</p>
          ) : (
            <div className="space-y-3">
              {info.referrals.map((referral) => (
                <div key={referral.id} className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{referral.name}</p>
                    <p className="text-xs text-muted-foreground">{referral.email}</p>
                  </div>
                  <div className="text-sm">
                    {referral.rewardGranted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                        <CheckCircle className="h-3.5 w-3.5" /> Recompensa liberada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                        Aguardando assinatura
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  const locale = getLocale()
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    crp: "",
    phone: "",
    specialty: "",
    bio: "",
    pixKey: "",
    paymentInfo: "",
    avatarUrl: "",
    sessionDuration: 50,
    sessionInterval: 10,
    publicName: "",
    publicBio: "",
    sessionPrice: "" as string | number,
    welcomeMessage: "",
    clinicAddress: "",
  })
  const [loading, setLoading] = useState(true)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [subInfo, setSubInfo] = useState<{
    plan: string
    planExpiresAt: string | null
    subscriptionStatus: string
    stripeCustomerId: string | null
    subscription: {
      cancelAtPeriodEnd: boolean
      currentPeriodEnd: string | null
    } | null
  } | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState<"csv" | "json" | null>(null)
  const [lastExport, setLastExport] = useState<{ at: string; format: string } | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem("psihumanis_last_export")
    if (raw) {
      try { setLastExport(JSON.parse(raw)) } catch {}
    }
  }, [])

  useEffect(() => {
    fetch("/api/configuracoes")
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => {
        if (data.name) setProfile({
            name: data.name || "",
            email: data.email || "",
            crp: data.crp || "",
            phone: data.phone || "",
            specialty: data.specialty || "",
            bio: data.bio || "",
            pixKey: data.pixKey || "",
            paymentInfo: data.paymentInfo || "",
            avatarUrl: data.avatarUrl || "",
            sessionDuration: data.sessionDuration || 50,
            sessionInterval: data.sessionInterval || 10,
            publicName: data.publicName || "",
            publicBio: data.publicBio || "",
            sessionPrice: data.sessionPrice ?? "",
            welcomeMessage: data.welcomeMessage || "",
            clinicAddress: data.clinicAddress || "",
          })
      })
      .catch(() => toast.error("Erro ao carregar configurações"))
      .finally(() => setLoading(false))

    fetch("/api/subscription/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) setSubInfo(data)
      })
      .catch(() => {})
  }, [])

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/subscription/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Erro ao abrir portal")
      }
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setPortalLoading(false)
    }
  }

  const handleUpgrade = async (targetPlan: string = "pro") => {
    setUpgradeLoading(true)
    try {
      window.location.href = `/configuracoes/checkout?plan=${targetPlan}`
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setUpgradeLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new) {
      toast.error("Preencha a senha atual e a nova senha")
      return
    }
    if (passwords.new.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres")
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("As senhas não coincidem")
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao alterar senha")
        return
      }
      toast.success(t("toast.passwordChanged", locale))
      setPasswords({ current: "", new: "", confirm: "" })
    } catch {
      toast.error("Erro ao alterar senha")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB")
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("O arquivo deve ser uma imagem")
      return
    }
    setAvatarLoading(true)
    try {
      // Resize image to 200x200 for avatar
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new window.Image()
      const base64 = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          canvas.width = 200
          canvas.height = 200
          ctx.drawImage(img, 0, 0, 200, 200)
          resolve(canvas.toDataURL("image/jpeg", 0.8))
        }
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: base64 }),
      })
      if (!res.ok) throw new Error()
      setProfile(prev => ({ ...prev, avatarUrl: base64 }))
      toast.success(t("toast.photoUpdated", locale))
    } catch {
      toast.error("Erro ao enviar foto")
    } finally {
      setAvatarLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    try {
      const toSend = {
        ...profile,
        sessionPrice: profile.sessionPrice === "" || profile.sessionPrice === null ? null : Number(profile.sessionPrice),
      }
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSend),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        console.error("Save error:", err)
        throw new Error()
      }
      toast.success(t("toast.configSaved", locale))
    } catch {
      toast.error("Erro ao salvar configurações")
    }
  }

  const handleExport = async (format: "csv" | "json") => {
    setExportLoading(format)
    try {
      const res = await fetch(`/api/export?format=${format}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const disp = res.headers.get("Content-Disposition") || ""
      const match = disp.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : `psihumanis-backup.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      const entry = { at: new Date().toISOString(), format }
      localStorage.setItem("psihumanis_last_export", JSON.stringify(entry))
      setLastExport(entry)
      toast.success(`Exportação ${format.toUpperCase()} concluída!`)
    } catch {
      toast.error("Erro ao exportar dados")
    } finally {
      setExportLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-44 animate-shimmer rounded-lg" />
          <div className="h-4 w-64 animate-shimmer rounded-lg" />
        </div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-28 animate-shimmer rounded-lg" />
          ))}
        </div>
        <div className="rounded-xl border p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-4 w-32 animate-shimmer rounded" />
                <div className="h-3 w-48 animate-shimmer rounded" />
              </div>
              <div className="h-9 w-20 animate-shimmer rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-nowrap overflow-x-auto w-full justify-start -mb-px">
          <TabsTrigger value="profile" className="shrink-0"><User className="mr-2 h-4 w-4" />Perfil</TabsTrigger>
          <TabsTrigger value="public" className="shrink-0"><Eye className="mr-2 h-4 w-4" />Perfil Público</TabsTrigger>
          <TabsTrigger value="notifications" className="shrink-0"><Bell className="mr-2 h-4 w-4" />Notificações</TabsTrigger>
          <TabsTrigger value="security" className="shrink-0"><Lock className="mr-2 h-4 w-4" />Segurança</TabsTrigger>
          <TabsTrigger value="appearance" className="shrink-0"><Palette className="mr-2 h-4 w-4" />Aparência</TabsTrigger>
          <TabsTrigger value="schedule" className="shrink-0"><Globe className="mr-2 h-4 w-4" />Agenda</TabsTrigger>
          <TabsTrigger value="financial" className="shrink-0"><CreditCard className="mr-2 h-4 w-4" />Pagamentos</TabsTrigger>
          <TabsTrigger value="referrals" className="shrink-0"><Gift className="mr-2 h-4 w-4" />Indicações</TabsTrigger>
          <TabsTrigger value="team" className="shrink-0"><Users className="mr-2 h-4 w-4" />Equipe</TabsTrigger>
          <TabsTrigger value="blog" className="shrink-0"><BookOpen className="mr-2 h-4 w-4" />Blog</TabsTrigger>
          <TabsTrigger value="export" className="shrink-0"><Download className="mr-2 h-4 w-4" />Exportação</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais e profissionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatarUrl || undefined} alt={profile.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                >
                  {avatarLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  Alterar Foto
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome completo</Label>
                  <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>CRP</Label>
                  <Input value={profile.crp} onChange={(e) => setProfile({...profile, crp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input value={profile.specialty} onChange={(e) => setProfile({...profile, specialty: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Biografia</Label>
                <Textarea rows={4} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
              </div>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Perfil Público</CardTitle>
              <CardDescription>Configure o que os pacientes veem ao agendar uma consulta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome de exibição</Label>
                  <Input placeholder="Como os pacientes te veem" value={profile.publicName} onChange={(e) => setProfile({...profile, publicName: e.target.value})} />
                  <p className="text-xs text-muted-foreground">Se vazio, usa o nome da conta</p>
                </div>
                <div className="space-y-2">
                  <Label>Valor da sessão (R$)</Label>
                  <Input type="number" min="0" step="0.01" placeholder="Ex: 150" value={profile.sessionPrice} onChange={(e) => setProfile({...profile, sessionPrice: e.target.value})} />
                  <p className="text-xs text-muted-foreground">Deixe vazio para não mostrar preço</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mensagem de boas-vindas</Label>
                <Textarea rows={3} placeholder="Mensagem que aparece para o paciente ao agendar" value={profile.welcomeMessage} onChange={(e) => setProfile({...profile, welcomeMessage: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Biografia pública</Label>
                <Textarea rows={4} placeholder="Descrição que aparece no card de agendamento" value={profile.publicBio} onChange={(e) => setProfile({...profile, publicBio: e.target.value})} />
                <p className="text-xs text-muted-foreground">Se vazio, usa a biografia do perfil</p>
              </div>
              <div className="space-y-2">
                <Label>Endereço / Local de atendimento</Label>
                <Input placeholder="Ex: Rua Exemplo, 123 - Belo Horizonte/MG" value={profile.clinicAddress} onChange={(e) => setProfile({...profile, clinicAddress: e.target.value})} />
              </div>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Salvar Perfil Público
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
              <CardDescription>Assim seu perfil aparece para os pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 ring-1 ring-white/10 max-w-md">
                <div className="flex items-start gap-4 mb-4">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-white/10" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal-500/30 to-indigo-500/30 flex items-center justify-center ring-2 ring-white/10 shrink-0">
                      <User className="h-8 w-8 text-teal-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-white">{profile.publicName || profile.name || "Seu nome"}</h3>
                    {profile.specialty && <p className="text-teal-400/80 text-sm">{profile.specialty}</p>}
                    {profile.sessionPrice && <p className="text-green-400 text-sm font-medium mt-1">R$ {Number(profile.sessionPrice).toFixed(2)}</p>}
                  </div>
                </div>
                {(profile.publicBio || profile.bio) && (
                  <p className="text-white/50 text-sm mb-3 line-clamp-3">{profile.publicBio || profile.bio}</p>
                )}
                {profile.welcomeMessage && (
                  <p className="text-teal-300/70 text-sm italic mb-3">&ldquo;{profile.welcomeMessage}&rdquo;</p>
                )}
                {profile.clinicAddress && (
                  <p className="text-white/30 text-xs">{profile.clinicAddress}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>Configure como deseja ser notificado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "WhatsApp", desc: "Receber notificações via WhatsApp", enabled: true },
                { title: "E-mail", desc: "Receber notificações por email", enabled: true },
                { title: "SMS", desc: "Receber notificações por SMS", enabled: false },
                { title: "Push", desc: "Notificações push no navegador", enabled: true },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.enabled} />
                </div>
              ))}
              <Separator />
              <div className="space-y-3">
                <p className="font-medium">Lembretes Automáticos</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lembrar paciente 24h antes</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lembrar paciente 1h antes</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confirmar presença após agendamento</span>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Proteja sua conta e dados dos pacientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alterar Senha</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Senha atual</Label>
                    <Input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova senha</Label>
                    <Input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar nova senha</Label>
                    <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                  </div>
                </div>
                <Button variant="outline" onClick={handleChangePassword} disabled={passwordLoading}>
                  {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Alterar Senha
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Autenticação em Dois Fatores (2FA)</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Autenticação 2FA</p>
                    <p className="text-sm text-muted-foreground">Proteção adicional no login</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Notificação de Incidente de Dados (ANPD)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Em caso de vazamento ou acesso não autorizado a dados de pacientes, você deve
                  notificar a ANPD em até 2 dias úteis (Art. 48 da LGPD). Siga o passo a passo:
                </p>
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold shrink-0">1</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Identifique e contenha o incidente</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">Altere senhas, revogue acessos, documente o que aconteceu.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold shrink-0">2</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Registre o relatório interno</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">Data, natureza dos dados afetados, número de titulares, consequências.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold shrink-0">3</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Notifique a ANPD</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Pelo canal:{" "}
                        <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                          www.gov.br/anpd
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold shrink-0">4</span>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Notifique os titulares afetados</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">Se houver risco aos direitos dos pacientes, informe-os individualmente.</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <a
                    href="https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/modelo-de-comunicacao-a-anpd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium flex items-center gap-1"
                  >
                    Modelo de comunicação à ANPD ↗
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Tema Escuro</p>
                  <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
                </div>
                <Switch
                  checked={typeof document !== "undefined" && document.documentElement.classList.contains("dark")}
                  onCheckedChange={(checked) => {
                    const html = document.documentElement
                    if (checked) {
                      html.classList.add("dark")
                      localStorage.setItem("theme", "dark")
                    } else {
                      html.classList.remove("dark")
                      localStorage.setItem("theme", "light")
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select value={getLocale()} onValueChange={(v) => setLocale(v as "pt" | "en")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Idioma da interface e do conteúdo público</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Agenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Duração padrão da sessão (minutos)</Label>
                <Select value={String(profile.sessionDuration)} onValueChange={(v) => setProfile({...profile, sessionDuration: parseInt(v)})}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="40">40 min</SelectItem>
                    <SelectItem value="50">50 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Intervalo entre consultas (minutos)</Label>
                <Select value={String(profile.sessionInterval)} onValueChange={(v) => setProfile({...profile, sessionInterval: parseInt(v)})}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem intervalo</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>Sincronize seus agendamentos automaticamente com o Google Agenda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleCalendarStatus />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Pagamentos</CardTitle>
              <CardDescription>Configure como os pacientes podem pagar pelas consultas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Chave PIX</Label>
                <Input
                  value={profile.pixKey}
                  onChange={(e) => setProfile({...profile, pixKey: e.target.value})}
                  placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                />
                <p className="text-sm text-muted-foreground">
                  A chave PIX será exibida nas faturas para o paciente realizar o pagamento
                </p>
              </div>
              <div className="space-y-2">
                <Label>Instruções de Pagamento</Label>
                <Textarea
                  rows={4}
                  value={profile.paymentInfo}
                  onChange={(e) => setProfile({...profile, paymentInfo: e.target.value})}
                  placeholder="Ex: Após o pagamento, envie o comprovante via WhatsApp..."
                />
                <p className="text-sm text-muted-foreground">
                  Informações adicionais exibidas nas faturas do paciente
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <p className="text-sm font-medium">Pré-visualização na fatura do paciente</p>
                <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-3 text-sm space-y-1">
                  {profile.pixKey ? (
                    <p><strong>PIX:</strong> {profile.pixKey}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Nenhuma chave PIX configurada</p>
                  )}
                  {profile.paymentInfo && (
                    <p className="text-muted-foreground whitespace-pre-line">{profile.paymentInfo}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="mt-4">
          <ReferralProgram />
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Equipe</CardTitle>
              <CardDescription>Convide outros profissionais para sua clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Seu plano atual:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 capitalize">
                        {subInfo?.plan || "trial"}
                      </span>
                    </p>
                    {subInfo?.plan === "trial" && subInfo.planExpiresAt && (
                      <p className="text-xs text-muted-foreground">
                        Trial expira em {new Date(subInfo.planExpiresAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    {subInfo?.subscription?.cancelAtPeriodEnd && subInfo.subscription?.currentPeriodEnd && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Cancelamento agendado para {new Date(subInfo.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  {subInfo?.subscriptionStatus && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      subInfo.subscriptionStatus === "active" || subInfo.subscriptionStatus === "trialing"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                        : subInfo.subscriptionStatus === "past_due"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {subInfo.subscriptionStatus === "active" ? "Ativo" :
                       subInfo.subscriptionStatus === "trialing" ? "Trial" :
                       subInfo.subscriptionStatus === "past_due" ? "Pagamento pendente" :
                       subInfo.subscriptionStatus}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {subInfo?.plan === "clinica" ? (
                    <Button variant="outline" size="sm" onClick={handlePortal} disabled={portalLoading}>
                      {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Gerenciar Assinatura
                    </Button>
                  ) : subInfo?.stripeCustomerId ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handlePortal} disabled={portalLoading}>
                        {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Gerenciar
                      </Button>
                      <Button size="sm" onClick={() => handleUpgrade("clinica")} disabled={upgradeLoading} className="bg-teal-600 hover:bg-teal-700">
                        {upgradeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upgrade para Clínica
                      </Button>
                    </>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleUpgrade("pro")} disabled={upgradeLoading}>
                        {upgradeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assinar Pro — R$97/mês
                      </Button>
                      <Button size="sm" onClick={() => handleUpgrade("clinica")} disabled={upgradeLoading} className="bg-teal-600 hover:bg-teal-700">
                        {upgradeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Assinar Clínica — R$197/mês
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blog" className="mt-4">
          <BlogEditor />
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Exportação de Dados</CardTitle>
              <CardDescription>Baixe uma cópia de segurança de todos os seus dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-700 dark:text-amber-300">Aviso de LGPD</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Os dados exportados contêm informações pessoais e sensíveis de pacientes protegidos
                      pela Lei Geral de Proteção de Dados (LGPD). Mantenha o arquivo em local seguro e
                      restrito. O compartilhamento indevido pode gerar sanções legais.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start gap-2 p-4"
                  onClick={() => handleExport("csv")}
                  disabled={exportLoading !== null}
                >
                  <div className="flex w-full items-center gap-2">
                    {exportLoading === "csv" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                    )}
                    <span className="font-medium">Exportar CSV</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Planilha compatível com Excel e Google Sheets
                  </p>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start gap-2 p-4"
                  onClick={() => handleExport("json")}
                  disabled={exportLoading !== null}
                >
                  <div className="flex w-full items-center gap-2">
                    {exportLoading === "json" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileJson className="h-5 w-5 text-teal-500" />
                    )}
                    <span className="font-medium">Exportar JSON</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Backup estruturado para restauração completa
                  </p>
                </Button>
              </div>

              {lastExport && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Última exportação ({lastExport.format.toUpperCase()}):{" "}
                  {new Date(lastExport.at).toLocaleString("pt-BR")}
                </div>
              )}

              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Pacientes, consultas e sessões</p>
                <p className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Transações financeiras e faturas</p>
                <p className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Dados restritos ao seu usuário</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
