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
    target: "[data-tour='patient-hero']",
    title: "Seu Espaço",
    text: "Acompanhe suas sessões, diário emocional e documentos em um lugar seguro.",
    placement: "bottom",
  },
  {
    target: "[data-tour='patient-appointment']",
    title: "Próxima Consulta",
    text: "Veja detalhes da sua próxima sessão e entre na sala virtual no horário.",
    placement: "bottom",
  },
  {
    target: "[data-tour='patient-mood']",
    title: "Como Você Se Sente?",
    text: "Registre seu humor diariamente. Isso ajuda seu psicólogo a acompanhar sua evolução.",
    placement: "bottom",
  },
  {
    target: "[data-tour='patient-quicklinks']",
    title: "Acesso Rápido",
    text: "Diário, questionários, tarefas, agenda e mais — tudo com um toque.",
    placement: "top",
  },
]

const TOUR_KEY = "psihumanis-patient-tour-v2"

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

  const vw = window.innerWidth
  left = Math.max(16, Math.min(left, vw - tw - 16))
  top = Math.max(16, top)

  return { top, left }
}

export function PatientOnboarding() {
  const [active, setActive] = useState(false)
  const [step, setStep] = useState(0)
  const [ready, setReady] = useState(false)
  const [spot, setSpot] = useState({ x: 0, y: 0, w: 0, h: 0 })
  const [tooltip, setTooltip] = useState({ top: 0, left: 0 })

  const TW = 300
  const PAD = 8

  const positionTooltip = useCallback((rect: DOMRect, placement: string) => {
    let top = 0, left = 0
    const th = 130

    switch (placement) {
      case "bottom":
        top = rect.bottom + PAD + window.scrollY
        left = rect.left + rect.width / 2 - TW / 2 + window.scrollX
        break
      case "top":
        top = rect.top - PAD - th + window.scrollY
        left = rect.left + rect.width / 2 - TW / 2 + window.scrollX
        break
      case "right":
        top = rect.top + rect.height / 2 - th / 2 + window.scrollY
        left = rect.right + PAD + window.scrollX
        break
      case "left":
        top = rect.top + rect.height / 2 - th / 2 + window.scrollY
        left = rect.left - PAD - TW + window.scrollX
        break
    }

    const vw = window.innerWidth
    if (left < 16 + window.scrollX) left = 16 + window.scrollX
    if (left + TW > vw - 16 + window.scrollX) left = vw - TW - 16 + window.scrollX

    return { top, left }
  }, [])

  const showStep = useCallback((stepIdx: number) => {
    const s = steps[stepIdx]
    const el = document.querySelector(s.target)
    if (!el) {
      setReady(false)
      return
    }

    setReady(false)

    const rect = el.getBoundingClientRect()
    const scrollTarget = rect.top + window.scrollY - window.innerHeight / 2 + rect.height / 2
    window.scrollTo({ top: Math.max(0, scrollTarget), behavior: "instant" })

    requestAnimationFrame(() => {
      const newRect = el.getBoundingClientRect()
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      setSpot({
        x: newRect.left + scrollX - PAD,
        y: newRect.top + scrollY - PAD,
        w: newRect.width + PAD * 2,
        h: newRect.height + PAD * 2,
      })
      setTooltip(positionTooltip(newRect, s.placement))
      setReady(true)
    })
  }, [positionTooltip])

  // Keep spotlight synced on scroll
  useEffect(() => {
    if (!active || !ready) return
    let raf: number
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const s = steps[step]
        const el = document.querySelector(s.target)
        if (!el) return
        const rect = el.getBoundingClientRect()
        const scrollY = window.scrollY
        const scrollX = window.scrollX

        setSpot({
          x: rect.left + scrollX - PAD,
          y: rect.top + scrollY - PAD,
          w: rect.width + PAD * 2,
          h: rect.height + PAD * 2,
        })
        setTooltip(positionTooltip(rect, s.placement))
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [active, step, ready, positionTooltip])

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return
    const t = setTimeout(() => {
      setActive(true)
      showStep(0)
    }, 1000)
    return () => clearTimeout(t)
  }, [showStep])

  // Swipe support for mobile
  const touchStartX = { current: 0 }
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 60) {
      if (dx < 0 && step < steps.length - 1) go(step + 1)
      else if (dx > 0 && step > 0) go(step - 1)
    }
  }

  const finish = () => {
    setActive(false)
    setReady(false)
    localStorage.setItem(TOUR_KEY, TOUR_KEY)
    setStep(0)
  }

  const go = (n: number) => {
    setStep(n)
    showStep(n)
  }

  if (!active || !ready) return null

  const s = steps[step]
  const last = step === steps.length - 1

  return (
    <>
      {/* Spotlight highlight — absolute position, moves with scroll */}
      <div
        className="absolute z-[9998] pointer-events-none rounded-xl"
        style={{
          position: "absolute",
          top: spot.y,
          left: spot.x,
          width: spot.w,
          height: spot.h,
          boxShadow: "0 0 0 3px rgba(13,148,136,0.9), 0 0 30px rgba(13,148,136,0.3)",
          transition: "all 0.15s ease-out",
        }}
      />

      {/* Dark overlay — absolute, covers full document */}
      <div
        className="pointer-events-none z-[9997]"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `radial-gradient(
            ellipse ${spot.w + 40}px ${spot.h + 40}px at ${spot.x + spot.w / 2}px ${spot.y + spot.h / 2}px,
            transparent 0%,
            transparent 60%,
            rgba(0,0,0,0.5) 100%
          )`,
        }}
      />

      {/* Clickable backdrop to close */}
      <div className="fixed inset-0 z-[9996]" onClick={finish} />

      {/* Tooltip — absolute position, moves with scroll */}
      <div
        className="absolute z-[10001] pointer-events-auto"
        style={{ top: tooltip.top, left: tooltip.left, width: TW }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
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
