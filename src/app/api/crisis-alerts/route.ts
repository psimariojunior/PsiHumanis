export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"

    const where: Record<string, unknown> = {
      psychologistId,
      channel: "CRISIS_ALERT",
    }
    if (unreadOnly) where.readAt = null

    const alerts = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const alertsWithPatient = await Promise.all(
      alerts.map(async (alert) => {
        if (!alert.patientId) return { ...alert, patient: null }
        const patient = await prisma.patient.findUnique({
          where: { id: alert.patientId },
          select: { id: true, name: true, email: true, phone: true },
        })
        return { ...alert, patient }
      })
    )

    return apiSuccess(alertsWithPatient)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching crisis alerts", { error: String(error) })
    return apiError("Erro ao buscar alertas de crise")
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const body = await request.json()
    const { id } = body

    if (!id) return apiError("ID do alerta é obrigatório", 400)

    const alert = await prisma.notification.findFirst({
      where: { id, psychologistId, channel: "CRISIS_ALERT" },
    })
    if (!alert) return apiError("Alerta não encontrado", 404)

    const updated = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    })

    return apiSuccess(updated)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error marking crisis alert as read", { error: String(error) })
    return apiError("Erro ao marcar alerta como lido")
  }
}
