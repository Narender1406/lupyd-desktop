"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface AnimatedCardProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

/**
 * AnimatedCard
 *
 * Animates its children in with a fade + slide-up effect.
 * Uses requestAnimationFrame to start the animation on the very next
 * frame after mount — guaranteeing content is visible immediately
 * without waiting for an async IntersectionObserver callback.
 *
 * The delay prop staggers multiple cards (e.g. 0.1s, 0.2s apart).
 */
export function AnimatedCard({ children, delay = 0, className = "" }: AnimatedCardProps) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // requestAnimationFrame fires after the browser has painted the first
    // frame. This is the earliest possible moment to start the transition
    // and ensures the opacity:0 → opacity:1 animation is always visible
    // (vs IntersectionObserver which can miss elements already in-viewport).
    rafRef.current = requestAnimationFrame(() => {
      setHasAnimated(true)
    })
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      className={`transition-all duration-500 ease-out ${className}`}
      style={{
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? "translateY(0)" : "translateY(20px)",
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  )
}
