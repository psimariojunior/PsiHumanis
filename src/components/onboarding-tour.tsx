"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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

const KEY = "psihumanis-tour-v15"

export function OnboardingTour() {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const overlayRef = useRef<HTMLDivElement>(null)

  const measure = useCallback((stepIdx: number) => {
    const s = steps[stepIdx]
    const el = document.querySelector(s.target)
    if (!el) return false
    const rect = el.getBoundingClientRect()
    setTargetRect(rect)

    const gap = 12
    const tw = 320
    const th = 140
    let top = 0, left = 0

    switch (s.placement) {
      case "bottom":
        top = rect.bottom + gap
        left = Math.max(16, Math.min(rect.left + rect.width / 2 - tw / 2, window.innerWidth - tw - 16))
        break
      case "top":
        top = Math.max(16, rect.top - gap - th)
        left = Math.max(16, Math.min(rect.left + rect.width / 2 - tw / 2, window.innerWidth - tw - 16))
        break
      case "right":
        top = Math.max(16, Math.min(rect.top + rect.height / 2 - th / 2, window.innerHeight - th - 16))
        left = Math.min(rect.right + gap, window.innerWidth - tw - 16)
        break
      case "left":
        top = Math.max(16, Math.min(rect.top + rect.height / 2 - th / 2, window.innerHeight - th - 16))
        left = Math.max(16, rect.left - gap - tw)
        break
    }

    // Keep within viewport
    if (top + th > window.innerHeight) top = window.innerHeight - th - 16
    if (left + tw > window.innerWidth) left = window.innerWidth - tw - 16
    if (top < 16) top = 16
    if (left < 16) left = 16

    setTooltipStyle({ position: "fixed", top, left, width: tw, zIndex: 10001 })
    el.scrollIntoView({ behavior: "smooth", block: "center" })
    return true
  }, [])

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => {
        setActive(true)
        measure(0)
      }, 1000)
      return () => clearTimeout(t)
    }
  }, [measure])

  useEffect(() => {
    if (active) measure(step)
  }, [active, step, measure])

  useEffect(() => {
    if (!active) return
    const onResize = () => measure(step)
    window.addEventListener("resize", onResize)
    window.addEventListener("scroll", onResize, { passive: true })
    return () => {
      window.removeEventListener("resize", onResize)
      window.removeEventListener("scroll", onResize)
    }
  }, [active, step, measure])

  const finish = () => {
    setActive(false)
    localStorage.setItem(KEY, "true")
    setStep(0)
    setTargetRect(null)
  }

  const go = (n: number) => {
    setStep(n)
  }

  if (!active || !targetRect) return null

  const s = steps[step]
  const pct = ((step + 1) / steps.length) * 100
  const last = step === steps.length - 1
  const pad = 6

  return (
    <>
      {/* Overlay with spotlight hole */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9999]"
        style={{
          background: `radial-gradient(
            ellipse ${targetRect.width + pad * 2}px ${targetRect.height + pad * 2}px at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
            transparent 0%,
            transparent 60%,
            rgba(0,0,0,0.5) 100%
          )`,
          transition: "background 0.3s ease",
        }}
        onClick={finish}
      />

      {/* Highlighted element glow */}
      <div
        className="fixed z-[10000] pointer-events-none rounded-xl"
        style={{
          top: targetRect.top - pad,
          left: targetRect.left - pad,
          width: targetRect.width + pad * 2,
          height: targetRect.height + pad * 2,
          boxShadow: "0 0 0 2px rgba(13,148,136,0.8), 0 0 20px rgba(13,148,136,0.3)",
          transition: "all 0.3s ease",
        }}
      />

      {/* Tooltip card */}
      <div style={tooltipStyle} className="pointer-events-auto">
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
            <button
              onClick={finish}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            >
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
            <span className="text-[10px] text-muted-foreground">
              {step + 1}/{steps.length}
            </span>
            <div className="flex items-center gap-1.5">
              {step > 0 && (
                <button
                  onClick={() => go(step - 1)}
                  className="h-7 px-2.5 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
              )}
              <button
                onClick={() => last ? finish() : go(step + 1)}
                className={cn(
                  "h-7 px-3 rounded-lg text-[11px] font-semibold text-white shadow-sm transition-all flex items-center gap-1",
                  last
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                    : "bg-gradient-to-r from-teal-600 to-teal-700"
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
