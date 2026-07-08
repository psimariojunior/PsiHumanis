import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  message: z.string().min(10).max(1000),
  category: z.enum(["GENERAL", "FEATURE", "BUG", "UX", "SUPPORT"]).default("GENERAL"),
  displayName: z.string().max(50).optional(),
  allowPublic: z.boolean().default(false),
})

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const data = feedbackSchema.parse(body)

    const feedback = await prisma.feedback.create({
      data: {
        ...data,
        psychologistId: session.user.id,
      },
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error creating feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const publicOnly = searchParams.get("public") === "true"

    if (publicOnly) {
      const feedbacks = await prisma.feedback.findMany({
        where: { allowPublic: true },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          rating: true,
          title: true,
          message: true,
          displayName: true,
          createdAt: true,
        },
      })

      const stats = await prisma.feedback.aggregate({
        where: { allowPublic: true },
        _avg: { rating: true },
        _count: { id: true },
      })

      return NextResponse.json({
        feedbacks,
        stats: {
          average: stats._avg.rating || 0,
          total: stats._count.id || 0,
        },
      })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { psychologistId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    const stats = await prisma.feedback.aggregate({
      where: { psychologistId: session.user.id },
      _avg: { rating: true },
      _count: { id: true },
    })

    return NextResponse.json({
      feedbacks,
      stats: {
        average: stats._avg.rating || 0,
        total: stats._count.id || 0,
      },
    })
  } catch (error) {
    console.error("Error fetching feedback:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}