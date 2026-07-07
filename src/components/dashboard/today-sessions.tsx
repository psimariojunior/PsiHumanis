"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Video, Clock, UserCheck, Calendar, Loader2, Bell, ArrowRight, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"

interface Appointment {
  id: string
  patientId: string
  patientName: string
  startTime: Date
  status: string
  modality: string
}

interface WaitingPatient {
  id: string
  room: string
  name: string
  status: "waiting" | "approved" | "rejected"
  createdAt: number
}

type SessionStatus = "scheduled" | "confirmed" | "waiting" | "in_call" | "completed" | "cancelled"

interface Session extends Appointment {
  sessionStatus: SessionStatus
  roomName: string
  waitingId?: string
}

const statusConfig: Record<SessionStatus, { label: string; color: string; bg: string; dot: string }> = {
  scheduled: { label: "Agendado", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/30", dot: "bg-teal-400" },
  confirmed: { label: "Confirmado", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", dot: "bg-emerald-400" },
  waiting: { label: "Na sala", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", dot: "bg-amber-400 animate-pulse" },
  in_call: { label: "Em sessão", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-950/30", dot: "bg-violet-400 animate-pulse" },
  completed: { label: "Concluído", color: "text-muted-foreground", bg: "bg-muted/50", dot: "bg-muted-foreground/50" },
  cancelled: { label: "Cancelado", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30", dot: "bg-red-400" },
}

function deriveStatus(apt: Appointment, waitingPatients: WaitingPatient[]): SessionStatus {
  const now = new Date()
  const start = apt.startTime
  const end = new Date(start.getTime() + 50 * 60 * 1000)

  if (apt.status === "CANCELLED") return "cancelled"
  if (apt.status === "COMPLETED") return "completed"

  const roomName = `sala-${apt.id.slice(0, 8)}`

  // Patient is in the room (approved = connected to LiveKit)
  const inRoom = waitingPatients.find(
    (w) => w.room === roomName && w.status === "approved"
  )
  if (inRoom) {
    // If appointment time is active, it's an active session
    if (now >= start && now <= end) return "in_call"
    // Patient arrived early or staying late
    return "waiting"
  }

  if (apt.status === "CONFIRMED") return "confirmed"
  return "scheduled"
}

export function TodaySessions({ appointments }: { appointments: Appointment[] }) {
  const { vibrateSelection } = useHapticFeedback()
  const [waitingPatients, setWaitingPatients] = useState<WaitingPatient[]>([])
  const [now, setNow] = useState(new Date())

  const fetchWaiting = useCallback(async () => {
    try {
      const res = await fetch("/api/livekit/waiting")
      if (!res.ok) return
      const data = await res.json()
      setWaitingPatients(data.patients || [])
    } catch {}
  }, [])

  useEffect(() => {
    let cancelled = false
    const poll = async () => {
      if (!cancelled) await fetchWaiting()
    }
    const interval = setInterval(poll, 3000)
    poll()
    return () => { cancelled = true; clearInterval(interval) }
  }, [fetchWaiting])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(interval)
  }, [])

  const sessions: Session[] = appointments.map((apt) => ({
    ...apt,
    sessionStatus: deriveStatus(apt, waitingPatients),
    roomName: `sala-${apt.id.slice(0, 8)}`,
  }))

  const waitingCount = sessions.filter((s) => s.sessionStatus === "waiting").length
  const inCallCount = sessions.filter((s) => s.sessionStatus === "in_call").length
  const scheduledCount = sessions.filter((s) => s.sessionStatus === "scheduled" || s.sessionStatus === "confirmed").length

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white via-teal-50/30 to-white dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-900 shadow-lg shadow-teal-500/5">
      <div className="h-1 bg-gradient-to-r from-teal-500 via-violet-500 to-teal-600" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2.5 text-base">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/40">
              <Calendar className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="font-semibold">Sessões de Hoje</p>
              <p className="text-xs text-muted-foreground font-normal">
                {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            {waitingCount > 0 && (
              <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 gap-1 animate-pulse">
                <Bell className="h-3 w-3" />
                {waitingCount} na sala
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {sessions.length} {sessions.length === 1 ? "sessão" : "sessões"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/50 mb-3">
              <Calendar className="h-7 w-7 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Nenhuma sessão agendada para hoje</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Aproveite para organizar sua agenda</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/agenda" onClick={() => vibrateSelection()}>
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Abrir Agenda
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Summary bar */}
            <div className="flex items-center gap-4 px-1 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-400" />
                <span className="text-[11px] text-muted-foreground">{scheduledCount} agendado{scheduledCount !== 1 ? "s" : ""}</span>
              </div>
              {waitingCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">{waitingCount} na sala</span>
                </div>
              )}
              {inCallCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-[11px] text-violet-600 dark:text-violet-400 font-medium">{inCallCount} em sessão</span>
                </div>
              )}
            </div>

            {/* Session list */}
            {sessions.map((session) => {
              const config = statusConfig[session.sessionStatus]
              const isPast = session.startTime < now && session.sessionStatus !== "in_call" && session.sessionStatus !== "waiting"
              return (
                <div
                  key={session.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                    session.sessionStatus === "waiting"
                      ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 shadow-md shadow-amber-500/10"
                      : session.sessionStatus === "in_call"
                      ? "border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20"
                      : "border-border/50 hover:bg-accent/30",
                    isPast && "opacity-50"
                  )}
                >
                  {/* Time */}
                  <div className="flex flex-col items-center justify-center w-14 shrink-0">
                    <span className={cn(
                      "text-sm font-bold leading-none",
                      session.sessionStatus === "waiting" ? "text-amber-600 dark:text-amber-400" : ""
                    )}>
                      {format(session.startTime, "HH:mm")}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {format(session.startTime, "EEE", { locale: ptBR })}
                    </span>
                  </div>

                  {/* Patient info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("font-medium text-sm truncate", isPast && "line-through decoration-muted-foreground/40")}>
                        {session.patientName}
                      </p>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-4 border-0", config.bg, config.color)}>
                        <span className={cn("h-1.5 w-1.5 rounded-full mr-1", config.dot)} />
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground">
                        {session.modality === "online" ? "Online" : "Presencial"}
                      </span>
                      {session.sessionStatus === "waiting" && (
                        <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          Paciente entrou na sala
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 flex items-center gap-1.5">
                    {session.sessionStatus === "waiting" || session.sessionStatus === "in_call" ? (
                      <>
                        <Button size="sm" variant="outline" className="h-8 px-2 text-xs" asChild>
                          <Link href={`/sessoes/modo?patient=${session.patientId}&room=${encodeURIComponent(session.roomName)}`} onClick={() => vibrateSelection()}>
                            <ClipboardList className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button size="sm" className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm" asChild>
                          <Link href={`/sala-virtual?room=${encodeURIComponent(session.roomName)}`} onClick={() => vibrateSelection()}>
                            <Video className="h-3.5 w-3.5 mr-1" />
                            Entrar
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      </>
                    ) : session.sessionStatus === "scheduled" || session.sessionStatus === "confirmed" ? (
                      <Button size="sm" variant="outline" className="h-8 px-3 text-xs" asChild>
                        <Link href={`/sala-virtual?room=${encodeURIComponent(session.roomName)}`} onClick={() => vibrateSelection()}>
                          <Video className="h-3.5 w-3.5 mr-1" />
                          Preparar
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
