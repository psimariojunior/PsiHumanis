"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft, Sparkles, UserPlus, Calendar, Video, CreditCard, FileText, Settings, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const TOUR_KEY = "psihumanis_guided_tour"
const TOUR_VERSION = "v2"

interface TourStep {
  id: string
  title: string
  description: string
  highlight: string
  icon: typeof Sparkles
  href: string
  position: "top" | "bottom" | "left" | "right"
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao PsiHumanis!",
    description: "Este tour rápido vai te mostrar como usar a plataforma. Leva menos de 2 minutos.",
    highlight: "",
    icon: Sparkles,
    href: "",
    position: "bottom",
  },
  {
    id: "dashboard",
    title: "Seu Dashboard",
    description: "Aqui você vê tudo em tempo real: consultas de hoje, receita, pacientes recentes e alertas de crise.",
    highlight: "[data-tour='dashboard-stats']",
    icon: CheckCircle2,
    href: "/dashboard",
    position: "bottom",
  },
  {
    id: "patients",
    title: "Cadastre seus Pacientes",
    description: "Adicione pacientes com dados completos. Eles receberão um link para acessar o portal deles.",
    highlight: "",
    icon: UserPlus,
    href: "/pacientes/novo",
    position: "right",
  },
  {
    id: "schedule",
    title: "Agende Consultas",
    description: "Use a agenda para gerenciar seus horários. Pacientes também podem agendar pelo portal público.",
    highlight: "",
    icon: Calendar,
    href: "/agenda",
    position: "right",
  },
  {
    id: "session-mode",
    title: "Modo Sessão",
    description: "Ao atender, abra o Modo Sessão: vídeo + prontuário lado a lado. Auto-save ativado.",
    highlight: "",
    icon: Video,
    href: "/sessoes/modo",
    position: "left",
  },
  {
    id: "records",
    title: "Prontuários Digitais",
    description: "Registre anotações clínicas durante a sessão. Tudo salvo com timestamp e conformidade CFP.",
    highlight: "",
    icon: FileText,
    href: "/prontuarios/novo",
    position: "left",
  },
  {
    id: "payments",
    title: "Receba Pagamentos",
    description: "Conecte sua conta Stripe para receber via cartão/boleto. Dinheiro vai direto na sua conta.",
    highlight: "",
    icon: CreditCard,
    href: "/configuracoes",
    position: "bottom",
  },
  {
    id: "done",
    title: "Tudo Pronto!",
    description: "Você está pronto para começar. Acesse as configurações para personalizar seu perfil público.",
    highlight: "",
    icon: Settings,
    href: "/configuracoes",
    position: "bottom",
  },
]

export function GuidedTour() {
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)

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

  const handleNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((s) => s + 1)
    } else {
      localStorage.setItem(TOUR_KEY, TOUR_VERSION)
      setCompleted(true)
      setActive(false)
    }
  }, [currentStep])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
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

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-background rounded-2xl shadow-2xl border overflow-hidden">
          <div className="h-1.5 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Passo {currentStep + 1} de {tourSteps.length}
                  </p>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted"
                aria-label="Fechar tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>

            {step.href && (
              <button
                onClick={handleGo}
                className="w-full text-left p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-sm font-medium text-primary flex items-center gap-2"
              >
                <ChevronRight className="h-4 w-4" />
                Ir para {step.title}
              </button>
            )}

            <div className="flex items-center gap-2 pt-1">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className={cn("flex-1", currentStep === 0 && "w-full")}
              >
                {currentStep === tourSteps.length - 1 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
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
