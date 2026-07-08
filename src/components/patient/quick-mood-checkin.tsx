"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"

interface QuickMoodCheckinProps {
  onMoodSelected?: (mood: number) => void
  lastMood?: number
}

const moods = [
  { value: 1, emoji: "😔", label: "Muito Baixo", color: "from-red-400 to-red-500", bg: "bg-red-50 dark:bg-red-950/30" },
  { value: 2, emoji: "😟", label: "Baixo", color: "from-orange-400 to-orange-500", bg: "bg-orange-50 dark:bg-orange-950/30" },
  { value: 3, emoji: "😐", label: "Neutro", color: "from-amber-400 to-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  { value: 4, emoji: "🙂", label: "Bom", color: "from-teal-400 to-teal-500", bg: "bg-teal-50 dark:bg-teal-950/30" },
  { value: 5, emoji: "😊", label: "Ótimo", color: "from-emerald-400 to-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
]

export function QuickMoodCheckin({ onMoodSelected, lastMood }: QuickMoodCheckinProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const { vibrate } = useHapticFeedback()

  const handleSelect = (mood: number) => {
    if (saved) return
    vibrate("medium")
    setSelected(mood)
    onMoodSelected?.(mood)
    setTimeout(() => setSaved(true), 300)
  }

  if (saved && selected) {
    const mood = moods.find((m) => m.value === selected)
    return (
      <Card className="overflow-hidden border-teal-500/20">
        <CardContent className="p-5">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">Humor registrado!</p>
              <p className="text-xs text-muted-foreground">Obrigado por compartilhar</p>
            </div>
            <div className={cn("px-4 py-2 rounded-full text-sm font-medium", mood?.bg)}>
              {mood?.emoji} {mood?.label}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-background to-cyan-500/5">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
            <Sparkles className="h-4 w-4 text-teal-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Como você está?</h3>
            <p className="text-xs text-muted-foreground">Toque para registrar seu humor</p>
          </div>
        </div>

        <div className="flex justify-between gap-2">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleSelect(mood.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all duration-200",
                selected === mood.value
                  ? cn("bg-gradient-to-b shadow-lg scale-110", mood.color, "text-white")
                  : "bg-muted/50 hover:bg-muted",
                lastMood === mood.value && !selected && "ring-2 ring-teal-500/30"
              )}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className={cn("text-[10px] font-medium", selected === mood.value ? "text-white/90" : "text-muted-foreground")}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>

        {lastMood && (
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            Último registro: {moods.find((m) => m.value === lastMood)?.emoji} {moods.find((m) => m.value === lastMood)?.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
