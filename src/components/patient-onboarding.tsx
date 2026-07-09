"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Calendar, BookOpen, ClipboardList, ListTodo, FileText,
  ChevronRight, ChevronLeft, X, PartyPopper, Heart, Sparkles, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

const TOUR_KEY = "psihumanis-patient-tour"
const TOUR_VERSION = "v4"

interface TourStep {
  icon: React.ElementType
  title: string
  description: string
  color: string
  illustration: string
  tip?: string
  action?: { label: string; href: string }
  demo?: "mood" | "agenda" | "diary"
}

const steps: TourStep[] = [
  {
    icon: Heart,
    title: "Bem-vindo(a)!",
    description: "Este é o seu espaço seguro. Tudo sobre seu tratamento está aqui.",
    color: "from-teal-500 to-emerald-500",
    illustration: "💚",
    demo: "mood",
  },
  {
    icon: Calendar,
    title: "Agenda",
    description: "Veja suas consultas e remarque se precisar.",
    color: "from-blue-500 to-indigo-500",
    illustration: "📅",
    tip: "O psicólogo agenda automaticamente.",
    action: { label: "Ver agenda", href: "/paciente/agenda" },
    demo: "agenda",
  },
  {
    icon: BookOpen,
    title: "Diário",
    description: "Registre como se sente. Acompanhe sua evolução.",
    color: "from-violet-500 to-purple-500",
    illustration: "📝",
    demo: "diary",
  },
  {
    icon: ClipboardList,
    title: "Questionários",
    description: "PHQ-9, GAD-7 e outros. Responda no seu ritmo.",
    color: "from-orange-500 to-amber-500",
    illustration: "✅",
  },
  {
    icon: ListTodo,
    title: "Tarefas",
    description: "Atividades enviadas pelo seu terapeuta.",
    color: "from-rose-500 to-pink-500",
    illustration: "📋",
    action: { label: "Ver tarefas", href: "/paciente/tarefas" },
  },
  {
    icon: PartyPopper,
    title: "Tudo pronto!",
    description: "Explore à vontade. Estamos aqui para ajudar.",
    color: "from-teal-500 to-cyan-500",
    illustration: "🎉",
  },
]

function MoodDemo({ onSelect }: { onSelect: (v: number) => void }) {
  const [sel, setSel] = useState<number | null>(null)
  return (
    <div className="flex justify-center gap-1">
      {[{ v: 1, e: "😔" }, { v: 2, e: "😟" }, { v: 3, e: "😐" }, { v: 4, e: "🙂" }, { v: 5, e: "😊" }].map((m) => (
        <button
          key={m.v}
          onClick={() => { setSel(m.v); onSelect(m.v) }}
          className={cn(
            "text-xl p-1.5 rounded-lg transition-all",
            sel === m.v ? "bg-teal-100 dark:bg-teal-900/50 scale-110" : "bg-muted/40 hover:bg-muted active:scale-95"
          )}
        >
          {m.e}
        </button>
      ))}
    </div>
  )
}

function AgendaDemo() {
  return (
    <div className="flex gap-1">
      {[
        { t: "14:00", c: "bg-emerald-500" },
        { t: "14:30", c: "bg-blue-500" },
        { t: "15:00", c: "bg-amber-500" },
      ].map((a, i) => (
        <div key={i} className="flex items-center gap-1 rounded-md bg-background/60 px-1.5 py-0.5 text-[10px]">
          <span className={cn("w-1 h-1 rounded-full", a.c)} />
          <span className="text-muted-foreground">{a.t}</span>
        </div>
      ))}
    </div>
  )
}

