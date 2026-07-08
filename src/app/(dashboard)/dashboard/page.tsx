"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { FinancialSummaryCard } from "@/components/dashboard/financial-summary"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AppointmentsChart } from "@/components/dashboard/appointments-chart"
import { RecentPatients } from "@/components/dashboard/recent-patients"
import { OnboardingChecklist } from "@/components/onboarding-checklist"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, UserPlus, FileText, Video, Sparkles, ArrowRight, BarChart3, TrendingUp, Users, DollarSign, Clock, Activity, CalendarDays, Sun, Moon, AlertTriangle, Zap, Target, Shield } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { cn, formatTime } from "@/lib/utils"
import { motion } from "framer-motion"
import { QuickNotesFab } from "@/components/dashboard/quick-notes-fab"
import { TodaySessions } from "@/components/dashboard/today-sessions"
import { BirthdayAlert } from "@/components/dashboard/birthday-alert"
import { WeeklyOccupancy } from "@/components/dashboard/weekly-occupancy"
import { CrisisAlerts } from "@/components/dashboard/crisis-alerts"
import { PracticeHealthScore } from "@/components/dashboard/practice-health-score"
import { FeedbackPrompt } from "@/components/feedback-prompt"
import { t, getLocale } from "@/lib/i18n"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"

