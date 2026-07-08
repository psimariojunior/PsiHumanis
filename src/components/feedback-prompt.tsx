"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, X, Send, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"

interface FeedbackPromptProps {
  trigger: "session_completed" | "manual"
  onDismiss?: () => void
}

const categories = [
  { value: "GENERAL", label: "Geral" },
  { value: "FEATURE", label: "Nova funcionalidade" },
  { value: "BUG", label: "Problema encontrado" },
  { value: "UX", label: "Experiência de uso" },
  { value: "SUPPORT", label: "Suporte" },
]

export function FeedbackPrompt({ trigger, onDismiss }: FeedbackPromptProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [category, setCategory] = useState("GENERAL")
  const [displayName, setDisplayName] = useState("")
  const [allowPublic, setAllowPublic] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { vibrate } = useHapticFeedback()

  useEffect(() => {
    if (trigger === "manual") {
      setIsOpen(true)
      return
    }

    const lastPrompt = localStorage.getItem("psihumanis_feedback_prompt")
    if (lastPrompt) {
      const daysSinceLastPrompt = (Date.now() - parseInt(lastPrompt)) / (1000 * 60 * 60 * 24)
      if (daysSinceLastPrompt < 7) return
    }

    const completedSessions = parseInt(localStorage.getItem("psihumanis_completed_sessions") || "0")
    if (completedSessions >= 3) {
      setTimeout(() => setIsOpen(true), 5000)
      localStorage.setItem("psihumanis_feedback_prompt", Date.now().toString())
    }
  }, [trigger])

  const handleSubmit = useCallback(async () => {
    if (rating === 0 || message.length < 10) return

    setIsSubmitting(true)
    vibrate("medium")

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          title: title || undefined,
          message,
          category,
          displayName: displayName || undefined,
          allowPublic,
        }),
      })

      if (res.ok) {
        setSubmitted(true)
        vibrate("heavy")
        setTimeout(() => {
          setIsOpen(false)
          onDismiss?.()
        }, 2000)
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false)
    }
  }, [rating, title, message, category, displayName, allowPublic, vibrate, onDismiss])

  const handleDismiss = useCallback(() => {
    vibrate("light")
    setIsOpen(false)
    localStorage.setItem("psihumanis_feedback_dismissed", Date.now().toString())
    onDismiss?.()
  }, [vibrate, onDismiss])

  if (!isOpen) return null

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold">Obrigado pelo feedback!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Sua opinião nos ajuda a melhorar o PsiHumanis para todos os psicólogos.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="relative bg-gradient-to-r from-teal-500 to-cyan-500 p-4 text-white">
          <button
            onClick={handleDismiss}
            className="absolute right-2 top-2 rounded-full p-1 hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <h3 className="text-lg font-semibold">Ajude-nos a melhorar</h3>
          <p className="text-sm text-white/80">Sua opinião é muito importante</p>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">Como você avalia o PsiHumanis?</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => {
                    setRating(star)
                    vibrate("light")
                  }}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= (hoveredStar || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-2 block">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    category === cat.value
                      ? "bg-teal-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Título (opcional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resumo do seu feedback"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              maxLength={100}
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-sm font-medium mb-2 block">Mensagem *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Conte-nos sua experiência, sugestões ou problemas encontrados..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[100px]"
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-muted-foreground">{message.length}/1000</p>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Nome para exibição (opcional)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Como gostaria de ser chamado"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              maxLength={50}
            />
          </div>

          {/* Allow Public */}
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <input
              type="checkbox"
              id="allowPublic"
              checked={allowPublic}
              onChange={(e) => setAllowPublic(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="allowPublic" className="text-sm">
              <span className="font-medium">Autorizo exibir meu feedback publicamente</span>
              <p className="text-xs text-muted-foreground">
                Seu nome e avaliação poderão aparecer na landing page
              </p>
            </label>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || message.length < 10 || isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Enviando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Enviar feedback
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}