function DiaryDemo() {
  const [sel, setSel] = useState<number | null>(null)
  return (
    <div className="flex justify-center gap-1">
      {[{ v: 1, e: "😔" }, { v: 2, e: "😟" }, { v: 3, e: "😐" }, { v: 4, e: "🙂" }, { v: 5, e: "😊" }].map((m) => (
        <button
          key={m.v}
          onClick={() => setSel(m.v)}
          className={cn(
            "text-base p-1 rounded-md transition-all",
            sel === m.v ? "bg-violet-100 dark:bg-violet-900/50 scale-110" : "bg-muted/30 hover:bg-muted active:scale-95"
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
  const [demoAction, setDemoAction] = useState<string | null>(null)
  const touchStartX = useRef(0)

  useEffect(() => {
    const stored = localStorage.getItem(TOUR_KEY)
    if (stored === TOUR_VERSION) return
    const timer = setTimeout(() => setShow(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const step = steps[currentStep]
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  function dismiss() {
    localStorage.setItem(TOUR_KEY, TOUR_VERSION)
    setShow(false)
  }
  function next() {
    setDemoAction(null)
    if (currentStep < steps.length - 1) { setCurrentStep(currentStep + 1); setAnimKey((k) => k + 1) }
    else dismiss()
  }
  function prev() {
    setDemoAction(null)
    if (currentStep > 0) { setCurrentStep(currentStep - 1); setAnimKey((k) => k + 1) }
  }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 60) { if (dx < 0 && !isLast) next(); else if (dx > 0 && !isFirst) prev() }
  }

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!show) return
      if (e.key === "Escape") dismiss()
      if (e.key === "ArrowRight" || e.key === "Enter") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [show, currentStep])

  if (!show) return null
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        key={animKey}
        className={cn(
          "bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[340px] overflow-hidden animate-tour-slide",
          "flex flex-col"
        )}
        style={{ maxHeight: "calc(100dvh - 32px)" }}
      >
        {/* Header — ultra compact */}
        <div className={cn("relative h-20 bg-gradient-to-br flex items-center justify-center overflow-hidden shrink-0", step.color)}>
          <div className="absolute inset-0 bg-noise opacity-5" />

          {/* Progress */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex gap-1">
            {steps.map((_, i) => (
              <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i <= currentStep ? "bg-white flex-1" : "bg-white/25 flex-0.5")} />
            ))}
          </div>

          <button onClick={dismiss} className="absolute top-2 right-2 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 z-10" aria-label="Fechar">
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="relative animate-tour-pop" key={`ill-${animKey}`}>
            <div className={cn("w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl", isLast && "animate-tour-glow")}>
              <span className="text-2xl">{step.illustration}</span>
            </div>
            {isLast && <div className="absolute -inset-1 rounded-[18px] border-2 border-dashed border-white/30 animate-spin-slow" />}
          </div>

          <span className="absolute bottom-1.5 left-2.5 text-white/60 text-[9px] font-medium">{currentStep + 1}/{steps.length}</span>
        </div>

        {/* Content — scrollable but compact */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          {/* Title + description */}
          <div className="flex items-start gap-2">
            <div className={cn("w-6 h-6 rounded-md bg-gradient-to-br flex items-center justify-center shadow-sm shrink-0 mt-0.5", step.color)}>
              <Icon className="h-3 w-3 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-snug mt-0.5">{step.description}</p>
            </div>
          </div>

          {/* Demo */}
          {step.demo === "mood" && (
            <div>
              <p className="text-[9px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">Toque para testar:</p>
              <MoodDemo onSelect={(v) => setDemoAction(`${v}/5`)} />
              {demoAction && <p className="text-[9px] text-teal-600 dark:text-teal-400 text-center mt-0.5 animate-fade-in">✓ Registrado {demoAction}!</p>}
            </div>
          )}
          {step.demo === "agenda" && (
            <div>
              <p className="text-[9px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">Sua agenda:</p>
              <AgendaDemo />
            </div>
          )}
          {step.demo === "diary" && (
            <div>
              <p className="text-[9px] text-muted-foreground mb-1 font-medium uppercase tracking-wider">Registrar emoções:</p>
              <DiaryDemo />
            </div>
          )}

          {/* Tip */}
          {step.tip && (
            <div className="flex items-start gap-1 p-2 rounded-lg bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
              <Zap className="h-3 w-3 shrink-0 mt-0.5 text-teal-500" />
              <span className="text-[11px] text-muted-foreground leading-snug">{step.tip}</span>
            </div>
          )}

          {/* Action */}
          {step.action && (
            <a href={step.action.href} className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-600 dark:text-teal-400 hover:underline" onClick={dismiss}>
              {step.action.label}<ChevronRight className="h-3 w-3" />
            </a>
          )}
        </div>

        {/* Footer — always visible, no scroll */}
        <div className="shrink-0 border-t border-border p-3 space-y-1.5">
          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="outline" onClick={prev} className="h-8 text-xs px-3">
                <ChevronLeft className="h-3 w-3 mr-0.5" />Voltar
              </Button>
            )}
            <Button
              onClick={next}
              className={cn(
                "flex-1 h-8 text-white font-semibold text-xs shadow-md",
                isFirst || isLast
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                  : "bg-teal-600 hover:bg-teal-700"
              )}
            >
              {isFirst ? <><Sparkles className="h-3 w-3 mr-1" />Vamos lá!</>
                : isLast ? <><PartyPopper className="h-3 w-3 mr-1" />Começar!</>
                : <>Próximo<ChevronRight className="h-3 w-3 ml-1" /></>}
            </Button>
          </div>
          <button onClick={dismiss} className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground transition-colors">
            Pular introdução
          </button>
        </div>
      </div>
    </div>
  )
}
