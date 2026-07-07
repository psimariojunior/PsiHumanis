export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"

export async function GET(request: Request) {
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
      include: {
        medicalRecords: {
          select: {
            id: true,
            type: true,
            title: true,
            content: true,
            isConfidential: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        emotionDiaries: {
          orderBy: { date: "desc" },
          take: 365,
        },
        appointments: {
          select: {
            id: true,
            startTime: true,
            endTime: true,
            status: true,
            type: true,
            modality: true,
            notes: true,
            createdAt: true,
          },
          orderBy: { startTime: "desc" },
        },
        invoices: {
          select: {
            id: true,
            number: true,
            description: true,
            totalAmount: true,
            status: true,
            dueDate: true,
            paidDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        consentLogs: {
          orderBy: { createdAt: "desc" },
        },
        therapyTasks: {
          select: {
            id: true,
            status: true,
            notes: true,
            assignedAt: true,
            completedAt: true,
            resource: {
              select: { name: true, type: true },
            },
          },
          orderBy: { assignedAt: "desc" },
        },
      },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      platform: "PsiHumanis",
      version: "1.0",
      personalData: {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        cpf: patient.cpf,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        profession: patient.profession,
        address: patient.address,
        city: patient.city,
        state: patient.state,
        emergencyContact: patient.emergencyContact,
        emergencyPhone: patient.emergencyPhone,
      },
      clinicalData: {
        medicalRecords: patient.medicalRecords,
        emotionDiaries: patient.emotionDiaries,
        therapyTasks: patient.therapyTasks,
      },
      appointments: patient.appointments,
      billing: patient.invoices,
      consentLogs: patient.consentLogs,
      metadata: {
        totalRecords: patient.medicalRecords.length,
        totalAppointments: patient.appointments.length,
        totalDiaryEntries: patient.emotionDiaries.length,
        accountCreated: patient.createdAt,
      },
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="psiHumanis-meus-dados-${new Date().toISOString().split("T")[0]}.json"`,
      },
    })
  } catch (error) {
    logger.error("Error exporting patient data", { error: String(error) })
    return NextResponse.json({ error: "Erro ao exportar dados" }, { status: 500 })
  }
}
