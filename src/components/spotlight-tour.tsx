"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle2, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"

const TOUR_KEY = "psihumanis_spotlight_tour"
const TOUR_VERSION = "v1"

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  href: string
  position: "top" | "bottom" | "left" | "right"
  icon?: typeof Sparkles
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Bem-vindo ao PsiHumanis!",
    description: "Vamos te mostrar como tudo funciona. Cada passo destaca um recurso real da plataforma.",
    target: "",
    href: "/dashboard",
    position: "bottom",
    icon: Sparkles,
  },
  {
    id: "hero",
    title: "Seu Painel",
    description: "Aqui você vê tudo em tempo real: saudação, consultas de hoje e próximo foco.",
    target: "[data-tour='dashboard-hero']",
    href: "/dashboard",
    position: "bottom",
  },
  {
    id: "quick-actions",
    title: "Ações Rápidas",
    description: "Novo paciente, prontuário, sala virtual e relatórios — tudo com um clique.",
    target: "[data-tour='quick-actions']",
    href: "/dashboard",
    position: "top",
  },
  {
    id: "today-sessions",
    title: "Sessões de Hoje",
    description: "Suas consultas do dia aparecem aqui. Clique em uma para entrar na sala virtual.",
    target: "[data-tour='today-sessions']",
    href: "/dashboard",
    position: "left",
  },
  {
    id: "sidebar",
    title: "Menu de Navegação",
    description: "Use o menu lateral para acessar todas as funcionalidades: agenda, pacientes, prontuários.",
    target: "[data-tour='sidebar-menu']",
    href: "/dashboard",
    position: "right",
  },
  {
    id: "new-patient",
    title: "Cadastre um Paciente",
    description: "Clique aqui para adicionar um novo paciente. Ele receberá um link de acesso.",
    target: "[data-tour='new-patient']",
    href: "/pacientes/novo",
    position: "right",
  },
  {
    id: "schedule",
    title: "Sua Agenda",
    description: "Gerencie seus horários, bloqueie períodos e veja consultas agendadas.",
    target: "[data-tour='agenda-page']",
    href: "/agenda",
    position: "bottom",
  },
  {
    id: "virtual-room",
    title: "Sala Virtual",
    description: "Prepare videochamadas seguras com seus pacientes. Compartilhe o link e aguarde a conexão.",
    target: "[data-tour='sala-virtual']",
    href: "/sala-virtual",
    position: "bottom",
  },
  {
    id: "done",
    title: "Tudo Pronto!",
    description: "Você já viu os principais recursos. Comece cadastrando seu primeiro paciente!",
    target: "",
    href: "/pacientes/novo",
    position: "bottom",
    icon: PartyPopper,
  },
]

