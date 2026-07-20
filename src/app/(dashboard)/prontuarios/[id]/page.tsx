"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, FileText, Lock, Download, Printer, Trash2, Edit, Save, X, CheckCircle, Heart } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { usePDFExport } from "@/hooks/use-pdf-export"
import { useSession } from "next-auth/react"
import { RichTextEditor } from "@/components/prontuario/rich-text-editor"

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

const moodEmoji = (m: number | null | undefined) => {
  if (m == null) return null
  if (m <= 3) return "😔"
  if (m <= 5) return "😐"
  if (m <= 7) return "🙂"
  return "😊"
}

interface SessionData {
  id: string
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  notes: string | null
  moodBefore: number | null
  moodAfter: number | null
  tags: string | null
  type: string | null
  startedAt: string | null
  endedAt: string | null
  duration: number | null
  isRemote: boolean
}

interface RecordData {
  id: string
  title: string
  type: string
  isConfidential: boolean
  content: string
  createdAt: string
  sessionId: string | null
  patient: { id: string; name: string; cpf?: string | null; phone?: string | null; email?: string | null; dateOfBirth?: string | null; gender?: string | null }
  session: SessionData | null
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
  const [soapForm, setSoapForm] = useState({
    subjective: "", objective: "", assessment: "", plan: "", notes: "",
    moodBefore: "", moodAfter: "", tags: "",
  })
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editFormRef = useRef(editForm)
  const soapFormRef = useRef(soapForm)
  editFormRef.current = editForm
  soapFormRef.current = soapForm

