import { Prisma } from "@prisma/client"
import { prisma } from "./prisma"
import { logger } from "./logger"
import { sendAppointmentReminderEmail } from "./email"
import { sendAppointmentReminderWhatsApp } from "./whatsapp"
import { sendPushToSubscriptions } from "./push"
import { sendFcmPush } from "./firebase-fcm"

export async function sendReminderNow(
  patientId: string,
  channel: string,
  psychologistName: string,
  appointmentDate?: string,
  appointmentTime?: string,
  overrides?: { email?: string | null; phone?: string | null; name?: string }
): Promise<{ ok: boolean; error?: string }> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { name: true, email: true, phone: true },
  })
  if (!patient) {
    const msg = `Paciente não encontrado (${patientId})`
    console.error("[sendReminderNow]", msg)
    return { ok: false, error: msg }
  }

  const patientEmail = overrides?.email ? overrides.email : patient.email
  const patientPhone = overrides?.phone ? overrides.phone : patient.phone
  const patientName = overrides?.name || patient.name

  console.log("[sendReminderNow] request", {
    patientId, channel, patientName,
    dbEmail: patient.email,
    overrideEmail: overrides?.email,
    patientEmail,
    dbPhone: patient.phone,
    overridePhone: overrides?.phone,
    patientPhone,
  })

  if (channel === "EMAIL") {
    if (!patientEmail) {
      const msg = "Paciente não tem e-mail cadastrado"
      console.error("[sendReminderNow]", msg, { patientId, patientName })
      return { ok: false, error: msg }
    }
    const err = await sendAppointmentReminderEmail(
      patientEmail, patientName, psychologistName,
      appointmentDate || "", appointmentTime || "", "Atendimento", "online"
    )
    console.log("[sendReminderNow] EMAIL result", { patientId, err })
    return err ? { ok: false, error: err } : { ok: true }
  }

  if (channel === "WHATSAPP") {
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const waToken = process.env.WHATSAPP_API_TOKEN
    if (!waPhoneId || !waToken) {
      console.log("[sendReminderNow] WHATSAPP not configured, skipping")
      return { ok: true }
    }
    if (!patientPhone) {
      const msg = "Paciente não tem WhatsApp cadastrado"
      console.error("[sendReminderNow]", msg, { patientId, patientName })
      return { ok: false, error: msg }
    }
    const ok = await sendAppointmentReminderWhatsApp(patientPhone, patientName, appointmentDate || "", appointmentTime || "")
    console.log("[sendReminderNow] WHATSAPP result", { patientId, ok })
    return ok ? { ok: true } : { ok: false, error: "Falha ao enviar WhatsApp" }
  }

  return { ok: false, error: `Canal desconhecido: ${channel}` }
}

