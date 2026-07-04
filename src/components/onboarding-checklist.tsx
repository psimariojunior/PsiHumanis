"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, PartyPopper, ArrowRight, X, Calendar, UserPlus, Video, Globe, CreditCard, Gift } from "lucide-react"
import { cn } from "@/lib/utils"

const ONBOARDING_KEY = "psihumanis_onboarding_completed"

const steps = [
  { id: "conta", label: "Conta criada", desc: "Seu acesso está pronto", href: "/configuracoes", done: true, icon: CheckCircle2 },
  { id: "publico", label: "Configurar perfil público", desc: "Configure como pacientes veem você", href: "/configuracoes", icon: Globe },
  { id: "paciente", label: "Cadastrar primeiro paciente", desc: "Monte sua base clínica", href: "/pacientes/novo", icon: UserPlus },
  { id: "agendar", label: "Agendar primeira consulta", desc: "Valide seu fluxo de atendimento", href: "/agenda", icon: Calendar },
  { id: "sala", label: "Testar sala virtual", desc: "Prepare o atendimento online", href: "/sala-virtual", icon: Video },
  { id: "pagamentos", label: "Ativar pagamentos", desc: "Organize cobrança e faturas", href: "/configuracoes", icon: CreditCard },
  { id: "indicacoes", label: "Compartilhar indicação", desc: "Ganhe 1 mês grátis por amigo", href: "/configuracoes", icon: Gift },
]

export function OnboardingChecklist() {
  const router = useRouter()
  const [completed, setCompleted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const val = localStorage.getItem(ONBOARDING_KEY)
    if (val === "true") { setCompleted(true); return }

    const saved = localStorage.getItem("psihumanis_onboarding_steps")
    if (saved) {
      try { setCheckedSteps(JSON.parse(saved)) } catch {}
    }
  }, [])

  const completedCount = steps.filter(
    (s) => s.done || checkedSteps[s.id]
  ).length
  const progress = Math.round((completedCount / steps.length) * 100)

  const handleFinish = () => {
    localStorage.setItem(ONBOARDING_KEY, "true")
    setCompleted(true)
  }

  const handleDismiss = () => {
    localStorage.setItem(ONBOARDING_KEY, "true")
    setCompleted(true)
  }

  const toggleStep = (id: string) => {
    const next = { ...checkedSteps, [id]: !checkedSteps[id] }
    setCheckedSteps(next)
    localStorage.setItem("psihumanis_onboarding_steps", JSON.stringify(next))
  }

  if (completed || dismissed) return null

  return (
    <Card className="overflow-hidden border-teal-200 dark:border-teal-800 shadow-sm">
      <div className="bg-gradient-to-r from-teal-600 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PartyPopper className="h-5 w-5 text-teal-200" />
            <div>
              <h3 className="text-white font-semibold text-sm">
                Bem-vindo ao PsiHumanis!
              </h3>
              <p className="text-teal-100 text-xs mt-0.5">
                {completedCount === steps.length
                  ? "Tudo pronto! Você está pronto para começar."
                  : `Complete os passos para começar — ${completedCount}/${steps.length}`
                }
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-teal-200 hover:text-white transition-colors rounded-lg p-1"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{completedCount}/{steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {steps.map((step) => {
            const isChecked = step.done || checkedSteps[step.id]
            const Icon = step.icon
            return (
              <button
                key={step.id}
                onClick={() => {
                  if (!step.done) toggleStep(step.id)
                }}
                onDoubleClick={() => router.push(step.href)}
                className={cn(
                  "w-full flex items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                  isChecked
                    ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                    : "hover:bg-accent/50"
                )}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", isChecked ? "text-emerald-500" : "text-teal-500")} />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm font-medium", isChecked && "line-through text-muted-foreground")}>{step.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{step.desc}</span>
                </span>
                {!step.done && !isChecked && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button size="sm" onClick={handleFinish} className="flex-1">
            {completedCount === steps.length ? "Começar a usar!" : "Concluir"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
          >
            Pular
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
