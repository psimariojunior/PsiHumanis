"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  X, ChevronRight, Sparkles, UserPlus, Calendar, Video,
  CreditCard, FileText, Settings, CheckCircle2, Users,
  Stethoscope, Brain, Zap, PartyPopper
} from "lucide-react"
import { cn } from "@/lib/utils"

const TOUR_KEY = "psihumanis_guided_tour"
const TOUR_VERSION = "v3"

interface TourStep {
  id: string
  title: string
  description: string
  highlight: string
  icon: typeof Sparkles
  href: string
  illustration: string
  color: string
  tip?: string
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo, Doutor(a)!",
    description: "Vamos mostrando como o PsiHumanis funciona. Cada passo é rápido e você pode experimentar na hora!",
    highlight: "",
    icon: Sparkles,
    href: "",
    illustration: "🧠",
    color: "from-teal-500 to-emerald-500",
  },
  {
    id: "dashboard",
    title: "Seu Painel Completo",
    description: "Consultas de hoje, receita do mês, pacientes ativos e alertas de crise — tudo em tempo real.",
    highlight: "[data-tour='dashboard-stats']",
    icon: CheckCircle2,
    href: "/dashboard",
    illustration: "📊",
    color: "from-blue-500 to-indigo-500",
    tip: "Os cards acima mudam conforme você usa a plataforma!",
  },
  {
    id: "patients",
    title: "Cadastre seus Pacientes",
    description: "Adicione pacientes com dados completos. Eles recebem um link para acessar o portal deles.",
    highlight: "",
    icon: UserPlus,
    href: "/pacientes/novo",
    illustration: "👥",
    color: "from-violet-500 to-purple-500",
    tip: "Cada paciente ganha acesso ao portal com diário, tarefas e agenda.",
  },
  {
    id: "schedule",
    title: "Agende Consultas",
    description: "Use a agenda para gerenciar seus horários. Pacientes também podem agendar pelo portal público.",
    highlight: "",
    icon: Calendar,
    href: "/agenda",
    illustration: "📅",
    color: "from-orange-500 to-amber-500",
    tip: "Suporte para consultas recorrentes semanais e quinzenais.",
  },
  {
    id: "session",
    title: "Modo Sessão",
    description: "Videochamada + prontuário lado a lado. Auto-save a cada 30 segundos.",
    highlight: "",
    icon: Video,
    href: "/sala-virtual",
    illustration: "🎥",
    color: "from-rose-500 to-pink-500",
    tip: "Funciona em qualquer dispositivo — celular, tablet ou computador.",
  },
  {
    id: "records",
    title: "Prontuários Digitais",
    description: "Registre anotações clínicas durante a sessão. Tudo salvo com timestamp e conformidade CFP.",
    highlight: "",
    icon: FileText,
    href: "/prontuarios/novo",
    illustration: "📋",
    color: "from-emerald-500 to-teal-500",
    tip: "Prontuários devem ser mantidos por no mínimo 5 anos (CFP).",
  },
  {
    id: "payments",
    title: "Receba Pagamentos",
    description: "Conecte sua conta Stripe para receber via cartão, PIX ou boleto. Dinheiro vai direto na sua conta.",
    highlight: "",
    icon: CreditCard,
    href: "/configuracoes",
    illustration: "💰",
    color: "from-yellow-500 to-orange-500",
    tip: "Taxa de plataforma: ZERO. Você só paga a assinatura.",
  },
  {
    id: "done",
    title: "Tudo Pronto!",
    description: "Você está pronto para transformar seu consultório. Comece cadastrando seu primeiro paciente!",
    highlight: "",
    icon: PartyPopper,
    href: "/pacientes/novo",
    illustration: "🎉",
    color: "from-teal-500 to-cyan-500",
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
        bottom: "40%",
        animationDelay: `${delay}s`,
        animationDuration: `${0.6 + Math.random() * 0.6}s`,
      }}
    />
  )
}

