"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  page: string
  title: string
  intro: string
  points: { label: string; text: string }[]
  href?: string
}

const steps: Step[] = [
  {
    page: "Dashboard",
    title: "Seu painel principal",
    intro: "Aqui você tem uma visão completa do seu consultório em tempo real.",
    points: [
      { label: "Cards superiores", text: "Mostram total de pacientes, consultas de hoje, receita do mês e pagamentos pendentes" },
      { label: "Ações rápidas", text: "Atalhos para criar consulta, cadastrar paciente, iniciar videochamada e abrir prontuário" },
      { label: "Gráficos", text: "Evolução de receita e agendamentos ao longo dos meses" },
      { label: "Meta do mês", text: "Acompanhe se está atingindo sua meta de faturamento" },
    ],
  },
  {
    page: "Pacientes",
    title: "Gerencie seus pacientes",
    intro: "Cadastre e acompanhe todos os seus pacientes em um só lugar.",
    points: [
      { label: "Lista de pacientes", text: "Veja todos os pacientes cadastrados com foto, contato e status" },
      { label: "Novo paciente", text: "Cadastre com nome, email, telefone, CPF e data de nascimento" },
      { label: "Perfil do paciente", text: "Acesse histórico completo, prontuários, questionários e diário emocional" },
      { label: "Timeline", text: "Linha do tempo com todas as atividades do paciente em ordem cronológica" },
    ],
    href: "/pacientes",
  },
  {
    page: "Agenda",
    title: "Sua agenda de consultas",
    intro: "Organize seus horários de forma visual e intuitiva.",
    points: [
      { label: "Calendário", text: "Visualize consultas por dia, semana ou mês" },
      { label: "Agendar", text: "Clique em um horário livre para criar uma consulta" },
      { label: "Status", text: "Confirme, cancele ou marque falta com um clique" },
      { label: "Lembretes", text: "Envio automático por email e WhatsApp 24h e 1h antes" },
    ],
    href: "/agenda",
  },
  {
    page: "Sala Virtual",
    title: "Videochamadas seguras",
    intro: "Atenda seus pacientes online com qualidade profissional.",
    points: [
      { label: "Criar sala", text: "Gere uma sala única e copie o link para enviar ao paciente" },
      { label: "Sala de espera", text: "Paciente aguarda com música relaxante e exercício de respiração" },
      { label: "Controles", text: "Ligue/desligue câmera e microfone durante a chamada" },
      { label: "Segurança", text: "Conexão criptografada via LiveKit Cloud com servidor no Brasil" },
    ],
    href: "/sala-virtual",
  },
  {
    page: "Prontuários",
    title: "Registros clínicos digitais",
    intro: "Documente cada sessão de forma organizada e segura.",
    points: [
      { label: "Novo prontuário", text: "Registre observações da sessão com formato SOAP" },
      { label: "Assinatura digital", text: "Assine o prontuário digitalmente após encerrar a sessão" },
      { label: "Histórico", text: "Todos os prontuários do paciente em ordem cronológica" },
      { label: "IA integrada", text: "Gere automaticamente notas SOAP com inteligência artificial" },
    ],
    href: "/prontuarios",
  },
  {
    page: "Financeiro",
    title: "Controle financeiro completo",
    intro: "Gerencie receitas, despesas e pagamentos do consultório.",
    points: [
      { label: "Receitas e despesas", text: "Registre todas as entradas e saídas financeiras" },
      { label: "Faturas", text: "Gere faturas para pacientes com pagamento via Stripe" },
      { label: "Recibos", text: "Emita recibos profissionais automaticamente" },
      { label: "Gráficos", text: "Acompanhe a evolução financeira mês a mês" },
    ],
    href: "/financeiro",
  },
  {
    page: "Relatórios",
    title: "Relatórios e análises",
    intro: "Gere documentos profissionais para tomada de decisão.",
    points: [
      { label: "Relatório de pacientes", text: "Lista completa com dados e histórico de consultas" },
      { label: "Relatório financeiro", text: "Resumo de receitas, despesas e métodos de pagamento" },
      { label: "Relatório de agenda", text: "Estatísticas de consultas por status e período" },
      { label: "Exportar", text: "Imima diretamente do navegador em formato PDF" },
    ],
    href: "/relatorios",
  },
  {
    page: "Configurações",
    title: "Personalize sua conta",
    intro: "Configure seu perfil e integrações com outros serviços.",
    points: [
      { label: "Perfil", text: "Foto, nome, CRP, especialidade e biografia profissional" },
      { label: "Google Calendar", text: "Sincronize consultas com seu calendário do Google" },
      { label: "Lembretes", text: "Configure envio automático por email e WhatsApp" },
      { label: "Pagamentos", text: "Configure chave PIX e integração com Stripe" },
    ],
    href: "/configuracoes",
  },
  {
    page: "Conclusão",
    title: "Tudo pronto!",
    intro: "Você conhece as principais funcionalidades do PsiHumanis.",
    points: [
      { label: "Primeiros passos", text: "Cadastre um paciente, agende uma consulta e teste a videochamada" },
      { label: "Questionários", text: "Aplique PHQ-9, GAD-7 e outros testes com seus pacientes" },
      { label: "Protocolos de crise", text: "Tenha acesso a protocolos de atendimento em emergências" },
      { label: "Suporte", text: "Acesse a página de Ajuda no menu lateral quando precisar" },
    ],
  },
]

