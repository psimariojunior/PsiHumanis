"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Building2, ArrowLeft, Loader2, Shield, Sparkles, Gift, CreditCard, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { BreadcrumbJsonLd } from "@/lib/seo"
import toast from "react-hot-toast"
import { trackCheckout } from "@/lib/analytics"

const plans = [
  {
    id: "pro" as const,
    name: "Pro",
    price: "R$ 97",
    period: "/mês",
    description: "Para profissionais individuais que querem escalar",
    icon: Zap,
    features: [
      "Até 200 pacientes",
      "Consultas ilimitadas",
      "Videochamada integrada",
      "IA para prontuários",
      "Relatórios avançados",
      "Lembretes automáticos",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    id: "clinica" as const,
    name: "Clínica",
    price: "R$ 197",
    period: "/mês",
    description: "Para clínicas e equipes com múltiplos profissionais",
    icon: Building2,
    features: [
      "Pacientes ilimitados",
      "Consultas ilimitadas",
      "Videochamada integrada",
      "IA para prontuários",
      "Relatórios avançados",
      "Lembretes automáticos",
      "Gerenciar equipe",
      "Suporte dedicado",
    ],
    popular: false,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const faqs = [
    { q: "Posso começar sem cartão de crédito?", a: "Sim! O trial de 14 dias é gratuito e não exige cartão. Você só insere os dados de pagamento quando decidir assinar." },
    { q: "O que acontece quando o trial expirar?", a: "Seu plano é rebaixado para o plano gratuito, que oferece funcionalidades limitadas. Seus dados não são perdidos." },
    { q: "Posso cancelar quando quiser?", a: "Sim, sem multa ou burocracia. O cancelamento é imediato e você mantém acesso até o final do período pago." },
    { q: "Tem desconto para pagamento anual?", a: "Entre em contato pelo email contato@psihumanis.com.br para condições especiais de pagamento anual." },
    { q: "Posso mudar de plano depois?", a: "Sim, você pode fazer upgrade ou downgrade a qualquer momento. A diferença é proporcional." },
    { q: "Meus dados ficam seguros?", a: "Sim. Criptografia ponta a ponta, servidores no Brasil, conformidade com LGPD e dados isolados por profissional." },
  ]

  const handleCheckout = async (plan: "pro" | "clinica") => {
    setLoading(plan)
    trackCheckout(plan)
    try {
      const res = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      if (res.status === 401 || res.redirected) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent("/pricing")}`
        return
      }
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Erro ao criar sessão de checkout")
      }
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_35%),linear-gradient(to_bottom,var(--background),rgba(16,185,129,0.06))]">
      <BreadcrumbJsonLd items={[
        { name: "Início", item: "/" },
        { name: "Planos", item: "/pricing" },
      ]} />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>

          <div className="text-center space-y-5">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
              <Sparkles className="mr-1 h-3.5 w-3.5" /> 14 dias grátis
            </Badge>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
              Gestão clínica premium sem complicar sua rotina
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-7">
              Agenda, pacientes, prontuários, videochamada, cobranças, relatórios e automações em uma única plataforma.
            </p>
            <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
              {["Sem cartão no trial", "Cancele quando quiser", "Dados protegidos"].map((item) => (
                <div key={item} className="rounded-2xl border bg-background/80 p-3 text-sm shadow-sm backdrop-blur">
                  <Check className="mx-auto mb-1 h-4 w-4 text-emerald-600" />{item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col overflow-hidden rounded-3xl ${
                  plan.popular
                    ? "border-emerald-500 dark:border-emerald-400 shadow-2xl shadow-emerald-500/15 scale-[1.01]"
                    : "shadow-lg shadow-slate-900/5"
                }`}
              >
                {plan.popular && <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Mais popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="flex-col gap-3">
                  <Button
                    className={`w-full ${plan.popular ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loading !== null}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {loading === plan.id ? "Redirecionando..." : "Começar agora"}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">Trial gratuito. Ative o plano só se fizer sentido.</p>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Comparison Table */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Comparar planos</h2>
          <div className="overflow-x-auto rounded-2xl border bg-card shadow-lg">
            <table className="w-full text-sm" role="table" aria-label="Comparação de planos">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Funcionalidade</th>
                  <th className="text-center p-4 font-medium">Pro</th>
                  <th className="text-center p-4 font-medium">Clínica</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Pacientes", pro: "Até 200", clinic: "Ilimitados" },
                  { feature: "Consultas", pro: "Ilimitadas", clinic: "Ilimitadas" },
                  { feature: "Videochamada integrada", pro: true, clinic: true },
                  { feature: "IA para prontuários", pro: true, clinic: true },
                  { feature: "Relatórios avançados", pro: true, clinic: true },
                  { feature: "Lembretes automáticos", pro: true, clinic: true },
                  { feature: "Gerenciar equipe", pro: false, clinic: true },
                  { feature: "Suporte prioritário", pro: true, clinic: true },
                  { feature: "Suporte dedicado", pro: false, clinic: true },
                  { feature: "14 dias grátis", pro: true, clinic: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-4">{row.feature}</td>
                    <td className="text-center p-4">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <span className="text-muted-foreground">—</span>
                      ) : <span className="font-medium">{row.pro}</span>}
                    </td>
                    <td className="text-center p-4">
                      {typeof row.clinic === "boolean" ? (
                        row.clinic ? <Check className="mx-auto h-4 w-4 text-emerald-600" /> : <span className="text-muted-foreground">—</span>
                      ) : <span className="font-medium">{row.clinic}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Dúvidas frequentes</h2>
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <div key={i} className="rounded-xl border bg-card overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  aria-expanded={faqOpen === i}
                  aria-controls={`pricing-faq-${i}`}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-accent/50 transition-colors"
                >
                  <span className="font-medium text-sm">{item.q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0 ml-4", faqOpen === i && "rotate-180")} />
                </button>
                {faqOpen === i && (
                  <div id={`pricing-faq-${i}`} role="region" className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { icon: Gift, title: "Indique e ganhe", desc: "Ganhe 1 mês grátis por amigo que assinar." },
            { icon: CreditCard, title: "Cobrança integrada", desc: "Cartão, PIX, boleto e histórico financeiro." },
            { icon: Shield, title: "Segurança clínica", desc: "Rotas protegidas, LGPD e dados isolados por profissional." },
          ].map((item) => (
            <Card key={item.title} className="p-5">
              <item.icon className="h-5 w-5 text-emerald-600" />
              <h3 className="mt-3 font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Todos os planos incluem 14 dias de trial gratuito. Não é necessário cartão de crédito para começar.
          </p>
          <div className="flex justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Sem cancelamento de contrato</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Suporte via chat</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Dados seguros</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
