import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { scheduleReminders } from "@/lib/notifications"
import { sendEmail } from "@/lib/email"
import { sendFcmPushToMultiple } from "@/lib/firebase-fcm"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { validateOrigin } from "@/lib/csrf"
import { sanitizeHtml } from "@/lib/security"

export const dynamic = "force-dynamic"

const publicBookingSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(120, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255).optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  startTime: z.string().min(1, "Data/hora é obrigatória"),
  psychologistId: z.string().optional(),
  modality: z.enum(["online", "presential"]).optional(),
})

export async function POST(request: NextRequest) {
  const rateLimit = rateLimitMiddleware(10, 60000)
  const blocked = await rateLimit(request)
  if (blocked) return blocked

  const originCheck = validateOrigin(request)
  if (!originCheck.allowed) return originCheck.error

  try {
    const raw = await request.json()
    const parse = publicBookingSchema.safeParse(raw)
    if (!parse.success) {
      return NextResponse.json({
        error: "Dados inválidos",
        details: parse.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      }, { status: 400 })
    }

    const { name, email, phone, startTime, psychologistId, modality } = parse.data
    const sanitizedName = sanitizeHtml(name.trim())

    const startDate = new Date(startTime)
    if (isNaN(startDate.getTime()) || startDate < new Date()) {
      return NextResponse.json({ error: "Data/hora inválida" }, { status: 400 })
    }

    let psychologistIdFinal = psychologistId
    if (!psychologistIdFinal) {
      const firstPsych = await prisma.user.findFirst({
        where: { role: { in: ["PSYCHOLOGIST", "ADMIN"] }, active: true },
        orderBy: { createdAt: "asc" },
      })
      if (!firstPsych) {
        return NextResponse.json({ error: "Nenhum psicólogo disponível" }, { status: 404 })
      }
      psychologistIdFinal = firstPsych.id
    } else {
      const psychExists = await prisma.user.findUnique({
        where: { id: psychologistIdFinal, role: { in: ["PSYCHOLOGIST", "ADMIN"] } },
      })
      if (!psychExists) {
        return NextResponse.json({ error: "Psicólogo não encontrado" }, { status: 404 })
      }
    }

    const durationMinutes = parseInt(process.env.APPOINTMENT_DURATION_MINUTES || "30", 10)
    const endDate = new Date(startDate)
    endDate.setMinutes(endDate.getMinutes() + durationMinutes)

    const conflict = await prisma.appointment.findFirst({
      where: {
        psychologistId: psychologistIdFinal,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startTime: { lt: endDate },
        endTime: { gt: startDate },
      },
    })

    if (conflict) {
      return NextResponse.json({ error: "Este horário não está mais disponível" }, { status: 409 })
    }

    let patient = null
    if (email?.trim()) {
      patient = await prisma.patient.findFirst({
        where: { email: email.trim(), psychologistId: psychologistIdFinal },
      })
    }

    if (!patient && phone?.trim()) {
      patient = await prisma.patient.findFirst({
        where: { phone: phone.trim(), psychologistId: psychologistIdFinal },
      })
    }

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          name: sanitizedName,
          email: email?.trim() || null,
          phone: phone?.trim() || null,
          psychologistId: psychologistIdFinal,
        },
      })
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: `Consulta - ${sanitizedName}`,
        startTime: startDate,
        endTime: endDate,
        status: "SCHEDULED",
        modality: modality === "presential" ? "presential" : "online",
        patientId: patient.id,
        psychologistId: psychologistIdFinal,
      },
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    })

    scheduleReminders(appointment.id, patient.id, psychologistIdFinal, startDate).catch(
      (e) => logger.error("scheduleReminders failed", { error: String(e) })
    )

    if (email?.trim()) {
      const tz = "America/Sao_Paulo"
      const dateStr = startDate.toLocaleDateString("pt-BR", { timeZone: tz, day: "numeric", month: "long", year: "numeric" })
      const timeStr = startDate.toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" })
      const roomCode = `sala-${appointment.id.slice(0, 8)}`
      const roomLink = `https://psihumanis.com.br/sala-virtual/entrar?room=${encodeURIComponent(roomCode)}`
      sendEmail(
        email.trim(),
        "Confirmação de Consulta - PsiHumanis",
        `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #0D9488; font-size: 1.5rem; margin: 0;">PsiHumanis</h1>
            <p style="color: #666; margin: 0;">Confirmação de agendamento</p>
          </div>
          <div style="background: #f8fafc; border-radius: 8px; padding: 24px;">
            <p style="font-size: 1.125rem; margin: 0 0 16px;">Olá, <strong>${sanitizedName}</strong>!</p>
            <p style="margin: 0 0 8px;">Sua consulta foi agendada com sucesso:</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Data</td><td style="padding: 8px 0;"><strong>${dateStr}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Horário</td><td style="padding: 8px 0;"><strong>${timeStr}</strong></td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Modalidade</td><td style="padding: 8px 0;"><strong>${modality === "presential" ? "Presencial" : "Online"}</strong></td></tr>
            </table>
            ${modality !== "presential" ? `
            <div style="margin-top: 20px; padding: 16px; background: #f0fdfa; border-radius: 8px; border: 1px solid #99f6e4;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #0f766e; font-size: 0.9rem;">🎥 Link da Sala Virtual</p>
              <p style="margin: 0 0 12px; font-size: 0.8rem; color: #666;">No horário da consulta, clique no link abaixo para entrar na videochamada:</p>
              <a href="${roomLink}" style="display: inline-block; padding: 10px 20px; background: #0D9488; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 0.875rem;">Entrar na Sala</a>
              <p style="margin: 12px 0 0; font-size: 0.75rem; color: #999; word-break: break-all;">${roomLink}</p>
            </div>` : ''}
            <p style="margin-top: 16px; font-size: 0.875rem; color: #666;">Você receberá um lembrete 24h antes da consulta.</p>
          </div>
          <p style="text-align: center; font-size: 0.75rem; color: #999; margin-top: 24px;">PsiHumanis — Gestão de Psicologia</p>
        </div>`
      ).catch((e: unknown) => logger.error("confirmation email failed", { error: String(e) }))
    }

    const psychEmail = "psi_mariojunior@hotmail.com"
    const tz = "America/Sao_Paulo"
    const dateStr = startDate.toLocaleDateString("pt-BR", { timeZone: tz, day: "numeric", month: "long", year: "numeric" })
    const timeStr = startDate.toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" })
    sendEmail(
      psychEmail,
      "Novo Agendamento - PsiHumanis",
      `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0D9488; font-size: 1.5rem; margin: 0;">PsiHumanis</h1>
          <p style="color: #666; margin: 0;">Novo agendamento recebido</p>
        </div>
        <div style="background: #f8fafc; border-radius: 8px; padding: 24px;">
          <p style="font-size: 1.125rem; margin: 0 0 16px;">Um paciente agendou uma consulta:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666;">Paciente</td><td style="padding: 8px 0;"><strong>${sanitizedName}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><strong>${email?.trim() || "—"}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Telefone</td><td style="padding: 8px 0;"><strong>${phone?.trim() || "—"}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Data</td><td style="padding: 8px 0;"><strong>${dateStr}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Horário</td><td style="padding: 8px 0;"><strong>${timeStr}</strong></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Modalidade</td><td style="padding: 8px 0;"><strong>${modality === "presential" ? "Presencial" : "Online"}</strong></td></tr>
          </table>
        </div>
        <p style="text-align: center; font-size: 0.75rem; color: #999; margin-top: 24px;">PsiHumanis — Gestão de Psicologia</p>
      </div>`
    ).catch((e: unknown) => logger.error("psychologist notification email failed", { error: String(e) }))

    // Push notification to psychologist
    prisma.pushSubscription.findMany({
      where: { psychologistId: psychologistIdFinal },
      select: { fcmToken: true },
    }).then((subs) => {
      const tokens = subs.map((s) => s.fcmToken).filter((t): t is string => !!t)
      if (tokens.length > 0) {
        sendFcmPushToMultiple(
          tokens,
          "Novo Agendamento",
          `${sanitizedName} agendou consulta para ${dateStr} às ${timeStr}`,
          "/agenda"
        ).catch((e) => logger.error("push to psychologist failed", { error: String(e) }))
      }
    }).catch((e) => logger.error("push query failed", { error: String(e) }))

    return NextResponse.json(
      {
        success: true,
        appointment: {
          id: appointment.id,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          patient: appointment.patient,
        },
      },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    logger.error("Error creating public appointment", { error: String(error) })
    return NextResponse.json({ error: "Erro ao agendar consulta" }, { status: 500 })
  }
}
