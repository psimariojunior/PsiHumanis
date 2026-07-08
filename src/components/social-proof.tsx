"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, Clock, Sparkles, CheckCircle, Users, Calendar, Heart, Star, Lock, Zap } from "lucide-react"

interface SocialProofProps {
  variant?: "landing" | "pricing"
}

const stats = [
  { value: "100%", label: "Dados criptografados", icon: <Shield className="h-5 w-5" /> },
  { value: "LGPD", label: "Conformidade total", icon: <Lock className="h-5 w-5" /> },
  { value: "24/7", label: "Suporte disponível", icon: <Heart className="h-5 w-5" /> },
  { value: "4.9", label: "Nota dos avaliadores", icon: <Star className="h-5 w-5" /> },
]

const trustBadges = [
  { icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, text: "Sem cartão no trial" },
  { icon: <Shield className="h-4 w-4 text-teal-500" />, text: "Dados protegidos LGPD" },
  { icon: <Clock className="h-4 w-4 text-cyan-500" />, text: "Cancele quando quiser" },
  { icon: <Sparkles className="h-4 w-4 text-violet-500" />, text: "14 dias grátis" },
]

export function SocialProof({ variant = "landing" }: SocialProofProps) {
  if (variant === "pricing") {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Por que profissionais escolhem o PsiHumanis?</h3>
          <p className="text-sm text-muted-foreground">Recursos que fazem a diferença na sua prática</p>
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

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
          {trustBadges.map((badge) => (
            <div key={badge.text} className="flex items-center gap-1.5">
              {badge.icon}
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
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

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        {trustBadges.map((badge) => (
          <div key={badge.text} className="flex items-center gap-1.5">
            {badge.icon}
            <span>{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
