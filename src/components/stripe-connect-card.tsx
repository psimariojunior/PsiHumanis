"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Loader2, CheckCircle2, AlertCircle, ExternalLink, Unlink, Shield, Banknote } from "lucide-react"
import toast from "react-hot-toast"

interface StripeStatus {
  connected: boolean
  accountId: string | null
  chargesEnabled?: boolean
  payoutsEnabled?: boolean
  detailsSubmitted?: boolean
}

export function StripeConnectCard() {
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/stripe/connect")
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao conectar")
      if (data.url) {
        window.location.href = data.url
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao conectar com Stripe")
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm("Tem certeza que deseja desconectar sua conta Stripe? Você não receberá mais pagamentos via cartão/boleto.")) return
    setDisconnecting(true)
    try {
      const res = await fetch("/api/stripe/connect", { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erro ao desconectar")
      }
      setStatus({ connected: false, accountId: null })
      toast.success("Conta Stripe desconectada")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao desconectar")
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Verificando conta Stripe...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isConnected = status?.connected === true
  const isPending = status?.accountId && !status?.connected

  return (
    <Card className={isConnected ? "border-green-200 dark:border-green-800/50" : isPending ? "border-amber-200 dark:border-amber-800/50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isConnected ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"}`}>
            <CreditCard className={`h-4 w-4 ${isConnected ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`} />
          </div>
          Recebimento de Pagamentos
          {isConnected && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ml-auto">Conectado</Badge>}
          {isPending && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ml-auto">Pendente</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 dark:text-green-200">Conta conectada e ativa</p>
                <p className="text-green-600 dark:text-green-400 mt-1">
                  Seus pacientes podem pagar via cartão de crédito e boleto. O dinheiro vai direto para sua conta bancária vinculada ao Stripe.
                </p>
                <p className="text-xs text-green-500 dark:text-green-500 mt-2 font-mono">
                  ID: {status?.accountId}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <Banknote className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Recebimento</p>
                <p className="text-xs font-semibold">{status?.payoutsEnabled ? "Ativo" : "Pendente"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <CreditCard className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Cartão</p>
                <p className="text-xs font-semibold">{status?.chargesEnabled ? "Ativo" : "Pendente"}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <Shield className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Dados</p>
                <p className="text-xs font-semibold">{status?.detailsSubmitted ? "Completos" : "Pendentes"}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleConnect} className="flex-1">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Atualizar Dados
              </Button>
              <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={disconnecting} className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30">
                {disconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlink className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </>
        ) : isPending ? (
          <>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Sua conta foi criada mas o cadastro ainda não foi concluído. Clique abaixo para finalizar no Stripe.
              </p>
            </div>
            <Button onClick={handleConnect} disabled={connecting} className="w-full">
              {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
              {connecting ? "Redirecionando..." : "Finalizar Cadastro no Stripe"}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Conecte sua conta Stripe para receber pagamentos dos seus pacientes diretamente na sua conta bancária.
              </p>
              <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  Pagamentos via cartão de crédito e boleto
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  Dinheiro vai direto para sua conta bancária
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  Sem intermediários — você é o responsável
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  Taxa de 3,99% + R$0,39 por transação (Stripe)
                </div>
              </div>
            </div>
            <Button onClick={handleConnect} disabled={connecting} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500">
              {connecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              {connecting ? "Conectando..." : "Conectar Minha Conta Stripe"}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              Você será redirecionado para o Stripe para completar o cadastro. Leva menos de 2 minutos.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
