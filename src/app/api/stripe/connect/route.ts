export const dynamic = "force-dynamic"

import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getStripe } from "@/lib/stripe"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { stripeConnectAccountId: true, email: true, name: true },
    })
    if (!user) return apiError("Usuário não encontrado", 404)

    const s = getStripe()
    let accountId = user.stripeConnectAccountId

    if (!accountId) {
      const account = await s.accounts.create({
        type: "express",
        email: user.email || undefined,
        country: "BR",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { psychologistId },
      })
      accountId = account.id

      await prisma.user.update({
        where: { id: psychologistId },
        data: { stripeConnectAccountId: accountId },
      })
    }

    const accountLink = await s.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/configuracoes?tab=stripe`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/configuracoes?tab=stripe&connected=true`,
      type: "account_onboarding",
    })

    return apiSuccess({ url: accountLink.url, accountId })
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error creating Stripe Connect account", { error: String(error) })
    return apiError("Erro ao criar conta de recebimento")
  }
}

export async function GET() {
  try {
    const psychologistId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { stripeConnectAccountId: true },
    })
    if (!user) return apiError("Usuário não encontrado", 404)

    if (!user.stripeConnectAccountId) {
      return apiSuccess({ connected: false, accountId: null })
    }

    const s = getStripe()
    try {
      const account = await s.accounts.retrieve(user.stripeConnectAccountId)
      return apiSuccess({
        connected: account.charges_enabled && account.payouts_enabled,
        accountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      })
    } catch {
      await prisma.user.update({
        where: { id: psychologistId },
        data: { stripeConnectAccountId: null },
      })
      return apiSuccess({ connected: false, accountId: null })
    }
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error checking Stripe Connect status", { error: String(error) })
    return apiError("Erro ao verificar status da conta")
  }
}

export async function DELETE() {
  try {
    const psychologistId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { stripeConnectAccountId: true },
    })
    if (!user?.stripeConnectAccountId) return apiError("Nenhuma conta conectada", 400)

    const s = getStripe()
    try {
      await s.accounts.del(user.stripeConnectAccountId)
    } catch (err) {
      logger.warn("Error deleting Stripe account (may already be deleted)", { error: String(err) })
    }

    await prisma.user.update({
      where: { id: psychologistId },
      data: { stripeConnectAccountId: null },
    })

    return apiSuccess({ disconnected: true })
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error disconnecting Stripe account", { error: String(error) })
    return apiError("Erro ao desconectar conta")
  }
}
