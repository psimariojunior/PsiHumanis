"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { MoodChart } from "@/components/patient/mood-chart"
import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { CalendarDays, BookHeart, History, User, ChevronRight, Clock, Sparkles, Activity, Brain, ClipboardList, FileText, Shield, Star, TrendingUp, ListTodo, Video } from "lucide-react"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { QuickMoodCheckin } from "@/components/patient/quick-mood-checkin"
import { StreakBadge } from "@/components/patient/streak-badge"
import { WeeklyInsights } from "@/components/patient/weekly-insights"

interface Appointment {
  id: string
  startTime: string
  status: string
  modalidade: string | null
  psychologist: { name: string }
}

interface DiaryEntry {
  id: string
  date: string
  mood: number
}

const quickLinks = [
  { href: "/paciente/relaxamento", icon: Sparkles, label: "Relaxamento", desc: "Respiração guiada", gradient: "from-teal-400 to-cyan-500", iconBg: "bg-teal-100 dark:bg-teal-900/30" },
  { href: "/paciente/agenda", icon: CalendarDays, label: "Agenda", desc: "Ver consultas", gradient: "from-teal-500 to-indigo-600", iconBg: "bg-teal-100 dark:bg-teal-900/30" },
  { href: "/paciente/diario", icon: BookHeart, label: "Diário", desc: "Registre emoções", gradient: "from-teal-500 to-teal-700", iconBg: "bg-teal-100 dark:bg-teal-900/30" },
  { href: "/paciente/questionarios", icon: ClipboardList, label: "Questionários", desc: "PHQ-9, GAD-7", gradient: "from-indigo-500 to-purple-600", iconBg: "bg-indigo-100 dark:bg-indigo-900/30" },
  { href: "/paciente/anamnese", icon: FileText, label: "Anamnese", desc: "Histórico clínico", gradient: "from-amber-500 to-orange-600", iconBg: "bg-amber-100 dark:bg-amber-900/30" },
  { href: "/paciente/protocolos-crise", icon: Shield, label: "Crise", desc: "Protocolos SOS", gradient: "from-red-500 to-rose-600", iconBg: "bg-red-100 dark:bg-red-900/30" },
  { href: "/paciente/tarefas", icon: ListTodo, label: "Tarefas", desc: "Recursos do psicólogo", gradient: "from-teal-500 to-teal-700", iconBg: "bg-teal-100 dark:bg-teal-900/30" },
  { href: "/paciente/consentimento", icon: FileText, label: "Consentimento", desc: "Termo LGPD", gradient: "from-teal-500 to-teal-700", iconBg: "bg-teal-100 dark:bg-teal-900/30" },
  { href: "/paciente/historico", icon: History, label: "Histórico", desc: "Consultas anteriores", gradient: "from-violet-500 to-purple-600", iconBg: "bg-violet-100 dark:bg-violet-900/30" },
  { href: "/paciente/faturas", icon: FileText, label: "Faturas", desc: "Pagamentos", gradient: "from-emerald-500 to-teal-600", iconBg: "bg-emerald-100 dark:bg-emerald-900/30" },
  { href: "/paciente/meus-dados", icon: User, label: "Meus Dados", desc: "Editar perfil", gradient: "from-rose-500 to-pink-600", iconBg: "bg-rose-100 dark:bg-rose-900/30" },
  { href: "/paciente/lgpd-export", icon: Shield, label: "Exportar Dados", desc: "LGPD Art. 18", gradient: "from-slate-500 to-gray-600", iconBg: "bg-slate-100 dark:bg-slate-900/30" },
]

