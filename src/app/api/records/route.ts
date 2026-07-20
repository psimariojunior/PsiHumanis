import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, createRecordSchema } from "@/lib/validation"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const psychologistId = await requireAuth()

    const records = await prisma.medicalRecord.findMany({
      where: { psychologistId },
      select: {
        id: true,
        type: true,
        title: true,
        isConfidential: true,
        sessionId: true,
        createdAt: true,
        patient: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return apiSuccess(records)
  } catch (error) {
    logger.error("Error fetching records", { error: String(error) })
    return apiError("Erro ao buscar prontuários")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const data = await request.json()
    const { error } = validate(createRecordSchema, data)
    if (error) return error

    const patient = await prisma.patient.findFirst({
      where: { id: data.patientId, psychologistId },
    })
    if (!patient) {
      return apiError("Paciente não encontrado", 404)
    }

    const record = await prisma.medicalRecord.create({
      data: {
        type: data.type || "SESSION_NOTE",
        title: sanitizeHtml(data.title),
        content: data.content ? sanitizeHtml(data.content) : "",
        isConfidential: data.isConfidential || false,
        patientId: data.patientId,
        psychologistId,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    })

    return apiSuccess(record, 201)
  } catch (error) {
    logger.error("Error creating record", { error: String(error) })
    return apiError("Erro ao criar prontuário")
  }
}
