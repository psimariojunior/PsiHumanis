"use client"

import { useState, useEffect, useCallback } from "react"
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface TourStep {
  target: string
  title: string
  text: string
  placement: "top" | "bottom" | "left" | "right"
}

const steps: TourStep[] = [
  {
    target: "[data-tour='dashboard-hero']",
    title: "Seu Painel",
    text: "Visão completa do consultório: próxima consulta, receita e atalhos rápidos.",
    placement: "bottom",
  },
  {
    target: "[data-tour='today-sessions']",
    title: "Sessões de Hoje",
    text: "Todas as consultas do dia em tempo real. Clique para entrar na sala virtual.",
    placement: "bottom",
  },
  {
    target: "[data-tour='dashboard-stats']",
    title: "Métricas",
    text: "Total de pacientes, consultas, receita e pagamentos pendentes.",
    placement: "bottom",
  },
  {
    target: "[data-tour='quick-actions']",
    title: "Ações Rápidas",
    text: "Cadastrar paciente, prontuário, sala virtual e relatórios com um clique.",
    placement: "left",
  },
  {
    target: "[data-tour='sidebar-menu']",
    title: "Menu Lateral",
    text: "Navegue por todas as funcionalidades: agenda, pacientes, financeiro e mais.",
    placement: "right",
  },
]

const KEY = "psihumanis-tour-v16"

function calcPosition(rect: DOMRect, placement: string, tw: number, th: number) {
  const gap = 12
  let top = 0, left = 0

  switch (placement) {
    case "bottom":
      top = rect.bottom + gap
      left = rect.left + rect.width / 2 - tw / 2
      break
    case "top":
      top = rect.top - gap - th
      left = rect.left + rect.width / 2 - tw / 2
      break
    case "right":
      top = rect.top + rect.height / 2 - th / 2
      left = rect.right + gap
      break
    case "left":
      top = rect.top + rect.height / 2 - th / 2
      left = rect.left - gap - tw
      break
  }

  // Clamp to viewport
  left = Math.max(16, Math.min(left, window.innerWidth - tw - 16))
  top = Math.max(16, Math.min(top, window.innerHeight - th - 16))

  return { top, left }
}

export function OnboardingTour() {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [ready, setReady] = useState(false)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })

  const TW = 320
  const TH = 140
  const PAD = 6

  const showStep = useCallback((stepIdx: number) => {
    const s = steps[stepIdx]
    const el = document.querySelector(s.target)
    if (!el) {
      setReady(false)
      return
    }

    // Hide while we scroll
    setReady(false)

    // Scroll element into view
    el.scrollIntoView({ behavior: "smooth", block: "center" })

    // Wait for scroll to finish, then measure
    const waitAndMeasure = () => {
      const rect = el.getBoundingClientRect()
      const pos = calcPosition(rect, s.placement, TW, TH)
      setTargetRect(rect)
      setTooltipPos(pos)
      setReady(true)
    }

    // Smooth scroll takes ~300-500ms, measure after it finishes
    setTimeout(waitAndMeasure, 500)
  }, [])

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => {
        setActive(true)
        showStep(0)
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [showStep])

  // Re-measure on resize
  useEffect(() => {
    if (!active || !ready) return
    const onResize = () => {
      const s = steps[step]
      const el = document.querySelector(s.target)
      if (!el) return
      const rect = el.getBoundingClientRect()
      const pos = calcPosition(rect, s.placement, TW, TH)
      setTargetRect(rect)
      setTooltipPos(pos)
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [active, step, ready])

  const finish = () => {
    setActive(false)
    setReady(false)
    localStorage.setItem(KEY, "true")
    setStep(0)
    setTargetRect(null)
  }

  const go = (n: number) => {
    setStep(n)
    showStep(n)
  }

  if (!active || !targetRect || !ready) return null

  const s = steps[step]
  const last = step === steps.length - 1

  return (
    <>
      {/* Dark overlay with spotlight hole */}
      <div
        className="fixed inset-0 z-[9999]"
        style={{
          background: `radial-gradient(
            ellipse ${targetRect.width + PAD * 2}px ${targetRect.height + PAD * 2}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
            transparent 0%,
            transparent 65%,
            rgba(0,0,0,0.55) 100%
          )`,
        }}
        onClick={finish}
      />

      {/* Glow border around target */}
      <div
        className="fixed z-[10000] pointer-events-none rounded-xl"
        style={{
          top: targetRect.top - PAD,
          left: targetRect.left - PAD,
          width: targetRect.width + PAD * 2,
          height: targetRect.height + PAD * 2,
          boxShadow: "0 0 0 2px rgba(13,148,136,0.9), 0 0 24px rgba(13,148,136,0.25)",
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10001] pointer-events-auto"
        style={{ top: tooltipPos.top, left: tooltipPos.left, width: TW }}
      >
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Progress dots */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1">
            <div className="flex items-center gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    i === step ? "w-6 bg-teal-500" : i < step ? "w-1.5 bg-teal-300" : "w-1.5 bg-slate-200 dark:bg-slate-700"
                  )}
                  onClick={() => go(i)}
                />
              ))}
            </div>
            <button onClick={finish} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-teal-500" />
              <h3 className="text-sm font-bold">{s.title}</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-muted-foreground">{step + 1}/{steps.length}</span>
            <div className="flex items-center gap-1.5">
              {step > 0 && (
                <button onClick={() => go(step - 1)} className="h-7 px-2.5 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1">
                  <ChevronLeft className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => last ? finish() : go(step + 1)}
                className={cn(
                  "h-7 px-3 rounded-lg text-[11px] font-semibold text-white shadow-sm transition-all flex items-center gap-1",
                  last ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : "bg-gradient-to-r from-teal-600 to-teal-700"
                )}
              >
                {last ? <><Check className="h-3 w-3" />Concluir</> : <>Avançar<ChevronRight className="h-3 w-3" /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
