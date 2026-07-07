export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const psychologistId = await requireAuth()
    const { id: patientId } = await params

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, psychologistId },
    })
    if (!patient) return apiError("Paciente não encontrado", 404)

    const entries = await prisma.emotionDiary.findMany({
      where: { patientId, psychologistId },
      orderBy: { date: "desc" },
      take: 30,
    })

    return apiSuccess(entries)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching patient diary", { error: String(error) })
    return apiError("Erro ao buscar diário do paciente")
  }
}
