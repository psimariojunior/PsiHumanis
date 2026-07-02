import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"
import { z } from "zod"

export const dynamic = "force-dynamic"

const pushRegisterSchema = z.object({
  pushToken: z.string().min(1),
  platform: z.enum(["android", "ios", "web"]),
})

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return Response.json({ error: "Não autorizado" }, { status: 401 })
    }

    const payload = await verifyPatientToken(auth.slice(7))
    if (!payload) {
      return Response.json({ error: "Token inválido" }, { status: 401 })
    }

    const body = await request.json()
    const parsed = pushRegisterSchema.safeParse(body)
    if (!parsed.success) {
      return Response.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const { pushToken, platform } = parsed.data

    await prisma.pushSubscription.upsert({
      where: { endpoint: pushToken },
      create: {
        endpoint: pushToken,
        p256dh: "",
        auth: "",
        fcmToken: pushToken,
        patientId: payload.patientId,
        psychologistId: "",
        platform,
      },
      update: {
        patientId: payload.patientId,
        fcmToken: pushToken,
        platform,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    logger.error("Error registering push token", { error: String(error) })
    return Response.json({ error: "Erro ao registrar push token" }, { status: 500 })
  }
}
