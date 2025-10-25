"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface AnimatedCardProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function AnimatedCard({ children, delay = 0, className = "" }: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isInView, hasAnimated])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-in-out ${className}`}
      style={{
        opacity: hasAnimated ? 1 : 0,
        transform: hasAnimated ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  )
}