export function SpotlightTour() {
  const router = useRouter()
  const [active, setActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const step = tourSteps[currentStep]
  const isLast = currentStep === tourSteps.length - 1
  const isFirst = currentStep === 0
  const hasTarget = !!step.target

  // Find and highlight target element
  const highlightTarget = useCallback(() => {
    if (!step.target) {
      setHighlightRect(null)
      return
    }
    const el = document.querySelector(step.target) as HTMLElement
    if (!el) {
      setHighlightRect(null)
      return
    }
    el.scrollIntoView({ behavior: "smooth", block: "center" })
    setTimeout(() => {
      const rect = el.getBoundingClientRect()
      setHighlightRect(rect)

      // Calculate tooltip position
      const gap = 16
      const tooltipWidth = 340
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let top = 0
      let left = 0

      switch (step.position) {
        case "bottom":
          top = rect.bottom + gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case "top":
          top = rect.top - gap - 180
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case "left":
          top = rect.top + rect.height / 2 - 90
          left = rect.left - tooltipWidth - gap
          break
        case "right":
          top = rect.top + rect.height / 2 - 90
          left = rect.right + gap
          break
      }

      // Keep tooltip in viewport
      left = Math.max(16, Math.min(left, viewportWidth - tooltipWidth - 16))
      top = Math.max(16, Math.min(top, viewportHeight - 200))

      setTooltipPos({ top, left })
    }, 400)
  }, [step.target, step.position])

  // Initialize tour
  useEffect(() => {
    const stored = localStorage.getItem(TOUR_KEY)
    if (stored === TOUR_VERSION) {
      setCompleted(true)
      return
    }
    const timer = setTimeout(() => setActive(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  // Navigate and highlight when step changes
  useEffect(() => {
    if (!active) return
    setIsTransitioning(true)
    setHighlightRect(null)

    if (step.href) {
      router.push(step.href)
    }

    // Wait for page to load, then highlight
    const navTimer = setTimeout(() => {
      highlightTarget()
      setIsTransitioning(false)
    }, 800)

    return () => clearTimeout(navTimer)
  }, [active, currentStep, highlightTarget, router, step.href])

  // Re-highlight on scroll/resize
  useEffect(() => {
    if (!active || !hasTarget) return
    const handler = () => highlightTarget()
    window.addEventListener("scroll", handler, { passive: true })
    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("scroll", handler)
      window.removeEventListener("resize", handler)
    }
  }, [active, hasTarget, highlightTarget])

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

  const Icon = step.icon || Sparkles

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleSkip} />

      {/* Spotlight cutout around target */}
      {highlightRect && (
        <div
          className="absolute rounded-xl transition-all duration-500 ease-out"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
            zIndex: 10,
          }}
        />
      )}

      {/* Animated ring around target */}
      {highlightRect && (
        <div
          className="absolute rounded-xl border-2 border-teal-400 animate-tour-glow pointer-events-none transition-all duration-500 ease-out"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            zIndex: 11,
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-[100] w-[calc(100vw-32px)] sm:w-[340px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border overflow-hidden transition-all duration-500 ease-out",
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}
        style={{
          top: highlightRect ? tooltipPos.top : "50%",
          left: highlightRect ? tooltipPos.left : "50%",
          transform: highlightRect ? undefined : "translate(-50%, -50%)",
        }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          />
        </div>

        <div className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25 shrink-0">
                <Icon className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  {isFirst ? "Vamos lá!" : `${currentStep} de ${tourSteps.length - 1}`}
                </p>
                <h3 className="font-semibold text-sm text-foreground leading-tight">{step.title}</h3>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted shrink-0"
              aria-label="Fechar tour"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          {/* Arrow pointing to target */}
          {highlightRect && (
            <div
              className="absolute w-3 h-3 bg-white dark:bg-slate-900 rotate-45 border-l border-b border-border"
              style={{
                ...(step.position === "bottom" && {
                  top: -6,
                  left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                }),
                ...(step.position === "top" && {
                  bottom: -6,
                  left: "50%",
                  transform: "translateX(-50%) rotate(225deg)",
                }),
                ...(step.position === "left" && {
                  right: -6,
                  top: "50%",
                  transform: "translateY(-50%) rotate(-45deg)",
                }),
                ...(step.position === "right" && {
                  left: -6,
                  top: "50%",
                  transform: "translateY(-50%) rotate(135deg)",
                }),
              }}
            />
          )}

          {/* Navigation */}
          <div className="flex items-center gap-2 pt-0.5">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={handlePrev} className="h-8 px-3 text-xs">
                <ChevronLeft className="h-3 w-3 mr-1" />
                Anterior
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className={cn(
                "flex-1 h-8 text-xs font-semibold text-white",
                isFirst || isLast
                  ? "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600"
                  : "bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              )}
            >
              {isFirst ? (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Vamos lá!
                </>
              ) : isLast ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Começar!
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="h-3 w-3 ml-1" />
                </>
              )}
            </Button>
          </div>

          <button
            onClick={handleSkip}
            className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular tour
          </button>
        </div>
      </div>
    </div>
  )
}
