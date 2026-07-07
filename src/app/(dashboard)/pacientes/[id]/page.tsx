"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn, getInitials, formatDate, calculateAge, formatCurrency } from "@/lib/utils"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, FileText, DollarSign, Pencil, Lock, ExternalLink, ClipboardList, Brain, Heart, Pill, Users, Leaf, Target, AlertCircle, BookHeart, CheckCircle2, CreditCard, Activity, History } from "lucide-react"
import Link from "next/link"

interface MedicalRecord {
  id: string
  title: string
  createdAt: string
  isConfidential: boolean
  type: string
}

interface PatientDetail {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  cpf?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  profession?: string | null
  city?: string | null
  state?: string | null
  observations?: string | null
  active: boolean
  medicalRecords?: MedicalRecord[]
}

interface TimelineItem {
  id: string
  type: "session" | "diary" | "questionnaire" | "task" | "payment"
  date: string
  title: string
  description: string
}

interface FinancialTransaction {
  id: string
  description: string
  amount: number
  dueDate?: string | null
  paymentStatus: string
  patientId: string
}

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [sessions, setSessions] = useState<unknown[]>([])
  const [financials, setFinancials] = useState<FinancialTransaction[]>([])
  const [questionnaireResponses, setQuestionnaireResponses] = useState<any[]>([])
  const [anamnese, setAnamnese] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [timelineLoading, setTimelineLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [patRes, transRes] = await Promise.all([
          fetch(`/api/pacientes/${params.id}`),
          fetch(`/api/financeiro`),
        ])
        if (patRes.ok) {
          const pat = await patRes.json()
          setPatient(pat)
        }
        if (transRes.ok) {
          const data = await transRes.json()
          setFinancials((data.transactions || []).filter((t: FinancialTransaction) => t.patientId === params.id))
        }
      } catch {}
      try {
        const [questRes, anamRes] = await Promise.all([
          fetch(`/api/pacientes/${params.id}/questionarios`),
          fetch(`/api/pacientes/${params.id}/anamnese`),
        ])
        if (questRes.ok) setQuestionnaireResponses(await questRes.json())
        if (anamRes.ok) setAnamnese(await anamRes.json())
      } catch {}
      setLoading(false)
    }
    load()
  }, [params.id])

  useEffect(() => {
    const items: TimelineItem[] = []
    async function loadTimeline() {
      try {
        const [sessRes, diaryRes, questRes, tasksRes, finRes] = await Promise.all([
          fetch(`/api/sessoes?pacienteId=${params.id}`),
          fetch(`/api/diario`),
          fetch(`/api/pacientes/${params.id}/questionarios`),
          fetch(`/api/pacientes/${params.id}/tarefas`),
          fetch(`/api/financeiro`),
        ])
        if (sessRes.ok) {
          const data = await sessRes.json()
          const sessions = data.data || []
          for (const s of sessions) {
            items.push({ id: `sess-${s.id}`, type: "session", date: s.date, title: "Sessão realizada", description: s.type || "Sessão clínica" })
          }
        }
        if (diaryRes.ok) {
          const entries = await diaryRes.json()
          for (const e of (Array.isArray(entries) ? entries : [])) {
            if (e.patientId === params.id) {
              items.push({ id: `diary-${e.id}`, type: "diary", date: e.date, title: "Registro no diário", description: `Humor: ${e.mood}/5` })
            }
          }
        }
        if (questRes.ok) {
          const qs = await questRes.json()
          for (const q of (Array.isArray(qs) ? qs : [])) {
            items.push({ id: `quest-${q.id}`, type: "questionnaire", date: q.completedAt || q.createdAt, title: q.questionnaire?.title || "Questionário", description: `Pontuação: ${q.totalScore}` })
          }
        }
        if (tasksRes.ok) {
          const ts = await tasksRes.json()
          for (const t of (Array.isArray(ts) ? ts : [])) {
            if (t.status === "COMPLETED") {
              items.push({ id: `task-${t.id}`, type: "task", date: t.completedAt || t.assignedAt, title: t.resource?.name || "Tarefa", description: "Tarefa concluída" })
            }
          }
        }
        if (finRes.ok) {
          const finData = await finRes.json()
          const trans = finData.transactions || []
          for (const t of trans) {
            if (t.patientId === params.id && t.paymentStatus === "PAID") {
              items.push({ id: `pay-${t.id}`, type: "payment", date: t.paymentDate || t.createdAt, title: t.description, description: `Valor: R$ ${Number(t.amount).toFixed(2)}` })
            }
          }
        }
      } catch {}
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setTimeline(items)
      setTimelineLoading(false)
    }
    loadTimeline()
  }, [params.id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-shimmer rounded-lg" />
          <div className="h-8 w-48 animate-shimmer rounded-lg" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-xl border p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full animate-shimmer" />
                <div className="space-y-2">
                  <div className="h-5 w-40 animate-shimmer rounded" />
                  <div className="h-4 w-28 animate-shimmer rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-16 animate-shimmer rounded" />
                    <div className="h-4 w-32 animate-shimmer rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 w-full animate-shimmer rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Paciente não encontrado</h2>
          <Button asChild><Link href="/pacientes">Voltar</Link></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/pacientes"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary/10 text-primary">{getInitials(patient.name)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{patient.name}</h2>
                <Badge variant={patient.active ? "success" : "secondary"}>
                  {patient.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} anos` : "-"} {patient.gender ? `• ${patient.gender}` : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/sessoes/modo?patient=${params.id}`}>
              <ClipboardList className="mr-2 h-4 w-4" /> Modo Sessão
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/pacientes/${params.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Editar</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle>Informações</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {patient.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{patient.email}</span></div>}
              {patient.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{patient.phone}</span></div>}
              {patient.city && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{patient.city}{patient.state ? `/${patient.state}` : ""}</span></div>}
              {patient.dateOfBirth && <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{formatDate(patient.dateOfBirth)}</span></div>}
            </div>
            <Separator />
            {patient.cpf && <div><p className="text-sm font-medium">CPF</p><p className="text-sm text-muted-foreground">{patient.cpf}</p></div>}
            {patient.profession && <div><p className="text-sm font-medium">Profissão</p><p className="text-sm text-muted-foreground">{patient.profession}</p></div>}
            {patient.observations && <><Separator /><div><p className="text-sm font-medium">Observações</p><p className="text-sm text-muted-foreground">{patient.observations}</p></div></>}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="financial">
            <TabsList>
              <TabsTrigger value="financial"><DollarSign className="mr-2 h-4 w-4" />Financeiro</TabsTrigger>
              <TabsTrigger value="records"><FileText className="mr-2 h-4 w-4" />Prontuários</TabsTrigger>
              <TabsTrigger value="questionnaires"><ClipboardList className="mr-2 h-4 w-4" />Questionários</TabsTrigger>
              <TabsTrigger value="anamnese"><Brain className="mr-2 h-4 w-4" />Anamnese</TabsTrigger>
              <TabsTrigger value="timeline"><History className="mr-2 h-4 w-4" />Linha do Tempo</TabsTrigger>
            </TabsList>

            <TabsContent value="financial" className="space-y-4">
              {financials.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground"><DollarSign className="mx-auto h-8 w-8 mb-2" /><p>Nenhuma transação financeira</p></CardContent></Card>
              ) : financials.map((fin: FinancialTransaction) => (
                <Card key={fin.id} className="card-hover">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{fin.description}</p>
                      <p className="text-sm text-muted-foreground">{fin.dueDate ? formatDate(fin.dueDate) : ""}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(fin.amount)}</p>
                      <Badge variant={fin.paymentStatus === "PAID" ? "success" : "warning"}>
                        {fin.paymentStatus === "PAID" ? "Pago" : "Pendente"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="records" className="space-y-4">
              {(!patient.medicalRecords || patient.medicalRecords.length === 0) ? (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <FileText className="mx-auto h-8 w-8 mb-2" />
                    <p>Nenhum prontuário encontrado</p>
                    <p className="text-xs mt-1">Prontuários são criados automaticamente ao encerrar uma sessão</p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href={`/prontuarios/novo?paciente=${params.id}`}>Criar Prontuário</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                patient.medicalRecords.map((rec: MedicalRecord) => (
                  <Link key={rec.id} href={`/prontuarios/${rec.id}`}>
                    <Card className="card-hover">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{rec.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(rec.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {rec.isConfidential && <Lock className="h-4 w-4 text-amber-500" />}
                          <Badge variant="secondary">{
                            rec.type === "SESSION_NOTE" ? "Nota de Sessão" :
                            rec.type === "ANAMNESIS" ? "Anamnese" :
                            rec.type === "EVOLUTION" ? "Evolução" :
                            rec.type === "DISCHARGE_SUMMARY" ? "Resumo de Alta" :
                            rec.type === "REPORT" ? "Relatório" : rec.type
                          }</Badge>
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </TabsContent>

            <TabsContent value="questionnaires" className="space-y-4">
              {questionnaireResponses.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground"><ClipboardList className="mx-auto h-8 w-8 mb-2" /><p>Nenhum questionário respondido</p></CardContent></Card>
              ) : (
                questionnaireResponses.map((r: any) => (
                  <Card key={r.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{r.questionnaire?.title || "Questionário"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(r.completedAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{r.totalScore}</p>
                          <Badge variant={r.severity === "Severa" || r.severity === "Moderadamente severa" ? "destructive" : r.severity === "Moderada" ? "warning" : "success"}>{r.severity}</Badge>
                        </div>
                      </div>
                      {r.answers?.length > 0 && (
                        <div className="space-y-1 mt-3 pt-3 border-t">
                          {r.answers.map((a: any) => (
                            <div key={a.id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{a.question?.questionText || "Pergunta"}</span>
                              <span className="font-medium ml-4">{a.value}/{a.question?.scaleMax || 3}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="anamnese" className="space-y-4">
              {!anamnese ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground"><Brain className="mx-auto h-8 w-8 mb-2" /><p>Anamnese não preenchida</p></CardContent></Card>
              ) : (
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {[
                      { key: "complaints", label: "Queixa Principal", icon: AlertCircle },
                      { key: "history", label: "Histórico", icon: Brain },
                      { key: "medications", label: "Medicações", icon: Pill },
                      { key: "allergies", label: "Alergias", icon: Heart },
                      { key: "familyHistory", label: "Histórico Familiar", icon: Users },
                      { key: "lifestyle", label: "Estilo de Vida", icon: Leaf },
                      { key: "expectations", label: "Expectativas", icon: Target },
                      { key: "previousTherapy", label: "Terapia Anterior", icon: Brain },
                    ].map(({ key, label, icon: Icon }) => (
                      anamnese[key] ? (
                        <div key={key}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="h-4 w-4 text-primary" />
                            <h4 className="font-medium text-sm">{label}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{anamnese[key]}</p>
                        </div>
                      ) : null
                    ))}
                    {anamnese.updatedAt && <p className="text-xs text-muted-foreground">Atualizado em {new Date(anamnese.updatedAt).toLocaleDateString("pt-BR")}</p>}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              {timelineLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4 animate-pulse">
                      <div className="w-3 h-3 rounded-full bg-muted mt-1.5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-48 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : timeline.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground"><History className="mx-auto h-8 w-8 mb-2" /><p>Nenhum registro encontrado</p></CardContent></Card>
              ) : (
                <div className="relative pl-6 space-y-0">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />
                  {timeline.map((item, index) => {
                    const dotColor = {
                      session: "bg-emerald-500",
                      diary: "bg-teal-500",
                      questionnaire: "bg-purple-500",
                      task: "bg-emerald-500",
                      payment: "bg-amber-500",
                    }[item.type]
                    const Icon = {
                      session: Activity,
                      diary: BookHeart,
                      questionnaire: ClipboardList,
                      task: CheckCircle2,
                      payment: CreditCard,
                    }[item.type]
                    return (
                      <div key={item.id} className="relative pb-6 last:pb-0 group">
                        <div className={cn("absolute -left-[19px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-background z-10", dotColor)} />
                        <Card className="card-hover transition-all group-hover:shadow-md ml-2">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5", {
                                "bg-emerald-100 dark:bg-emerald-900/30": item.type === "session",
                                "bg-teal-100 dark:bg-teal-900/30": item.type === "diary",
                                "bg-purple-100 dark:bg-purple-900/30": item.type === "questionnaire",
                                "bg-cyan-100 dark:bg-cyan-900/30": item.type === "task",
                                "bg-amber-100 dark:bg-amber-900/30": item.type === "payment",
                              })}>
                                <Icon className={cn("h-4 w-4", {
                                  "text-emerald-600": item.type === "session",
                                  "text-teal-600": item.type === "diary",
                                  "text-purple-600": item.type === "questionnaire",
                                  "text-cyan-600": item.type === "task",
                                  "text-amber-600": item.type === "payment",
                                })} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="font-medium text-sm">{item.title}</p>
                                  <span className="text-[11px] text-muted-foreground shrink-0">{new Date(item.date).toLocaleDateString("pt-BR")}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