const KEY = "psihumanis-tour-v13"
const STEP_KEY = "psihumanis-tour-step-v13"
const ACTIVE_KEY = "psihumanis-tour-active-v13"

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(STEP_KEY)
      return saved ? parseInt(saved) : 0
    }
    return 0
  })
  const [anim, setAnim] = useState<"in" | "out">("in")
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem(KEY) && !sessionStorage.getItem(ACTIVE_KEY)) {
      if (pathname === "/dashboard") {
        sessionStorage.setItem(ACTIVE_KEY, "true")
        const t = setTimeout(() => setOpen(true), 500)
        return () => clearTimeout(t)
      }
    } else if (sessionStorage.getItem(ACTIVE_KEY) === "true" && !localStorage.getItem(KEY)) {
      setOpen(true)
    }
  }, [pathname])

  useEffect(() => {
    if (open) sessionStorage.setItem(STEP_KEY, String(step))
  }, [step, open])

  const finish = () => {
    setAnim("out")
    setTimeout(() => {
      localStorage.setItem(KEY, "true")
      sessionStorage.removeItem(ACTIVE_KEY)
      sessionStorage.removeItem(STEP_KEY)
      setOpen(false)
      setStep(0)
    }, 300)
  }

  const go = (n: number) => {
    setAnim("out")
    setTimeout(() => {
      setStep(n)
      setAnim("in")
      const s = steps[n]
      if (s.href && s.href !== pathname) router.push(s.href)
    }, 250)
  }

  if (!open) return null
  const s = steps[step]
  const pct = ((step + 1) / steps.length) * 100
  const last = step === steps.length - 1

  return (
    <>
      {/* Floating guide card - bottom right, doesn't block content */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-[95] w-[380px] max-w-[calc(100vw-3rem)]"
        style={{
          opacity: anim === "in" ? 1 : 0,
          transform: anim === "in" ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Pulsing glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 via-violet-500/20 to-cyan-500/20 rounded-3xl blur-xl animate-pulse" />
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header with gradient */}
          <div className="relative h-2 bg-gradient-to-r from-teal-500 via-violet-500 to-cyan-500" />

          {/* Close + progress */}
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/50 flex items-center justify-center animate-pulse">
                <Lightbulb className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="flex items-center gap-1">
                {steps.map((_, i) => (
                  <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === step ? "w-6 bg-teal-500" : i < step ? "w-1.5 bg-teal-300" : "w-1.5 bg-slate-200 dark:bg-slate-700")} />
                ))}
              </div>
            </div>
            <button onClick={finish} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Page badge */}
          <div className="px-5 mt-2">
            <span className="inline-block text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-full uppercase tracking-wide">
              {s.page}
            </span>
          </div>

          {/* Title + intro */}
          <div className="px-5 mt-2">
            <h3 className="text-base font-bold leading-tight">{s.title}</h3>
            <p className="text-[13px] text-slate-500 mt-1">{s.intro}</p>
          </div>

          {/* Points - what to look at on this page */}
          <div className="px-5 mt-3 space-y-2">
            {s.points.map((p, i) => (
              <div key={i} className="flex items-start gap-2.5" style={{ opacity: anim === "in" ? 1 : 0, transition: `opacity 0.3s ease ${i * 80}ms` }}>
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-[7px] shrink-0" />
                <div className="flex-1">
                  <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{p.label}</span>
                  <span className="text-[12px] text-slate-500 ml-1">— {p.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="px-5 mt-4">
            <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={finish} className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
              Pular tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button onClick={() => go(step - 1)} className="h-8 px-3 rounded-lg text-[12px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1">
                  <ChevronLeft className="h-3.5 w-3.5" /> Voltar
                </button>
              )}
              <button
                onClick={() => last ? finish() : go(step + 1)}
                className={cn(
                  "h-8 px-5 rounded-lg text-[12px] font-semibold text-white shadow-md transition-all flex items-center gap-1.5",
                  last ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400" : "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-500"
                )}
              >
                {last ? <><Check className="h-4 w-4" />Concluir</> : <>Próximo<ChevronRight className="h-4 w-4" /></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle dim - just 15% so user can still see everything */}
      <div className="fixed inset-0 z-[80] bg-black/5 pointer-events-none" />
    </>
  )
}
