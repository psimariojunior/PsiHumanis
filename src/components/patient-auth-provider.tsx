"use client"

import { useEffect, useState, createContext, useContext, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import Link from "next/link"
import Image from "next/image"
import { CommandPalette } from "@/components/command-palette"
import { PushNotificationPrompt } from "@/components/push-notification-prompt"
import { Capacitor } from "@capacitor/core"
import { registerForPushNotifications, setupPushNotificationListeners } from "@/lib/capacitor-push"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, BookHeart, CalendarDays, History, User, LayoutDashboard, Receipt, Sun, Moon, Menu, X, ClipboardList, FileText, ShieldAlert, FileCheck, ListChecks } from "lucide-react"

export interface PatientData {
  id: string
  psychologistId: string
  name: string
  email: string | null
  phone: string | null
  cpf: string | null
  rg: string | null
  dateOfBirth: string | null
  gender: string | null
  maritalStatus: string | null
  profession: string | null
  company: string | null
  address: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  healthInsurance: string | null
  insuranceNumber: string | null
  referredBy: string | null
  howFound: string | null
  observations: string | null
  photoUrl: string | null
  createdAt: string
}

interface PatientAuthContextType {
  patient: PatientData | null
  token: string | null
  login: (token: string, patient: PatientData) => void
  logout: () => void
  loading: boolean
}

const PatientAuthContext = createContext<PatientAuthContextType>({
  patient: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: true,
})

export const usePatientAuth = () => useContext(PatientAuthContext)

export function PatientAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const storedToken = localStorage.getItem("patient_token")
    if (!storedToken) {
      setLoading(false)
      return
    }

    setToken(storedToken)

    if (Capacitor.isNativePlatform()) {
      setupPushNotificationListeners()
      registerForPushNotifications().then((pushToken) => {
        if (pushToken) {
          fetch("/api/pacientes/push-register", {
            method: "POST",
            headers: { Authorization: `Bearer ${storedToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ pushToken, platform: Capacitor.getPlatform() }),
          }).catch(() => {})
        }
      })
    }

    fetch("/api/pacientes/me", {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data) => setPatient(data))
      .catch(() => {
        // Token invalid or server unavailable — keep token and let pages handle 401
      })
      .finally(() => setLoading(false))
  }, [])

  const login = (newToken: string, data: PatientData) => {
    localStorage.setItem("patient_token", newToken)
    setToken(newToken)
    setPatient(data)
  }

  const logout = () => {
    localStorage.removeItem("patient_token")
    setToken(null)
    setPatient(null)
    router.push("/paciente/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const authPages = ["/paciente/login", "/paciente/cadastro", "/paciente/recuperar-senha", "/paciente/reset-password"]
  const publicPages = ["/paciente/questionarios", "/paciente/anamnese", "/paciente/protocolos-crise", "/paciente/consentimento", "/paciente/tarefas"]
  const isAuthPage = authPages.includes(pathname)
  const isPublicPage = isAuthPage || publicPages.includes(pathname) || pathname.startsWith("/paciente/questionarios/")

  if (!patient && !isPublicPage) {
    router.push("/paciente/login")
    return null
  }

  if (patient && isAuthPage) {
    router.push("/paciente")
    return null
  }

  return (
    <PatientAuthContext.Provider value={{ patient, token, login, logout, loading }}>
      <div className="min-h-screen bg-background">
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        {patient && (
          <>
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:bg-accent transition-all"
                  aria-label="Menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <Link href="/paciente" className="flex items-center gap-2 group">
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-teal-500 to-teal-700 shadow-md shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-all duration-300 group-hover:scale-105 ring-2 ring-teal-500/20">
                    <Image src="/logo.png" alt="PsiHumanis" width={36} height={36} className="w-full h-full object-cover" priority />
                  </div>
                  <span className="text-foreground font-semibold text-sm">PsiHumanis</span>
                </Link>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                  aria-label="Alternar tema"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </button>
                <nav className="hidden sm:flex items-center gap-1">
                  <Link href="/paciente" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    pathname === "/paciente" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                  }`}>
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Início
                  </Link>
                  <Link href="/paciente/agenda" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    pathname === "/paciente/agenda" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                  }`}>
                    <CalendarDays className="h-3.5 w-3.5" />
                    Agenda
                  </Link>
                  <Link href="/paciente/diario" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    pathname === "/paciente/diario" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                  }`}>
                    <BookHeart className="h-3.5 w-3.5" />
                    Diário
                  </Link>
                  <Link href="/paciente/historico" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    pathname === "/paciente/historico" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                  }`}>
                    <History className="h-3.5 w-3.5" />
                    Histórico
                  </Link>
                  <Link href="/paciente/meus-dados" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    pathname === "/paciente/meus-dados" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                  }`}>
                    <User className="h-3.5 w-3.5" />
                    Meus Dados
                  </Link>
                  <Link href="/paciente/faturas" className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    pathname === "/paciente/faturas" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                  }`}>
                    <Receipt className="h-3.5 w-3.5" />
                    Faturas
                  </Link>
                </nav>
                <span className="hidden sm:block text-muted-foreground text-sm">{patient.name}</span>
                <button onClick={logout} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Sair
                </button>
              </div>
            </div>
          </header>

          {mobileMenuOpen && (
            <div className="sm:hidden fixed inset-0 z-30 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
              <nav className="absolute top-14 left-0 right-0 bg-background border-b border-border shadow-lg p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
                <p className="text-xs text-muted-foreground px-3 py-2">Olá, {patient.name.split(" ")[0]}</p>
                {[
                  { href: "/paciente", icon: LayoutDashboard, label: "Início" },
                  { href: "/paciente/agenda", icon: CalendarDays, label: "Agenda" },
                  { href: "/paciente/diario", icon: BookHeart, label: "Diário" },
                  { href: "/paciente/historico", icon: History, label: "Histórico" },
                  { href: "/paciente/meus-dados", icon: User, label: "Meus Dados" },
                  { href: "/paciente/faturas", icon: Receipt, label: "Faturas" },
                  { href: "/paciente/tarefas", icon: ClipboardList, label: "Tarefas" },
                  { href: "/paciente/questionarios", icon: ListChecks, label: "Questionários" },
                  { href: "/paciente/anamnese", icon: FileText, label: "Anamnese" },
                  { href: "/paciente/protocolos-crise", icon: ShieldAlert, label: "Protocolos de Crise" },
                  { href: "/paciente/consentimento", icon: FileCheck, label: "Consentimento" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      pathname === href ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
          </>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    <PushNotificationPrompt /></PatientAuthContext.Provider>
  )
}
