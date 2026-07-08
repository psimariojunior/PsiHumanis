"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Sparkles, Moon, Sun, Cloud, Heart, Brain } from "lucide-react"
import { cn } from "@/lib/utils"

interface MoodEntry {
  id: string
  date: string
  mood: number
  emotions?: string[]
}

interface WeeklyInsightsProps {
  entries: MoodEntry[]
}

function MoodDistribution({ entries }: { entries: MoodEntry[] }) {
  const moodLabels = ["Muito Baixo", "Baixo", "Neutro", "Bom", "Ótimo"]
  const moodColors = ["bg-red-400", "bg-orange-400", "bg-amber-400", "bg-teal-400", "bg-emerald-400"]
  const moodIcons = [<Moon key="1" />, <Cloud key="2" />, <Sun key="3" />, <Heart key="4" />, <Sparkles key="5" />]

  const counts = [0, 0, 0, 0, 0]
  entries.forEach((e) => {
    if (e.mood >= 1 && e.mood <= 5) counts[e.mood - 1]++
  })
  const total = entries.length || 1

  return (
    <div className="space-y-2">
      {moodLabels.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-16">{label}</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-1000", moodColors[i])}
              style={{ width: `${(counts[i] / total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-6 text-right">{counts[i]}</span>
        </div>
      ))}
    </div>
  )
}

function WeeklyStreak({ entries }: { entries: MoodEntry[] }) {
  const today = new Date()
  const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  const weekDays = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const hasEntry = entries.some((e) => e.date.startsWith(dateStr))
    const entry = entries.find((e) => e.date.startsWith(dateStr))
    weekDays.push({
      day: days[date.getDay()],
      date: date.getDate(),
      hasEntry,
      mood: entry?.mood || 0,
      isToday: i === 0,
    })
  }

  const moodColors = ["", "bg-red-400", "bg-orange-400", "bg-amber-400", "bg-teal-400", "bg-emerald-400"]

  return (
    <div className="flex justify-between">
      {weekDays.map((d) => (
        <div key={d.day} className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">{d.day}</span>
          <div
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-all",
              d.hasEntry ? cn(moodColors[d.mood], "text-white") : "bg-muted text-muted-foreground",
              d.isToday && "ring-2 ring-teal-500 ring-offset-2"
            )}
          >
            {d.date}
          </div>
        </div>
      ))}
    </div>
  )
}

export function WeeklyInsights({ entries }: WeeklyInsightsProps) {
  const [insight, setInsight] = useState("")
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable")

  useEffect(() => {
    if (entries.length < 2) {
      setInsight("Registre suas emoções diariamente para ver insights personalizados.")
      return
    }

    const last7 = entries.slice(-7)
    const prev7 = entries.slice(-14, -7)

    const avgLast7 = last7.reduce((sum, e) => sum + e.mood, 0) / last7.length
    const avgPrev7 = prev7.length > 0 ? prev7.reduce((sum, e) => sum + e.mood, 0) / prev7.length : avgLast7

    const diff = avgLast7 - avgPrev7

    if (diff > 0.5) {
      setTrend("up")
      setInsight(`Seu humor melhorou ${Math.round(diff * 20)}% esta semana! Continue assim.`)
    } else if (diff < -0.5) {
      setTrend("down")
      setInsight("Seu humor está um pouco baixo. Considere uma sessão de relaxamento.")
    } else {
      setTrend("stable")
      setInsight("Seu humor está estável. Continue registrando para manter o acompanhamento.")
    }

    const emotionCounts: Record<string, number> = {}
    last7.forEach((e) => {
      if (e.emotions) {
        e.emotions.forEach((emo) => {
          emotionCounts[emo] = (emotionCounts[emo] || 0) + 1
        })
      }
    })

    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]
    if (topEmotion) {
      setInsight((prev) => `${prev} Emoção mais frequente: ${topEmotion[0]}.`)
    }
  }, [entries])

  const trendIcon = trend === "up" ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : trend === "down" ? <TrendingDown className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4 text-muted-foreground" />

  return (
    <Card className="overflow-hidden border-teal-500/20">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
            <Brain className="h-4 w-4 text-teal-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Insights da Semana</h3>
            <div className="flex items-center gap-1.5">
              {trendIcon}
              <span className="text-xs text-muted-foreground">
                {trend === "up" ? "Melhorando" : trend === "down" ? "Atenção" : "Estável"}
              </span>
            </div>
          </div>
        </div>

        <WeeklyStreak entries={entries} />

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Distribuição de Humor</p>
            <MoodDistribution entries={entries} />
          </div>

          <div className="rounded-xl bg-teal-500/5 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">{insight}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
