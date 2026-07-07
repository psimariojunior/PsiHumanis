import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getStripe } from "@/lib/stripe"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const { invoiceId } = await request.json()

    if (!invoiceId) {
      return apiError("ID da fatura é obrigatório", 400)
    }

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, psychologistId },
      include: {
        patient: { select: { id: true, name: true, email: true, stripeCustomerId: true } },
        psychologist: { select: { name: true, stripeConnectAccountId: true } },
      },
    })

    if (!invoice) {
      return apiError("Fatura não encontrada", 404)
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
          metadata: { patientId: invoice.patient.id, psychologistId },
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
      customer: stripeCustomerId || undefined,
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
      metadata: { invoiceId: invoice.id, psychologistId },
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
    logger.error("Error creating checkout session", { error: String(error) })
    return apiError("Erro ao criar sessão de pagamento")
  }
}
