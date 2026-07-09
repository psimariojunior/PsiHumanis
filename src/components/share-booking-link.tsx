"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, MessageCircle, Link2, Share2, QrCode, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"

export function ShareBookingLink() {
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const psychologistId = session?.user?.id || ""
  const bookingUrl = origin ? `${origin}/agendar/${psychologistId}` : ""
  const registrationUrl = origin ? `${origin}/paciente/cadastro` : ""

  async function copyToClipboard(text: string, label: string) {
    await navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp(text: string) {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (!psychologistId) return null

  return (
    <Card className="border-dashed border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-xl">
            <Link2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Link de Agendamento</h3>
            <p className="text-xs text-muted-foreground">Envie para o paciente agendar direto com você</p>
          </div>
        </div>

        {/* Primary link - booking */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={bookingUrl}
              readOnly
              className="text-xs font-mono bg-white dark:bg-slate-800"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(bookingUrl, "Link de agendamento")}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => shareWhatsApp(`Olá! Agende sua consulta comigo pelo link:\n${bookingUrl}`)}
              className="flex-1 text-xs"
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Agendar consulta", url: bookingUrl })
                } else {
                  copyToClipboard(bookingUrl, "Link")
                }
              }}
              className="flex-1 text-xs"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Secondary link - registration */}
        <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
          <p className="text-xs text-muted-foreground mb-2">Link de cadastro (paciente novo):</p>
          <div className="flex gap-2">
            <Input
              value={registrationUrl}
              readOnly
              className="text-xs font-mono bg-white dark:bg-slate-800"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(registrationUrl, "Link de cadastro")}
              className="shrink-0"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