export function GuidedTour() {
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [showTip, setShowTip] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(TOUR_KEY)
    if (stored === TOUR_VERSION) {
      setCompleted(true)
      return
    }
    const timer = setTimeout(() => setActive(true), 1500)
    return () => clearTimeout(timer)
  }, [])

  const step = tourSteps[currentStep]
  const progress = ((currentStep + 1) / tourSteps.length) * 100
  const isLast = currentStep === tourSteps.length - 1
  const isWelcome = currentStep === 0

  const handleNext = useCallback(() => {
    setShowTip(false)
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((s) => s + 1)
      setAnimKey((k) => k + 1)
    } else {
      localStorage.setItem(TOUR_KEY, TOUR_VERSION)
      setCompleted(true)
      setActive(false)
    }
  }, [currentStep])

  const handlePrev = useCallback(() => {
    setShowTip(false)
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
      setAnimKey((k) => k + 1)
    }
  }, [currentStep])

  const handleSkip = useCallback(() => {
    localStorage.setItem(TOUR_KEY, TOUR_VERSION)
    setCompleted(true)
    setActive(false)
  }, [])

  const handleGo = useCallback(() => {
    if (step.href) router.push(step.href)
  }, [step.href, router])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!active) return
      if (e.key === "Escape") handleSkip()
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext()
      if (e.key === "ArrowLeft") handlePrev()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [active, handleNext, handlePrev, handleSkip])

  if (completed || !active) return null

  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />

      {/* Spotlight ring animation */}
      {step.highlight && (
        <div className="absolute z-20 animate-tour-ring pointer-events-none"
          style={{
            width: 200, height: 200,
            borderRadius: "50%",
            border: "3px solid rgba(13,148,136,0.5)",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}

      <div className="relative z-10 w-full max-w-lg mx-4" key={animKey}>
        <div className="bg-background rounded-3xl shadow-2xl border overflow-hidden animate-tour-slide">
          {/* Top gradient header with illustration */}
          <div className={cn("relative h-44 bg-gradient-to-br flex items-center justify-center overflow-hidden", step.color)}>
            <div className="absolute inset-0 bg-noise opacity-5" />

            {/* Floating particles */}
            <div className="absolute top-4 left-8 w-3 h-3 bg-white/20 rounded-full animate-float" />
            <div className="absolute top-12 right-12 w-2 h-2 bg-white/30 rounded-full animate-float-delayed" />
            <div className="absolute bottom-8 left-16 w-4 h-4 bg-white/15 rounded-full animate-float" />

            {/* Progress dots */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              {tourSteps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i <= currentStep ? "bg-white w-6" : "bg-white/30 w-2"
                  )}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10 z-10"
              aria-label="Fechar tour"
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
                  {/* Confetti */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ConfettiParticle key={i} delay={i * 0.08} x={20 + Math.random() * 60} />
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

            {/* Step counter */}
            <div className="absolute bottom-4 left-4">
              <span className="text-white/80 text-xs font-medium">
                {isWelcome ? "Vamos lá!" : `Passo ${currentStep} de ${tourSteps.length - 1}`}
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
                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <TypewriterText text={step.description} key={`tw-${animKey}`} />
              </p>
            </div>

            {/* Tip card */}
            {step.tip && !showTip && (
              <button
                onClick={() => setShowTip(true)}
                className="w-full text-left p-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-sm text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 shrink-0" />
                  <span className="font-medium">Dica rápida</span>
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

            {/* Navigate to page button */}
            {step.href && (
              <button
                onClick={handleGo}
                className="w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-muted transition-all text-sm font-medium text-primary flex items-center gap-2 group"
              >
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
                <span>Ir para {step.title}</span>
              </button>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center gap-2 pt-1">
              {!isWelcome && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="flex-1 h-10"
                >
                  Anterior
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className={cn(
                  "flex-1 h-10 bg-gradient-to-r text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all",
                  isWelcome || isLast
                    ? "from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                    : "from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                )}
              >
                {isWelcome ? (
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
              onClick={handleSkip}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Pular tour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
