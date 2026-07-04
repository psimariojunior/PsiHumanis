"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePatientAuth } from "@/components/patient-auth-provider"
import toast from "react-hot-toast"
import { Loader2, Calendar, ArrowLeft } from "lucide-react"
import { WelcomeBanner } from "./components/welcome-banner"
import { AppointmentList } from "./components/appointment-list"
import { BookingFlow } from "./components/booking-flow"
import { PullToRefresh } from "@/components/pull-to-refresh"

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

export default function AgendaPacientePage() {
  const router = useRouter()
  const { patient, token } = usePatientAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppts, setLoadingAppts] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([])

  useEffect(() => {
    if (!token) return
    fetchAppointments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchAppointments = () => {
    if (!token) return
    setLoadingAppts(true)
    fetch("/api/pacientes/agendamentos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAppointments)
      .catch(() => toast.error("Erro ao carregar agendamentos"))
      .finally(() => setLoadingAppts(false))
  }

  const loadAvailability = useCallback(async () => {
    if (!patient?.psychologistId) return
    try {
      const res = await fetch(`/api/disponibilidade/public?psychologistId=${patient.psychologistId}`)
      const data = await res.json()
      setAvailableDays(data.availableDays || [])
    } catch {
      toast.error("Erro ao carregar horários")
    }
  }, [patient?.psychologistId])

  const handleStartBooking = () => {
    setShowBooking(true)
    loadAvailability()
  }

  const upcoming = appointments.filter((a) => new Date(a.startTime) > new Date() && a.status !== "CANCELLED")
  const past = appointments.filter((a) => new Date(a.startTime) <= new Date() || a.status === "CANCELLED")
  const hasAppointments = upcoming.length > 0 || past.length > 0
  const isFirstTime = !hasAppointments && !loadingAppts

  return (
    <div className="min-h-screen">
      {!showBooking && isFirstTime && (
        <WelcomeBanner patientName={patient?.name || ""} onStartBooking={handleStartBooking} />
      )}

      {!showBooking && !isFirstTime && (
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Minha Agenda</h1>
              <p className="text-foreground text-sm mt-1">Olá, {patient?.name?.split(" ")[0]}</p>
            </div>
            <Button onClick={handleStartBooking} className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20 shrink-0">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar consulta
            </Button>
          </div>

          {loadingAppts ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <PullToRefresh onRefresh={async () => { fetchAppointments() }}>
              <AppointmentList
                appointments={appointments}
                token={token || ""}
                onAppointmentsChange={setAppointments}
              />
            </PullToRefresh>
          )}
        </div>
      )}

      {showBooking && (
        <BookingFlow
          availableDays={availableDays}
          token={token || ""}
          patientName={patient?.name}
          patientEmail={patient?.email}
          patientPhone={patient?.phone}
          psychologistId={patient?.psychologistId}
          onClose={() => setShowBooking(false)}
          onSuccess={() => {
            setShowBooking(false)
            if (token) {
              fetch("/api/pacientes/agendamentos", {
                headers: { Authorization: `Bearer ${token}` },
              }).then((res) => res.json()).then(setAppointments).catch(() => {})
            }
          }}
        />
      )}
    </div>
  )
}
