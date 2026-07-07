"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react"
import "@livekit/components-styles"
import {
  Video, Loader2, Save, FileText, User, Calendar, Brain,
  ChevronLeft, ChevronRight, Smile, Meh, Frown, Clock, ArrowLeft
} from "lucide-react"
import toast from "react-hot-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { EnhancedInCallUI } from "@/components/livekit/enhanced-in-call-ui"

interface PatientInfo {
  id: string
  name: string
  email: string | null
  phone: string | null
  birthDate: string | null
  cpf: string | null
}

interface DiaryEntry {
  id: string
  date: string
  mood: number
  emotions: string | null
  notes: string | null
}

interface SessionModeProps {
  patientId: string
  appointmentId?: string
  roomName: string
}

function SessionModeInner({ patientId, appointmentId, roomName }: SessionModeProps) {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [patient, setPatient] = useState<PatientInfo | null>(null)
  const [recentDiary, setRecentDiary] = useState<DiaryEntry[]>([])
  const [panelOpen, setPanelOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("prontuario")
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  const [form, setForm] = useState({
    title: `Sessão - ${new Date().toLocaleDateString("pt-BR")}`,
    content: "",
    sessionType: "SESSION_NOTE",
    patientMood: 3,
    observations: "",
    homework: "",
    nextSessionPlan: "",
  })

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gestao-de-psicologia-0khxxf01.livekit.cloud"

  useEffect(() => {
    Promise.all([
      fetch(`/api/pacientes/${patientId}`).then(r => r.ok ? r.json() : null),
      fetch(`/api/pacientes/${patientId}/diario`).then(r => r.ok ? r.json() : []),
    ]).then(([patientData, diaryData]) => {
      if (patientData) setPatient(patientData)
      if (Array.isArray(diaryData)) setRecentDiary(diaryData.slice(0, 5))
    }).catch(() => {})
  }, [patientId])

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    try {
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Erro ao gerar token")
      }
      const data = await res.json()
      setToken(data.token)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao conectar")
    } finally {
      setConnecting(false)
    }
  }, [roomName])

  const saveProntuario = useCallback(async (showToast = false) => {
    if (!form.content.trim() && !form.observations.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          type: form.sessionType,
          title: form.title,
          content: [
            form.content,
            form.observations ? `## Observações\n${form.observations}` : "",
            form.homework ? `## Tarefa Terapêutica\n${form.homework}` : "",
            form.nextSessionPlan ? `## Plano Próxima Sessão\n${form.nextSessionPlan}` : "",
            `## Humor do Paciente: ${form.patientMood}/5`,
          ].filter(Boolean).join("\n\n"),
          isConfidential: false,
        }),
      })
      if (!res.ok) throw new Error()
      setLastSaved(new Date())
      if (showToast) toast.success("Prontuário salvo!")
    } catch {
      if (showToast) toast.error("Erro ao salvar prontuário")
    } finally {
      setSaving(false)
    }
  }, [patientId, form])

  useEffect(() => {
    if (autoSaveTimer.current) clearInterval(autoSaveTimer.current)
    autoSaveTimer.current = setInterval(() => {
      if (form.content.trim() || form.observations.trim()) {
        saveProntuario(false)
      }
    }, 30000)
    return () => { if (autoSaveTimer.current) clearInterval(autoSaveTimer.current) }
  }, [form.content, form.observations, saveProntuario])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault()
      saveProntuario(true)
    }
  }, [saveProntuario])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const moodIcons = [
    { value: 1, icon: Frown, label: "Muito Ruim", color: "text-red-500" },
    { value: 2, icon: Frown, label: "Ruim", color: "text-orange-500" },
    { value: 3, icon: Meh, label: "Neutro", color: "text-yellow-500" },
    { value: 4, icon: Smile, label: "Bom", color: "text-lime-500" },
    { value: 5, icon: Smile, label: "Ótimo", color: "text-emerald-500" },
  ]

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      <div className={`flex-1 flex flex-col ${panelOpen ? "w-1/2" : "w-full"} transition-all duration-300`}>
        <div className="flex items-center gap-2 px-4 py-2 bg-background border-b shrink-0">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
          </Button>
          <span className="text-sm font-medium flex-1">
            Modo Sessão — {patient?.name || "Carregando..."}
          </span>
          {lastSaved && (
            <span className="text-[10px] text-muted-foreground">
              Salvo {lastSaved.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveProntuario(true)}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
            Salvar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPanelOpen(!panelOpen)}
          >
            {panelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1">
          {token ? (
            <ErrorBoundary>
              <LiveKitRoom
                token={token}
                serverUrl={livekitUrl}
                connect={true}
                video={true}
                audio={{ echoCancellation: true, noiseSuppression: true, autoGainControl: true }}
                onDisconnected={() => { setToken(null) }}
                style={{ height: "100%" }}
              >
                <ErrorBoundary>
                  <RoomAudioRenderer />
                  <EnhancedInCallUI roomName={roomName} onLeave={() => setToken(null)} isPsychologist />
                </ErrorBoundary>
              </LiveKitRoom>
            </ErrorBoundary>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-900">
              <div className="text-center space-y-4">
                <Video className="h-12 w-12 text-teal-400 mx-auto" />
                <div>
                  <h3 className="text-white font-semibold">Iniciar Videochamada</h3>
                  <p className="text-slate-400 text-sm">Conecte-se ao vídeo enquanto preenche o prontuário</p>
                </div>
                <Button onClick={handleConnect} disabled={connecting} className="bg-teal-600 hover:bg-teal-500">
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Video className="h-4 w-4 mr-2" />}
                  {connecting ? "Conectando..." : "Entrar no Vídeo"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`${panelOpen ? "w-1/2 border-l" : "w-0"} transition-all duration-300 overflow-hidden bg-background flex flex-col`}>
        {panelOpen && (
          <>
            <div className="p-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">Prontuário da Sessão</h3>
                  <p className="text-[10px] text-muted-foreground">Preencha durante o atendimento • Auto-salva a cada 30s</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  <Clock className="h-3 w-3 mr-1" />
                  Ctrl+S para salvar
                </Badge>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-4 mt-2">
                <TabsTrigger value="prontuario" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" /> Prontuário
                </TabsTrigger>
                <TabsTrigger value="paciente" className="text-xs">
                  <User className="h-3 w-3 mr-1" /> Paciente
                </TabsTrigger>
                <TabsTrigger value="historico" className="text-xs">
                  <Brain className="h-3 w-3 mr-1" /> Diário
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <TabsContent value="prontuario" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label className="text-xs">Título</Label>
                    <Input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Tipo de Registro</Label>
                    <div className="flex gap-1.5">
                      {[
                        { value: "SESSION_NOTE", label: "Nota de Sessão" },
                        { value: "EVOLUTION", label: "Evolução" },
                        { value: "ANAMNESIS", label: "Anamnese" },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setForm(f => ({ ...f, sessionType: opt.value }))}
                          className={`text-[11px] px-2.5 py-1 rounded-lg transition-all ${
                            form.sessionType === opt.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Observações Clínicas</Label>
                    <Textarea
                      value={form.content}
                      onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                      rows={6}
                      placeholder="Descreva o que foi trabalhado na sessão, comportamentos observados, intervenções utilizadas..."
                      className="text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Humor do Paciente (durante a sessão)</Label>
                    <div className="flex gap-1.5">
                      {moodIcons.map(({ value, icon: Icon, label, color }) => (
                        <button
                          key={value}
                          onClick={() => setForm(f => ({ ...f, patientMood: value }))}
                          className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-all flex-1 ${
                            form.patientMood === value
                              ? `bg-primary/10 ring-1 ring-primary/30 ${color}`
                              : "bg-muted hover:bg-accent text-muted-foreground"
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${form.patientMood === value ? color : ""}`} />
                          <span className="text-[9px]">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Anotações Adicionais</Label>
                    <Textarea
                      value={form.observations}
                      onChange={e => setForm(f => ({ ...f, observations: e.target.value }))}
                      rows={3}
                      placeholder="Impressões, sinais observados, pontos de atenção..."
                      className="text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Tarefa Terapêutica para Casa</Label>
                    <Textarea
                      value={form.homework}
                      onChange={e => setForm(f => ({ ...f, homework: e.target.value }))}
                      rows={2}
                      placeholder="Exercício, leitura, atividade entre sessões..."
                      className="text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Plano para Próxima Sessão</Label>
                    <Textarea
                      value={form.nextSessionPlan}
                      onChange={e => setForm(f => ({ ...f, nextSessionPlan: e.target.value }))}
                      rows={2}
                      placeholder="Objetivos, temas a explorar, ajustes no tratamento..."
                      className="text-sm resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="paciente" className="mt-0">
                  {patient ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold">{patient.name}</h4>
                          <p className="text-xs text-muted-foreground">{patient.email || "Sem email"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted rounded-lg p-2.5">
                          <span className="text-muted-foreground">Telefone</span>
                          <p className="font-medium mt-0.5">{patient.phone || "—"}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-2.5">
                          <span className="text-muted-foreground">Nascimento</span>
                          <p className="font-medium mt-0.5">
                            {patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("pt-BR") : "—"}
                          </p>
                        </div>
                        <div className="bg-muted rounded-lg p-2.5 col-span-2">
                          <span className="text-muted-foreground">CPF</span>
                          <p className="font-medium mt-0.5">{patient.cpf || "—"}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Carregando dados do paciente...</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="historico" className="mt-0">
                  {recentDiary.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground mb-3">Últimos registros do diário de emoções</p>
                      {recentDiary.map(entry => {
                        const moodConfig = moodIcons.find(m => m.value === entry.mood)
                        const MoodIcon = moodConfig?.icon || Meh
                        let emotions: string[] = []
                        try { emotions = entry.emotions ? JSON.parse(entry.emotions) : [] } catch {}
                        return (
                          <div key={entry.id} className="bg-muted/50 rounded-lg p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium">
                                {new Date(entry.date).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
                              </span>
                              <div className="flex items-center gap-1">
                                <MoodIcon className={`h-3.5 w-3.5 ${moodConfig?.color || ""}`} />
                                <span className="text-[10px] text-muted-foreground">{entry.mood}/5</span>
                              </div>
                            </div>
                            {emotions.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {emotions.map((e: string) => (
                                  <span key={e} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{e}</span>
                                ))}
                              </div>
                            )}
                            {entry.notes && <p className="text-[11px] text-muted-foreground line-clamp-2">{entry.notes}</p>}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nenhum registro no diário</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </div>
    </div>
  )
}

export default function SessionModePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <SessionModeWrapper />
    </Suspense>
  )
}

function SessionModeWrapper() {
  const searchParams = useSearchParams()
  const patientId = searchParams.get("patient") || ""
  const appointmentId = searchParams.get("appointment") || ""
  const room = searchParams.get("room") || `sessao-${Date.now()}`

  if (!patientId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold">Modo Sessão</h2>
            <p className="text-muted-foreground text-sm">Selecione um paciente para iniciar</p>
          </div>
          <Button asChild>
            <a href="/pacientes">Selecionar Paciente</a>
          </Button>
        </div>
      </div>
    )
  }

  return <SessionModeInner patientId={patientId} appointmentId={appointmentId} roomName={room} />
}
