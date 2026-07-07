export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"

export async function POST(request: Request) {
  try {
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
      select: { id: true, name: true, email: true },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.emotionDiary.deleteMany({ where: { patientId: patient.id } })
      await tx.therapyTask.deleteMany({ where: { patientId: patient.id } })
      await tx.notification.deleteMany({ where: { patientId: patient.id } })
      await tx.pushSubscription.deleteMany({ where: { patientId: patient.id } })
      await tx.consentLog.deleteMany({ where: { patientId: patient.id } })

      const records = await tx.medicalRecord.findMany({
        where: { patientId: patient.id },
        select: { id: true },
      })
      for (const rec of records) {
        await tx.attachment.deleteMany({ where: { recordId: rec.id } })
      }
      await tx.medicalRecord.deleteMany({ where: { patientId: patient.id } })

      await tx.invoice.deleteMany({ where: { patientId: patient.id } })

      await tx.appointment.deleteMany({ where: { patientId: patient.id } })

      await tx.patient.delete({ where: { id: patient.id } })
    })

    logger.info("Patient data deleted (LGPD)", { patientId: patient.id, name: patient.name })

    return NextResponse.json({
      success: true,
      message: "Seus dados foram permanentemente excluídos.",
    })
  } catch (error) {
    logger.error("Error deleting patient data (LGPD)", { error: String(error) })
    return NextResponse.json({ error: "Erro ao excluir dados" }, { status: 500 })
  }
}