export default function DashboardHome() {
  const locale = getLocale()
  const { vibrateSelection } = useHapticFeedback()
  const quickActions = [
    { label: t("dash.newPatient", locale), href: "/pacientes/novo", icon: UserPlus, gradient: "from-teal-600 to-sky-600" },
    { label: t("dash.prontuario", locale), href: "/prontuarios/novo", icon: FileText, gradient: "from-violet-500 to-purple-600" },
    { label: t("dash.virtualRoom", locale), href: "/sala-virtual", icon: Video, gradient: "from-cyan-500 to-teal-700" },
    { label: t("dash.reports", locale), href: "/relatorios", icon: BarChart3, gradient: "from-emerald-500 to-teal-600" },
  ]
  const [data, setData] = useState<{
    stats: { totalPatients: number; appointmentsToday: number; monthlyRevenue: number; pendingPayments: number; appointmentChange: number; revenueChange: number }
    monthlyData: { month: string; appointments: number; receita: number }[]
    appointments: { id: string; patientId: string; patientName: string; startTime: string; status: string; modality: string }[]
    todaysAppointments: { id: string; patientId: string; patientName: string; startTime: string; status: string; modality: string }[]
    tomorrowsAppointments: { id: string; patientId: string; patientName: string; startTime: string; status: string; modality: string }[]
    patients: { id: string; name: string; email: string | null; phone: string | null; createdAt: string }[]
    financialSummary: { totalRevenue: number; totalExpenses: number; balance: number; pending: number; overdue: number; received: number; goal: number }
    indicators: { averageTicket: number; completionRate: number; cancellationRate: number; occupationRate: number }
    birthdays: { id: string; name: string; day: number; age: number; phone: string | null }[]
    streak: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [progressWidth, setProgressWidth] = useState(0)
  const [period, setPeriod] = useState<"6" | "12" | "all">("12")
  const [onboardingDone, setOnboardingDone] = useState(true)
  const [hasAvailability, setHasAvailability] = useState(true)

  useEffect(() => {
    const val = localStorage.getItem("psihumanis_onboarding_completed")
    setOnboardingDone(val === "true")
  }, [])

  useEffect(() => {
    fetch("/api/disponibilidade")
      .then((r) => r.json())
      .then((data) => {
        const slots = data.slots || data || []
        setHasAvailability(Array.isArray(slots) && slots.length > 0)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/dashboard", { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then(setData)
      .catch((err) => {
        if (err?.name === "AbortError") return
        toast.error("Erro ao carregar dados")
        setData(null)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!data?.financialSummary) return
    const pct = data.financialSummary.goal > 0
      ? Math.min(100, Math.round((data.financialSummary.received / data.financialSummary.goal) * 100)) : 0
    const timer = setTimeout(() => setProgressWidth(pct), 200)
    return () => clearTimeout(timer)
  }, [data])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-72 bg-card rounded-xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-44 bg-card rounded-xl animate-pulse" />
            <div className="h-64 bg-card rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const stats = data?.stats ?? { totalPatients: 0, appointmentsToday: 0, monthlyRevenue: 0, pendingPayments: 0, appointmentChange: 0, revenueChange: 0 }
  const todaysAppointments = (data?.todaysAppointments ?? []).map((a) => ({ ...a, startTime: new Date(a.startTime) }))
  const tomorrowsAppointments = (data?.tomorrowsAppointments ?? []).map((a) => ({ ...a, startTime: new Date(a.startTime) }))
  const recentPatients = (data?.patients ?? []).map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))
  const financialSummary = data?.financialSummary ?? { totalRevenue: 0, totalExpenses: 0, balance: 0, pending: 0, overdue: 0, received: 0, goal: 10000 }
  const indicators = data?.indicators ?? { averageTicket: 0, completionRate: 0, cancellationRate: 0, occupationRate: 0 }
  const streak = data?.streak ?? 0

  const filteredMonthlyData = (data?.monthlyData ?? []).slice(period === "6" ? -6 : period === "12" ? -12 : 0)
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
  const nextAppointment = todaysAppointments[0]
  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return t("dash.goodMorning", locale)
    if (h < 18) return t("dash.goodAfternoon", locale)
    return t("dash.goodEvening", locale)
  })()

  const statusVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "info"
      case "CONFIRMED": return "success"
      case "IN_PROGRESS": return "warning"
      case "COMPLETED": return "success"
      case "CANCELLED": return "destructive"
      default: return "secondary"
    }
  }
  const statusLabel = (status: string) => {
    switch (status) {
      case "SCHEDULED": return t("dash.scheduled", locale)
      case "CONFIRMED": return t("dash.confirmed", locale)
      case "IN_PROGRESS": return t("dash.inProgress", locale)
      case "COMPLETED": return t("dash.completed", locale)
      case "CANCELLED": return t("dash.cancelled", locale)
      case "NO_SHOW": return locale === "en" ? "No show" : "Faltou"
      default: return status
    }
  }

  const AppointmentList = ({ items, emptyIcon: EmptyIcon, emptyText }: { items: typeof todaysAppointments; emptyIcon: typeof Sun; emptyText: string }) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <EmptyIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        </div>
      )
    }
    return (
      <div className="space-y-2">
        {items.slice(0, 5).map((apt) => (
          <div key={apt.id} className="flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 hover:bg-accent/50 hover:shadow-md hover:shadow-teal-500/5 cursor-pointer hover:-translate-y-0.5">
            <div className="flex flex-col items-center justify-center w-14 shrink-0 rounded-lg bg-muted/50 py-1.5">
              <span className="text-sm font-bold leading-none">{formatTime(apt.startTime)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{apt.patientName}</p>
              <p className="text-xs text-muted-foreground">{apt.modality === "online" ? "Online" : "Presencial"}</p>
            </div>
            <Badge variant={statusVariant(apt.status)} className="text-[10px]">{statusLabel(apt.status)}</Badge>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <section data-tour="dashboard-hero" className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-950 via-teal-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-10 top-10 h-2 w-2 rounded-full bg-teal-400/60 animate-bounce" style={{ animationDelay: "0.5s" }} />
        <div className="absolute left-20 bottom-10 h-1.5 w-1.5 rounded-full bg-cyan-400/40 animate-bounce" style={{ animationDelay: "1s" }} />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {greeting}! Sua clínica em tempo real.
            </h1>
            <p className="text-sm text-teal-100/80 max-w-xl">
              Acompanhe agenda, receita e próximos movimentos em uma visão objetiva.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" asChild className="bg-white text-slate-950 hover:bg-teal-50">
                <Link href="/agenda"><Calendar className="mr-1.5 h-4 w-4" />{locale === "en" ? "Open calendar" : "Abrir agenda"}</Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/relatorios"><BarChart3 className="mr-1.5 h-4 w-4" />{t("dash.reports", locale)}</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl min-w-[220px] transition-all duration-300 hover:bg-white/15">
            <p className="text-xs uppercase tracking-[0.15em] text-teal-200 mb-2">{locale === "en" ? "Next focus" : "Próximo foco"}</p>
            <p className="text-lg font-semibold">
              {nextAppointment ? nextAppointment.patientName : t("dash.freeSchedule", locale)}
            </p>
            {nextAppointment && (
              <p className="text-xs text-teal-100/70 mt-1">
                {formatTime(nextAppointment.startTime)} — {statusLabel(nextAppointment.status)}
              </p>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-white/10 p-2.5 text-center backdrop-blur-sm">
                <p className="text-teal-200 text-xs">{t("dash.today", locale)}</p>
                <p className="text-lg font-bold">{todaysAppointments.length}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5 text-center backdrop-blur-sm">
                <p className="text-teal-200 text-xs">{locale === "en" ? "Received" : "Recebido"}</p>
                <p className="text-sm font-bold">{currency.format(financialSummary.received)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Banner */}
      {!hasAvailability && (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">{locale === "en" ? "Set your availability" : "Configure seus horários de atendimento"}</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  {locale === "en" ? "Patients won't be able to book until you set your schedule." : "Pacientes não poderão agendar consultas até que você configure sua agenda."}
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              <Link href="/disponibilidade">
                <Clock className="mr-2 h-4 w-4" /> {locale === "en" ? "Set Now" : "Configurar Agora"}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Onboarding */}
      {!onboardingDone && <OnboardingChecklist />}

      {/* Crisis Alerts */}
      <CrisisAlerts />

      {/* Practice Health Score */}
      <PracticeHealthScore
        score={Math.min(100, Math.round(
          (indicators.completionRate * 0.3) +
          (indicators.occupationRate * 0.3) +
          ((100 - indicators.cancellationRate) * 0.2) +
          (stats.appointmentsToday > 0 ? 20 : 0)
        ))}
        trend={stats.appointmentChange > 0 ? "up" : stats.appointmentChange < 0 ? "down" : "stable"}
        factors={[
          { label: "Taxa de conclusão", value: Math.round(indicators.completionRate), max: 100, icon: <Target className="h-3 w-3" />, color: "text-emerald-500" },
          { label: "Ocupação", value: Math.round(indicators.occupationRate), max: 100, icon: <Zap className="h-3 w-3" />, color: "text-teal-500" },
          { label: "Presença", value: Math.round(100 - indicators.cancellationRate), max: 100, icon: <Shield className="h-3 w-3" />, color: "text-cyan-500" },
          { label: "Ticket médio", value: Math.min(100, Math.round(indicators.averageTicket / 2)), max: 100, icon: <DollarSign className="h-3 w-3" />, color: "text-violet-500" },
        ]}
        message={
          indicators.completionRate > 80
            ? "Excelente! Sua prática está saudável e seus pacientes estão engajados."
            : indicators.completionRate > 60
            ? "Bom trabalho! Continue focado na qualidade do atendimento."
            : "Atenção: muitas sessões canceladas. Revise a agenda e comunicação."
        }
      />

      {/* Today's sessions with real-time room status */}
      <div data-tour="today-sessions"><TodaySessions appointments={todaysAppointments} /></div>

      {/* Stats Cards */}
      <div data-tour="dashboard-stats"><StatsCards stats={stats} /></div>

      {/* Charts + Financial */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {locale === "en" ? "Monthly Revenue" : "Receita Mensal"}
                </CardTitle>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                  {(["6", "12", "all"] as const).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                    >{p === "6" ? "6m" : p === "12" ? "12m" : "Todos"}</button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart data={filteredMonthlyData} />
            </CardContent>
          </Card>

          <Card className="transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                </div>
                {locale === "en" ? "Monthly Appointments" : "Agendamentos Mensais"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentsChart data={filteredMonthlyData} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-teal-600 via-teal-700 to-indigo-800 text-white shadow-xl shadow-teal-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-teal-200" />
                </div>
                <span className="font-semibold text-sm">{locale === "en" ? "Monthly Goal" : "Meta do Mês"}</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-100">Progresso</span>
                  <span className="font-bold">{progressWidth}%</span>
                </div>
                <div className="h-3 rounded-full bg-white/15 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-white/90 to-white transition-all duration-1500 ease-out relative" style={{ width: `${progressWidth}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-100">Recebido</span>
                  <span className="font-bold">{currency.format(financialSummary.received)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-teal-100">Meta</span>
                  <span className="font-bold">{currency.format(financialSummary.goal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <FinancialSummaryCard summary={financialSummary} />

          <Card className="transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                </div>
                {locale === "en" ? "Indicators" : "Indicadores"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Ticket Médio", value: currency.format(indicators.averageTicket), icon: DollarSign, color: "text-emerald-500" },
                  { label: "Conclusão", value: `${Math.round(indicators.completionRate)}%`, icon: TrendingUp, color: "text-teal-500" },
                  { label: "Cancelamento", value: `${Math.round(indicators.cancellationRate)}%`, icon: Activity, color: "text-amber-500" },
                  { label: "Ocupação", value: `${Math.round(indicators.occupationRate)}%`, icon: Users, color: "text-indigo-500" },
                ].map((item) => (
                  <div key={item.label} className="bg-muted/50 rounded-xl p-3.5 text-center transition-all duration-200 hover:bg-muted/80 hover:scale-105">
                    <item.icon className={cn("h-4 w-4 mx-auto mb-1.5", item.color)} />
                    <p className="text-lg font-bold">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <WeeklyOccupancy appointments={(data?.appointments ?? []).map(a => ({ ...a, startTime: new Date(a.startTime) }))} />
          <BirthdayAlert birthdays={data?.birthdays ?? []} />
        </div>
      </div>

      {/* Bottom Row: Appointments + Quick Actions + Recent Patients */}
      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Sun className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              {locale === "en" ? "Today" : "Hoje"}
              <Badge variant="secondary" className="ml-auto text-[10px]">{todaysAppointments.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentList items={todaysAppointments} emptyIcon={Sun} emptyText={t("dash.noAppointmentsToday", locale)} />
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Moon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              </div>
              {locale === "en" ? "Tomorrow" : "Amanhã"}
              <Badge variant="secondary" className="ml-auto text-[10px]">{tomorrowsAppointments.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentList items={tomorrowsAppointments} emptyIcon={Moon} emptyText={t("dash.noAppointmentsTomorrow", locale)} />
          </CardContent>
        </Card>

        <Card data-tour="quick-actions" className="transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              {locale === "en" ? "Quick Actions" : "Ações Rápidas"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, i) => (
              <Link key={action.label} href={action.href} onClick={() => vibrateSelection()}>
                <div className="group flex items-center gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-accent/50 hover:shadow-md hover:shadow-teal-500/5 cursor-pointer hover:-translate-y-0.5">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shrink-0", action.gradient)}>
                    <action.icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <RecentPatients patients={recentPatients} />
      </div>

      <QuickNotesFab />

      {/* Feedback Prompt */}
      <FeedbackPrompt trigger="session_completed" />
    </div>
  )
}
