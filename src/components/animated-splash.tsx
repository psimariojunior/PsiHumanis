"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function AnimatedSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"logo" | "text" | "fade">("logo")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 400)
    const t2 = setTimeout(() => setPhase("fade"), 1200)
    const t3 = setTimeout(() => onComplete(), 1600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-br from-teal-600 via-teal-700 to-teal-900">
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5" />
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />

      <div className={cn(
        "relative flex flex-col items-center gap-6 transition-all duration-700",
        phase === "logo" && "scale-110 opacity-0",
        phase === "text" && "scale-100 opacity-100",
        phase === "fade" && "scale-95 opacity-0"
      )}>
        <div className="relative">
          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm ring-4 ring-white/20 shadow-2xl flex items-center justify-center">
            <Image src="/logo.png" alt="PsiHumanis" width={80} height={80} className="w-full h-full object-cover" priority />
          </div>
        </div>

        <div className={cn(
          "text-center transition-all duration-500 delay-200",
          phase === "logo" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}>
          <h1 className="text-3xl font-bold text-white tracking-tight">PsiHumanis</h1>
          <p className="text-teal-200/70 text-sm mt-1">Gestão para Psicólogos</p>
        </div>

        <div className={cn(
          "w-48 h-1 bg-white/20 rounded-full overflow-hidden transition-all duration-500 delay-500",
          phase === "logo" ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
        )}>
          <div className="h-full bg-white rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: phase === "fade" ? "100%" : "60%" }} />
        </div>
      </div>
    </div>
  )
}
