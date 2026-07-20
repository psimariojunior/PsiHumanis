import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { z } from "zod"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

const updateRecordSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().max(10000).optional(),
  type: z.string().max(100).optional(),
  isConfidential: z.boolean().optional(),
  subjective: z.string().max(10000).nullish(),
  objective: z.string().max(10000).nullish(),
  assessment: z.string().max(10000).nullish(),
  plan: z.string().max(10000).nullish(),
  notes: z.string().max(10000).nullish(),
  moodBefore: z.number().int().min(0).max(10).nullish(),
  moodAfter: z.number().int().min(0).max(10).nullish(),
  tags: z.string().max(500).nullish(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const psychologistId = await requireAuth()

    const record = await prisma.medicalRecord.findFirst({
      where: {
        id: params.id,
        psychologistId,
      },
      include: {
        patient: { select: { id: true, name: true, cpf: true, phone: true, email: true, dateOfBirth: true, gender: true } },
        session: {
          select: {
            id: true, subjective: true, objective: true, assessment: true, plan: true,
            notes: true, moodBefore: true, moodAfter: true, tags: true, type: true,
            startedAt: true, endedAt: true, duration: true, isRemote: true,
          },
        },
      },
    })

    if (!record) {
      return apiError("Prontuário não encontrado", 404)
    }

    return apiSuccess(record)
  } catch (error) {
    logger.error("Error fetching record", { error: String(error) })
    return apiError("Erro ao buscar prontuário")
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const psychologistId = await requireAuth()

    const existing = await prisma.medicalRecord.findFirst({
      where: {
        id: params.id,
        psychologistId,
      },
    })
    if (!existing) {
      return apiError("Prontuário não encontrado", 404)
    }

    const body = await request.json()
    const result = updateRecordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.issues.map((i) => i.message) },
        { status: 400 }
      )
    }
    const data = result.data

    await prisma.medicalRecord.update({
      where: { id: params.id },
      data: {
        title: data.title ? sanitizeHtml(data.title) : existing.title,
        content: data.content ? sanitizeHtml(data.content) : existing.content,
        type: data.type ?? existing.type,
        isConfidential: data.isConfidential ?? existing.isConfidential,
      },
    })

    if (existing.sessionId) {
      const sessionData: Record<string, unknown> = {}
      if (data.subjective !== undefined) sessionData.subjective = sanitizeHtml(data.subjective || "")
      if (data.objective !== undefined) sessionData.objective = sanitizeHtml(data.objective || "")
      if (data.assessment !== undefined) sessionData.assessment = sanitizeHtml(data.assessment || "")
      if (data.plan !== undefined) sessionData.plan = sanitizeHtml(data.plan || "")
      if (data.notes !== undefined) sessionData.notes = sanitizeHtml(data.notes || "")
      if (data.moodBefore !== undefined) sessionData.moodBefore = data.moodBefore
      if (data.moodAfter !== undefined) sessionData.moodAfter = data.moodAfter
      if (data.tags !== undefined) sessionData.tags = sanitizeHtml(data.tags || "")

      if (Object.keys(sessionData).length > 0) {
        await prisma.therapySession.update({
          where: { id: existing.sessionId },
          data: sessionData,
        })
      }
    }

    const record = await prisma.medicalRecord.findFirst({
      where: { id: params.id },
      include: {
        patient: { select: { id: true, name: true, cpf: true, phone: true, email: true, dateOfBirth: true, gender: true } },
        session: {
          select: {
            id: true, subjective: true, objective: true, assessment: true, plan: true,
            notes: true, moodBefore: true, moodAfter: true, tags: true, type: true,
            startedAt: true, endedAt: true, duration: true, isRemote: true,
          },
        },
      },
    })

    return apiSuccess(record)
  } catch (error) {
    logger.error("Error updating record", { error: String(error) })
    return apiError("Erro ao atualizar prontuário")
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const psychologistId = await requireAuth()

    const existing = await prisma.medicalRecord.findFirst({
      where: {
        id: params.id,
        psychologistId,
      },
    })
    if (!existing) {
      return apiError("Prontuário não encontrado", 404)
    }

    const created = new Date(existing.createdAt)
    const fiveYearsAgo = new Date()
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5)

    if (created > fiveYearsAgo) {
      return apiError(
        "Prontuário não pode ser excluído: prontuários clínicos devem ser mantidos por no mínimo 5 anos " +
        "conforme Resolução CFP nº 06/2019. Prontuário criado em " +
        created.toLocaleDateString("pt-BR") + ".",
        403
      )
    }

    await prisma.medicalRecord.delete({ where: { id: params.id } })
    return apiSuccess({ message: "Prontuário excluído com sucesso" })
  } catch (error) {
    logger.error("Error deleting record", { error: String(error) })
    return apiError("Erro ao excluir prontuário")
  }
}
