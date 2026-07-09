"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StickyNote, X, Loader2, Trash2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import toast from "react-hot-toast"

interface QuickNote {
  id: string
  content: string
  createdAt: string
}

export function QuickNotesFab() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState<QuickNote[]>([])
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadNotes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/quick-notes?limit=20", { cache: "no-store" })
      if (!res.ok) return
      const data = await res.json()
      setNotes(Array.isArray(data) ? data : [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      loadNotes()
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open, loadNotes])

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const res = await fetch("/api/quick-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Erro ao salvar")
      }
      const note = await res.json()
      setNotes((prev) => [note, ...prev])
      setContent("")
      toast.success("Anotação salva!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar anotação")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/quick-notes?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setNotes((prev) => prev.filter((n) => n.id !== id))
      toast.success("Anotação excluída")
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-[56px] right-4 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-amber-500/30 transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95",
          open && "rotate-90"
        )}
        aria-label="Anotações rápidas"
      >
        {open ? <X className="h-6 w-6" /> : <StickyNote className="h-6 w-6" />}
        {!open && notes.length > 0 && (
          <span className="absolute -top-1 -right-1 flex min-w-[20px] items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-bold text-white">
            {notes.length > 9 ? "9+" : notes.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-[120px] right-4 sm:right-6 z-40 w-[22rem] max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="rounded-2xl border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-semibold">Anotações Rápidas</h3>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Digite uma anotação rápida... (ex: retornar ligação, ideia de técnica, observação)"
                rows={3}
                maxLength={2000}
                className="resize-none"
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSave()
                }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {content.length}/2000 · ⌘+Enter para salvar
                </span>
                <Button size="sm" onClick={handleSave} disabled={saving || !content.trim()}>
                  {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <StickyNote className="mr-1.5 h-4 w-4" />}
                  Salvar
                </Button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto border-t">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                  <StickyNote className="h-7 w-7" />
                  <p className="text-xs">Nenhuma anotação ainda</p>
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="group border-b px-4 py-3 transition-colors hover:bg-accent/40">
                    <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ptBR })}
                      </span>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        aria-label="Excluir anotação"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
