"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Video,
  FileText,
  Bell,
  BarChart3,
  Smile,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Receipt,
  ClipboardList,
  Sparkles,
  Heart,
  BookOpen,
  ListTodo,
  LogOut,
  Shield,
  FileType,
  ClipboardCheck,
  Building2,
  Brain,
  Zap,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { WaitingRoomBadge } from "@/components/waiting-room-queue"
import { t, getLocale } from "@/lib/i18n"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const baseMenuItems = [
  { href: "/dashboard", labelKey: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes", labelKey: "sidebar.patients", label: "Pacientes", icon: Users },
  { href: "/agenda", labelKey: "sidebar.schedule", label: "Agenda", icon: Calendar },
  { href: "/disponibilidade", labelKey: "sidebar.availability", label: "Disponibilidade", icon: Clock },
  { href: "/sala-virtual", labelKey: "sidebar.virtualRoom", label: "Sala Virtual", icon: Video },
  { href: "/sessoes", labelKey: "sidebar.sessions", label: "Sessões", icon: ClipboardList },
  { href: "/questionarios", labelKey: "sidebar.questionnaires", label: "Questionários", icon: ClipboardList },
  { href: "/prontuarios", labelKey: "sidebar.records", label: "Prontuários", icon: FileText },
  { href: "/documentos", labelKey: "sidebar.documents", label: "Documentos", icon: FileType },
  { href: "/diario-emocoes", labelKey: "sidebar.emotionDiary", label: "Diário de Emoções", icon: Smile },
  { href: "/tarefas", labelKey: "sidebar.tasks", label: "Tarefas", icon: ListTodo },
  { href: "/notificacoes", labelKey: "sidebar.notifications", label: "Notificações", icon: Bell },
  { href: "/configuracoes", labelKey: "sidebar.settings", label: "Configurações", icon: Settings },
  { href: "/ajuda", labelKey: "sidebar.help", label: "Ajuda", icon: BookOpen },
  { href: "/blog", labelKey: "sidebar.blog", label: "Blog", icon: BookOpen },
]

const proMenuItems = [
  { href: "/financeiro", labelKey: "sidebar.financial", label: "Financeiro", icon: DollarSign },
  { href: "/cobrancas", labelKey: "sidebar.billing", label: "Cobranças", icon: Receipt },
  { href: "/comunicacao", labelKey: "sidebar.communication", label: "Comunicação", icon: MessageSquare },
  { href: "/relatorios", labelKey: "sidebar.reports", label: "Relatórios", icon: BarChart3 },
  { href: "/recibos", labelKey: "sidebar.receipts", label: "Recibos", icon: Receipt },
  { href: "/lista-espera", labelKey: "sidebar.waitingList", label: "Lista de Espera", icon: ClipboardList },
  { href: "/automacoes", labelKey: "sidebar.automations", label: "Automações", icon: Zap },
]

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const locale = getLocale()
  const isAdmin = session?.user?.role === "ADMIN"
  const isReceptionist = session?.user?.role === "RECEPTIONIST"
  const isClinicAdmin = (session?.user?.role === "CLINIC_ADMIN" || isAdmin) && session?.user?.plan === "clinica"
  const hasClinicPlan = session?.user?.plan === "clinica"

  const receptionMenuItems = [
    { href: "/recepcao", labelKey: "sidebar.reception", label: "Recepção", icon: ClipboardCheck },
    { href: "/configuracoes", labelKey: "sidebar.settings", label: "Configurações", icon: Settings },
  ]

  const isPaid = session?.user?.plan === "pro" || session?.user?.plan === "clinica"

  const clinicMenuItems = [
    ...baseMenuItems,
    ...proMenuItems,
    { href: "/outcomes", labelKey: "sidebar.outcomes", label: "Clinical Outcomes", icon: Brain },
    { href: "/recepcao", labelKey: "sidebar.reception", label: "Recepção", icon: ClipboardCheck },
    { href: "/clinica", labelKey: "sidebar.clinic", label: "Clínica", icon: Building2 },
  ]

  const proMenu = [...baseMenuItems, ...proMenuItems]

  const allMenuItems = isReceptionist
    ? receptionMenuItems
    : isClinicAdmin
      ? [...clinicMenuItems, { href: "/admin", labelKey: "sidebar.admin", label: "Admin", icon: Shield }]
      : isAdmin
        ? hasClinicPlan
          ? [...clinicMenuItems, { href: "/admin", labelKey: "sidebar.admin", label: "Admin", icon: Shield }]
          : isPaid
            ? [...proMenu, { href: "/admin", labelKey: "sidebar.admin", label: "Admin", icon: Shield }]
            : [...baseMenuItems, { href: "/admin", labelKey: "sidebar.admin", label: "Admin", icon: Shield }]
        : isPaid
          ? proMenu
          : baseMenuItems

  const sidebarContent = (
    <div className="flex h-full flex-col bg-background dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border-r relative">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/[0.03] to-transparent pointer-events-none" />
      <div className="flex h-16 items-center justify-between px-4 border-b relative">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-all duration-300 group-hover:scale-105 ring-2 ring-teal-500/20">
            <Image src="/logo.png" alt="PsiHumanis" width={40} height={40} className="w-full h-full object-cover" priority />
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-teal-600 to-teal-500 dark:from-teal-400 dark:to-teal-300 bg-clip-text text-transparent">
                PsiHumanis
              </span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Gestão em Psicologia</p>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden lg:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2 relative">
        <nav className="flex flex-col gap-1 px-3" data-tour="sidebar-menu">
          {allMenuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                data-tour={`sidebar-${item.href.split("/").pop()}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group/item",
                  !collapsed && "hover:pl-4",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5" />
                )}
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-teal-500 to-sky-500" />
                )}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0 relative",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground group-hover/item:bg-accent group-hover/item:text-foreground"
                )}>
                  <item.icon className="h-4 w-4" />
                  {item.href === "/sala-virtual" && <WaitingRoomBadge />}
                </div>
                {!collapsed && <span className="relative">{item.labelKey && item.labelKey.startsWith("sidebar.") ? t(item.labelKey, locale) : item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4 relative">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 p-4 text-white shadow-lg shadow-teal-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-teal-200" />
                <p className="text-sm font-semibold">CRP 04/52274</p>
              </div>
              <p className="text-xs text-teal-100/80 leading-relaxed">
                Mário Júnior · Gestalt-Terapia
              </p>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sair</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-700 shadow-lg shadow-teal-500/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col transition-[width] duration-300 ease-in-out",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
