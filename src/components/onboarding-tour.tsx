"use client"

import { useState, useEffect } from "react"
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Calendar, Users, Video, FileText, DollarSign, Settings, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Step {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const steps: Step[] = [
  {
    title: "Bem-vindo ao PsiHumanis",
    description: "Sua plataforma completa para gestão de consultório psicológico. Vamos apresentar as principais funcionalidades.",
    icon: <Sparkles className="h-6 w-6" />,
    color: "from-teal-500 to-emerald-600",
  },
  {
    title: "Agenda Inteligente",
    description: "Organize suas consultas com calendário visual, lembretes automáticos por email e WhatsApp, e confirmação com um clique.",
    icon: <Calendar className="h-6 w-6" />,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Gestão de Pacientes",
    description: "Cadastre pacientes, acompanhe histórico completo, prontuários digitais, questionários (PHQ-9, GAD-7) e diário emocional.",
    icon: <Users className="h-6 w-6" />,
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Videochamadas Seguras",
    description: "Atenda pacientes online com sala de espera, controles de câmera/mic, e conexão criptografada via LiveKit Cloud.",
    icon: <Video className="h-6 w-6" />,
    color: "from-cyan-500 to-teal-600",
  },
  {
    title: "Prontuários Digitais",
    description: "Documente sessões em formato SOAP, assine digitalmente e gere automaticamente com inteligência artificial.",
    icon: <FileText className="h-6 w-6" />,
    color: "from-amber-500 to-orange-600",
  },
  {
    title: "Controle Financeiro",
    description: "Registre receitas e despesas, gere faturas via Stripe, emita recibos e acompanhe a evolução do consultório.",
    icon: <DollarSign className="h-6 w-6" />,
    color: "from-emerald-500 to-green-600",
  },
  {
    title: "Tudo Pronto!",
    description: "Explore o painel, cadastre seu primeiro paciente e agende uma consulta. Estamos aqui para ajudar!",
    icon: <Check className="h-6 w-6" />,
    color: "from-teal-500 to-emerald-600",
  },
]

const KEY = "psihumanis-tour-v14"

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      const t = setTimeout(() => {
        setVisible(true)
        setOpen(true)
      }, 800)
      return () => clearTimeout(t)
    }
  }, [])

  const finish = () => {
    setOpen(false)
    setTimeout(() => {
      localStorage.setItem(KEY, "true")
      setStep(0)
      setVisible(false)
    }, 300)
  }

  const next = () => {
    if (step === steps.length - 1) {
      finish()
    } else {
      setStep(step + 1)
    }
  }

  if (!visible) return null

  const s = steps[step]
  const pct = ((step + 1) / steps.length) * 100
  const last = step === steps.length - 1

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-all duration-300",
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          "relative w-full max-w-md mx-4 transition-all duration-300",
          open ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        )}
      >
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Header gradient */}
          <div className={cn("h-2 bg-gradient-to-r", s.color)} />

          {/* Close button */}
          <button
            onClick={finish}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors z-10"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Icon */}
            <div className={cn("inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br text-white shadow-lg mb-5", s.color)}>
              {s.icon}
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === step ? "w-8 bg-teal-500" : i < step ? "w-3 bg-teal-300" : "w-3 bg-slate-200 dark:bg-slate-700"
                  )}
                />
              ))}
            </div>

            {/* Title + Description */}
            <h2 className="text-xl font-bold mb-2">{s.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
          </div>

          {/* Progress bar */}
          <div className="px-8">
            <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-8 py-6">
            <button
              onClick={finish}
              className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Pular tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(step - 1)}
                  className="h-9"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              )}
              <Button
                size="sm"
                onClick={next}
                className={cn(
                  "h-9 px-5 text-white shadow-md",
                  last
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400"
                    : "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500"
                )}
              >
                {last ? (
                  <><Check className="h-4 w-4 mr-1" />Concluir</>
                ) : (
                  <>Próximo<ChevronRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
