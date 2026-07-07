export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"
import { z } from "zod"

const assignSchema = z.object({
  resourceId: z.string().min(1, "ID do recurso é obrigatório"),
  notes: z.string().max(500).optional(),
})

export async function POST(
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

    const body = await request.json()
    const parsed = assignSchema.safeParse(body)
    if (!parsed.success) {
      return apiError("Dados inválidos", 400)
    }

    const resource = await prisma.therapyResource.findFirst({
      where: { id: parsed.data.resourceId, psychologistId },
    })
    if (!resource) return apiError("Recurso não encontrado", 404)

    const existing = await prisma.therapyTask.findFirst({
      where: {
        resourceId: parsed.data.resourceId,
        patientId,
        status: "PENDING",
      },
    })
    if (existing) return apiError("Este recurso já foi atribuído a este paciente e está pendente", 409)

    const task = await prisma.therapyTask.create({
      data: {
        resourceId: parsed.data.resourceId,
        patientId,
        psychologistId,
        notes: parsed.data.notes || null,
        status: "PENDING",
      },
      include: {
        resource: { select: { id: true, name: true, type: true, category: true } },
        patient: { select: { id: true, name: true } },
      },
    })

    return apiSuccess(task, 201)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error assigning task", { error: String(error) })
    return apiError("Erro ao atribuir tarefa")
  }
}

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

    const tasks = await prisma.therapyTask.findMany({
      where: { patientId, psychologistId },
      include: {
        resource: { select: { id: true, name: true, type: true, category: true, description: true } },
      },
      orderBy: { assignedAt: "desc" },
    })

    return apiSuccess(tasks)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching patient tasks", { error: String(error) })
    return apiError("Erro ao buscar tarefas do paciente")
  }
}
