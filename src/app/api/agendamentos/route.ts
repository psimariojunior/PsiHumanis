import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, createAppointmentSchema } from "@/lib/validation"
import { scheduleReminders } from "@/lib/notifications"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { syncAppointmentToCalendar } from "@/lib/google-calendar"
import { fireTrigger } from "@/lib/automation-engine"
import { sendFcmPushToMultiple } from "@/lib/firebase-fcm"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const patientId = searchParams.get("patientId")

    const where: Prisma.AppointmentWhereInput = {
      psychologistId,
    }

    if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate), lte: new Date(endDate) }
    }
    if (patientId) {
      where.patientId = patientId
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { startTime: "asc" },
    })

    return apiSuccess(appointments)
  } catch (error) {
    logger.error("Error fetching appointments", { error: String(error) })
    return apiError("Erro ao buscar agendamentos")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const data = await request.json()
    const { error } = validate(createAppointmentSchema, data)
    if (error) return error

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      return apiError("Data/hora fim deve ser após data/hora início", 400)
    }

    const createSingleAppointment = async (
      startTime: Date, endTime: Date, index: number, total: number
    ) => {
      const appt = await prisma.appointment.create({
        data: {
          title: data.title ? sanitizeHtml(data.title) : null,
          startTime,
          endTime,
          type: data.type || null,
          modality: data.modality || "presential",
          notes: data.notes ? sanitizeHtml(data.notes) : null,
          price: data.price ? parseFloat(String(data.price)) : null,
          color: data.color || null,
          status: "SCHEDULED",
          patientId: data.patientId,
          psychologistId,
          isRecurring: total > 1,
          recurringRule: total > 1 ? JSON.stringify({ index, total }) : null,
        },
        include: {
          patient: { select: { id: true, name: true, email: true, phone: true } },
        },
      })

      scheduleReminders(appt.id, appt.patientId, psychologistId, appt.startTime).catch(
        (e) => logger.error("scheduleReminders failed", { error: String(e) })
      )
      syncAppointmentToCalendar(psychologistId, appt as Parameters<typeof syncAppointmentToCalendar>[1]).catch(() => {})

      fireTrigger("appointment_booked", {
        psychologistId,
        patientId: appt.patientId,
        patientName: appt.patient.name,
        patientEmail: appt.patient.email ?? undefined,
        appointmentId: appt.id,
        appointmentDate: startTime.toLocaleDateString("pt-BR"),
        appointmentTime: startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      }).catch((e) => logger.error("fireTrigger appointment_booked failed", { error: String(e) }))

      // Push notification to patient
      prisma.pushSubscription.findMany({
        where: { patientId: appt.patientId },
        select: { fcmToken: true },
      }).then((subs) => {
        const tokens = subs.map((s) => s.fcmToken).filter((t): t is string => !!t)
        if (tokens.length > 0) {
          const dateStr = startTime.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })
          const timeStr = startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
          sendFcmPushToMultiple(
            tokens,
            "Consulta Agendada",
            `Sua consulta foi agendada para ${dateStr} às ${timeStr}`,
            "/paciente/agenda"
          ).catch((e) => logger.error("push to patient failed", { error: String(e) }))
        }
      }).catch((e) => logger.error("patient push query failed", { error: String(e) }))

      return appt
    }

    const duration = new Date(data.endTime).getTime() - new Date(data.startTime).getTime()

    if (data.isRecurring && data.recurringRule) {
      let rule: { frequency: string; occurrences: number }
      try { rule = JSON.parse(data.recurringRule) } catch {
        return apiError("Regra de recorrência inválida", 400)
      }
      const intervalDays = rule.frequency === "weekly" ? 7 : 14
      const maxOccurrences = Math.min(rule.occurrences || 4, 52)
      const results = []
      for (let i = 0; i < maxOccurrences; i++) {
        const start = new Date(data.startTime)
        start.setDate(start.getDate() + i * intervalDays)
        const end = new Date(start.getTime() + duration)
        results.push(await createSingleAppointment(start, end, i + 1, maxOccurrences))
      }
      return apiSuccess(results, 201)
    }

    const appointment = await createSingleAppointment(
      new Date(data.startTime), new Date(data.endTime), 1, 1
    )
    return apiSuccess(appointment, 201)
  } catch (error) {
    logger.error("Error creating appointment", { error: String(error) })
    return apiError("Erro ao criar agendamento")
  }
}
