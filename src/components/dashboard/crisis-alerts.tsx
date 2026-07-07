"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Bell, Eye, Phone, Mail, Clock, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface CrisisAlert {
  id: string
  title: string
  message: string
  status: string
  readAt: string | null
  createdAt: string
  patient: {
    id: string
    name: string
    email: string | null
    phone: string | null
  } | null
}

export function CrisisAlerts() {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(true)
  const [markingRead, setMarkingRead] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchAlerts()
  }, [])

  async function fetchAlerts() {
    try {
      const res = await fetch("/api/crisis-alerts?unread=true")
      if (res.ok) {
        const data = await res.json()
        setAlerts(Array.isArray(data) ? data : [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function markAsRead(id: string) {
    setMarkingRead((prev) => new Set(prev).add(id))
    try {
      const res = await fetch("/api/crisis-alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id))
        toast.success("Alerta marcado como lido")
      }
    } catch {
      toast.error("Erro ao marcar alerta")
    } finally {
      setMarkingRead((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  if (loading) return null
  if (alerts.length === 0) return null

  return (
    <Card className="border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/50">
              <AlertTriangle className="h-4 w-4" />
            </div>
            Alertas de Crise
            <Badge className="bg-red-500 text-white ml-1">{alerts.length}</Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white dark:bg-red-950/20 rounded-xl p-4 ring-1 ring-red-200 dark:ring-red-800/50 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">
                      {alert.title}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{alert.message}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              {alert.patient && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Link
                    href={`/pacientes/${alert.patient.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {alert.patient.name}
                  </Link>
                  {alert.patient.phone && (
                    <a
                      href={`tel:${alert.patient.phone}`}
                      className="flex items-center gap-1 text-muted-foreground hover:text-green-600 transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {alert.patient.phone}
                    </a>
                  )}
                  {alert.patient.email && (
                    <a
                      href={`mailto:${alert.patient.email}`}
                      className="flex items-center gap-1 text-muted-foreground hover:text-blue-600 transition-colors"
                    >
                      <Mail className="h-3 w-3" />
                      {alert.patient.email}
                    </a>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Link
                  href={`/diario-emocoes`}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Ver diário
                </Link>
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30"
                  onClick={() => markAsRead(alert.id)}
                  disabled={markingRead.has(alert.id)}
                >
                  {markingRead.has(alert.id) ? "Marcando..." : "Marcar como lido"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  )
}
