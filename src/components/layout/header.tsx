"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"
import { Menu, LogOut, User, Settings, Moon, Sun, Search } from "lucide-react"
import { NotificationDropdown } from "@/components/comunicacao/notification-dropdown"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onMenuClick: () => void
  onPaletteOpen?: () => void
}

export function Header({ onMenuClick, onPaletteOpen }: HeaderProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite"

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-xl transition-all duration-200",
        scrolled && "shadow-sm"
      )}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative pl-3 border-l-2 border-teal-500/30">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{greeting}, {session?.user?.name?.split(" ")[0] || "Psicólogo"}</h1>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
              </span>
            </div>
            <p className="text-xs text-muted-foreground">CRP 04/52274</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPaletteOpen}
            className="hidden sm:flex"
            aria-label="Abrir paleta de comandos"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPaletteOpen}
            className="hidden lg:flex items-center gap-2 h-9 text-xs text-muted-foreground"
            aria-label="Abrir paleta de comandos"
          >
            <Search className="h-3.5 w-3.5" />
            Buscar...
            <kbd className="ml-1 rounded border bg-muted px-1 py-0.5 text-[10px] font-mono">⌘K</kbd>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(session?.user?.name || "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{session?.user?.name}</span>
                  <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/configuracoes" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuracoes" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                localStorage.removeItem("psihumanis-psy-credentials")
                localStorage.removeItem("psihumanis-psy-biometric-enabled")
                signOut()
              }} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
