"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, Wind, Waves, TreePine, CloudRain, Moon } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"
import { createRain, createOcean, createForest, createWind, createNight, type SoundController, type SoundFactory } from "@/lib/ambient-sounds"

type BreathingPattern = {
  name: string
  nameEn: string
  description: string
  inhale: number
  holdIn: number
  exhale: number
  holdOut: number
  color: string
  gradient: string
}

type AmbientSoundDef = {
  id: string
  name: string
  nameEn: string
  icon: React.ReactNode
  factory: SoundFactory
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: "Respiração 4-7-8",
    nameEn: "4-7-8 Breathing",
    description: "Calma o sistema nervoso e ajuda a dormir",
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    color: "from-teal-400 to-cyan-400",
    gradient: "bg-gradient-to-br from-teal-500/20 to-cyan-500/20",
  },
  {
    name: "Respiração Caixa",
    nameEn: "Box Breathing",
    description: "Usado por Navy SEALs para foco e controle",
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    color: "from-blue-400 to-indigo-400",
    gradient: "bg-gradient-to-br from-blue-500/20 to-indigo-500/20",
  },
  {
    name: "Respiração 4-4",
    nameEn: "4-4 Breathing",
    description: "Simples e eficaz para ansiedade",
    inhale: 4,
    holdIn: 0,
    exhale: 4,
    holdOut: 0,
    color: "from-emerald-400 to-teal-400",
    gradient: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
  },
  {
    name: "Respiração Coerente",
    nameEn: "Coherent Breathing",
    description: "5-5 para equilíbrio do sistema nervoso",
    inhale: 5,
    holdIn: 0,
    exhale: 5,
    holdOut: 0,
    color: "from-violet-400 to-purple-400",
    gradient: "bg-gradient-to-br from-violet-500/20 to-purple-500/20",
  },
  {
    name: "Respiração Profunda",
    nameEn: "Deep Breathing",
    description: "6-6 para relaxamento profundo",
    inhale: 6,
    holdIn: 0,
    exhale: 6,
    holdOut: 0,
    color: "from-rose-400 to-pink-400",
    gradient: "bg-gradient-to-br from-rose-500/20 to-pink-500/20",
  },
]

const ambientSounds: AmbientSoundDef[] = [
  { id: "rain", name: "Chuva", nameEn: "Rain", icon: <CloudRain className="h-5 w-5" />, factory: createRain },
  { id: "ocean", name: "Oceano", nameEn: "Ocean", icon: <Waves className="h-5 w-5" />, factory: createOcean },
  { id: "forest", name: "Floresta", nameEn: "Forest", icon: <TreePine className="h-5 w-5" />, factory: createForest },
  { id: "wind", name: "Vento", nameEn: "Wind", icon: <Wind className="h-5 w-5" />, factory: createWind },
  { id: "night", name: "Noite", nameEn: "Night", icon: <Moon className="h-5 w-5" />, factory: createNight },
]

