"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Star,
  ArrowLeft,
  Loader2,
  Send,
  Quote,
  CheckCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn, formatDate } from "@/lib/utils"
import { t, getLocale } from "@/lib/i18n"

interface Review {
  id: string
  patientName: string
  rating: number
  comment: string
  createdAt: string
}

interface Psychologist {
  id: string
  name: string
  specialty: string | null
}

function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn(
            i <= value
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
          )}
        />
      ))}
    </div>
  )
}

export default function AvaliacoesPage() {
  const locale = getLocale()
  const [reviews, setReviews] = useState<Review[]>([])
  const [average, setAverage] = useState(0)
  const [total, setTotal] = useState(0)
  const [psychologists, setPsychologists] = useState<Psychologist[]>([])
  const [selectedPsych, setSelectedPsych] = useState("")
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({ patientName: "", rating: 5, comment: "" })
  const [hover, setHover] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetch("/api/disponibilidade/public/psicologos")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : []
        setPsychologists(list)
        if (list.length > 0) setSelectedPsych(list[0].id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedPsych) return
    setLoading(true)
    fetch(`/api/avaliacoes?psychologistId=${selectedPsych}`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || [])
        setAverage(data.average || 0)
        setTotal(data.total || 0)
      })
      .catch(() => toast.error(t("avaliacoes.errorLoad", locale)))
      .finally(() => setLoading(false))
  }, [selectedPsych])

  async function submitReview() {
    if (!form.patientName.trim() || !form.comment.trim()) {
      toast.error(t("avaliacoes.errorEmpty", locale))
      return
    }
    if (!selectedPsych) {
      toast.error(t("avaliacoes.errorSelect", locale))
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          psychologistId: selectedPsych,
          patientName: form.patientName,
          rating: form.rating,
          comment: form.comment,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Erro ao enviar")
      }
      setSubmitted(true)
      setForm({ patientName: "", rating: 5, comment: "" })
      toast.success(t("avaliacoes.successSent", locale))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("avaliacoes.errorSubmit", locale))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-teal-50/30 dark:to-teal-950/10">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("avaliacoes.back", locale)}
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t("avaliacoes.title", locale)}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("avaliacoes.subtitle", locale)}
          </p>
        </div>

        {psychologists.length > 1 && (
          <div className="max-w-xs mx-auto mb-10">
            <Select value={selectedPsych} onValueChange={setSelectedPsych}>
              <SelectTrigger><SelectValue placeholder={t("avaliacoes.selectProfessional", locale)} /></SelectTrigger>
              <SelectContent>
                {psychologists.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Aggregate */}
        <Card className="mb-10 border-0 bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-xl shadow-teal-500/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="text-center">
                <p className="text-6xl font-bold">{average.toFixed(1)}</p>
                <div className="flex justify-center my-2">
                  <Stars value={Math.round(average)} size={22} />
                </div>
                <p className="text-teal-100 text-sm">{total} {t("avaliacoes.ratings", locale)}</p>
              </div>
              <div className="hidden md:block w-px h-24 bg-white/20" />
              <div className="space-y-2 w-full max-w-xs">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length
                  const pct = total > 0 ? (count / total) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3 text-teal-100">{star}</span>
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
                        <div className="h-full rounded-full bg-amber-300 transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-teal-100">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Reviews list */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Quote className="h-5 w-5 text-teal-500" />
              {locale === "en" ? "What our patients say" : "O que dizem nossos pacientes"}
            </h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Star className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {t("avaliacoes.noReviews", locale)}
                  </p>
                </CardContent>
              </Card>
            ) : (
              reviews.map((r) => (
                <Card key={r.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600/10 text-teal-600 font-semibold text-sm">
                          {r.patientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{r.patientName}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Submit form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {submitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-1">{t("avaliacoes.successTitle", locale)}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t("avaliacoes.successSubtitle", locale)}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                      {t("avaliacoes.submitAnother", locale)}
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold mb-1">{t("avaliacoes.formTitle", locale)}</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {t("avaliacoes.formSubtitle", locale)}
                    </p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="r-name">{t("avaliacoes.nameLabel", locale)}</Label>
                        <Input
                          id="r-name"
                          value={form.patientName}
                          onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                          placeholder={t("avaliacoes.namePlaceholder", locale)}
                          maxLength={120}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("avaliacoes.ratingLabel", locale)}</Label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <button
                              key={i}
                              type="button"
                              onMouseEnter={() => setHover(i)}
                              onMouseLeave={() => setHover(0)}
                              onClick={() => setForm((f) => ({ ...f, rating: i }))}
                              className="p-1"
                              aria-label={`${i} estrelas`}
                            >
                              <Star
                                className={cn(
                                  "h-7 w-7 transition-colors",
                                  i <= (hover || form.rating)
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="r-comment">{t("avaliacoes.commentLabel", locale)}</Label>
                        <Textarea
                          id="r-comment"
                          value={form.comment}
                          onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                          placeholder={t("avaliacoes.commentPlaceholder", locale)}
                          rows={4}
                          maxLength={1000}
                        />
                      </div>
                      <Button className="w-full" onClick={submitReview} disabled={submitting}>
                        {submitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        {t("avaliacoes.submit", locale)}
                      </Button>
                      <p className="text-[11px] text-muted-foreground text-center">
                        {t("avaliacoes.agreement", locale)}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
