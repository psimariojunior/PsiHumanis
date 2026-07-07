"use client"

import { Suspense, useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react"
import "@livekit/components-styles"
import { Video, Loader2, Link2, Copy, LogOut, Shield, Zap, FileText, Clock, UserCheck, UserX, Bell, ClipboardList } from "lucide-react"
import toast from "react-hot-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { EnhancedInCallUI } from "@/components/livekit/enhanced-in-call-ui"

interface WaitingPatient {
  id: string
  room: string
  name: string
  status: "waiting" | "approved" | "rejected"
  createdAt: number
}

function VirtualRoomPageInner() {
  const searchParams = useSearchParams()
  const initialRoom = searchParams.get("room") || `sala-${Date.now()}`
  const [roomName, setRoomName] = useState(initialRoom)
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [ending, setEnding] = useState(false)
  const [origin, setOrigin] = useState("")
  const [liveDuration, setLiveDuration] = useState(0)
  const [endedSession, setEndedSession] = useState<{ duration: number } | null>(null)
  const [waitingPatients, setWaitingPatients] = useState<WaitingPatient[]>([])

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gestao-de-psicologia-0khxxf01.livekit.cloud"

  const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, "-")

  // Poll for waiting patients
  useEffect(() => {
    if (!token) return
    const sanitizedRoom = sanitize(roomName)
    let cancelled = false

    const poll = async () => {
      try {
        const res = await fetch(`/api/livekit/waiting?room=${encodeURIComponent(sanitizedRoom)}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) {
          setWaitingPatients(data.patients || [])
        }
      } catch {}
    }

    const interval = setInterval(poll, 3000)
    poll()
    return () => { cancelled = true; clearInterval(interval) }
  }, [token, roomName])

  const handleApprovePatient = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/livekit/waiting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "approved" }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Paciente aprovado!")
    } catch {
      toast.error("Erro ao aprovar paciente")
    }
  }, [])

  const handleRejectPatient = useCallback(async (id: string) => {
    try {
      const res = await fetch("/api/livekit/waiting", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "rejected" }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Paciente recusado")
    } catch {
      toast.error("Erro ao recusar paciente")
    }
  }, [])

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    try {
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(sanitize(roomName))}`)
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

  const handleEndRoom = useCallback(async () => {
    setEnding(true)
    try {
      const res = await fetch("/api/livekit/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomName }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Erro ao encerrar")
      }
      toast.success("Sala encerrada!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao encerrar sala")
      setEnding(false)
      return
    }
    setEnding(false)
    setEndedSession({ duration: liveDuration })
    setToken(null)
    setRoomName(`sala-${Date.now()}`)
  }, [roomName, liveDuration])

  const patientLink = origin ? `${origin}/sala-virtual/entrar?room=${encodeURIComponent(sanitize(roomName))}` : ""

  if (token) {
    return (
      <ErrorBoundary>
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          {/* Waiting patients notification bar */}
          {waitingPatients.filter(p => p.status === "waiting").length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 px-4 py-2.5 shrink-0">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Bell className="h-4 w-4 animate-pulse" />
                  <span className="text-sm font-semibold">
                    {waitingPatients.filter(p => p.status === "waiting").length} paciente(s) aguardando
                  </span>
                </div>
                {waitingPatients.filter(p => p.status === "waiting").map(patient => (
                  <div key={patient.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5 border border-amber-200 dark:border-amber-800 shadow-sm">
                    <span className="text-sm font-medium">{patient.name}</span>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700" onClick={() => handleApprovePatient(patient.id)}>
                      <UserCheck className="h-3.5 w-3.5 mr-1" /> Aceitar
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500 hover:bg-red-100 hover:text-red-600" onClick={() => handleRejectPatient(patient.id)}>
                      <UserX className="h-3.5 w-3.5 mr-1" /> Recusar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-background border-b shrink-0">
            <span className="text-sm font-medium flex-1">Sala: {roomName}</span>
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(patientLink)
              toast.success("Link copiado!")
            }}>
              <Copy className="mr-2 h-4 w-4" /> Copiar Link
            </Button>
            <Button variant="destructive" size="sm" onClick={handleEndRoom} disabled={ending}>
              {ending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              {ending ? "Encerrando..." : "Encerrar Sala"}
            </Button>
          </div>
          <div className="flex-1">
            <LiveKitRoom
              token={token}
              serverUrl={livekitUrl}
              connect={true}
              video={true}
              audio={{ echoCancellation: true, noiseSuppression: true, autoGainControl: true }}
              onDisconnected={() => { setEndedSession({ duration: liveDuration }); setToken(null) }}
              onError={(e) => console.error("LiveKit error:", e)}
              style={{ height: "100%" }}
            >
              <ErrorBoundary>
                <RoomAudioRenderer />
                <EnhancedInCallUI roomName={roomName} onLeave={handleEndRoom} isPsychologist />
              </ErrorBoundary>
            </LiveKitRoom>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  if (endedSession) {
    const mins = Math.floor(endedSession.duration / 60)
    const secs = endedSession.duration % 60
    const durationLabel = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/30 mx-auto">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Sessão encerrada</h2>
            <p className="text-muted-foreground">
              Duração total: <span className="font-mono font-semibold text-foreground">{durationLabel}</span>
            </p>
          </div>
          <div className="rounded-xl border bg-card p-5 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" />
                Deseja registrar esta sessão no prontuário?
              </div>
              <p className="text-xs text-muted-foreground">
                Documente as observações clínicas enquanto os detalhes estão frescos.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/prontuarios/novo">
                  <FileText className="mr-2 h-4 w-4" />
                  Criar Prontuário
                </Link>
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setEndedSession(null)}>
                Voltar para a Sala Virtual
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-xl shadow-teal-500/30 mx-auto">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Sala Virtual</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Inicie uma videochamada segura com seu paciente. Compartilhe o link e aguarde a conexão.
          </p>
        </div>

        <Card className="border-0 shadow-2xl shadow-teal-500/5">
          <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-t-xl" />
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Sala</label>
              <Input 
                value={roomName} 
                onChange={(e) => setRoomName(e.target.value)} 
                placeholder="Ex: sala-terapia-001"
                className="h-11" 
              />
            </div>

            <div className="bg-teal-50 dark:bg-teal-950/30 rounded-xl p-4 border border-teal-100 dark:border-teal-900/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shrink-0">
                  <Link2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Link para o paciente</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{patientLink || "Digite o nome da sala"}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(patientLink)
                    toast.success("Link copiado!")
                  }}
                  disabled={!patientLink}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600 shadow-lg shadow-teal-500/25" 
              onClick={handleConnect} 
              disabled={connecting || !roomName}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-5 w-5" />
                  Entrar na Sala
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center mx-auto">
              <Video className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-xs text-muted-foreground">HD Automático</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center mx-auto">
              <Shield className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-xs text-muted-foreground">Criptografado</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/30 flex items-center justify-center mx-auto">
              <Zap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-xs text-muted-foreground">Baixa Latência</p>
          </div>
        </div>

        <Card className="border-0 shadow-lg shadow-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Modo Sessão</h3>
                <p className="text-sm text-muted-foreground">Vídeo + Prontuário aberto durante o atendimento</p>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/sessoes/modo">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Abrir Modo Sessão
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VirtualRoomPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando sala virtual...</p>
        </div>
      </div>
    }>
      <VirtualRoomPageInner />
    </Suspense>
  )
}