  function loadRecord() {
    setLoading(true)
    fetch(`/api/records/${params.id}`)
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => {
        setRecord(data)
        setEditForm({ title: data.title, content: data.content, type: data.type, isConfidential: data.isConfidential })
        if (data.session) {
          setSoapForm({
            subjective: data.session.subjective || "",
            objective: data.session.objective || "",
            assessment: data.session.assessment || "",
            plan: data.session.plan || "",
            notes: data.session.notes || "",
            moodBefore: data.session.moodBefore ? String(data.session.moodBefore) : "",
            moodAfter: data.session.moodAfter ? String(data.session.moodAfter) : "",
            tags: data.session.tags || "",
          })
        }
      })
      .catch(() => toast.error("Erro ao carregar prontuário"))
      .finally(() => setLoading(false))
  }

  useEffect(loadRecord, [params.id])

  const autoSave = useCallback(async () => {
    if (!editing || !record) return
    setAutoSaveStatus("saving")
    try {
      const body: Record<string, unknown> = {
        title: editFormRef.current.title,
        content: editFormRef.current.content,
        type: editFormRef.current.type,
        isConfidential: editFormRef.current.isConfidential,
      }
      if (record.sessionId) {
        const sf = soapFormRef.current
        body.subjective = sf.subjective
        body.objective = sf.objective
        body.assessment = sf.assessment
        body.plan = sf.plan
        body.notes = sf.notes
        body.moodBefore = sf.moodBefore ? parseInt(sf.moodBefore) : null
        body.moodAfter = sf.moodAfter ? parseInt(sf.moodAfter) : null
        body.tags = sf.tags
      }
      const res = await fetch(`/api/records/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      setAutoSaveStatus("saved")
      setTimeout(() => setAutoSaveStatus("idle"), 2000)
    } catch {
      setAutoSaveStatus("idle")
    }
  }, [editing, params.id, record])

  function markDirty(newForm?: typeof editForm, newSoap?: typeof soapForm) {
    if (newForm) setEditForm(newForm)
    if (newSoap) setSoapForm(newSoap)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(autoSave, 3000)
  }

  useEffect(() => {
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [autoSave])

  function startEdit() {
    if (record) {
      setEditForm({ title: record.title, content: record.content, type: record.type, isConfidential: record.isConfidential })
      if (record.session) {
        setSoapForm({
          subjective: record.session.subjective || "",
          objective: record.session.objective || "",
          assessment: record.session.assessment || "",
          plan: record.session.plan || "",
          notes: record.session.notes || "",
          moodBefore: record.session.moodBefore ? String(record.session.moodBefore) : "",
          moodAfter: record.session.moodAfter ? String(record.session.moodAfter) : "",
          tags: record.session.tags || "",
        })
      }
      setEditing(true)
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

  const isSessionNote = !!record.sessionId && !!record.session

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => { setEditing(false); loadRecord() }}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Editar Prontuário</h2>
              <p className="text-muted-foreground">{record.patient.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {autoSaveStatus === "saving" && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Salvando...
              </span>
            )}
            {autoSaveStatus === "saved" && (
              <span className="text-xs text-emerald-600 flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" />
                Salvo
              </span>
            )}
            <Button variant="outline" onClick={() => { setEditing(false); loadRecord() }}>
              <X className="mr-2 h-4 w-4" /> Fechar
            </Button>
            <Button onClick={autoSave} disabled={autoSaveStatus === "saving"}>
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {isSessionNote ? "Prontuário SOAP" : "Registro Clínico"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input value={editForm.title} onChange={(e) => markDirty({ ...editForm, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={editForm.type} onValueChange={(v) => markDirty({ ...editForm, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isSessionNote ? (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white bg-teal-600 shadow-sm">S</span>
                    Subjetivo — Relato do paciente
                  </Label>
                  <RichTextEditor
                    value={soapForm.subjective}
                    onChange={(v) => markDirty(undefined, { ...soapForm, subjective: v })}
                    placeholder="O que o paciente trouxe? Queixas, sentimentos, percepções..."
                    minHeight="120px"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white bg-emerald-600 shadow-sm">O</span>
                    Objetivo — Observações do psicólogo
                  </Label>
                  <RichTextEditor
                    value={soapForm.objective}
                    onChange={(v) => markDirty(undefined, { ...soapForm, objective: v })}
                    placeholder="O que você observou? Comportamento, aparência, interação..."
                    minHeight="120px"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white bg-amber-600 shadow-sm">A</span>
                    Avaliação — Análise clínica
                  </Label>
                  <RichTextEditor
                    value={soapForm.assessment}
                    onChange={(v) => markDirty(undefined, { ...soapForm, assessment: v })}
                    placeholder="Diagnóstico, progresso, insights, interpretação..."
                    minHeight="120px"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white bg-purple-600 shadow-sm">P</span>
                    Plano — Próximos passos
                  </Label>
                  <RichTextEditor
                    value={soapForm.plan}
                    onChange={(v) => markDirty(undefined, { ...soapForm, plan: v })}
                    placeholder="Intervenções, tarefas, encaminhamentos, conduta..."
                    minHeight="120px"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observações Gerais</Label>
                  <RichTextEditor
                    value={soapForm.notes}
                    onChange={(v) => markDirty(undefined, { ...soapForm, notes: v })}
                    placeholder="Informações adicionais relevantes..."
                    minHeight="100px"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Humor Pré {soapForm.moodBefore && <span className="text-lg">{moodEmoji(parseInt(soapForm.moodBefore))}</span>}
                    </Label>
                    <Select value={soapForm.moodBefore} onValueChange={(v) => markDirty(undefined, { ...soapForm, moodBefore: v })}>
                      <SelectTrigger><SelectValue placeholder="--" /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n} - {n <= 3 ? "Muito baixo" : n <= 5 ? "Baixo" : n <= 7 ? "Bom" : "Ótimo"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      Humor Pós {soapForm.moodAfter && <span className="text-lg">{moodEmoji(parseInt(soapForm.moodAfter))}</span>}
                    </Label>
                    <Select value={soapForm.moodAfter} onValueChange={(v) => markDirty(undefined, { ...soapForm, moodAfter: v })}>
                      <SelectTrigger><SelectValue placeholder="--" /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n} - {n <= 3 ? "Muito baixo" : n <= 5 ? "Baixo" : n <= 7 ? "Bom" : "Ótimo"}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input value={soapForm.tags} onChange={(e) => markDirty(undefined, { ...soapForm, tags: e.target.value })} placeholder="ansiedade, autoestima..." />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label>Conteúdo</Label>
                <RichTextEditor
                  value={editForm.content}
                  onChange={(v) => markDirty({ ...editForm, content: v })}
                  placeholder="Escreva o conteúdo do prontuário..."
                  minHeight="320px"
                />
              </div>
            )}

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Switch checked={editForm.isConfidential} onCheckedChange={(v) => markDirty({ ...editForm, isConfidential: v })} />
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
            const sections = isSessionNote && record.session ? [
              record.session.subjective && { heading: "Subjetivo", content: record.session.subjective },
              record.session.objective && { heading: "Objetivo", content: record.session.objective },
              record.session.assessment && { heading: "Avaliação", content: record.session.assessment },
              record.session.plan && { heading: "Plano", content: record.session.plan },
              record.session.notes && { heading: "Observações", content: record.session.notes },
            ].filter(Boolean) as { heading: string; content: string }[] : [
              { heading: typeLabels[record.type] || record.type, content: record.content }
            ]
            generatePDF({
              title: record.title,
              patientName: record.patient.name,
              psychologistName: (session?.user as any)?.name || "Psicólogo",
              crp: (session?.user as any)?.crp || "00000",
              sections,
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

      {isSessionNote && record.session ? (
        <div className="space-y-4">
          {(record.session.moodBefore || record.session.moodAfter) && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <Heart className="h-4 w-4 text-rose-400" />
                  {record.session.moodBefore && (
                    <span className="text-sm">
                      Humor Pré: <strong>{record.session.moodBefore}/10</strong> <span className="text-lg">{moodEmoji(record.session.moodBefore)}</span>
                    </span>
                  )}
                  {record.session.moodAfter && (
                    <span className="text-sm">
                      Humor Pós: <strong>{record.session.moodAfter}/10</strong> <span className="text-lg">{moodEmoji(record.session.moodAfter)}</span>
                    </span>
                  )}
                  {record.session.moodBefore && record.session.moodAfter && (
                    <Badge variant={record.session.moodAfter > record.session.moodBefore ? "default" : record.session.moodAfter < record.session.moodBefore ? "destructive" : "secondary"}>
                      {record.session.moodAfter > record.session.moodBefore ? "↑ Melhora" : record.session.moodAfter < record.session.moodBefore ? "↓ Piora" : "→ Estável"}
                    </Badge>
                  )}
                  {record.session.tags && (
                    <span className="text-xs text-muted-foreground ml-auto">Tags: {record.session.tags}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {[
            { letter: "S", label: "Subjetivo", content: record.session.subjective, color: "bg-teal-600" },
            { letter: "O", label: "Objetivo", content: record.session.objective, color: "bg-emerald-600" },
            { letter: "A", label: "Avaliação", content: record.session.assessment, color: "bg-amber-600" },
            { letter: "P", label: "Plano", content: record.session.plan, color: "bg-purple-600" },
          ].map((field) => (
            <Card key={field.letter}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white ${field.color} shadow-sm`}>
                    {field.letter}
                  </span>
                  {field.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {field.content ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: field.content }} />
                  </div>
                ) : (
                  <p className="text-muted-foreground/50 text-sm italic">Não preenchido</p>
                )}
              </CardContent>
            </Card>
          ))}

          {record.session.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Observações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: record.session.notes }} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Registro Clínico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: record.content }} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Paciente: <strong>{record.patient.name}</strong></span>
          {isSessionNote && record.session?.duration && (
            <span>Duração: <strong>{Math.floor(record.session.duration / 60)}min</strong></span>
          )}
        </div>
        <span>ID: {record.id}</span>
      </div>
    </div>
  )
}
