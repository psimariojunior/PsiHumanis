import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getStripe } from "@/lib/stripe"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { validateOrigin } from "@/lib/csrf"
import { apiError, apiSuccess } from "@/lib/api-helpers"
import { verifyPatientToken } from "@/lib/patient-auth"

export const dynamic = "force-dynamic"

async function getPatientFromToken(request: NextRequest): Promise<string | null> {
  const auth = request.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null
  try {
    const payload = await verifyPatientToken(auth.slice(7))
    return payload?.patientId || null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = rateLimitMiddleware(10, 60000)
  const blocked = await rateLimit(request)
  if (blocked) return blocked

  const originCheck = validateOrigin(request)
  if (!originCheck.allowed) return originCheck.error

  try {
    const patientId = await getPatientFromToken(request)
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return apiError("ID da fatura é obrigatório", 400)
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        patient: { select: { id: true, name: true, email: true, stripeCustomerId: true } },
        psychologist: { select: { id: true, name: true, stripeConnectAccountId: true } },
      },
    })

    if (!invoice) {
      return apiError("Fatura não encontrada", 404)
    }

    if (patientId && invoice.patientId !== patientId) {
      return apiError("Fatura não pertence a este paciente", 403)
    }

    if (invoice.status === "PAID" || invoice.status === "REFUNDED") {
      return apiError("Fatura já foi paga", 400)
    }

    let stripeCustomerId = invoice.patient.stripeCustomerId

    if (!stripeCustomerId && invoice.patient.email) {
      const s = getStripe()
      const customers = await s.customers.search({
        query: `email:"${invoice.patient.email}"`,
      })

      stripeCustomerId = customers.data[0]?.id

      if (!stripeCustomerId) {
        const customer = await s.customers.create({
          name: invoice.patient.name || undefined,
          email: invoice.patient.email || undefined,
          metadata: { patientId: invoice.patient.id, psychologistId: invoice.psychologist.id },
        })
        stripeCustomerId = customer.id
      }

      await prisma.patient.update({
        where: { id: invoice.patient.id },
        data: { stripeCustomerId },
      })
    }

    const s = getStripe()

    const sessionParams: Record<string, unknown> = {
      ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
      payment_method_types: ["card", "boleto"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: invoice.description,
              metadata: { invoiceId: invoice.id, invoiceNumber: invoice.number },
            },
            unit_amount: Math.round(invoice.totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/paciente/faturas?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/paciente/faturas?canceled=true`,
      metadata: { invoiceId: invoice.id, psychologistId: invoice.psychologist.id },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    }

    if (invoice.psychologist.stripeConnectAccountId) {
      sessionParams.transfer_data = {
        destination: invoice.psychologist.stripeConnectAccountId,
      }
    }

    const session = await s.checkout.sessions.create(sessionParams as any)

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { stripeCheckoutSessionId: session.id },
    })

    return apiSuccess({ url: session.url })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    logger.error("Error creating public checkout session", { error: msg })
    return apiError("Erro ao criar sessão de pagamento")
  }
}
