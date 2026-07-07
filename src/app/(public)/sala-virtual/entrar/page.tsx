"use client"

import { Suspense, useState, useCallback, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, CreditCard, Lock, ArrowLeft } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react"
import "@livekit/components-styles"
import toast from "react-hot-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { ParticipantWatcher } from "./components/participant-watcher"
import { InCallUI } from "./components/in-call-ui"
import { EnhancedInCallUI } from "@/components/livekit/enhanced-in-call-ui"
import { PrejoinView } from "./components/prejoin-view"
import { EndedView } from "./components/end-view"
import { WelcomeView } from "./components/welcome-view"

function EntrarSalaForm() {
  const searchParams = useSearchParams()
  const roomParam = searchParams.get("room") || ""
  const [roomInput, setRoomInput] = useState(roomParam)
  const [step, setStep] = useState(roomParam ? "prejoin" : "welcome")
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [patientName, setPatientName] = useState("")
  const [psychologistPresent, setPsychologistPresent] = useState(false)
  const [paymentRequired, setPaymentRequired] = useState(false)
  const [paymentData, setPaymentData] = useState<{ appointmentId: string; amount: number } | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [hd, setHd] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gestao-de-psicologia-0khxxf01.livekit.cloud"
  const hdRef = useRef(hd)
  hdRef.current = hd

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    const nameParam = patientName.trim() ? `&name=${encodeURIComponent(patientName.trim())}` : ""
    try {
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomInput)}&patient=true${nameParam}`)
      const body = await res.json().catch(() => ({}))
      if (res.status === 402 && body.error === "PAYMENT_REQUIRED") {
        setPaymentData({ appointmentId: body.appointmentId, amount: body.amount })
        setPaymentRequired(true)
        setConnecting(false)
        return
      }
      if (!res.ok) {
        throw new Error(body.error || "Erro ao conectar")
      }
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setCameraReady(false)
      setConnecting(false)
      setToken(body.token)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao conectar")
      setConnecting(false)
    }
  }, [roomInput, patientName])

  const startCamera = useCallback(() => {
    const videoConstraints = hdRef.current
      ? { width: { ideal: 1280 }, height: { ideal: 720 } }
      : { width: { ideal: 640 }, height: { ideal: 480 } }
    navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
      .then((s) => {
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
        setCameraReady(true)
      })
      .catch(() => toast.error("Permita acesso à câmera e microfone nas configurações do navegador"))
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  const toggleCamera = () => setCameraOn((c) => {
    const next = !c
    if (streamRef.current) streamRef.current.getVideoTracks().forEach((t) => (t.enabled = next))
    else if (next) startCamera()
    return next
  })

  const toggleMic = () => setMicOn((c) => {
    const next = !c
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next))
    return next
  })

  const toggleHd = useCallback(() => {
    setHd((prev) => {
      const next = !prev
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setCameraReady(false)
      const videoConstraints = next
        ? { width: { ideal: 1280 }, height: { ideal: 720 } }
        : { width: { ideal: 640 }, height: { ideal: 480 } }
      navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
        .then((s) => {
          streamRef.current = s
          if (videoRef.current) videoRef.current.srcObject = s
          setCameraReady(true)
        })
        .catch(() => toast.error("Erro ao reiniciar câmera"))
      return next
    })
  }, [])

  const handleDisconnected = useCallback(() => {
    setToken(null)
    setStep("ended")
    setPsychologistPresent(false)
  }, [])

  const handleLeaveCall = useCallback(() => {
    setToken(null)
    setStep("ended")
    setPsychologistPresent(false)
  }, [])

  useEffect(() => {
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setCameraReady(false) }
  }, [])

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission()
  }, [])

  useEffect(() => {
    if (psychologistPresent && typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Psicólogo entrou na sala", { body: "O profissional está disponível para a sessão." })
    }
  }, [psychologistPresent])

  if (token) {
    return (
      <ErrorBoundary>
        <div className="h-screen relative bg-black">
          <LiveKitRoom
            token={token}
            serverUrl={livekitUrl}
            connect={true}
            video={cameraOn}
            audio={micOn ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false}
            onDisconnected={handleDisconnected}
            style={{ height: "100%" }}
          >
            <ErrorBoundary>
              <RoomAudioRenderer volume={1} />
              <ParticipantWatcher onParticipantsChange={setPsychologistPresent} />
              <EnhancedInCallUI roomName={roomInput} onLeave={handleLeaveCall} />
            </ErrorBoundary>
          </LiveKitRoom>
        </div>
      </ErrorBoundary>
    )
  }

  if (step === "prejoin") {
    return (
      <PrejoinView
        roomInput={roomInput}
        patientName={patientName}
        cameraReady={cameraReady}
        connecting={connecting}
        cameraOn={cameraOn}
        micOn={micOn}
        hd={hd}
        videoRef={videoRef}
        onBack={() => { stopCamera(); setStep("welcome") }}
        onStartCamera={startCamera}
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMic}
        onToggleHd={toggleHd}
        onConnect={handleConnect}
        onPatientNameChange={setPatientName}
      />
    )
  }

  if (paymentRequired && paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20 mx-auto">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Pagamento Necessário</h2>
            <p className="text-slate-400 text-sm">
              É necessário confirmar o pagamento da sessão antes de entrar na sala virtual.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-2xl p-6 ring-1 ring-slate-700/50 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Valor da sessão</span>
              <span className="text-white font-semibold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(paymentData.amount)}
              </span>
            </div>
            <div className="h-px bg-slate-700" />
            <p className="text-xs text-slate-500">
              Clique abaixo para realizar o pagamento via cartão de crédito ou boleto.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/pagamentos/public-checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId: paymentData.appointmentId }),
                  })
                  const data = await res.json()
                  if (res.ok && data.url) {
                    window.location.href = data.url
                  } else {
                    toast.error(data.error || "Erro ao criar pagamento")
                  }
                } catch {
                  toast.error("Erro ao processar pagamento")
                }
              }}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 hover:from-teal-400 hover:to-teal-500 transition-all"
            >
              <CreditCard className="h-5 w-5" />
              Pagar Agora
            </button>
            <button
              onClick={() => { setPaymentRequired(false); setPaymentData(null) }}
              className="w-full h-10 rounded-xl text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "ended") {
    return <EndedView onNewRoom={() => { setStep("welcome"); setRoomInput("") }} />
  }

  return <WelcomeView initialRoom={roomParam} onContinue={(room) => { setRoomInput(room); setStep("prejoin"); startCamera() }} />
}

export default function EntrarSalaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EntrarSalaForm />
    </Suspense>
  )
}
