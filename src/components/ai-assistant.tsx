"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles, FileText, Lightbulb, BarChart3, ListChecks, MessageSquare, Loader2, Copy, Check, X } from "lucide-react"
import { toast } from "react-hot-toast"

interface Message {
  role: "user" | "assistant"
  content: string
  action?: string
}

const QUICK_ACTIONS = [
  { id: "summarize", label: "Resumir Sessão", icon: FileText, placeholder: "Cole as notas da sessão para resumir..." },
  { id: "suggest-treatment", label: "Sugerir Tratamento", icon: Lightbulb, placeholder: "Descreva o quadro do paciente..." },
  { id: "report", label: "Gerar Relatório", icon: BarChart3, placeholder: "Dados do paciente para o relatório..." },
  { id: "suggest-tasks", label: "Sugerir Tarefas", icon: ListChecks, placeholder: "Notas da sessão para sugerir tarefas..." },
  { id: "chat", label: "Perguntar", icon: MessageSquare, placeholder: "Faça uma pergunta sobre psicologia..." },
]

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: "user", content: input.trim(), action: activeAction || undefined }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      let action = activeAction || "chat"
      let data: Record<string, unknown> = {}

      switch (action) {
        case "summarize":
          data = { notes: userMsg.content }
          break
        case "suggest-treatment":
          data = { assessment: userMsg.content }
          break
        case "report":
          data = { name: "Paciente", notes: userMsg.content }
          break
        case "suggest-tasks":
          data = { sessionNotes: userMsg.content }
          break
        case "analyze-emotions":
          data = { emotions: userMsg.content.split("\n").filter(Boolean) }
          break
        default:
          action = "chat"
          data = { message: userMsg.content, context: messages.slice(-4).map((m) => `${m.role}: ${m.content}`).join("\n") }
      }

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      })

      const result = await res.json()
      if (result.error) throw new Error(result.error)

      setMessages((prev) => [...prev, { role: "assistant", content: result.content }])
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao processar")
      setMessages((prev) => [...prev, { role: "assistant", content: "❌ Erro ao processar sua solicitação." }])
    } finally {
      setLoading(false)
      setActiveAction(null)
    }
  }

  function copyMessage(content: string, idx: number) {
    navigator.clipboard.writeText(content)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] sm:max-w-[calc(100vw-48px)] h-[100dvh] sm:h-[520px] sm:max-h-[calc(100vh-96px)] bg-card sm:border sm:border-border sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="font-semibold text-sm">Assistente IA</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Quick actions */}
      <div className="flex gap-1.5 px-3 py-2 border-b border-border overflow-x-auto scrollbar-none">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => setActiveAction(activeAction === a.id ? null : a.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
              activeAction === a.id
                ? "bg-emerald-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <a.icon className="h-3 w-3" />
            {a.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-emerald-500 opacity-50" />
            <p>Como posso ajudar?</p>
            <p className="text-xs mt-1 opacity-70">Selecione uma ação ou digite sua pergunta</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-emerald-500 text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
              {msg.role === "assistant" && (
                <button
                  onClick={() => copyMessage(msg.content, i)}
                  className="ml-2 p-1 hover:bg-background/50 rounded transition-colors inline-flex"
                >
                  {copiedIdx === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-xl px-3 py-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processando...
            </div>
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        {activeAction && (
          <div className="mb-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400 px-2 py-1 rounded-lg">
            {QUICK_ACTIONS.find((a) => a.id === activeAction)?.label} ativo
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={QUICK_ACTIONS.find((a) => a.id === activeAction)?.placeholder || "Digite sua mensagem..."}
            className="min-h-[44px] max-h-[120px] resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            size="icon"
            className="shrink-0 bg-emerald-500 hover:bg-emerald-600"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
