"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import toast from "react-hot-toast"
import { Loader2, Calendar, Clock, XCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  modality: string | null
  psychologist: { name: string }
}

interface AvailableDay {
  date: string
  dayOfWeek: number
  slots: { time: string; startTime: string; endTime: string }[]
}

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("T")[0].split("-")
  return `${d}/${m}/${y}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function AppointmentList({
  appointments,
  token,
  onAppointmentsChange,
}: {
  appointments: Appointment[]
  token: string
  onAppointmentsChange: (appointments: Appointment[]) => void
}) {
  const { vibrateSelection, vibrateNotification } = useHapticFeedback()
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const [rescheduleTarget, setRescheduleTarget] = useState<string | null>(null)
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null)
  const [rescheduleReason, setRescheduleReason] = useState("")
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const handleCancel = async (appointmentId: string, reason: string) => {
    setCancelling(appointmentId)
    try {
      const res = await fetch(`/api/pacientes/agendamentos/${appointmentId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ cancelReason: reason || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao cancelar")
      }
      vibrateNotification()
      toast.success("Consulta cancelada")
      onAppointmentsChange(appointments.map((a) => a.id === appointmentId ? { ...a, status: "CANCELLED" } : a))
    } catch (e) {
      vibrateNotification()
      toast.error(e instanceof Error ? e.message : "Erro ao cancelar")
    } finally {
      setCancelling(null)
      setCancelTarget(null)
      setCancelReason("")
    }
  }

  const loadAvailability = async () => {
    setLoadingAvailability(true)
    try {
      const res = await fetch("/api/disponibilidade/public")
      const data = await res.json()
      setAvailableDays(data.availableDays || [])
    } catch {
      toast.error("Erro ao carregar horários")
    } finally {
      setLoadingAvailability(false)
    }
  }

  const handleStartReschedule = (appointmentId: string) => {
    setRescheduleTarget(appointmentId)
    setSelectedSlot(null)
    setRescheduleReason("")
    setWeekOffset(0)
    loadAvailability()
  }

  const handleReschedule = async () => {
    if (!rescheduleTarget || !selectedSlot) return
    setRescheduleLoading(true)
    try {
      const res = await fetch(`/api/pacientes/agendamentos/${rescheduleTarget}/reschedule`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          newStartTime: selectedSlot.startTime,
          newEndTime: selectedSlot.endTime,
          reason: rescheduleReason || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao remarcar")

      vibrateNotification()
      toast.success(data.message || "Consulta remarcada!")
      onAppointmentsChange(appointments.map((a) =>
        a.id === rescheduleTarget
          ? { ...a, startTime: selectedSlot.startTime, endTime: selectedSlot.endTime }
          : a
      ))
      setRescheduleTarget(null)
      setSelectedSlot(null)
      setRescheduleReason("")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao remarcar")
    } finally {
      setRescheduleLoading(false)
    }
  }

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + weekOffset * 7)
  weekStart.setHours(0, 0, 0, 0)

  const weekDays: Date[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    weekDays.push(d)
  }

  const upcoming = appointments.filter((a) => new Date(a.startTime) > new Date() && a.status !== "CANCELLED")
  const past = appointments.filter((a) => new Date(a.startTime) <= new Date() || a.status === "CANCELLED")

  return (
    <>
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Próximas consultas</h2>
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a.id} className="bg-card hover:bg-accent rounded-xl p-4 ring-1 ring-border transition-all">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium">{formatDateBR(a.startTime)}</p>
                    <p className="text-foreground text-sm">
                      <Clock className="h-3.5 w-3.5 inline mr-1" />
                      {formatTime(a.startTime)} — {formatTime(a.endTime)}
                    </p>
                  </div>
                  <div className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full hidden sm:block">
                    {a.modality === "online" ? "Online" : "Presencial"}
                  </div>

                  <Dialog open={rescheduleTarget === a.id} onOpenChange={(open) => { if (!open) { setRescheduleTarget(null); setSelectedSlot(null) } }}>
                    <DialogTrigger asChild>
                      <button onClick={() => handleStartReschedule(a.id)} disabled={cancelling === a.id}
                        className="text-muted-foreground hover:text-teal-500 transition-colors p-1 disabled:opacity-50" title="Remarcar consulta">
                        <RotateCcw className="h-5 w-5" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Remarcar consulta</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Consulta atual: {formatDateBR(a.startTime)} às {formatTime(a.startTime)}
                        </DialogDescription>
                      </DialogHeader>

                      {loadingAvailability ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w - 1)} disabled={weekOffset <= 0}>
                              <ChevronLeft className="h-4 w-4" /> Anterior
                            </Button>
                            <span className="text-sm text-muted-foreground">
                              {weekDays[0] && weekDays[0].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                              {" — "}
                              {weekDays[13] && weekDays[13].toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w + 1)}>
                              Próximo <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {DAY_NAMES.map(d => (
                              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
                            ))}
                            {weekDays.map((day, i) => {
                              const dateStr = day.toISOString().split("T")[0]
                              const dayData = availableDays.find(dd => dd.date === dateStr)
                              const hasSlots = dayData && dayData.slots.length > 0
                              const isToday = dateStr === now.toISOString().split("T")[0]
                              const isPast = day < new Date(now.getFullYear(), now.getMonth(), now.getDate())
                              return (
                                <div key={i} className={`text-center p-1 rounded-lg text-xs ${
                                  isPast ? "text-muted-foreground/40" :
                                  hasSlots ? "bg-primary/10 text-primary font-medium cursor-pointer hover:bg-primary/20" :
                                  "text-muted-foreground"
                                } ${isToday ? "ring-2 ring-primary/30" : ""}`}>
                                  {day.getDate()}
                                  {hasSlots && !isPast && (
                                    <div className="text-[10px] text-primary/70">{dayData!.slots.length}h</div>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {availableDays.filter(dd => {
                            const d = new Date(dd.date)
                            return d >= weekDays[0] && d <= weekDays[13]
                          }).length === 0 && (
                            <p className="text-center text-muted-foreground text-sm py-4">
                              Nenhum horário disponível nestas 2 semanas
                            </p>
                          )}

                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {availableDays
                              .filter(dd => {
                                const d = new Date(dd.date)
                                return d >= weekDays[0] && d <= weekDays[13]
                              })
                              .sort((a, b) => a.date.localeCompare(b.date))
                              .map(day => (
                                <div key={day.date}>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    {new Date(day.date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "short" })}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {day.slots.map(slot => {
                                      const isSelected = selectedSlot?.startTime === slot.startTime
                                      return (
                                        <button
                                          key={slot.time}
                                          onClick={() => setSelectedSlot({ startTime: slot.startTime, endTime: slot.endTime })}
                                          className={`px-2 py-1 rounded-md text-xs font-mono transition-all ${
                                            isSelected
                                              ? "bg-primary text-primary-foreground"
                                              : "bg-muted hover:bg-primary/10 text-foreground"
                                          }`}
                                        >
                                          {slot.time}
                                        </button>
                                      )
                                    })}
                                  </div>
                                </div>
                              ))}
                          </div>

                          <div>
                            <label className="text-sm text-foreground block mb-1">Motivo (opcional)</label>
                            <Input placeholder="Ex: conflito de horário..." value={rescheduleReason}
                              onChange={(e) => setRescheduleReason(e.target.value)} />
                          </div>

                          <div className="flex gap-3">
                            <DialogClose asChild>
                              <Button variant="outline" className="flex-1">Voltar</Button>
                            </DialogClose>
                            <Button className="flex-1" disabled={!selectedSlot || rescheduleLoading}
                              onClick={handleReschedule}>
                              {rescheduleLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                              {selectedSlot
                                ? `Remarcar para ${formatDateBR(selectedSlot.startTime)} ${formatTime(selectedSlot.startTime)}`
                                : "Selecione um horário"
                              }
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Dialog open={cancelTarget === a.id} onOpenChange={(open) => { if (!open) { setCancelTarget(null); setCancelReason("") } }}>
                    <DialogTrigger asChild>
                      <button onClick={() => setCancelTarget(a.id)} disabled={cancelling === a.id}
                        className="text-muted-foreground hover:text-red-400 transition-colors p-1 disabled:opacity-50" title="Cancelar consulta">
                        {cancelling === a.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-5 w-5" />}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Cancelar consulta</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                          Tem certeza que deseja cancelar a consulta do dia {formatDateBR(a.startTime)}?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-foreground block mb-1">Motivo (opcional)</label>
                          <Input placeholder="Ex: imprevisto, mudança de horário..." value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)} />
                        </div>
                        <div className="flex gap-3">
                          <DialogClose asChild>
                            <Button variant="outline" className="flex-1">Voltar</Button>
                          </DialogClose>
                          <Button variant="destructive" className="flex-1" disabled={cancelling === a.id}
                            onClick={() => handleCancel(a.id, cancelReason)}>
                            {cancelling === a.id && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Cancelar consulta
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h2>
          <div className="space-y-2">
            {past.slice(0, 5).map((a) => (
              <div key={a.id} className="bg-card rounded-xl p-3 ring-1 ring-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-card flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-foreground text-sm">{formatDateBR(a.startTime)} — {formatTime(a.startTime)}</p>
                    <p className="text-muted-foreground text-xs">{a.status === "CANCELLED" ? "Cancelada" : "Realizada"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
