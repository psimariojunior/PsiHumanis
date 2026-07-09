import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { summarizeSession, suggestTreatment, generateReport, suggestTasks, analyzeEmotions, chat } from "@/lib/ai"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action, data } = body

    switch (action) {
      case "summarize":
        return NextResponse.json(await summarizeSession(data.notes, data.patientName))
      case "suggest-treatment":
        return NextResponse.json(await suggestTreatment(data.assessment, data.history))
      case "report":
        return NextResponse.json(await generateReport(data))
      case "suggest-tasks":
        return NextResponse.json(await suggestTasks(data.sessionNotes, data.patientContext))
      case "analyze-emotions":
        return NextResponse.json(await analyzeEmotions(data.emotions))
      case "chat":
        return NextResponse.json(await chat(data.message, data.context))
      default:
        return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erro interno" },
      { status: 500 }
    )
  }
}
