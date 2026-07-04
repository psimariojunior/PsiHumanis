"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, FileText, Lock, Download, Printer, Trash2, Edit, Save, X } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { usePDFExport } from "@/hooks/use-pdf-export"
import { useSession } from "next-auth/react"

const typeLabels: Record<string, string> = {
  SESSION_NOTE: "Nota de Sessão",
  ANAMNESIS: "Anamnese",
  EVOLUTION: "Evolução",
  DISCHARGE_SUMMARY: "Resumo de Alta",
  REPORT: "Relatório",
  THERAPEUTIC_PLAN: "Plano Terapêutico",
  EXAM_RESULT: "Resultado de Exame",
  CONTRACT: "Contrato",
  OTHER: "Outro",
}

interface RecordData {
  id: string
  title: string
  type: string
  isConfidential: boolean
  content: string
  createdAt: string
  patient: { id: string; name: string }
}

export default function RecordDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: session } = useSession()
  const { generatePDF } = usePDFExport()
  const [record, setRecord] = useState<RecordData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", content: "", type: "", isConfidential: false })

  function loadRecord() {
    setLoading(true)
    fetch(`/api/records/${params.id}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => {
        setRecord(data)
        setEditForm({ title: data.title, content: data.content, type: data.type, isConfidential: data.isConfidential })
      })
      .catch(() => toast.error("Erro ao carregar prontuário"))
      .finally(() => setLoading(false))
  }

  useEffect(loadRecord, [params.id])

  function startEdit() {
    if (record) {
      setEditForm({ title: record.title, content: record.content, type: record.type, isConfidential: record.isConfidential })
      setEditing(true)
    }
  }

  async function saveEdit() {
    setSaving(true)
    try {
      const res = await fetch(`/api/records/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      if (!res.ok) throw new Error()
      toast.success("Prontuário atualizado!")
      setEditing(false)
      loadRecord()
    } catch {
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  async function deleteRecord() {
    setDeleting(true)
    try {
      const res = await fetch(`/api/records/${params.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Prontuário excluído!")
      router.push("/prontuarios")
    } catch {
      toast.error("Erro ao excluir")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-shimmer rounded-lg" />
          <div className="h-8 w-52 animate-shimmer rounded-lg" />
        </div>
        <div className="rounded-xl border p-8 space-y-6">
          <div className="space-y-2">
            <div className="h-5 w-40 animate-shimmer rounded" />
            <div className="h-4 w-64 animate-shimmer rounded" />
          </div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-4 w-full animate-shimmer rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Prontuário não encontrado</p>
      </div>
    )
  }

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Editar Prontuário</h2>
              <p className="text-muted-foreground">{record.patient.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}>
              <X className="mr-2 h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving ? <><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar</>}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro Clínico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={editForm.type} onValueChange={(v) => setEditForm({ ...editForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea value={editForm.content} onChange={(e) => setEditForm({ ...editForm, content: e.target.value })} rows={16} className="font-mono text-sm" />
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Switch checked={editForm.isConfidential} onCheckedChange={(v) => setEditForm({ ...editForm, isConfidential: v })} />
              <div>
                <p className="text-sm font-medium">Prontuário Confidencial</p>
                <p className="text-xs text-muted-foreground">Apenas você terá acesso</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prontuarios">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{record.title}</h2>
              <Badge variant="secondary">{typeLabels[record.type] || record.type}</Badge>
              {record.isConfidential && (
                <Badge variant="warning">
                  <Lock className="mr-1 h-3 w-3" />
                  Confidencial
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {record.patient.name} • {formatDate(record.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startEdit}><Edit className="mr-2 h-4 w-4" /> Editar</Button>
          <Button variant="outline" size="sm" onClick={() => {
            if (!record) return
            generatePDF({
              title: record.title,
              patientName: record.patient.name,
              psychologistName: (session?.user as any)?.name || "Psicólogo",
              crp: (session?.user as any)?.crp || "00000",
              sections: [{ heading: typeLabels[record.type] || record.type, content: record.content }],
              date: new Date().toLocaleDateString("pt-BR")
            }).then((filename) => toast.success(`PDF gerado: ${filename}`))
          }}><Download className="mr-2 h-4 w-4" /> PDF</Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> Imprimir</Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Excluir</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir prontuário?</DialogTitle>
                <DialogDescription>Esta ação não pode ser desfeita. O prontuário será permanentemente removido.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={(e) => { const btn = e.currentTarget.closest('[role="dialog"]')?.querySelector("button.absolute"); if (btn) (btn as HTMLButtonElement).click(); }}>Cancelar</Button>
                <Button variant="destructive" onClick={deleteRecord} disabled={deleting}>
                  {deleting ? "Excluindo..." : "Excluir"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registro Clínico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap">{record.content}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Paciente: <strong>{record.patient.name}</strong></span>
        </div>
        <span>ID: {record.id}</span>
      </div>
    </div>
  )
}
