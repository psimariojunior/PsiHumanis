"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { Loader2, Calendar, Clock, ChevronLeft, ChevronRight, Video } from "lucide-react"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"

interface TimeSlot {
  time: string
  startTime: string
  endTime: string
}

interface AvailableDay {
  date: string
  dayOfWeek: number
  slots: TimeSlot[]
}

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("T")[0].split("-")
  return `${d}/${m}/${y}`
}

export function BookingFlow({
  availableDays,
  token,
  patientName,
  patientEmail,
  patientPhone,
  psychologistId,
  onClose,
  onSuccess,
}: {
  availableDays: AvailableDay[]
  token: string
  patientName?: string
  patientEmail?: string | null
  patientPhone?: string | null
  psychologistId?: string
  onClose: () => void
  onSuccess: () => void
}) {
  const { vibrateSelection, vibrateNotification } = useHapticFeedback()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedModality, setSelectedModality] = useState("online")
  const [bookingLoading, setBookingLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())

  const availableDates = new Set(availableDays.map((d) => d.date))
  const selectedDay = availableDays.find((d) => d.date === selectedDate)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const handleBook = useCallback(async () => {
    if (!selectedSlot || !token) return
    setBookingLoading(true)
    try {
      const res = await fetch("/api/agendamentos/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patientName || "",
          email: patientEmail || undefined,
          phone: patientPhone || undefined,
          startTime: selectedSlot.startTime,
          modality: selectedModality,
          psychologistId: psychologistId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao agendar")
      vibrateNotification()
      toast.success("Consulta agendada!")
      onSuccess()
    } catch (e) {
      vibrateNotification()
      toast.error(e instanceof Error ? e.message : "Erro ao agendar")
    } finally {
      setBookingLoading(false)
    }
  }, [selectedSlot, token, patientName, patientEmail, patientPhone, selectedModality, psychologistId, onSuccess, vibrateNotification])

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {!selectedDate ? (
        <>
          <button onClick={onClose} className="flex items-center gap-2 text-muted-foreground hover:text-accent-foreground text-sm mb-6 transition-all">
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Agendar consulta</h1>
            <p className="text-foreground text-sm mt-1">Escolha o melhor dia para você</p>
          </div>
          <div className="bg-card rounded-2xl p-6 ring-1 ring-border">
            <div className="flex items-center justify-between mb-6">
              <button aria-label="Mês anterior" onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) } else { setCurrentMonth(currentMonth - 1) } }}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-all">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-foreground">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
              <button aria-label="Próximo mês" onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) } else { setCurrentMonth(currentMonth + 1) } }}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-accent transition-all">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES_SHORT.map((d) => (
                <div key={d} className="text-center text-xs text-muted-foreground font-medium py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }, (_, i) => (<div key={`e-${i}`} />))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const isAvail = availableDates.has(dateStr)
                const isToday = dateStr === new Date().toISOString().split("T")[0]
                return (
                  <button key={day} disabled={!isAvail} onClick={() => setSelectedDate(dateStr)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                      isAvail ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer" : "text-muted-foreground cursor-not-allowed"
                    } ${isToday ? "ring-1 ring-primary/40" : ""}`}>
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      ) : !selectedSlot ? (
        <>
          <button onClick={() => setSelectedDate(null)} className="flex items-center gap-2 text-muted-foreground hover:text-accent-foreground text-sm mb-6 transition-all">
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="bg-card rounded-2xl p-6 ring-1 ring-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{formatDateBR(selectedDate)}</h2>
                <p className="text-muted-foreground text-sm">
                  {["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"][new Date(selectedDate).getUTCDay()]}
                </p>
              </div>
            </div>
            {selectedDay && selectedDay.slots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedDay.slots.map((s) => (
                  <button key={s.time} onClick={() => { vibrateSelection(); setSelectedSlot(s) }}
                    className="bg-muted hover:bg-primary/10 text-foreground hover:text-primary/80 rounded-xl py-3 px-4 text-sm font-medium transition-all ring-1 ring-border hover:ring-primary/30">
                    <Clock className="h-4 w-4 inline mr-1.5" />{s.time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">Nenhum horário disponível neste dia</p>
            )}
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setSelectedSlot(null)} className="flex items-center gap-2 text-muted-foreground hover:text-accent-foreground text-sm mb-6 transition-all">
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 ring-1 ring-primary/20 mb-4">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">{formatDateBR(selectedDate)}</h2>
            <p className="text-foreground text-lg">às {selectedSlot.time}</p>
          </div>
          <div className="bg-card rounded-2xl p-6 ring-1 ring-border mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Modalidade</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSelectedModality("online")}
                className={`rounded-xl py-4 px-4 text-sm font-medium transition-all ring-1 text-left ${
                  selectedModality === "online"
                    ? "bg-primary/10 ring-primary/30 text-primary"
                    : "bg-muted ring-border text-foreground hover:bg-accent"
                }`}>
                <Video className="h-5 w-5 mb-1.5" />
                <p className="font-medium">Online</p>
                <p className="text-xs mt-0.5 opacity-70">Videochamada</p>
              </button>
              <button onClick={() => setSelectedModality("presential")}
                className={`rounded-xl py-4 px-4 text-sm font-medium transition-all ring-1 text-left ${
                  selectedModality === "presential"
                    ? "bg-primary/10 ring-primary/30 text-primary"
                    : "bg-muted ring-border text-foreground hover:bg-accent"
                }`}>
                <Calendar className="h-5 w-5 mb-1.5" />
                <p className="font-medium">Presencial</p>
                <p className="text-xs mt-0.5 opacity-70">No consultório</p>
              </button>
            </div>
          </div>
          <div className="bg-card rounded-2xl p-6 ring-1 ring-border mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Confirmar agendamento</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary text-xs font-bold">{patientName?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-foreground">{patientName}</span>
              </div>
              {patientEmail && <p className="text-foreground text-sm ml-11">{patientEmail}</p>}
              {patientPhone && <p className="text-foreground text-sm ml-11">{patientPhone}</p>}
            </div>
          </div>
          <Button onClick={handleBook} disabled={bookingLoading}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300">
            {bookingLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {bookingLoading ? "Agendando..." : "Confirmar Agendamento"}
          </Button>
        </>
      )}
    </div>
  )
}
