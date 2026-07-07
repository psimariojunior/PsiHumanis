import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"
import { sanitizeHtml } from "@/lib/security"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { z } from "zod"

export const dynamic = "force-dynamic"

const rateLimit = rateLimitMiddleware(100, 60000)

const diarySchema = z.object({
  mood: z.number().int().min(1).max(5),
  emotions: z.string().max(500).optional(),
  activities: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().int().min(1).max(10).optional(),
  anxietyLevel: z.number().int().min(1).max(10).optional(),
})

export async function GET(request: Request) {
  try {
    const rateLimitResponse = await rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const token = await verifyPatientToken(auth.slice(7))
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: token.patientId },
      select: { psychologistId: true },
    })
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const entries = await prisma.emotionDiary.findMany({
      where: { patientId: token.patientId, psychologistId: patient.psychologistId },
      orderBy: { date: "desc" },
      take: 100,
    })

    return NextResponse.json(entries)
  } catch (error) {
    logger.error("Error fetching patient diary", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar diário" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const token = await verifyPatientToken(auth.slice(7))
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: token.patientId },
      select: { psychologistId: true },
    })
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const parsed = diarySchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const data = parsed.data
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await prisma.emotionDiary.findFirst({
      where: {
        patientId: token.patientId,
        date: { gte: today, lt: tomorrow },
      },
    })

    if (existing) {
      const updated = await prisma.emotionDiary.update({
        where: { id: existing.id },
        data: {
          mood: data.mood,
          emotions: data.emotions || existing.emotions,
          activities: data.activities || existing.activities,
          notes: data.notes !== undefined ? sanitizeHtml(data.notes) : existing.notes,
          sleepHours: data.sleepHours !== undefined ? data.sleepHours : existing.sleepHours,
          sleepQuality: data.sleepQuality !== undefined ? data.sleepQuality : existing.sleepQuality,
          anxietyLevel: data.anxietyLevel !== undefined ? data.anxietyLevel : existing.anxietyLevel,
        },
      })
      return NextResponse.json(updated)
    }

    const entry = await prisma.emotionDiary.create({
      data: {
        mood: data.mood,
        date: new Date(),
        emotions: data.emotions || null,
        activities: data.activities || null,
        notes: data.notes ? sanitizeHtml(data.notes) : null,
        sleepHours: data.sleepHours ?? null,
        sleepQuality: data.sleepQuality ?? null,
        anxietyLevel: data.anxietyLevel ?? null,
        patientId: token.patientId,
        psychologistId: patient.psychologistId,
      },
    })

    if (data.mood <= 2) {
      try {
        const patientFull = await prisma.patient.findUnique({
          where: { id: token.patientId },
          select: { name: true },
        })
        const patientName = patientFull?.name || "Paciente"
        const moodLabel = data.mood === 1 ? "Muito Baixo" : "Baixo"
        const emotionsParsed = data.emotions ? JSON.parse(data.emotions) : []
        const emotionTags = emotionsParsed.length > 0 ? `\nEmoções: ${emotionsParsed.join(", ")}` : ""
        const noteText = data.notes ? `\nAnotação: "${data.notes}"` : ""

        await prisma.notification.create({
          data: {
            title: "Alerta de Crise",
            message: `O humor de ${patientName} está ${moodLabel} (${data.mood}/5). Possível necessidade de atenção urgente.${emotionTags}${noteText}`,
            channel: "CRISIS_ALERT",
            status: "PENDING",
            psychologistId: patient.psychologistId,
            patientId: token.patientId,
          },
        })

        const { sendFcmPushToMultiple } = await import("@/lib/firebase-fcm")
        const psyPushSubscriptions = await prisma.pushSubscription.findMany({
          where: { psychologistId: patient.psychologistId },
          select: { fcmToken: true },
        })
        if (psyPushSubscriptions.length > 0) {
          const tokens = psyPushSubscriptions.map((s) => s.fcmToken).filter((t): t is string => t !== null)
          if (tokens.length > 0) {
            await sendFcmPushToMultiple(
              tokens,
              "Alerta de Crise",
              `${patientName} registrou humor ${moodLabel} (${data.mood}/5). Verifique o diário de emoções.`,
              "/diario-emocoes"
            )
          }
        }

        const psychologistUser = await prisma.user.findUnique({
          where: { id: patient.psychologistId },
          select: { email: true, name: true },
        })
        if (psychologistUser?.email) {
          const { sendEmail } = await import("@/lib/email")
          await sendEmail(
            psychologistUser.email,
            `Alerta de Crise - ${patientName}`,
            `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #dc2626; color: white; padding: 16px 24px; border-radius: 12px 12px 0 0;">
                <h2 style="margin: 0; font-size: 18px;">Alerta de Crise</h2>
              </div>
              <div style="background: #fef2f2; padding: 24px; border: 1px solid #fecaca; border-top: none; border-radius: 0 0 12px 12px;">
                <p style="margin: 0 0 12px; color: #991b1b; font-size: 15px;">
                  O paciente <strong>${patientName}</strong> registrou um humor <strong>${moodLabel}</strong> (${data.mood}/5) no diário de emoções.
                </p>
                ${emotionsParsed.length > 0 ? `<p style="margin: 0 0 8px; color: #7f1d1d;"><strong>Emoções:</strong> ${emotionsParsed.join(", ")}</p>` : ""}
                ${data.notes ? `<p style="margin: 0 0 8px; color: #7f1d1d;"><strong>Anotação:</strong> "${data.notes}"</p>` : ""}
                <p style="margin: 16px 0 0; color: #991b1b; font-size: 13px;">
                  Acesse o diário de emoções para mais detalhes.
                </p>
              </div>
            </div>`
          )
        }
      } catch (err) {
        logger.error("Error sending crisis alert", { error: String(err) })
      }
    }

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    logger.error("Error creating diary entry", { error: String(error) })
    return NextResponse.json({ error: "Erro ao salvar diário" }, { status: 500 })
  }
}
