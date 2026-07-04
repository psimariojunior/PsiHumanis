"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials, formatDate, calculateAge } from "@/lib/utils"
import { Plus, Mail, Phone, MoreHorizontal, Trash2, Download } from "lucide-react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { PullToRefresh } from "@/components/pull-to-refresh"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"

interface Patient {
  id: string
  name: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  active: boolean
  createdAt: string
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = () => {
    const controller = new AbortController()
    setLoading(true)
    fetch("/api/pacientes", { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => setPatients(data.patients || []))
      .catch((err) => {
        if (err?.name === "AbortError") return
        toast.error("Erro ao carregar pacientes")
        setPatients([])
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }

  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "name",
      header: "Paciente",
      cell: ({ row }) => (
        <Link href={`/pacientes/${row.original.id}`} className="flex items-center gap-3 hover:underline">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {getInitials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.dateOfBirth ? `${calculateAge(row.original.dateOfBirth)} anos` : "-"} • {row.original.gender || ""}
            </p>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: "email",
      header: "Contato",
      cell: ({ row }) => (
        <div className="max-w-[200px] space-y-1">
          <div className="flex items-center gap-1 text-sm truncate">
            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{row.original.email || "-"}</span>
          </div>
          <div className="flex items-center gap-1 text-sm truncate">
            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="truncate">{row.original.phone || "-"}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Paciente desde",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.active ? "active" : "inactive"} />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/pacientes/${row.original.id}`}>Ver detalhes</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-shimmer rounded-lg" />
            <div className="h-4 w-56 animate-shimmer rounded-lg" />
          </div>
          <div className="h-9 w-36 animate-shimmer rounded-lg" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-4 border-b pb-3">
            <div className="h-4 w-1/4 animate-shimmer rounded" />
            <div className="h-4 w-1/4 animate-shimmer rounded" />
            <div className="h-4 w-1/6 animate-shimmer rounded" />
            <div className="h-4 w-1/6 animate-shimmer rounded" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 rounded-full animate-shimmer" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-40 animate-shimmer rounded" />
                  <div className="h-3 w-24 animate-shimmer rounded" />
                </div>
              </div>
              <div className="h-4 w-32 animate-shimmer rounded hidden md:block" />
              <div className="h-5 w-20 animate-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground">
            Gerencie seus pacientes e informações
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button asChild>
            <Link href="/pacientes/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Link>
          </Button>
          </div>
        </div>

      <PullToRefresh onRefresh={async () => { fetchPatients() }}>
      <DataTable
        columns={columns}
        data={patients}
        searchKey="name"
        searchPlaceholder="Buscar paciente..."
        renderMobileCard={(patient) => (
          <Link href={`/pacientes/${patient.id}`} className="block">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{patient.name}</p>
                  <Badge variant={patient.active ? "success" : "secondary"} className="text-[10px] shrink-0">
                    {patient.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <div className="mt-1 space-y-0.5">
                  {patient.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} anos` : ""}
                  {patient.gender ? ` · ${patient.gender}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={(e) => { e.preventDefault(); setDeleteTarget(patient) }}
                aria-label={`Excluir ${patient.name}`}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          </Link>
        )}
      />
      </PullToRefresh>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDeleteTarget(null)}>
          <div className="bg-background rounded-xl p-6 w-full max-w-md shadow-2xl border mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Excluir paciente</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>?
              Todos os dados associados (consultas, sessões, prontuários) serão removidos permanentemente.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={async () => {
                try {
                  const res = await fetch(`/api/pacientes/${deleteTarget.id}`, { method: "DELETE" })
                  if (!res.ok) throw new Error()
                  toast.success("Paciente excluído")
                  setPatients((prev) => prev.filter((p) => p.id !== deleteTarget.id))
                } catch {
                  toast.error("Erro ao excluir paciente")
                }
                setDeleteTarget(null)
              }}>
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
