"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Sparkles, Target, Zap, Heart, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

interface HealthScoreProps {
  score: number
  trend: "up" | "down" | "stable"
  factors: {
    label: string
    value: number
    max: number
    icon: React.ReactNode
    color: string
  }[]
  message: string
}

function AnimatedScore({ score }: { score: number }) {
  const [displayScore, setDisplayScore] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let start = 0
    const duration = 1500
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayScore(Math.round(eased * score))

      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 160
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const radius = 65

    const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"
    const time = Date.now() / 1000

    ctx.clearRect(0, 0, size, size)

    // Background circle
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = "rgba(13, 148, 136, 0.1)"
    ctx.lineWidth = 8
    ctx.lineCap = "round"
    ctx.stroke()

    // Progress arc
    const progress = displayScore / 100
    ctx.beginPath()
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
    ctx.strokeStyle = color
    ctx.lineWidth = 8
    ctx.lineCap = "round"
    ctx.stroke()

    // Glow
    ctx.shadowColor = color
    ctx.shadowBlur = 15
    ctx.beginPath()
    ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
    ctx.strokeStyle = color
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    ctx.stroke()
    ctx.shadowBlur = 0

    // Particles
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + time * 0.3
      const dist = radius + 12 + Math.sin(time * 2 + i) * 3
      const px = cx + Math.cos(angle) * dist
      const py = cy + Math.sin(angle) * dist
      const size = 2 + Math.sin(time * 3 + i) * 1

      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.fillStyle = `${color}${Math.round(40 + Math.sin(time + i) * 20).toString(16).padStart(2, "0")}`
      ctx.fill()
    }
  }, [displayScore, score])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let frame: number
    const animate = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const size = 160
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const cx = size / 2
      const cy = size / 2
      const radius = 65
      const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"
      const time = Date.now() / 1000

      ctx.clearRect(0, 0, size, size)

      // Background circle
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(13, 148, 136, 0.1)"
      ctx.lineWidth = 8
      ctx.lineCap = "round"
      ctx.stroke()

      // Progress arc
      const progress = displayScore / 100
      ctx.beginPath()
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
      ctx.strokeStyle = color
      ctx.lineWidth = 8
      ctx.lineCap = "round"
      ctx.stroke()

      // Glow effect
      ctx.save()
      ctx.shadowColor = color
      ctx.shadowBlur = 15
      ctx.beginPath()
      ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
      ctx.strokeStyle = color
      ctx.lineWidth = 4
      ctx.lineCap = "round"
      ctx.stroke()
      ctx.restore()

      // Floating particles
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time * 0.3
        const dist = radius + 12 + Math.sin(time * 2 + i) * 3
        const px = cx + Math.cos(angle) * dist
        const py = cy + Math.sin(angle) * dist
        const s = 2 + Math.sin(time * 3 + i) * 1

        ctx.beginPath()
        ctx.arc(px, py, s, 0, Math.PI * 2)
        ctx.fillStyle = `${color}${Math.round(40 + Math.sin(time + i) * 20).toString(16).padStart(2, "0")}`
        ctx.fill()
      }

      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [displayScore, score])

  const color = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500"

  return (
    <div className="relative">
      <canvas ref={canvasRef} className="h-40 w-40" style={{ width: 160, height: 160 }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-4xl font-bold", color)}>{displayScore}</span>
        <span className="text-xs text-muted-foreground">de 100</span>
      </div>
    </div>
  )
}

export function PracticeHealthScore({ score, trend, factors, message }: HealthScoreProps) {
  const trendIcon = trend === "up" ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : trend === "down" ? <TrendingDown className="h-4 w-4 text-red-500" /> : <Minus className="h-4 w-4 text-muted-foreground" />
  const trendLabel = trend === "up" ? "Subindo" : trend === "down" ? "Caindo" : "Estável"

  return (
    <Card className="overflow-hidden border-teal-500/20 bg-gradient-to-br from-teal-500/5 via-background to-cyan-500/5">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
            <Heart className="h-4 w-4 text-teal-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Saúde da Prática</h3>
            <div className="flex items-center gap-1.5">
              {trendIcon}
              <span className="text-xs text-muted-foreground">{trendLabel}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <AnimatedScore score={score} />

          <div className="flex-1 space-y-3">
            {factors.map((factor) => (
              <div key={factor.label}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={factor.color}>{factor.icon}</span>
                    <span className="text-xs font-medium">{factor.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{factor.value}/{factor.max}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", factor.color.replace("text-", "bg-"))}
                    style={{ width: `${(factor.value / factor.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-teal-500/5 p-3">
          <Sparkles className="h-4 w-4 text-teal-500 shrink-0" />
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}