export default function RelaxamentoPage() {
  const { vibrate } = useHapticFeedback()
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(breathingPatterns[0])
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "holdIn" | "exhale" | "holdOut">("inhale")
  const [countdown, setCountdown] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [selectedSound, setSelectedSound] = useState<AmbientSoundDef | null>(null)
  const [soundVolume, setSoundVolume] = useState(0.5)
  const [isMuted, setIsMuted] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const soundCtrlRef = useRef<SoundController | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  const totalCycleTime = selectedPattern.inhale + selectedPattern.holdIn + selectedPattern.exhale + selectedPattern.holdOut

  const drawBreathingCircle = useCallback(
    (progress: number, currentPhase: string) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      const w = rect.width
      const h = rect.height
      const cx = w / 2
      const cy = h / 2
      const maxRadius = Math.min(w, h) * 0.35

      ctx.clearRect(0, 0, w, h)

      let scale = 1
      if (currentPhase === "inhale") {
        scale = 0.5 + progress * 0.5
      } else if (currentPhase === "holdIn") {
        scale = 1
      } else if (currentPhase === "exhale") {
        scale = 1 - progress * 0.5
      } else {
        scale = 0.5
      }

      const radius = maxRadius * scale

      // Outer glow
      const glowGradient = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5)
      glowGradient.addColorStop(0, "rgba(13, 148, 136, 0.15)")
      glowGradient.addColorStop(1, "rgba(13, 148, 136, 0)")
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 1.5, 0, Math.PI * 2)
      ctx.fillStyle = glowGradient
      ctx.fill()

      // Main circle
      const mainGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
      mainGradient.addColorStop(0, "rgba(20, 184, 166, 0.6)")
      mainGradient.addColorStop(0.7, "rgba(13, 148, 136, 0.4)")
      mainGradient.addColorStop(1, "rgba(15, 118, 110, 0.2)")
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fillStyle = mainGradient
      ctx.fill()

      // Border
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(13, 148, 136, 0.5)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Inner circle
      const innerGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.3)
      innerGradient.addColorStop(0, "rgba(45, 212, 191, 0.8)")
      innerGradient.addColorStop(1, "rgba(13, 148, 136, 0.3)")
      ctx.beginPath()
      ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2)
      ctx.fillStyle = innerGradient
      ctx.fill()

      // Particles
      const time = Date.now() / 1000
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 0.5
        const dist = radius * (0.6 + Math.sin(time + i) * 0.1)
        const px = cx + Math.cos(angle) * dist
        const py = cy + Math.sin(angle) * dist
        const particleSize = 2 + Math.sin(time * 2 + i) * 1

        ctx.beginPath()
        ctx.arc(px, py, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(45, 212, 191, ${0.3 + Math.sin(time + i) * 0.2})`
        ctx.fill()
      }

      // Progress ring
      if (isActive) {
        ctx.beginPath()
        ctx.arc(cx, cy, maxRadius + 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress)
        ctx.strokeStyle = "rgba(13, 148, 136, 0.8)"
        ctx.lineWidth = 3
        ctx.lineCap = "round"
        ctx.stroke()
      }
    },
    [isActive]
  )

  useEffect(() => {
    let frame: number
    const animate = () => {
      const progress = countdown / (phase === "inhale" ? selectedPattern.inhale : phase === "holdIn" ? selectedPattern.holdIn : phase === "exhale" ? selectedPattern.exhale : selectedPattern.holdOut || 1)
      drawBreathingCircle(progress, phase)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [phase, countdown, drawBreathingCircle, selectedPattern, isActive])

  const startSound = useCallback(
    (sound: AmbientSoundDef) => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      if (soundCtrlRef.current) {
        soundCtrlRef.current.stop()
        soundCtrlRef.current = null
      }
      soundCtrlRef.current = sound.factory(audioCtxRef.current, soundVolume)
    },
    [soundVolume]
  )

  const stopSound = useCallback(() => {
    if (soundCtrlRef.current) {
      soundCtrlRef.current.stop()
      soundCtrlRef.current = null
    }
  }, [])

  const toggleSound = useCallback(
    (sound: AmbientSoundDef) => {
      if (selectedSound?.id === sound.id) {
        setSelectedSound(null)
        stopSound()
        vibrate("light")
      } else {
        setSelectedSound(sound)
        startSound(sound)
        vibrate("medium")
      }
    },
    [selectedSound, startSound, stopSound, vibrate]
  )

  const startSession = useCallback(() => {
    vibrate("heavy")
    setIsActive(true)
    setCycleCount(0)
    setTotalTime(0)
    setPhase("inhale")
    setCountdown(selectedPattern.inhale)
  }, [selectedPattern, vibrate])

  const pauseSession = useCallback(() => {
    vibrate("medium")
    setIsActive(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
  }, [vibrate])

  const resumeSession = useCallback(() => {
    vibrate("light")
    setIsActive(true)
  }, [vibrate])

  const resetSession = useCallback(() => {
    vibrate("medium")
    setIsActive(false)
    setPhase("inhale")
    setCountdown(0)
    setCycleCount(0)
    setTotalTime(0)
    if (timerRef.current) clearInterval(timerRef.current)
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
  }, [vibrate])

  useEffect(() => {
    if (!isActive) return

    timerRef.current = setInterval(() => {
      setTotalTime((t) => t + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isActive])

  useEffect(() => {
    if (!isActive || countdown <= 0) return

    phaseTimerRef.current = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1)
      } else {
        const getPhaseDuration = (p: string) =>
          p === "inhale" ? selectedPattern.inhale : p === "holdIn" ? selectedPattern.holdIn : p === "exhale" ? selectedPattern.exhale : selectedPattern.holdOut

        let nextPhase: typeof phase
        if (phase === "inhale") {
          nextPhase = selectedPattern.holdIn > 0 ? "holdIn" : "exhale"
        } else if (phase === "holdIn") {
          nextPhase = "exhale"
        } else if (phase === "exhale") {
          nextPhase = selectedPattern.holdOut > 0 ? "holdOut" : "inhale"
          if (nextPhase === "inhale") setCycleCount((c) => c + 1)
        } else {
          nextPhase = "inhale"
          setCycleCount((c) => c + 1)
        }

        setPhase(nextPhase)
        setCountdown(getPhaseDuration(nextPhase))
        vibrate("light")
      }
    }, 1000)

    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
    }
  }, [isActive, countdown, phase, selectedPattern, vibrate])

  useEffect(() => {
    if (selectedSound && !isMuted) {
      soundCtrlRef.current?.setVolume(soundVolume)
    }
  }, [soundVolume, selectedSound, isMuted])

  useEffect(() => {
    if (isMuted) {
      soundCtrlRef.current?.setVolume(0)
    } else if (selectedSound) {
      soundCtrlRef.current?.setVolume(soundVolume)
    }
  }, [isMuted, selectedSound, soundVolume])

  useEffect(() => {
    return () => {
      stopSound()
      if (timerRef.current) clearInterval(timerRef.current)
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
    }
  }, [stopSound])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const phaseLabel = (p: string) => {
    switch (p) {
      case "inhale": return "Inspire"
      case "holdIn": return "Segure"
      case "exhale": return "Expire"
      case "holdOut": return "Segure"
      default: return ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-teal-500/5">
      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/paciente">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relaxamento</h1>
            <p className="text-sm text-muted-foreground">Exercícios de respiração e sons ambiente</p>
          </div>
        </div>

        {/* Breathing Circle */}
        <Card className="mb-6 overflow-hidden border-teal-500/20">
          <CardContent className="p-6">
            <div className="relative mx-auto mb-6" style={{ width: 280, height: 280 }}>
              <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
              {isActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">{countdown}</span>
                  <span className="text-sm font-medium text-muted-foreground">{phaseLabel(phase)}</span>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Play className="h-10 w-10 text-teal-500" />
                  <span className="mt-2 text-sm text-muted-foreground">Pressione para começar</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="mb-4 flex justify-center gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{cycleCount}</p>
                <p className="text-xs text-muted-foreground">Ciclos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{formatTime(totalTime)}</p>
                <p className="text-xs text-muted-foreground">Tempo</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
              {!isActive ? (
                <Button onClick={startSession} className="h-14 w-14 rounded-full bg-teal-600 hover:bg-teal-700" size="icon">
                  <Play className="h-6 w-6" />
                </Button>
              ) : (
                <>
                  <Button onClick={pauseSession} variant="outline" className="h-12 w-12 rounded-full" size="icon">
                    <Pause className="h-5 w-5" />
                  </Button>
                  <Button onClick={resetSession} variant="outline" className="h-12 w-12 rounded-full" size="icon">
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </>
              )}
              {isActive && (
                <Button onClick={resumeSession} className="h-12 w-12 rounded-full bg-teal-600 hover:bg-teal-700" size="icon">
                  <Play className="h-5 w-5" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Breathing Patterns */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Padrões de Respiração</h2>
          <div className="grid gap-2">
            {breathingPatterns.map((pattern) => (
              <button
                key={pattern.name}
                onClick={() => {
                  if (!isActive) {
                    setSelectedPattern(pattern)
                    vibrate("light")
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  selectedPattern.name === pattern.name
                    ? "border-teal-500 bg-teal-500/10 shadow-sm"
                    : "border-border hover:border-teal-500/50 hover:bg-accent/50",
                  isActive && "opacity-50 cursor-not-allowed"
                )}
                disabled={isActive}
              >
                <div className={cn("h-10 w-10 rounded-lg bg-gradient-to-br", pattern.color, "flex items-center justify-center")}>
                  <Wind className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{pattern.name}</p>
                  <p className="text-xs text-muted-foreground">{pattern.description}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <span>{pattern.inhale}-{pattern.holdIn}-{pattern.exhale}{pattern.holdOut > 0 ? `-${pattern.holdOut}` : ""}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Ambient Sounds */}
        <div className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Sons Ambiente</h2>
          <div className="grid grid-cols-5 gap-2">
            {ambientSounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all",
                  selectedSound?.id === sound.id
                    ? "border-teal-500 bg-teal-500/10 shadow-sm"
                    : "border-border hover:border-teal-500/50 hover:bg-accent/50"
                )}
              >
                <div className={cn("transition-colors", selectedSound?.id === sound.id ? "text-teal-500" : "text-muted-foreground")}>
                  {sound.icon}
                </div>
                <span className="text-[10px] font-medium">{sound.name}</span>
              </button>
            ))}
          </div>

          {selectedSound && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border p-3">
              <button onClick={() => setIsMuted(!isMuted)} className="text-muted-foreground hover:text-foreground">
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={soundVolume * 100}
                onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
                className="flex-1 accent-teal-500"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">{Math.round(soundVolume * 100)}%</span>
            </div>
          )}
        </div>

        {/* Tips */}
        <Card className="border-teal-500/20 bg-teal-500/5">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-teal-700 dark:text-teal-300">Dicas para melhor experiência</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Use fones de ouvido para melhor imersão</li>
              <li>• Pratique pelo menos 5 minutos por dia</li>
              <li>• Escolha um lugar tranquilo e confortável</li>
              <li>• Comece com a respiração 4-4 se é sua primeira vez</li>
              <li>• Combine com sons ambiente para relaxamento profundo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
