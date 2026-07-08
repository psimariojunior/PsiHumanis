"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Flame, Star, Trophy, Zap, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakBadgeProps {
  currentStreak: number
  longestStreak: number
  totalEntries: number
}

function getStreakInfo(streak: number) {
  if (streak >= 30) return { icon: <Trophy className="h-5 w-5" />, label: "Mestre", color: "from-amber-400 to-yellow-500", bg: "bg-amber-50 dark:bg-amber-950/30", message: "Incrível! Você é um exemplo de dedicação!" }
  if (streak >= 14) return { icon: <Star className="h-5 w-5" />, label: "Dedicado", color: "from-teal-400 to-cyan-500", bg: "bg-teal-50 dark:bg-teal-950/30", message: "Duas semanas seguidas! Continue assim!" }
  if (streak >= 7) return { icon: <Flame className="h-5 w-5" />, label: "Em Chamas", color: "from-orange-400 to-red-500", bg: "bg-orange-50 dark:bg-orange-950/30", message: "Uma semana completa! Você está no caminho certo!" }
  if (streak >= 3) return { icon: <Zap className="h-5 w-5" />, label: "Começando", color: "from-teal-400 to-teal-500", bg: "bg-teal-50 dark:bg-teal-950/30", message: "3 dias seguidos! O hábito está se formando!" }
  return { icon: <Calendar className="h-5 w-5" />, label: "Iniciante", color: "from-slate-400 to-slate-500", bg: "bg-slate-50 dark:bg-slate-950/30", message: "Comece hoje! Registre seu humor diariamente." }
}

function AnimatedStreak({ streak }: { streak: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (streak === 0) return
    const duration = 800
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * streak))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [streak])

  return <span className="text-4xl font-bold">{display}</span>
}

export function StreakBadge({ currentStreak, longestStreak, totalEntries }: StreakBadgeProps) {
  const info = getStreakInfo(currentStreak)

  return (
    <Card className={cn("overflow-hidden", info.bg)}>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg", info.color)}>
            {info.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <AnimatedStreak streak={currentStreak} />
              <div>
                <p className="text-xs text-muted-foreground">dias seguidos</p>
                <p className="text-xs font-medium text-muted-foreground">{info.label}</p>
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{info.message}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-background/50 p-3 text-center">
            <p className="text-lg font-bold">{longestStreak}</p>
            <p className="text-[10px] text-muted-foreground">Recorde</p>
          </div>
          <div className="rounded-xl bg-background/50 p-3 text-center">
            <p className="text-lg font-bold">{totalEntries}</p>
            <p className="text-[10px] text-muted-foreground">Total de registros</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
