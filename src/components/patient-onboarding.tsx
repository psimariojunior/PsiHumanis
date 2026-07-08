"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Calendar, BookOpen, ClipboardList, ListTodo, FileText,
  ChevronRight, ChevronLeft, X, PartyPopper, Heart, Sparkles, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

const TOUR_KEY = "psihumanis-patient-tour"
const TOUR_VERSION = "v3"

interface TourStep {
  icon: React.ElementType
  title: string
  description: string
  color: string
  gradient: string
  illustration: string
  tip?: string
  action?: { label: string; href: string }
  demo?: "mood" | "agenda" | "diary" | "tasks" | "docs"
}

const steps: TourStep[] = [
  {
    icon: Heart,
    title: "Bem-vindo(a)!",
    description: "Este é o seu espaço seguro. Tudo sobre seu tratamento está aqui.",
    color: "from-teal-500 to-emerald-500",
    gradient: "bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-200 dark:border-teal-800",
    illustration: "💚",
    demo: "mood",
  },
  {
    icon: Calendar,
    title: "Agenda",
    description: "Veja suas consultas e remarque se precisar.",
    color: "from-blue-500 to-indigo-500",
    gradient: "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200 dark:border-blue-800",
    illustration: "📅",
    tip: "O psicólogo agenda automaticamente para você.",
    action: { label: "Ver agenda", href: "/paciente/agenda" },
    demo: "agenda",
  },
  {
    icon: BookOpen,
    title: "Diário",
    description: "Registre como se sente. Acompanhe sua evolução.",
    color: "from-violet-500 to-purple-500",
    gradient: "bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-200 dark:border-violet-800",
    illustration: "📝",
    tip: "Toque nos emojis para testar agora!",
    demo: "diary",
  },
  {
    icon: ClipboardList,
    title: "Questionários",
    description: "PHQ-9, GAD-7 e outros. Responda no seu ritmo.",
    color: "from-orange-500 to-amber-500",
    gradient: "bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800",
    illustration: "✅",
  },
  {
    icon: ListTodo,
    title: "Tarefas",
    description: "Atividades enviadas pelo seu terapeuta para você em casa.",
    color: "from-rose-500 to-pink-500",
    gradient: "bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-200 dark:border-rose-800",
    illustration: "📋",
    action: { label: "Ver tarefas", href: "/paciente/tarefas" },
  },
  {
    icon: PartyPopper,
    title: "Tudo pronto!",
    description: "Explore à vontade. Estamos aqui para ajudar.",
    color: "from-teal-500 to-cyan-500",
    gradient: "bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-teal-200 dark:border-teal-800",
    illustration: "🎉",
  },
]

function MoodDemo({ onSelect }: { onSelect: (v: number) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const emojis = [
    { v: 1, e: "😔", l: "Baixo" },
    { v: 2, e: "😟", l: "Ruim" },
    { v: 3, e: "😐", l: "Ok" },
    { v: 4, e: "🙂", l: "Bom" },
    { v: 5, e: "😊", l: "Ótimo" },
  ]
  return (
    <div className="flex justify-center gap-1.5">
      {emojis.map((m) => (
        <button
          key={m.v}
          onClick={() => { setSelected(m.v); onSelect(m.v) }}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-xl p-2 transition-all text-lg",
            selected === m.v
              ? "bg-teal-100 dark:bg-teal-900/50 scale-110 shadow-md"
              : "bg-muted/50 hover:bg-muted active:scale-95"
          )}
        >
          <span>{m.e}</span>
          <span className="text-[9px] text-muted-foreground">{m.l}</span>
        </button>
      ))}
    </div>
  )
}

