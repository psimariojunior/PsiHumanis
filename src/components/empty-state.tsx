"use client"

import { Calendar, Users, FileText, DollarSign, ClipboardList, BookOpen, Heart, ListTodo, MessageSquare, Video, Settings, CreditCard, UserPlus, CalendarX, BarChart3, type LucideIcon } from "lucide-react"

interface EmptyStateProps {
  type?: "appointments" | "patients" | "records" | "financial" | "tasks" | "diary" | "questionnaires" | "chat" | "video" | "settings" | "generic"
  icon?: LucideIcon
  title?: string
  description?: string
  action?: React.ReactNode
}

const configs = {
  appointments: {
    icon: Calendar,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    ring: "ring-blue-200 dark:ring-blue-800",
    title: "Nenhuma consulta agendada",
    description: "Agende sua primeira consulta para começar.",
  },
  patients: {
    icon: Users,
    gradient: "from-purple-500 to-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    ring: "ring-purple-200 dark:ring-purple-800",
    title: "Nenhum paciente cadastrado",
    description: "Adicione seu primeiro paciente para começar.",
  },
  records: {
    icon: FileText,
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    ring: "ring-emerald-200 dark:ring-emerald-800",
    title: "Nenhum prontuário",
    description: "Os prontuários aparecerão aqui após as consultas.",
  },
  financial: {
    icon: DollarSign,
    gradient: "from-amber-500 to-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    ring: "ring-amber-200 dark:ring-amber-800",
    title: "Nenhuma transação",
    description: "Registre pagamentos e receitas para acompanhar suas finanças.",
  },
  tasks: {
    icon: ListTodo,
    gradient: "from-rose-500 to-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    ring: "ring-rose-200 dark:ring-rose-800",
    title: "Nenhuma tarefa",
    description: "Crie tarefas para organizar seu atendimento.",
  },
  diary: {
    icon: BookOpen,
    gradient: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    ring: "ring-cyan-200 dark:ring-cyan-800",
    title: "Diário vazio",
    description: "Registre seus sentimentos e emoções do dia.",
  },
  questionnaires: {
    icon: ClipboardList,
    gradient: "from-indigo-500 to-indigo-600",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    ring: "ring-indigo-200 dark:ring-indigo-800",
    title: "Nenhum questionário",
    description: "Responda os questionários enviados pelo seu psicólogo.",
  },
  chat: {
    icon: MessageSquare,
    gradient: "from-teal-500 to-teal-600",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    ring: "ring-teal-200 dark:ring-teal-800",
    title: "Sala de espera vazia",
    description: "Aguardando pacientes para a sessão.",
  },
  video: {
    icon: Video,
    gradient: "from-violet-500 to-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    ring: "ring-violet-200 dark:ring-violet-800",
    title: "Nenhuma sala ativa",
    description: "Inicie uma videochamada para começar.",
  },
  settings: {
    icon: Settings,
    gradient: "from-slate-500 to-slate-600",
    bg: "bg-slate-50 dark:bg-slate-950/30",
    ring: "ring-slate-200 dark:ring-slate-800",
    title: "Nenhuma configuração",
    description: "Personalize sua experiência.",
  },
  generic: {
    icon: Heart,
    gradient: "from-pink-500 to-pink-600",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    ring: "ring-pink-200 dark:ring-pink-800",
    title: "Nada por aqui",
    description: "Comece adicionando algo novo.",
  },
}

const iconGradients: Record<string, string> = {
  CreditCard: "from-amber-500 to-amber-600",
  UserPlus: "from-purple-500 to-purple-600",
  CalendarX: "from-blue-500 to-blue-600",
  BarChart3: "from-emerald-500 to-emerald-600",
  Calendar: "from-blue-500 to-blue-600",
  Users: "from-purple-500 to-purple-600",
  FileText: "from-emerald-500 to-emerald-600",
  DollarSign: "from-amber-500 to-amber-600",
  ListTodo: "from-rose-500 to-rose-600",
  BookOpen: "from-cyan-500 to-cyan-600",
  ClipboardList: "from-indigo-500 to-indigo-600",
}

export function EmptyState({ type, icon: CustomIcon, title, description, action }: EmptyStateProps) {
  if (type) {
    const config = configs[type] || configs.generic
    const Icon = config.icon

    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className={`w-20 h-20 rounded-3xl ${config.bg} ring-4 ${config.ring} flex items-center justify-center mb-6`}>
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          {title || config.title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          {description || config.description}
        </p>
        {action && <div>{action}</div>}
      </div>
    )
  }

  const Icon = CustomIcon || Heart
  const iconName = Icon.displayName || Icon.name || "Heart"
  const gradient = iconGradients[iconName] || "from-slate-500 to-slate-600"

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-slate-50 dark:bg-slate-900/50 ring-4 ring-slate-200 dark:ring-slate-800 flex items-center justify-center mb-6">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title || "Nada por aqui"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-6">
        {description || "Comece adicionando algo novo."}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
