import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

const updateSessionSchema = z.object({
  action: z.enum(["start", "pause", "resume", "end", "save"]).optional(),
  subjective: z.string().max(10000).optional(),
  objective: z.string().max(10000).optional(),
  assessment: z.string().max(10000).optional(),
  plan: z.string().max(10000).optional(),
  notes: z.string().max(10000).optional(),
  moodBefore: z.number().int().min(0).max(10).optional(),
  moodAfter: z.number().int().min(0).max(10).optional(),
  tags: z.string().max(500).optional(),
  type: z.string().max(100).optional(),
  isRemote: z.boolean().optional(),
})

type SessionUpdateData = z.infer<typeof updateSessionSchema>

function sanitizeSessionFields(data: SessionUpdateData): SessionUpdateData {
  const textFields: (keyof SessionUpdateData)[] = ["subjective", "objective", "assessment", "plan", "notes", "tags", "type"]
  for (const field of textFields) {
    const val = data[field]
    if (typeof val === "string") {
      ;(data as Record<string, unknown>)[field] = sanitizeHtml(val)
    }
  }
  return data
}

async function getSessionById(id: string, psychologistId: string) {
  return prisma.therapySession.findFirst({
    where: { id, psychologistId },
    include: {
      patient: {
        select: { id: true, name: true, cpf: true, phone: true, email: true, dateOfBirth: true, gender: true, address: true, neighborhood: true, city: true, state: true, profession: true, observations: true },
      },
      appointment: { select: { id: true, startTime: true, endTime: true, modality: true, status: true } },
    },
  })
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const psychologistId = await requireAuth()

    const therapySession = await getSessionById(params.id, psychologistId)
    if (!therapySession) {
      return apiError("Sessão não encontrada", 404)
    }

    return apiSuccess(therapySession)
  } catch (error) {
    logger.error("Error fetching session", { error: String(error) })
    return apiError("Erro ao buscar sessão")
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const psychologistId = await requireAuth()
    const existing = await prisma.therapySession.findFirst({
      where: { id: params.id, psychologistId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }

    const raw = await request.json()
    const parse = updateSessionSchema.safeParse(raw)
    if (!parse.success) {
      return NextResponse.json({
        error: "Dados inválidos",
        details: parse.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      }, { status: 400 })
    }

    const data = sanitizeSessionFields(parse.data)
    const { action, subjective, objective, assessment, plan, notes, moodBefore, moodAfter, tags, type, isRemote } = data

    const now = new Date()

    const updateAndFetch = async (data: Prisma.TherapySessionUpdateInput) => {
      await prisma.therapySession.update({ where: { id: params.id }, data })
      return getSessionById(params.id, psychologistId)
    }

    if (action === "start") {
      const updated = await updateAndFetch({ status: "IN_PROGRESS", startedAt: now })
      await prisma.appointment.updateMany({
        where: { id: existing.appointmentId ?? "", psychologistId },
        data: { status: "IN_PROGRESS" },
      })
      return apiSuccess(updated)
    }

    if (action === "pause") {
      if (existing.status !== "IN_PROGRESS") {
        return apiError("Sessão não está em andamento", 400)
      }
      const elapsed = existing.startedAt ? Math.floor((now.getTime() - existing.startedAt.getTime()) / 1000) : 0
      const totalPaused = (existing.pausedSeconds ?? 0) + elapsed
      const updated = await updateAndFetch({ status: "PAUSED", pausedSeconds: totalPaused, duration: totalPaused })
      return apiSuccess(updated)
    }

    if (action === "resume") {
      if (existing.status !== "PAUSED") {
        return apiError("Sessão não está pausada", 400)
      }
      const updated = await updateAndFetch({ status: "IN_PROGRESS", startedAt: now })
      return apiSuccess(updated)
    }

    if (action === "end") {
      if (existing.status !== "IN_PROGRESS" && existing.status !== "PAUSED") {
        return apiError("Sessão não está ativa", 400)
      }

      let totalSeconds = existing.pausedSeconds ?? 0
      if (existing.status === "IN_PROGRESS" && existing.startedAt) {
        totalSeconds += Math.floor((now.getTime() - existing.startedAt.getTime()) / 1000)
      }

      const updated = await updateAndFetch({
        status: "COMPLETED",
        endedAt: now,
        duration: totalSeconds,
        subjective: subjective ?? existing.subjective,
        objective: objective ?? existing.objective,
        assessment: assessment ?? existing.assessment,
        plan: plan ?? existing.plan,
        notes: notes ?? existing.notes,
        moodBefore: moodBefore !== undefined ? moodBefore : existing.moodBefore,
        moodAfter: moodAfter !== undefined ? moodAfter : existing.moodAfter,
        tags: tags ?? existing.tags,
        type: type ?? existing.type,
        isRemote: isRemote ?? existing.isRemote,
      })

      await prisma.appointment.updateMany({
        where: { id: existing.appointmentId ?? "", psychologistId },
        data: { status: "COMPLETED" },
      })

      const sessionDate = existing.startedAt ?? existing.createdAt
      const dateStr = sessionDate.toLocaleDateString("pt-BR")
      const sections: string[] = []
      if (subjective?.trim()) sections.push("**Subjetivo:**\n" + subjective)
      if (objective?.trim()) sections.push("**Objetivo:**\n" + objective)
      if (assessment?.trim()) sections.push("**Avaliação:**\n" + assessment)
      if (plan?.trim()) sections.push("**Plano:**\n" + plan)
      if (notes?.trim()) sections.push("**Observações:**\n" + notes)
      const content = sections.join("\n\n") || "Sessão realizada sem anotações."

      const title = `Sessão ${dateStr}` + (tags?.trim() ? ` — ${tags}` : "")

      await prisma.medicalRecord.create({
        data: {
          type: "SESSION_NOTE",
          title,
          content,
          patientId: existing.patientId,
          psychologistId,
        },
      })

      return apiSuccess(updated)
    }

    const updated = await updateAndFetch({
      subjective: subjective !== undefined ? subjective : existing.subjective,
      objective: objective !== undefined ? objective : existing.objective,
      assessment: assessment !== undefined ? assessment : existing.assessment,
      plan: plan !== undefined ? plan : existing.plan,
      notes: notes !== undefined ? notes : existing.notes,
      moodBefore: moodBefore !== undefined ? moodBefore : existing.moodBefore,
      moodAfter: moodAfter !== undefined ? moodAfter : existing.moodAfter,
      tags: tags !== undefined ? tags : existing.tags,
      type: type ?? existing.type,
      isRemote: isRemote ?? existing.isRemote,
    })

    return apiSuccess(updated)
  } catch (error) {
    logger.error("Error updating session", { error: String(error) })
    return apiError("Erro ao atualizar sessão")
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const psychologistId = await requireAuth()

    const existing = await prisma.therapySession.findFirst({
      where: { id: params.id, psychologistId },
    })
    if (!existing) {
      return apiError("Sessão não encontrada", 404)
    }

    await prisma.therapySession.delete({ where: { id: params.id } })
    return apiSuccess({ message: "Sessão removida" })
  } catch (error) {
    logger.error("Error deleting session", { error: String(error) })
    return apiError("Erro ao remover sessão")
  }
}
