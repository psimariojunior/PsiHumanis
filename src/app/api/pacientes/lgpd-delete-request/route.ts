import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const patient = await prisma.patient.findFirst({
      where: { email: email.toLowerCase() },
    })

    if (!patient) {
      return NextResponse.json({ success: true, message: "Request logged" })
    }

    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        name: "[EXCLUÍDO]",
        cpf: null,
        phone: null,
        email: `[excluido-${Date.now()}@deleted.com]`,
        address: null,
        emergencyContact: null,
        emergencyPhone: null,
      },
    })

    await prisma.emotionDiary.deleteMany({ where: { patientId: patient.id } })
    await prisma.consentLog.deleteMany({ where: { patientId: patient.id } })
    await prisma.notification.deleteMany({ where: { patientId: patient.id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}