function AgendaDemo() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const fmt = tomorrow.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
  return (
    <div className="space-y-1.5">
      {[
        { time: "14:00", status: "Confirmada", color: "bg-emerald-500" },
        { time: "14:30", status: "Em andamento", color: "bg-blue-500" },
        { time: "15:00", status: "Aguardando", color: "bg-amber-500" },
      ].map((a, i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-background/60 px-2.5 py-1.5 text-xs">
          <span className="font-mono font-medium text-foreground">{a.time}</span>
          <span className={cn("h-1.5 w-1.5 rounded-full", a.color)} />
          <span className="text-muted-foreground">{a.status}</span>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground text-center pt-0.5">{fmt}</p>
    </div>
  )
}

function DiaryDemo() {
  const [selected, setSelected] = useState<number | null>(null)
  const moods = [
    { v: 1, e: "😔" },
    { v: 2, e: "😟" },
    { v: 3, e: "😐" },
    { v: 4, e: "🙂" },
    { v: 5, e: "😊" },
  ]
  return (
    <div className="flex justify-center gap-1.5">
      {moods.map((m) => (
        <button
          key={m.v}
          onClick={() => setSelected(m.v)}
          className={cn(
            "text-xl p-1.5 rounded-lg transition-all",
            selected === m.v
              ? "bg-violet-100 dark:bg-violet-900/50 scale-125"
              : "bg-muted/30 hover:bg-muted active:scale-110"
          )}
        >
          {m.e}
        </button>
      ))}
    </div>
  )
}

export function PatientOnboarding() {
  const [show, setShow] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [showTip, setShowTip] = useState(false)
  const [demoAction, setDemoAction] = useState<string | null>(null)
  const touchStartX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem(TOUR_KEY)
    if (stored === TOUR_VERSION) return
    const timer = setTimeout(() => setShow(true), 800)
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
    setDemoAction(null)
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setAnimKey((k) => k + 1)
    } else {
      handleDismiss()
    }
  }

  function handlePrev() {
    setShowTip(false)
    setDemoAction(null)
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setAnimKey((k) => k + 1)
    }
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 60) {
      if (dx < 0 && !isLast) handleNext()
      else if (dx > 0 && !isFirst) handlePrev()
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
    <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl w-full sm:max-w-sm overflow-hidden animate-tour-slide",
          "max-h-[85vh] overflow-y-auto"
        )}
        key={animKey}
      >
        {/* Compact header bar */}
        <div className={cn("relative h-28 sm:h-36 bg-gradient-to-br flex items-center justify-center overflow-hidden", step.color)}>
          <div className="absolute inset-0 bg-noise opacity-5" />

          {/* Progress */}
          <div className="absolute top-3 left-3 right-3 flex items-center gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === currentStep ? "bg-white flex-1" : i < currentStep ? "bg-white/60 flex-1" : "bg-white/25 flex-0.5"
                )}
              />
            ))}
          </div>

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-white/60 hover:text-white p-1.5 rounded-full hover:bg-white/10 z-10"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Illustration */}
          <div className="relative animate-tour-pop" key={`ill-${animKey}`}>
            <div className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl",
              isLast && "animate-tour-glow"
            )}>
              <span className="text-3xl sm:text-4xl">{step.illustration}</span>
            </div>
            {isLast && (
              <div className="absolute -inset-1 rounded-[24px] border-2 border-dashed border-white/30 animate-spin-slow" />
            )}
          </div>

          {/* Step label */}
          <span className="absolute bottom-2 left-3 text-white/70 text-[10px] font-medium">
            {currentStep + 1}/{steps.length}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title + description */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className={cn("w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm", step.color)}>
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed pl-9">
              {step.description}
            </p>
          </div>

          {/* Interactive demo */}
          {step.demo === "mood" && (
            <div className="pl-9">
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Toque para testar:</p>
              <MoodDemo onSelect={(v) => setDemoAction(`Humor: ${v}/5`)} />
              {demoAction && (
                <p className="text-[10px] text-teal-600 dark:text-teal-400 text-center mt-1 animate-fade-in">
                  ✓ {demoAction} — assim funciona!
                </p>
              )}
            </div>
          )}

          {step.demo === "agenda" && (
            <div className="pl-9">
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Sua agenda ficará assim:</p>
              <AgendaDemo />
            </div>
          )}

          {step.demo === "diary" && (
            <div className="pl-9">
              <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Registrar emoções:</p>
              <DiaryDemo />
            </div>
          )}

          {/* Tip */}
          {step.tip && (
            <div className={cn(
              "pl-9 p-2.5 rounded-xl border text-xs",
              step.gradient
            )}>
              <span className="flex items-start gap-1.5">
                <Zap className="h-3 w-3 shrink-0 mt-0.5 text-teal-500" />
                <span className="text-muted-foreground">{step.tip}</span>
              </span>
            </div>
          )}

          {/* Action link */}
          {step.action && (
            <div className="pl-9">
              <a
                href={step.action.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline"
                onClick={handleDismiss}
              >
                {step.action.label}
                <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2 pt-1">
            {!isFirst && (
              <Button variant="outline" onClick={handlePrev} className="h-9 text-xs">
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Voltar
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn(
                "flex-1 h-9 text-white font-semibold text-xs shadow-md transition-all",
                isFirst || isLast
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                  : "bg-teal-600 hover:bg-teal-700"
              )}
            >
              {isFirst ? (
                <><Sparkles className="h-3.5 w-3.5 mr-1" />Vamos lá!</>
              ) : isLast ? (
                <><PartyPopper className="h-3.5 w-3.5 mr-1" />Começar!</>
              ) : (
                <>Próximo<ChevronRight className="h-3.5 w-3.5 ml-1" /></>
              )}
            </Button>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors py-0.5"
          >
            Pular introdução
          </button>
        </div>
      </div>
    </div>
  )
}
