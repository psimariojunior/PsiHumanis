"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Calendar, BookOpen, ClipboardList, ListTodo, FileText,
  ChevronRight, ChevronLeft, X, PartyPopper, Heart, Sparkles, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

const TOUR_KEY = "psihumanis-patient-tour"
const TOUR_VERSION = "v2"

interface TourStep {
  icon: React.ElementType
  title: string
  description: string
  color: string
  illustration: string
  tip?: string
}

const steps: TourStep[] = [
  {
    icon: Heart,
    title: "Seu Espaço Seguro",
    description: "Bem-vindo(a)! Este é o seu cantinho seguro. Vamos te mostrar como funciona tudo.",
    color: "from-teal-500 to-emerald-500",
    illustration: "💚",
  },
  {
    icon: Calendar,
    title: "Sua Agenda",
    description: "Veja todas as suas consultas em um só lugar. Você pode até cancelar ou remarcar pelo app.",
    color: "from-blue-500 to-indigo-500",
    illustration: "📅",
    tip: "Suas consultas aparecem aqui automaticamente quando o psicólogo agenda.",
  },
  {
    icon: BookOpen,
    title: "Diário de Emoções",
    description: "Registre como se sente a cada dia. Seu psicólogo acompanha sua evolução junto com você.",
    color: "from-violet-500 to-purple-500",
    illustration: "📝",
    tip: "Quanto mais registros, mais o psicólogo entende seu progresso!",
  },
  {
    icon: ClipboardList,
    title: "Questionários",
    description: "Seu psicólogo pode enviar questionários para entender melhor você. Responda no seu ritmo.",
    color: "from-orange-500 to-amber-500",
    illustration: "✅",
  },
  {
    icon: ListTodo,
    title: "Tarefas Terapêuticas",
    description: "Atividades e exercícios designados pelo seu terapeuta. Acompanhe seu progresso aqui.",
    color: "from-rose-500 to-pink-500",
    illustration: "📋",
    tip: "Complete as tarefas para acelerar seu processo terapêutico.",
  },
  {
    icon: FileText,
    title: "Seus Registros",
    description: "Laudos, atestados e documentos importantes ficam guardados aqui. Sempre acessível.",
    color: "from-emerald-500 to-teal-500",
    illustration: "📁",
  },
  {
    icon: PartyPopper,
    title: "Tudo Pronto!",
    description: "Você conhece tudo que precisa! Acesse sua agenda e comece sua jornada de cuidado.",
    color: "from-teal-500 to-cyan-500",
    illustration: "🎉",
  },
]

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed("")
    setDone(false)
    let i = 0
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1))
          i++
        } else {
          setDone(true)
          clearInterval(interval)
        }
      }, 18)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [text, delay])

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-0.5 h-4 bg-teal-500 ml-0.5 animate-pulse" />}
    </span>
  )
}

function ConfettiParticle({ delay, x }: { delay: number; x: number }) {
  const colors = ["bg-teal-400", "bg-blue-400", "bg-purple-400", "bg-pink-400", "bg-yellow-400", "bg-orange-400"]
  const color = colors[Math.floor(Math.random() * colors.length)]
  return (
    <div
      className={cn("absolute w-2 h-2 rounded-full animate-tour-confetti", color)}
      style={{
        left: `${x}%`,
        bottom: "50%",
        animationDelay: `${delay}s`,
        animationDuration: `${0.6 + Math.random() * 0.6}s`,
      }}
    />
  )
}

export function PatientOnboarding() {
  const [show, setShow] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [showTip, setShowTip] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(TOUR_KEY)
    if (stored === TOUR_VERSION) return
    const timer = setTimeout(() => setShow(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  function handleDismiss() {
    localStorage.setItem(TOUR_KEY, TOUR_VERSION)
    setShow(false)
  }

  function handleNext() {
    setShowTip(false)
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setAnimKey((k) => k + 1)
    } else {
      handleDismiss()
    }
  }

  function handlePrev() {
    setShowTip(false)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setAnimKey((k) => k + 1)
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!show) return
      if (e.key === "Escape") handleDismiss()
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext()
      if (e.key === "ArrowLeft") handlePrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [show, currentStep])

  if (!show) return null

  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-tour-slide" key={animKey}>
        {/* Header with illustration */}
        <div className={cn("relative h-52 bg-gradient-to-br flex items-center justify-center overflow-hidden", step.color)}>
          <div className="absolute inset-0 bg-noise opacity-5" />

          {/* Floating particles */}
          <div className="absolute top-6 left-10 w-3 h-3 bg-white/20 rounded-full animate-float" />
          <div className="absolute top-14 right-14 w-2 h-2 bg-white/30 rounded-full animate-float-delayed" />
          <div className="absolute bottom-12 left-20 w-4 h-4 bg-white/15 rounded-full animate-float" />

          {/* Progress dots */}
          <div className="absolute top-4 left-4 right-4 flex justify-between">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i <= currentStep ? "bg-white w-5" : "bg-white/30 w-2"
                )}
              />
            ))}
          </div>

          {/* Close */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 z-10"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Main illustration */}
          <div className="relative animate-tour-pop" key={`ill-${animKey}`}>
            {isLast ? (
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                  <span className="text-5xl">{step.illustration}</span>
                </div>
                {Array.from({ length: 10 }).map((_, i) => (
                  <ConfettiParticle key={i} delay={i * 0.1} x={15 + Math.random() * 70} />
                ))}
              </div>
            ) : (
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl animate-tour-glow">
                  <span className="text-5xl">{step.illustration}</span>
                </div>
                <div className="absolute -inset-2 rounded-[28px] border-2 border-dashed border-white/20 animate-spin-slow" />
              </div>
            )}
          </div>

          {/* Step label */}
          <div className="absolute bottom-4 left-4">
            <span className="text-white/80 text-xs font-medium">
              {isFirst ? "Vamos lá!" : `Passo ${currentStep} de ${steps.length - 1}`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-md", step.color)}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <TypewriterText text={step.description} key={`tw-${animKey}`} />
            </p>
          </div>

          {/* Tip */}
          {step.tip && !showTip && (
            <button
              onClick={() => setShowTip(true)}
              className="w-full text-left p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-sm text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 shrink-0" />
                <span className="font-medium">Dica</span>
                <ChevronRight className="h-3 w-3 ml-auto" />
              </span>
            </button>
          )}
          {step.tip && showTip && (
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-sm text-teal-700 dark:text-teal-300 animate-fade-in">
              <span className="flex items-start gap-2">
                <Zap className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{step.tip}</span>
              </span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-1">
            {!isFirst && (
              <Button variant="outline" onClick={handlePrev} className="flex-1 h-10">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn(
                "flex-1 h-10 text-white font-semibold shadow-lg transition-all",
                isFirst || isLast
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-teal-500/25 hover:shadow-teal-500/40"
                  : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-teal-500/25 hover:shadow-teal-500/40"
              )}
            >
              {isFirst ? (
                <>
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Vamos lá!
                </>
              ) : isLast ? (
                <>
                  <PartyPopper className="h-4 w-4 mr-1.5" />
                  Começar!
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            Pular introdução
          </button>
        </div>
      </div>
    </div>
  )
}