export default function PacienteDashboard() {
  const { patient, token } = usePatientAuth()
  const { vibrateSelection, vibrateNotification } = useHapticFeedback()
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null)
  const [loadingAppt, setLoadingAppt] = useState(true)
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    if (!token) return
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchData = useCallback(() => {
    if (!token) return
    Promise.all([
      fetch("/api/pacientes/agendamentos", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/pacientes/diario", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([appts, diary]) => {
        const apptsArray = Array.isArray(appts) ? appts : []
        const diaryArray = Array.isArray(diary) ? diary : []
        const upcoming = (apptsArray as Appointment[]).filter((a) => a.status !== "CANCELLED" && new Date(a.startTime) > new Date()).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        setNextAppointment(upcoming[0] || null)
        setSessionCount(apptsArray.filter((a: any) => a.status !== "CANCELLED" && new Date(a.startTime) <= new Date()).length)
        setDiaryEntries(diaryArray as DiaryEntry[])
      })
      .catch(() => {})
      .finally(() => setLoadingAppt(false))
  }, [token])

  const formatDateTime = (iso: string) => {
    const d = new Date(iso)
    return { date: d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" }), time: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) }
  }

  const timeUntilAppointment = () => {
    if (!nextAppointment) return null
    const diff = new Date(nextAppointment.startTime).getTime() - Date.now()
    if (diff < 0) return null
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h`
    return "<1h"
  }

  const canEnterRoom = () => {
    if (!nextAppointment) return false
    const now = Date.now()
    const start = new Date(nextAppointment.startTime).getTime()
    const end = start + 50 * 60 * 1000
    return now >= start - 30 * 60 * 1000 && now <= end
  }

  const roomName = nextAppointment ? `sala-${nextAppointment.id.slice(0, 8)}` : ""

  return (
    <PullToRefresh onRefresh={async () => { fetchData() }}>
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br from-teal-950 via-teal-900 to-slate-950 p-6 text-white shadow-2xl shadow-teal-950/20">
        <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-teal-400/20 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-teal-100">
              <Sparkles className="h-3.5 w-3.5" />
              Sua jornada terapêutica
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Olá, {patient?.name?.split(" ")[0]}</h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-teal-100">
              Acompanhe consultas, tarefas, diário emocional e documentos em um espaço seguro e acolhedor.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:w-64">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-teal-200">Sessões</p>
              <p className="text-2xl font-bold">{sessionCount}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-teal-200">Diário</p>
              <p className="text-2xl font-bold">{diaryEntries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {loadingAppt ? (
        <Card className="p-6"><div className="space-y-3"><div className="h-4 w-32 animate-shimmer rounded" /><div className="h-4 w-48 animate-shimmer rounded" /><div className="h-4 w-40 animate-shimmer rounded" /></div></Card>
      ) : nextAppointment ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-indigo-800 p-6 text-white shadow-xl shadow-teal-500/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-teal-200" />
              <h3 className="font-semibold">Próxima Consulta</h3>
              <span className="ml-auto text-xs bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">em {timeUntilAppointment()}</span>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/15 backdrop-blur-sm shrink-0">
                <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <p className="font-medium text-lg">{formatDateTime(nextAppointment.startTime).date}</p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-teal-100">
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDateTime(nextAppointment.startTime).time}</span>
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{nextAppointment.psychologist.name}</span>
                </div>
              </div>
              <Link href="/paciente/agenda" className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 transition-all backdrop-blur-sm shrink-0" aria-label="Ver agenda completa">
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            {canEnterRoom() && (
              <Link
                href={`/sala-virtual/entrar?room=${encodeURIComponent(roomName)}`}
                onClick={() => vibrateNotification()}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm text-sm font-medium"
              >
                <Video className="h-4 w-4" />
                Entrar na Sala
              </Link>
            )}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed">
          <div className="flex flex-col items-center gap-2">
            <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">Nenhuma consulta agendada</p>
            <p className="text-muted-foreground/60 text-xs">Entre em contato com seu psicólogo</p>
          </div>
        </Card>
      )}

      <MoodChart entries={diaryEntries} />

      {/* Quick Mood Check-in */}
      <QuickMoodCheckin
        lastMood={diaryEntries.length > 0 ? diaryEntries[diaryEntries.length - 1].mood : undefined}
        onMoodSelected={(mood) => {
          fetch("/api/pacientes/diario", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ mood, emotions: [], notes: "" }),
          })
        }}
      />

      {/* Streak Badge */}
      <StreakBadge
        currentStreak={(() => {
          let streak = 0
          const today = new Date()
          for (let i = 0; i < 30; i++) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split("T")[0]
            if (diaryEntries.some((e) => e.date.startsWith(dateStr))) {
              streak++
            } else {
              break
            }
          }
          return streak
        })()}
        longestStreak={(() => {
          let max = 0
          let current = 0
          const sorted = [...diaryEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          for (let i = 0; i < sorted.length; i++) {
            if (i === 0) {
              current = 1
            } else {
              const prev = new Date(sorted[i - 1].date)
              const curr = new Date(sorted[i].date)
              const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
              if (diff <= 1) {
                current++
              } else {
                max = Math.max(max, current)
                current = 1
              }
            }
          }
          return Math.max(max, current)
        })()}
        totalEntries={diaryEntries.length}
      />

      {/* Weekly Insights */}
      <WeeklyInsights entries={diaryEntries} />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Cuidado contínuo", desc: "Registre emoções entre sessões", icon: BookHeart, href: "/paciente/diario" },
          { label: "Questionários", desc: "Acompanhe sua evolução clínica", icon: Brain, href: "/paciente/questionarios" },
          { label: "Tarefas terapêuticas", desc: "Veja exercícios enviados", icon: ListTodo, href: "/paciente/tarefas" },
        ].map((item) => (
          <Link key={item.label} href={item.href} onClick={() => vibrateSelection()}>
            <Card className="group h-full p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/5">
              <item.icon className="h-5 w-5 text-teal-600 transition-transform group-hover:scale-110" />
              <h3 className="mt-3 text-sm font-semibold">{item.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acesso rápido</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => vibrateSelection()}>
              <div className="group relative overflow-hidden bg-card hover:bg-accent rounded-2xl p-5 ring-1 ring-border transition-all duration-200 cursor-pointer hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-0.5">
                <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br", link.gradient)} />
                <div className="relative">
                  <div className={cn("flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br shadow-md mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3", link.gradient)}>
                    <link.icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-foreground font-medium text-sm">{link.label}</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">{link.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
    </PullToRefresh>
  )
}
