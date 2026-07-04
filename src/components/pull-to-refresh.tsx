"use client"

import { useState, useRef, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHapticFeedback } from "@/hooks/use-haptic-feedback"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { vibrate } = useHapticFeedback()

  const threshold = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || 0
    if (scrollTop > 0) return
    startY.current = e.touches[0].clientY
    setPulling(true)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return
    const scrollTop = containerRef.current?.scrollTop || 0
    if (scrollTop > 0) return

    const currentY = e.touches[0].clientY
    const distance = Math.max(0, (currentY - startY.current) * 0.5)
    setPullDistance(Math.min(distance, threshold * 1.5))
  }, [pulling, refreshing])

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true)
      setPullDistance(threshold)
      vibrate("light")
      await onRefresh()
      vibrate("medium")
      setRefreshing(false)
    }
    setPulling(false)
    setPullDistance(0)
  }, [pulling, pullDistance, refreshing, onRefresh, vibrate])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{ height: pullDistance > 0 ? `${pullDistance}px` : refreshing ? "60px" : "0px" }}
      >
        <RefreshCw
          className={cn(
            "h-6 w-6 text-teal-500 transition-transform",
            refreshing && "animate-spin"
          )}
          style={{ transform: `rotate(${pullDistance * 2}deg)` }}
        />
      </div>
      {children}
    </div>
  )
}
