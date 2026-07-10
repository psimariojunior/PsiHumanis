"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { StickyNote, X, Loader2, Trash2, Clock, Pencil } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import toast from "react-hot-toast"

interface QuickNote {
  id: string
  content: string
  createdAt: string
}

export function QuickNotesDropdown() {
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Anotações rápidas">
          <Pencil className="h-5 w-5" />
          {!open && notes.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex min-w-[16px] h-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-white">
              {notes.length > 9 ? "9+" : notes.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b bg-gradient-to-r from-amber-500/10 to-orange-500/10 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <StickyNote className="h-3.5 w-3.5 text-amber-500" />
            <h3 className="text-sm font-semibold">Anotações Rápidas</h3>
          </div>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-3 space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Digite uma anotação rápida..."
            rows={2}
            maxLength={2000}
            className="resize-none text-sm"
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSave()
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {content.length}/2000
            </span>
            <Button size="sm" onClick={handleSave} disabled={saving || !content.trim()} className="h-7 text-xs">
              {saving ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <StickyNote className="mr-1 h-3 w-3" />}
              Salvar
            </Button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto border-t">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center gap-1.5 py-6 text-muted-foreground">
              <StickyNote className="h-5 w-5 opacity-50" />
              <p className="text-xs">Nenhuma anotação</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="group border-b px-4 py-2.5 transition-colors hover:bg-accent/40 last:border-0">
                <p className="text-xs whitespace-pre-wrap break-words leading-relaxed">{note.content}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ptBR })}
                  </span>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    aria-label="Excluir"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
