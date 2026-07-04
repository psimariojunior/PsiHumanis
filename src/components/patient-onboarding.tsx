"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, BookOpen, ClipboardList, ListTodo, FileText, ChevronRight, ChevronLeft, X } from "lucide-react"

interface TourStep {
  icon: React.ElementType
  title: string
  description: string
  color: string
}

const steps: TourStep[] = [
  {
    icon: Calendar,
    title: "Sua Agenda",
    description: "Visualize e gerencie todas as suas consultas em um só lugar.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: BookOpen,
    title: "Diário de Emoções",
    description: "Registre seus sentimentos e acompanhe sua evolução ao longo do tempo.",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: ClipboardList,
    title: "Questionários",
    description: "Responda os questionários enviados pelo seu psicólogo.",
    color: "from-indigo-500 to-indigo-600",
  },
  {
    icon: ListTodo,
    title: "Tarefas",
    description: "Acompanhe as atividades e tarefas designadas pelo seu terapeuta.",
    color: "from-rose-500 to-rose-600",
  },
  {
    icon: FileText,
    title: "Seus Registros",
    description: "Acesse laudos, atestados e documentos importantes.",
    color: "from-emerald-500 to-emerald-600",
  },
]

export function PatientOnboarding() {
  const [show, setShow] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const dismissed = localStorage.getItem("psihumanis-patient-tour")
    if (!dismissed) {
      setTimeout(() => setShow(true), 1000)
    }
  }, [])

  function handleDismiss() {
    localStorage.setItem("psihumanis-patient-tour", "true")
    setShow(false)
  }

  function handleNext() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleDismiss()
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (!show) return null

  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5" />
          <button onClick={handleDismiss} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
          <div className="relative">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl`}>
              <Icon className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentStep ? "bg-white flex-1" : "bg-white/30 w-2"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {step.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {step.description}
          </p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handlePrev} className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white">
            {currentStep === steps.length - 1 ? "Começar" : "Próximo"}
            {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
