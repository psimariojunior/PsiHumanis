import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const psychologistId = await requireAuth()
    const now = new Date()
    const brtNow = new Date(now.getTime() - 3 * 3600000)
    const currentYear = brtNow.getUTCFullYear()
    const currentMonth = brtNow.getUTCMonth()
    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1))
    const startOfLastMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1))
    const startOfToday = new Date(Date.UTC(currentYear, currentMonth, brtNow.getUTCDate()))
    const endOfToday = new Date(startOfToday.getTime() + 86400000)
    const endOfTomorrow = new Date(endOfToday.getTime() + 86400000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000)
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1))
    const sixMonthsAgo = new Date(Date.UTC(currentYear, currentMonth - 5, 1))

    const [
      totalPatients,
      appointmentsToday,
      monthlyIncome,
      lastMonthIncome,
      pendingPayments,
      overduePayments,
      recentAppointments,
      todaysAppointments,
      tomorrowsAppointments,
      recentPatients,
      recentAuditLogs,
      recentPayments,
      financialSummary,
      allAppointments,
      monthlyRevenueData,
      paymentMethods,
      newPatientsMonthly,
      patientsPerMonth,
      completedAppointments,
      totalAppointments,
      appointmentStatuses,
      birthdayPatients,
    ] = await Promise.all([
      prisma.patient.count({ where: { psychologistId, active: true } }),
      prisma.appointment.count({
        where: { psychologistId, startTime: { gte: startOfToday, lt: endOfToday } },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: "PAID", paymentDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: "PAID", paymentDate: { gte: startOfLastMonth, lt: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: "PENDING" },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: "OVERDUE" },
        _sum: { amount: true },
      }),
      prisma.appointment.findMany({
        where: { psychologistId, startTime: { gte: now }, status: { in: ["SCHEDULED", "CONFIRMED"] } },
        include: { patient: { select: { id: true, name: true } } },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      prisma.appointment.findMany({
        where: { psychologistId, startTime: { gte: startOfToday, lt: endOfToday }, status: { notIn: ["CANCELLED"] } },
        include: { patient: { select: { id: true, name: true } } },
        orderBy: { startTime: "asc" },
        take: 20,
      }),
      prisma.appointment.findMany({
        where: { psychologistId, startTime: { gte: endOfToday, lt: endOfTomorrow }, status: { notIn: ["CANCELLED"] } },
        include: { patient: { select: { id: true, name: true } } },
        orderBy: { startTime: "asc" },
        take: 20,
      }),
      prisma.patient.findMany({
        where: { psychologistId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.auditLog.findMany({
        where: { userId: psychologistId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      prisma.financialTransaction.findMany({
        where: { psychologistId, type: "INCOME", paymentStatus: "PAID", paymentDate: { gte: sevenDaysAgo } },
        include: { patient: { select: { name: true } } },
        orderBy: { paymentDate: "desc" },
        take: 10,
      }),
      Promise.all([
        prisma.financialTransaction.aggregate({
          where: { psychologistId, type: "INCOME", paymentStatus: "PAID" },
          _sum: { amount: true },
        }),
        prisma.financialTransaction.aggregate({
          where: { psychologistId, type: "EXPENSE", paymentStatus: "PAID" },
          _sum: { amount: true },
        }),
      ]),
      prisma.appointment.findMany({
        where: { psychologistId, startTime: { gte: startOfYear } },
        select: { startTime: true, status: true },
      }),
      prisma.financialTransaction.groupBy({
        by: ["paymentDate"],
        where: {
          psychologistId,
          type: "INCOME",
          paymentStatus: "PAID",
          paymentDate: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.groupBy({
        by: ["paymentMethod"],
        where: { psychologistId, type: "INCOME", paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
      prisma.patient.findMany({
        where: { psychologistId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.$queryRawUnsafe<{ mes: string; total: bigint }[]>(
        `SELECT to_char("startTime", 'YYYY-MM') as mes, COUNT(*) as total
         FROM "Appointment"
         WHERE "psychologistId" = $1 AND "startTime" >= $2 AND "status" != 'CANCELLED'
         GROUP BY mes ORDER BY mes`,
        psychologistId, sixMonthsAgo
      ),
      prisma.appointment.count({
        where: { psychologistId, status: "COMPLETED" },
      }),
      prisma.appointment.count({
        where: { psychologistId, status: { notIn: ["CANCELLED"] } },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: { psychologistId },
        _count: true,
      }),
      prisma.patient.findMany({
        where: {
          psychologistId,
          active: true,
          dateOfBirth: { not: null },
        },
        select: { id: true, name: true, dateOfBirth: true, phone: true },
      }),
    ])

    const income = financialSummary[0]._sum.amount || 0
    const expense = financialSummary[1]._sum.amount || 0
    const pending = pendingPayments._sum.amount || 0
    const overdue = overduePayments._sum.amount || 0

    const currentMonthRevenue = monthlyIncome._sum.amount || 0
    const prevMonthRevenue = lastMonthIncome._sum.amount || 0
    const revenueChange = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    const monthlyAppointments = Array(12).fill(0)
    for (const apt of allAppointments) {
      monthlyAppointments[apt.startTime.getMonth()]++
    }

    const monthlyRevenue: number[] = Array(12).fill(0)
    for (const tx of monthlyRevenueData) {
      if (tx.paymentDate) {
        monthlyRevenue[tx.paymentDate.getMonth()] += tx._sum.amount || 0
      }
    }

    const monthlyData = monthNames.map((month, i) => ({
      month,
      appointments: monthlyAppointments[i],
      receita: monthlyRevenue[i],
    }))

    const lastMonthAppointments = allAppointments.filter(
      (a) => a.startTime.getMonth() === currentMonth - 1 && a.startTime.getFullYear() === currentYear
    ).length
    const thisMonthAppointments = monthlyAppointments[currentMonth]
    const appointmentChange = lastMonthAppointments > 0 ? ((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100 : 0

    const paymentsByMethod = paymentMethods.map((pm) => ({
      name: pm.paymentMethod || "Outros",
      value: pm._sum.amount || 0,
    }))

    const totalPts = totalAppointments || 1
    const completionRate = Math.round((completedAppointments / totalPts) * 100)
    const cancellationCount = appointmentStatuses.find((s) => s.status === "CANCELLED")?._count || 0
    const totalWithCancel = totalAppointments + cancellationCount || 1
    const cancellationRate = Math.round((cancellationCount / totalWithCancel) * 100)
    const averageTicket = totalPatients > 0 ? Math.round(income / totalPatients) : 0
    const occupationRate = Math.min(100, Math.round((monthlyAppointments[currentMonth] / 22) * 100))

    const sixMonthNames: string[] = []
    for (let i = 5; i >= 0; i--) {
      const m = new Date(currentYear, currentMonth - i, 1)
      sixMonthNames.push(monthNames[m.getMonth()])
    }
    const newPatientsByMonth = sixMonthNames.map((m) => ({ month: m, count: 0 }))
    for (const p of newPatientsMonthly) {
      const idx = sixMonthNames.indexOf(monthNames[p.createdAt.getMonth()])
      if (idx >= 0) newPatientsByMonth[idx].count++
    }

    const mapApt = (apt: { id: string; startTime: Date; status: string; modality: string | null; patient: { id: string; name: string } }) => ({
      id: apt.id,
      patientId: apt.patient.id,
      patientName: apt.patient.name,
      startTime: apt.startTime,
      status: apt.status,
      modality: apt.modality || "presential",
    })

    type ActivityItem = {
      id: string
      type: "appointment" | "patient" | "payment" | "session" | "system"
      description: string
      timestamp: string
      amount?: number
    }
    const activity: ActivityItem[] = []

    for (const p of recentPatients) {
      activity.push({
        id: `pat-${p.id}`,
        type: "patient",
        description: `Novo paciente cadastrado: ${p.name}`,
        timestamp: p.createdAt.toISOString(),
      })
    }
    for (const apt of todaysAppointments) {
      activity.push({
        id: `apt-${apt.id}`,
        type: "appointment",
        description: `Consulta agendada: ${apt.patient.name}`,
        timestamp: apt.createdAt ? apt.createdAt.toISOString() : apt.startTime.toISOString(),
      })
    }
    for (const tx of recentPayments) {
      activity.push({
        id: `pay-${tx.id}`,
        type: "payment",
        description: `Pagamento recebido${tx.patient ? ` de ${tx.patient.name}` : ""}`,
        timestamp: tx.paymentDate ? tx.paymentDate.toISOString() : tx.createdAt.toISOString(),
        amount: tx.amount,
      })
    }
    for (const log of recentAuditLogs) {
      if (log.action === "CREATE" && log.entity === "Patient") continue
      if (log.details) {
        activity.push({
          id: `log-${log.id}`,
          type: "system",
          description: log.details,
          timestamp: log.createdAt.toISOString(),
        })
      }
    }
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    const recentActivity = activity.slice(0, 10)

    // Streak: consecutive working days with at least one non-cancelled appointment
    const appointmentDates = allAppointments
      .filter((a) => a.status !== "CANCELLED")
      .map((a) => {
        const d = new Date(a.startTime.getTime() - 3 * 3600000)
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`
      })
    const uniqueDates = Array.from(new Set(appointmentDates)).sort().reverse()
    let streak = 0
    const today = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(brtNow.getUTCDate()).padStart(2, "0")}`
    for (let i = 0; i < uniqueDates.length; i++) {
      const expected = new Date(brtNow.getTime() - i * 86400000)
      const expectedStr = `${expected.getUTCFullYear()}-${String(expected.getUTCMonth() + 1).padStart(2, "0")}-${String(expected.getUTCDate()).padStart(2, "0")}`
      if (uniqueDates[i] === expectedStr) streak++
      else break
    }

    return apiSuccess({
      stats: {
        totalPatients,
        appointmentsToday,
        monthlyRevenue: currentMonthRevenue,
        pendingPayments: pending + overdue,
        appointmentChange: Math.round(appointmentChange * 10) / 10,
        revenueChange: Math.round(revenueChange * 10) / 10,
      },
      birthdays: birthdayPatients
        .filter((p) => {
          if (!p.dateOfBirth) return false
          const brt = new Date(p.dateOfBirth.getTime() - 3 * 3600000)
          return brt.getUTCMonth() === currentMonth
        })
        .map((p) => {
          const brt = new Date(p.dateOfBirth!.getTime() - 3 * 3600000)
          const day = brt.getUTCDate()
          const age = currentYear - brt.getUTCFullYear()
          return { id: p.id, name: p.name, day, age, phone: p.phone }
        })
        .sort((a, b) => a.day - b.day),
      monthlyData,
      appointments: recentAppointments.map(mapApt),
      todaysAppointments: todaysAppointments.map(mapApt),
      tomorrowsAppointments: tomorrowsAppointments.map(mapApt),
      patients: recentPatients.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        createdAt: p.createdAt,
      })),
      recentActivity,
      financialSummary: {
        totalRevenue: income,
        totalExpenses: expense,
        balance: income - expense,
        pending,
        overdue,
        received: income,
        goal: 10000,
      },
      indicators: {
        averageTicket,
        completionRate,
        cancellationRate,
        occupationRate,
      },
      paymentsByMethod,
      newPatientsByMonth,
      appointmentsPerMonth: patientsPerMonth.map((ap) => ({
        month: ap.mes.slice(5),
        count: Number(ap.total),
      })),
      streak,
    })
  } catch (error) {
    logger.error("Error fetching dashboard data", { error: String(error) })
    return apiError("Erro ao carregar dashboard")
  }
}
