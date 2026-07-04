"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Mail, Shield, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

export default function DataDeletionPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/pacientes/lgpd-delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        toast.error("Erro ao enviar solicitação")
      }
    } catch {
      toast.error("Erro ao enviar solicitação")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-4">
              <Trash2 className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-xl">Solicitar Exclusão de Dados</CardTitle>
            <p className="text-sm text-muted-foreground">
              PsiHumanis — exclusão de conta e dados pessoais
            </p>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h3 className="text-lg font-semibold">Solicitação enviada</h3>
                <p className="text-sm text-muted-foreground">
                  Recebemos sua solicitação de exclusão de dados. Em até 15 dias úteis, todos os seus dados pessoais serão excluídos permanentemente do sistema.
                </p>
                <p className="text-xs text-muted-foreground">
                  Você receberá um email de confirmação em <strong>{email}</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">O que será excluído:</p>
                  <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-300">
                    <li>• Dados pessoais (nome, email, CPF, telefone)</li>
                    <li>• Prontuários e registros clínicos</li>
                    <li>• Diário de emoções e questionários</li>
                    <li>• Histórico de consultas</li>
                    <li>• Dados de pagamento</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email da conta</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="destructive" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Solicitar exclusão de dados"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  De acordo com a LGPD (Lei Geral de Proteção de Dados) e GDPR, você tem o direito de solicitar a exclusão dos seus dados pessoais.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
