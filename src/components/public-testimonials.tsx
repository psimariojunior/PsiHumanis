"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feedback {
  id: string
  rating: number
  title: string | null
  message: string
  displayName: string | null
  createdAt: string
}

interface PublicTestimonialsProps {
  limit?: number
}

export function PublicTestimonials({ limit = 6 }: PublicTestimonialsProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [stats, setStats] = useState({ average: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/feedback?public=true`)
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data.feedbacks || [])
        setStats(data.stats || { average: 0, total: 0 })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="h-8 w-32 mx-auto bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 mx-auto bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (feedbacks.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "h-5 w-5",
                  star <= Math.round(stats.average)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="text-lg font-bold">{stats.average.toFixed(1)}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {stats.total} {stats.total === 1 ? "avaliação" : "avaliações"} de psicólogos reais
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feedbacks.slice(0, limit).map((feedback) => (
          <Card key={feedback.id} className="border-teal-500/20 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-3 w-3",
                      star <= feedback.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              {feedback.title && (
                <h4 className="text-sm font-semibold mb-1">{feedback.title}</h4>
              )}

              <div className="relative">
                <Quote className="absolute -left-1 -top-1 h-4 w-4 text-teal-500/20" />
                <p className="text-xs text-muted-foreground leading-relaxed pl-4">
                  &ldquo;{feedback.message}&rdquo;
                </p>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-500/10 text-[10px] font-bold text-teal-600">
                  {feedback.displayName?.charAt(0).toUpperCase() || "P"}
                </div>
                <div>
                  <p className="text-xs font-medium">
                    {feedback.displayName || "Psicólogo(a)"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(feedback.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}