export async function dispatchNotification(
  notificationId: string,
  overrides?: { psychologistName?: string }
): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification) {
    logger.warn("Notification not found", { notificationId })
    return
  }

  const psyName = overrides?.psychologistName || "Psicólogo"

  let patientName = "Paciente"
  let patientEmail: string | null = null
  let patientPhone: string | null = null
  let appointmentDate = ""
  let appointmentTime = ""

  if (notification.patientId) {
    const patient = await prisma.patient.findUnique({
      where: { id: notification.patientId },
      select: { name: true, email: true, phone: true },
    })
    if (patient) {
      patientName = patient.name
      patientEmail = patient.email
      patientPhone = patient.phone
    }
  }

  const appointmentLookupId = notification.appointmentId || notification.externalId
  if (appointmentLookupId) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentLookupId },
      select: { startTime: true },
    })
    if (appointment) {
      const tz = "America/Sao_Paulo"
      const d = new Date(appointment.startTime)
      const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
      appointmentDate = d.toLocaleDateString("pt-BR", { timeZone: tz, day: "numeric", month: "long", year: "numeric" })
      appointmentTime = d.toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" })
    }
  }

  let sendErr: string | null = "Nenhum canal disponível"

  if (notification.channel === "EMAIL" && patientEmail) {
    sendErr = await sendAppointmentReminderEmail(
      patientEmail,
      patientName,
      psyName,
      appointmentDate,
      appointmentTime,
      "Atendimento",
      "online"
    )
  } else if (notification.channel === "WHATSAPP" && patientPhone) {
    const ok = await sendAppointmentReminderWhatsApp(patientPhone, patientName, appointmentDate, appointmentTime)
    sendErr = ok ? null : "Falha ao enviar WhatsApp"
  } else {
    sendErr = `Canal ${notification.channel} sem contato do paciente`
    logger.warn("Cannot dispatch notification", {
      notificationId,
      channel: notification.channel,
      hasEmail: !!patientEmail,
      hasPhone: !!patientPhone,
    })
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: sendErr ? "FAILED" : "SENT",
      sentAt: sendErr ? null : new Date(),
      errorMessage: sendErr,
    },
  })

  if (!sendErr && notification.patientId) {
    try {
      const subs = await prisma.pushSubscription.findMany({
        where: { patientId: notification.patientId },
        select: { fcmToken: true },
      })
      for (const sub of subs) {
        if (sub.fcmToken) {
          await sendFcmPush({
            token: sub.fcmToken,
            title: notification.title || "PsiHumanis",
            body: `${notification.message || "Você tem um lembrete de consulta"}${appointmentDate ? ` — ${appointmentDate} às ${appointmentTime}` : ""}`,
            url: "/paciente/agenda",
            tag: `reminder-${notificationId}`,
          })
        }
      }
    } catch {}
  }

  if (!sendErr) {
    try {
      const { Redis } = await import("@upstash/redis") as typeof import("@upstash/redis")
      const redisUrl = process.env.UPSTASH_REDIS_REST_URL
      const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
      if (redisUrl && redisToken) {
        const redis = new Redis({ url: redisUrl, token: redisToken })
        const key = `push:subscriptions:${notification.psychologistId}`
        const subs: string[] = await redis.get(key) || []
        if (subs.length > 0) {
          const parsed = subs.map(s => { try { return JSON.parse(s) } catch { return null } }).filter(Boolean)
          await sendPushToSubscriptions(parsed, {
            title: notification.title || "PsiHumanis",
            body: `Lembrete ${notification.channel} enviado para ${patientName}${appointmentDate ? ` (${appointmentDate})` : ""}`,
            url: "/notificacoes",
            tag: `reminder-${notificationId}`,
          })
        }
      }
    } catch {}
  }
}

export async function scheduleReminders(
  appointmentId: string,
  patientId: string,
  psychologistId: string,
  startTime: Date
): Promise<void> {
  const now = new Date()

  const remindAt = [
    new Date(startTime.getTime() - 24 * 60 * 60 * 1000),
    new Date(startTime.getTime() - 60 * 60 * 1000),
  ]

  for (const scheduledAt of remindAt) {
    if (scheduledAt <= now) continue
    for (const channel of ["EMAIL", "WHATSAPP"]) {
      await prisma.notification.create({
      data: {
        title: "Lembrete de consulta",
        message: "Lembrete automático de consulta",
        channel,
        status: "PENDING",
        scheduledAt,
        patientId,
        recipientId: patientId,
        psychologistId,
        appointmentId,
        externalId: appointmentId,
      },
      })
    }
  }
}

export async function cancelPendingReminders(appointmentId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { OR: [{ externalId: appointmentId }, { appointmentId }], status: "PENDING" },
    data: { status: "CANCELLED" },
  })
}

export async function processPendingNotifications(force = false): Promise<{ sent: number; failed: number }> {
  const where: Prisma.NotificationWhereInput = { status: "PENDING" }
  if (!force) {
    where.scheduledAt = { lte: new Date() }
  }
  const pending = await prisma.notification.findMany({
    where,
    select: { id: true },
  })

  let sent = 0
  let failed = 0

  for (const n of pending) {
    try {
      await dispatchNotification(n.id)
      sent++
    } catch (err) {
      logger.error("Error dispatching notification", { id: n.id, error: String(err) })
      failed++
    }
  }

  if (pending.length > 0) {
    logger.info("Notifications processed", { total: pending.length, sent, failed })
  }

  return { sent, failed }
}
