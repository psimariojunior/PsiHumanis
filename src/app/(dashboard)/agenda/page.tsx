"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, formatDate, formatTime } from "@/lib/utils"
import { Plus, ChevronLeft, ChevronRight, Clock, Video, MapPin, Loader2, CheckCircle, XCircle, Play, Bell, ClipboardEdit, Receipt } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { t, getLocale } from "@/lib/i18n"
import toast from "react-hot-toast"

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

interface Appt {
  id: string
  patientId: string
  patientName: string
  patientEmail: string | null
  patientPhone: string | null
  startTime: string
  startTimeRaw: string
  endTime: string
  status: string
  modality: string | null
  type: string | null
  day: number
  price: number | null
}

interface PatientOption {
  id: string
  name: string
}

export default function AgendaPage() {
  const router = useRouter()
  const locale = getLocale()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("day")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [selectedAppt, setSelectedAppt] = useState<Appt | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [recurring, setRecurring] = useState(false)
  const [recurringFreq, setRecurringFreq] = useState<"weekly" | "biweekly">("weekly")
  const [recurringOccurrences, setRecurringOccurrences] = useState(4)
  const [hasAvailability, setHasAvailability] = useState(true)

  const fetchAppointments = useCallback(async (signal?: AbortSignal) => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59)
    try {
      const res = await fetch(`/api/agendamentos?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`, { signal })
      if (!res.ok) throw new Error()
      const data = await res.json()
      const mapped = (data || []).map((apt: { id: string; patientId: string; patient: { name: string; email: string | null; phone: string | null }; startTime: string; endTime: string; status: string; modality: string | null; type: string | null; price: number | null }) => ({
        id: apt.id,
        patientId: apt.patientId,
        patientName: apt.patient?.name || "Paciente",
        patientEmail: apt.patient?.email || null,
        patientPhone: apt.patient?.phone || null,
        startTime: formatTime(apt.startTime),
        startTimeRaw: apt.startTime,
        endTime: formatTime(apt.endTime),
        status: apt.status,
        modality: apt.modality,
        type: apt.type,
        day: new Date(apt.startTime).getDate(),
        price: apt.price ?? null,
      }))
      setAppointments(mapped)
    } catch (err) {
      if ((err as Error)?.name === "AbortError") return
      toast.error("Erro ao carregar agendamentos")
      setAppointments([])
    }
  }, [currentDate])

  useEffect(() => {
    const controller = new AbortController()
    fetchAppointments(controller.signal).finally(() => setLoading(false))

    fetch("/api/pacientes?limit=100", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setPatients(data.patients || []))
      .catch(() => {})

    return () => controller.abort()
  }, [fetchAppointments])

  useEffect(() => {
    fetch("/api/disponibilidade")
      .then((r) => r.json())
      .then((data) => {
        const slots = data.slots || data || []
        setHasAvailability(Array.isArray(slots) && slots.length > 0)
      })
      .catch(() => {})
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const today = new Date()
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const getAppointmentsForDay = (day: number) =>
    appointments.filter((apt) => apt.day === day)

  const timeSlots = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`)

  const handleUpdateStatus = useCallback(async (id: string, statusOrMethod: string) => {
    try {
      if (statusOrMethod === "DELETE") {
        if (!confirm(t("confirm.cancelAppointment", locale))) return
        await fetch(`/api/agendamentos/${id}`, { method: "DELETE" })
      } else {
        await fetch(`/api/agendamentos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusOrMethod }),
        })
      }
      toast.success("Status atualizado!")
      setShowDetail(false)
      setSelectedAppt(null)
      fetchAppointments()
    } catch {
      toast.error("Erro ao atualizar status")
    }
  }, [fetchAppointments])

  const handleSendReminder = useCallback(async (appt: Appt) => {
    const channels = []
    if (appt.patientEmail) channels.push("EMAIL")
    if (appt.patientPhone) channels.push("WHATSAPP")
    if (channels.length === 0) {
      toast.error("Paciente não tem email nem WhatsApp cadastrados")
      return
    }
    const appointmentDate = `${selectedDate.getDate()} de ${months[selectedDate.getMonth()]} de ${selectedDate.getFullYear()}`
    const appointmentTime = appt.startTime
    const sent: string[] = []
    const failed: string[] = []
    for (const channel of channels) {
      try {
        const res = await fetch("/api/notificacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Lembrete de consulta",
            message: `Lembrete: consulta de ${appt.patientName}`,
            channel,
            patientId: appt.patientId,
            patientEmail: appt.patientEmail,
            patientPhone: appt.patientPhone,
            patientName: appt.patientName,
            appointmentDate,
            appointmentTime,
          }),
        })
        if (res.ok) {
          sent.push(channel === "EMAIL" ? "Email" : "WhatsApp")
        } else {
          const body = await res.text()
          console.error(`[lembrete] ${channel} failed:`, res.status, body)
          failed.push(channel === "EMAIL" ? "Email" : "WhatsApp")
        }
      } catch (err) {
        console.error(`[lembrete] ${channel} error:`, err)
        failed.push(channel === "EMAIL" ? "Email" : "WhatsApp")
      }
    }
    if (sent.length > 0) {
      toast.success(`Lembrete enviado por ${sent.join(" e ")}`)
    }
    if (failed.length > 0) {
      const msg = failed.join(" e ")
      toast.error(`Falha ao enviar por ${msg}${failed.includes("WhatsApp") && !failed.includes("Email") ? " (WhatsApp não configurado)" : ""}`)
    }
  }, [selectedDate])

  async function handleNewAppointment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const date = formData.get("date") as string
    const startTime = formData.get("startTime") as string
    const duration = parseInt(formData.get("duration") as string) || 40
    const offset = -new Date().getTimezoneOffset()
    const sign = offset >= 0 ? '+' : '-'
    const pad = (n: number) => String(Math.abs(Math.floor(n))).padStart(2, '0')
    const tz = `${sign}${pad(offset / 60)}:${pad(offset % 60)}`
    const startDateTime = new Date(`${date}T${startTime}:00${tz}`)
    try {
      const body: Record<string, unknown> = {
        patientId: formData.get("patientId"),
        startTime: startDateTime.toISOString(),
        endTime: new Date(startDateTime.getTime() + duration * 60000).toISOString(),
        type: formData.get("type"),
        modality: formData.get("modality"),
        price: formData.get("price"),
        notes: formData.get("notes"),
      }
      if (recurring) {
        body.isRecurring = true
        body.recurringRule = JSON.stringify({ frequency: recurringFreq, occurrences: recurringOccurrences })
      }
      const res = await fetch("/api/agendamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      toast.success(t("toast.appointmentScheduled", locale))
      setShowDialog(false)
      fetchAppointments()
    } catch {
      toast.error("Erro ao agendar consulta")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-shimmer rounded-lg" />
            <div className="h-4 w-56 animate-shimmer rounded-lg" />
          </div>
          <div className="h-9 w-36 animate-shimmer rounded-lg" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 animate-shimmer rounded-2xl" />
          ))}
        </div>
        <div className="h-[400px] animate-shimmer rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Availability Guidance Banner */}
      {!hasAvailability && (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-amber-800 dark:text-amber-200">Horários não configurados</p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Configure seus horários para que pacientes possam agendar consultas.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              <Link href="/disponibilidade">Configurar Agora</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground">
            Gerencie suas consultas e horários
          </p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Consulta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nova Consulta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleNewAppointment} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Paciente</Label>
                <Select name="patientId" required>
                  <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
                  <SelectContent>
                    {patients.length === 0 ? (
                      <SelectItem value="" disabled>Nenhum paciente cadastrado</SelectItem>
                    ) : patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" name="date" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Horário</Label>
                  <Input id="startTime" name="startTime" type="time" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Select name="duration" defaultValue="40">
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Label htmlFor="modality">Modalidade</Label>
                  <Select name="modality" defaultValue="presential">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presential">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select name="type" defaultValue="individual">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="casal">Casal</SelectItem>
                    <SelectItem value="familia">Família</SelectItem>
                    <SelectItem value="grupo">Grupo</SelectItem>
                    <SelectItem value="supervisao">Supervisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Valor</Label>
                  <Input id="price" name="price" type="number" step="0.01" placeholder="0,00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" name="notes" rows={2} />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t">
                <input type="checkbox" id="recurring" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="recurring" className="text-sm font-normal">Repetir consulta</Label>
              </div>
              {recurring && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div className="space-y-2">
                    <Label htmlFor="recurringFreq">Frequência</Label>
                    <select id="recurringFreq" value={recurringFreq} onChange={(e) => setRecurringFreq(e.target.value as "weekly" | "biweekly")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quinzenal</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurringOccurrences">Repetições</Label>
                    <select id="recurringOccurrences" value={recurringOccurrences} onChange={(e) => setRecurringOccurrences(Number(e.target.value))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {[2, 4, 6, 8, 10, 12, 16, 20].map((n) => (
                        <option key={n} value={n}>{n}x</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <Button type="submit">Agendar Consulta{recurring ? ` (${recurringOccurrences}x)` : ""}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-semibold min-w-0 text-center flex-1">
                {months[month]} {year}
              </h3>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => setView("day")}>Dia</Button>
              <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => setView("week")}>Semana</Button>
              <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => setView("month")}>Mês</Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayAppointments = getAppointmentsForDay(day)
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(new Date(year, month, day))}
                  className={`relative rounded-lg p-2 text-sm text-left transition-colors hover:bg-accent min-h-[60px] ${
                    isToday(day) ? "bg-primary/10 border border-primary/30" : ""
                  } ${day === selectedDate.getDate() && month === selectedDate.getMonth() ? "ring-2 ring-primary" : ""}`}
                >
                  <span className={`font-medium ${isToday(day) ? "text-primary" : ""}`}>{day}</span>
                  {dayAppointments.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      <div className="flex gap-0.5">
                        {dayAppointments.slice(0, 3).map((apt) => (
                          <div
                            key={apt.id}
                            className={`h-1.5 w-1.5 rounded-full ${
                              apt.modality === "online" ? "bg-teal-500" : "bg-emerald-500"
                            }`}
                          />
                        ))}
                        {dayAppointments.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{dayAppointments.length - 3}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{dayAppointments.length} consultas</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">
            {formatDate(selectedDate)} — Agenda do Dia
          </h3>
          <div className="space-y-2">
            {timeSlots.map((time) => {
              const slotAppointments = appointments.filter(
                (apt) => apt.startTime.slice(0, 2) === time.slice(0, 2) && apt.day === selectedDate.getDate()
              )
              return (
                <div key={time} className="flex gap-4 group">
                  <div className="w-16 text-sm text-muted-foreground pt-1">{time}</div>
                  <div className="flex-1 min-h-[40px]">
                    {slotAppointments.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => { setSelectedAppt(apt); setShowDetail(true) }}
                        className={`cursor-pointer flex items-center gap-3 rounded-lg p-3 mb-1 border ${
                          apt.status === "IN_PROGRESS"
                            ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20"
                            : apt.status === "CONFIRMED"
                            ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/10"
                            : apt.status === "CANCELLED"
                            ? "border-red-200 bg-red-50 dark:bg-red-950/10 opacity-60"
                            : apt.status === "COMPLETED"
                            ? "border-muted bg-muted/30"
                            : "hover:bg-accent/50"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(apt.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{apt.patientName}</span>
                            {apt.status === "CANCELLED" && <span className="text-xs text-red-500">Cancelada</span>}
                            {apt.status === "COMPLETED" && <span className="text-xs text-gray-500">Realizada</span>}
                            {apt.modality === "online" ? (
                              <Video className="h-3.5 w-3.5 text-teal-500" />
                            ) : (
                              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {apt.startTime} - {apt.endTime}
                            </span>
                            <span>{apt.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedAppt?.patientName || "Detalhes da Consulta"}</DialogTitle>
            <DialogDescription>
              {selectedAppt && `${selectedAppt.startTime} - ${selectedAppt.endTime}`}
            </DialogDescription>
          </DialogHeader>
          {selectedAppt && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{selectedAppt.startTime} - {selectedAppt.endTime}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {selectedAppt.modality === "online" ? <Video className="h-4 w-4 text-muted-foreground" /> : <MapPin className="h-4 w-4 text-muted-foreground" />}
                <span>{selectedAppt.modality === "online" ? "Online" : "Presencial"}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAppt.status !== "CANCELLED" && selectedAppt.status !== "COMPLETED" && (
                  <>
                    {selectedAppt.status !== "CONFIRMED" && (
                      <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-600" onClick={() => handleUpdateStatus(selectedAppt.id, "CONFIRMED")}>
                        <CheckCircle className="mr-1 h-4 w-4" /> Confirmar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-violet-300 text-violet-600" onClick={async () => {
                      try {
                        const res = await fetch("/api/sessoes", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ patientId: selectedAppt.patientId, appointmentId: selectedAppt.id, type: selectedAppt.type, isRemote: selectedAppt.modality === "online" }),
                        })
                        if (!res.ok) throw new Error()
                        const sess = await res.json()
                        await fetch(`/api/sessoes/${sess.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "start" }),
                        })
                        setShowDetail(false)
                        router.push(`/sessoes/${sess.id}`)
                      } catch {
                        toast.error("Erro ao iniciar sessão")
                      }
                    }}>
                      <ClipboardEdit className="mr-1 h-4 w-4" /> Iniciar Sessão
                    </Button>
                    {selectedAppt.status !== "IN_PROGRESS" && (
                      <Button size="sm" variant="outline" className="border-amber-300 text-amber-600" onClick={() => handleUpdateStatus(selectedAppt.id, "IN_PROGRESS")}>
                        <Play className="mr-1 h-4 w-4" /> Iniciar
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-gray-300" onClick={() => handleUpdateStatus(selectedAppt.id, "COMPLETED")}>
                      <CheckCircle className="mr-1 h-4 w-4" /> Concluir
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-300 text-red-600" onClick={() => handleUpdateStatus(selectedAppt.id, "DELETE")}>
                      <XCircle className="mr-1 h-4 w-4" /> Cancelar
                    </Button>
                  </>
                )}
                {selectedAppt.modality === "online" && selectedAppt.status !== "CANCELLED" && (
                  <Button size="sm" asChild>
                    <Link href="/sala-virtual"><Video className="mr-1 h-4 w-4" /> Sala Virtual</Link>
                  </Button>
                )}
                <Button size="sm" variant="outline" className="border-teal-300 text-teal-600" onClick={() => handleSendReminder(selectedAppt)}>
                  <Bell className="mr-1 h-4 w-4" /> Enviar Lembrete
                </Button>
                <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-600" onClick={async () => {
                  try {
                    const desc = `Sessão de ${selectedAppt.type || "psicologia"} - ${new Date(selectedAppt.startTimeRaw).toLocaleDateString("pt-BR")}`
                    const val = selectedAppt.price || 100
                    const due = new Date(selectedAppt.startTimeRaw)
                    due.setDate(due.getDate() + 7)
                    const res = await fetch("/api/invoices", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        patientId: selectedAppt.patientId,
                        description: desc,
                        amount: val,
                        dueDate: due.toISOString().split("T")[0],
                      }),
                    })
                    if (!res.ok) throw new Error()
                    toast.success(t("toast.invoiceCreated", locale))
                    router.push("/cobrancas")
                  } catch {
                    toast.error("Erro ao criar fatura")
                  }
                }}>
                  <Receipt className="mr-1 h-4 w-4" /> Criar Fatura
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
