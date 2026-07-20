"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog"
import { cn, formatDate } from "@/lib/utils"
import { BookOpen, Brain, FileText, Filter, Plus, Search, Sparkles, Tags, User, X, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

interface TherapyResource {
  id: string
  name: string
  description: string | null
  type: string
  content: string | null
  category: string | null
  tags: string | null
  isPublic: boolean
  createdAt: string
}

interface Patient {
  id: string
  name: string
}

const typeLabels: Record<string, string> = {
  CBT_EXERCISE: "Exercício TCC",
  PSYCHOEDUCATION: "Psicoeducação",
  MEDITATION: "Meditação",
  WORKSHEET: "Planilha",
  OTHER: "Outro",
}

const typeColors: Record<string, string> = {
  CBT_EXERCISE: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  PSYCHOEDUCATION: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  MEDITATION: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  WORKSHEET: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

const typeIcons: Record<string, typeof Brain> = {
  CBT_EXERCISE: Brain,
  PSYCHOEDUCATION: BookOpen,
  MEDITATION: Sparkles,
  WORKSHEET: FileText,
  OTHER: FileText,
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

export default function RecursosTerapeuticosPage() {
  const [resources, setResources] = useState<TherapyResource[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignResourceId, setAssignResourceId] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [assignLoading, setAssignLoading] = useState(false)
  const [assignNotes, setAssignNotes] = useState("")

  const [form, setForm] = useState({ name: "", description: "", type: "", content: "", category: "", tags: "" })
  const [submitting, setSubmitting] = useState(false)

  const loadResources = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (filterType && filterType !== "all") params.set("type", filterType)
      const res = await fetch(`/api/recursos-terapeuticos?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResources(Array.isArray(data) ? data : data.data || [])
    } catch {
      toast.error("Erro ao carregar recursos")
    } finally {
      setLoading(false)
    }
  }, [search, filterType])

  useEffect(() => { loadResources() }, [loadResources])

  useEffect(() => {
    if (!search && !filterType) return
    const timer = setTimeout(() => loadResources(), 300)
    return () => clearTimeout(timer)
  }, [search, filterType, loadResources])

  async function handleCreate() {
    if (!form.name.trim() || !form.type) { toast.error("Nome e tipo são obrigatórios"); return }
    setSubmitting(true)
    try {
      const res = await fetch("/api/recursos-terapeuticos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success("Recurso criado com sucesso")
      setCreateOpen(false)
      setForm({ name: "", description: "", type: "", content: "", category: "", tags: "" })
      loadResources()
    } catch {
      toast.error("Erro ao criar recurso")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAssign() {
    if (!assignResourceId || !selectedPatient) { toast.error("Selecione um paciente"); return }
    setAssignLoading(true)
    try {
      const res = await fetch(`/api/pacientes/${selectedPatient}/tarefas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId: assignResourceId, notes: assignNotes.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erro ao atribuir")
      }
      toast.success("Recurso atribuído ao paciente")
      setAssignOpen(false)
      setSelectedPatient("")
      setAssignResourceId(null)
      setAssignNotes("")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao atribuir recurso")
    } finally {
      setAssignLoading(false)
    }
  }

  function openAssign(resourceId: string) {
    setAssignResourceId(resourceId)
    setAssignNotes("")
    setAssignOpen(true)
    if (patients.length === 0) {
      fetch("/api/pacientes")
        .then(r => r.json())
        .then(data => setPatients(data.patients || []))
        .catch(() => toast.error("Erro ao carregar pacientes"))
    }
  }

  const filtered = resources.filter(r => {
    if (search) {
      const q = search.toLowerCase()
      if (!r.name.toLowerCase().includes(q) && !(r.description || "").toLowerCase().includes(q) && !(r.tags || "").toLowerCase().includes(q)) return false
    }
    if (filterType && filterType !== "all" && r.type !== filterType) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recursos Terapêuticos</h2>
          <p className="text-muted-foreground">Biblioteca de materiais para usar com seus pacientes</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Novo Recurso</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Criar Recurso Terapêutico</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Respiração Guiada" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CBT_EXERCISE">Exercício TCC</SelectItem>
                    <SelectItem value="PSYCHOEDUCATION">Psicoeducação</SelectItem>
                    <SelectItem value="MEDITATION">Meditação</SelectItem>
                    <SelectItem value="WORKSHEET">Planilha</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Ex: Ansiedade, Depressão" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Breve descrição do recurso" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea id="content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} placeholder="Conteúdo completo do recurso..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input id="tags" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="ansiedade, respiração, relaxamento" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9" placeholder="Buscar recursos..." />
        </div>
        <Select value={filterType} onValueChange={v => setFilterType(v)}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="CBT_EXERCISE">Exercício TCC</SelectItem>
            <SelectItem value="PSYCHOEDUCATION">Psicoeducação</SelectItem>
            <SelectItem value="MEDITATION">Meditação</SelectItem>
            <SelectItem value="WORKSHEET">Planilha</SelectItem>
            <SelectItem value="OTHER">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg animate-shimmer" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-3/4 animate-shimmer rounded" />
                  <div className="h-3 w-1/2 animate-shimmer rounded" />
                </div>
              </div>
              <div className="h-3 w-full animate-shimmer rounded" />
              <div className="h-3 w-2/3 animate-shimmer rounded" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg font-medium mb-1">Nenhum recurso encontrado</p>
            <p className="text-sm mb-4">Crie seu primeiro recurso terapêutico</p>
            <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />Criar Recurso</Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => {
            const Icon = typeIcons[resource.type] || FileText
            const isExpanded = expandedId === resource.id
            return (
              <motion.div key={resource.id} variants={itemVariants}>
                <Card className={cn("card-hover cursor-pointer transition-all", isExpanded && "ring-2 ring-primary/20")}>
                  <CardContent className="p-5" onClick={() => setExpandedId(isExpanded ? null : resource.id)}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-md shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{resource.name}</h3>
                          <Badge className={cn("shrink-0 text-[10px] px-1.5 py-0", typeColors[resource.type] || "bg-gray-100")}>
                            {typeLabels[resource.type] || resource.type}
                          </Badge>
                        </div>
                        {resource.category && (
                          <p className="text-xs text-muted-foreground">{resource.category}</p>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                    </div>

                    {resource.description && !isExpanded && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                    )}

                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t">
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        )}
                        {resource.content && (
                          <div className="text-sm bg-muted/50 rounded-lg p-3 whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {resource.content}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          {resource.tags?.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                            <span key={tag} className="inline-flex items-center text-[11px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                              <Tags className="h-3 w-3 mr-1" />{tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-muted-foreground">Criado em {formatDate(resource.createdAt)}</span>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={e => { e.stopPropagation(); openAssign(resource.id) }}>
                            <User className="mr-1.5 h-3.5 w-3.5" />Atribuir
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <Dialog open={assignOpen} onOpenChange={v => { setAssignOpen(v); if (!v) setAssignResourceId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Atribuir Recurso ao Paciente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Instruções para o paciente (opcional)</Label>
              <Textarea
                value={assignNotes}
                onChange={e => setAssignNotes(e.target.value)}
                rows={3}
                placeholder="Ex: Faça este exercício 2 vezes por semana antes de dormir"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setAssignOpen(false); setAssignResourceId(null) }}>Cancelar</Button>
              <Button onClick={handleAssign} disabled={assignLoading || !selectedPatient}>
                {assignLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Atribuir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
