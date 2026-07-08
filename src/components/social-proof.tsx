"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Users, Calendar, Shield, Clock, TrendingUp, Heart, Sparkles, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SocialProofProps {
  variant?: "landing" | "pricing"
}

const testimonials = [
  {
    name: "Dra. Ana Carolina",
    role: "Psicóloga Clínica",
    crp: "CRP 06/123456",
    text: "O PsiHumanis transformou minha prática. Economizo 3 horas por dia em tarefas administrativas e meus pacientes adoram o portal.",
    rating: 5,
    avatar: "AC",
  },
  {
    name: "Dr. Rafael Santos",
    role: "Neuropsicólogo",
    crp: "CRP 04/789012",
    text: "A sala virtual é incrível. Conduzo sessões online com a mesma qualidade presencial. Os prontuários digitais são perfeitos.",
    rating: 5,
    avatar: "RS",
  },
  {
    name: "Dra. Mariana Costa",
    role: "Psicóloga Infantil",
    crp: "CRP 07/345678",
    text: "Meus pacientes俫am as tarefas terapêuticas e o diário de emoções. O engajamento entre sessões aumentou 40%.",
    rating: 5,
    avatar: "MC",
  },
]

const stats = [
  { value: "2.500+", label: "Psicólogos ativos", icon: <Users className="h-5 w-5" /> },
  { value: "15.000+", label: "Sessões realizadas", icon: <Calendar className="h-5 w-5" /> },
  { value: "98%", label: "Satisfação", icon: <Heart className="h-5 w-5" /> },
  { value: "4.9", label: "Nota média", icon: <Star className="h-5 w-5" /> },
]

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration])

  return <span>{count.toLocaleString("pt-BR")}</span>
}

export function SocialProof({ variant = "landing" }: SocialProofProps) {
  if (variant === "pricing") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Psicólogos que já confiam no PsiHumanis</h3>
          <p className="text-sm text-muted-foreground">Junte-se a milhares de profissionais satisfeitos</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-teal-600">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-teal-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mb-3">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-600">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.crp}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-teal-600">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid gap-4 sm:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.name} className="border-teal-500/20 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mb-3">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-600">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-xs font-medium">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.crp}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trust badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Sem cartão no trial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-teal-500" />
          <span>Dados protegidos LGPD</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-cyan-500" />
          <span>Cancele quando quiser</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <span>14 dias grátis</span>
        </div>
      </div>
    </div>
  )
}
