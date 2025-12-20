"use client"

import React, { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void
  children: ReactNode
  className?: string
}

export function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
  const [pullStartPoint, setPullStartPoint] = useState(0)
  const [pullChange, setPullChange] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const refreshThreshold = 80 // pixels needed to trigger refresh

  const onPullStart = (clientY: number) => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop
      // Only allow pull-to-refresh when at the top of the page
      if (scrollTop === 0) {
        setPullStartPoint(clientY)
        setIsPulling(true)
      }
    }
  }

  const onPulling = (clientY: number) => {
    if (!isPulling || pullStartPoint === 0) return
    
    const pullLength = clientY - pullStartPoint
    if (pullLength > 0) {
      setPullChange(Math.min(pullLength, refreshThreshold * 1.5))
    }
  }

  const onPullEnd = () => {
    if (!isPulling) return
    
    setIsPulling(false)
    
    if (pullChange > refreshThreshold) {
      setIsRefreshing(true)
      setPullChange(0)
      setPullStartPoint(0)
      
      Promise.resolve(onRefresh()).then(() => {
        setIsRefreshing(false)
      })
    } else {
      setPullChange(0)
      setPullStartPoint(0)
    }
  }

  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    onPullStart(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    onPulling(e.touches[0].clientY)
  }

  const handleTouchEnd = () => {
    onPullEnd()
  }

  // Handle mouse events for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    onPullStart(e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPulling) {
      onPulling(e.clientY)
    }
  }

  const handleMouseUp = () => {
    onPullEnd()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setIsPulling(false)
      setIsRefreshing(false)
      setPullChange(0)
      setPullStartPoint(0)
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="flex justify-center items-center w-full absolute top-0 left-0 z-10 transition-transform duration-200"
          style={{ 
            transform: `translateY(${isRefreshing ? '20px' : `${Math.max(0, pullChange - 60)}px`})`,
            opacity: isPulling ? Math.min(1, pullChange / refreshThreshold) : 1
          }}
        >
          <div className="bg-white rounded-full p-2 shadow-lg border border-gray-200">
            <RefreshCw 
              className={`h-6 w-6 ${isRefreshing ? 'animate-spin' : ''}`} 
              style={{ 
                transform: isPulling ? `rotate(${Math.min(180, pullChange * 2)}deg)` : 'rotate(0deg)',
                transition: 'transform 0.1s ease-out'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Content with top padding to accommodate pull indicator */}
      <div 
        className="pt-4"
        style={{ 
          transform: `translateY(${isPulling ? `${pullChange}px` : '0px'})`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  )
}