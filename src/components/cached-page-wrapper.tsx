"use client"

import React, { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { PullToRefresh } from '@/components/pull-to-refresh'
import { usePageCache } from '@/components/page-cache-provider'

interface CachedPageWrapperProps {
  children: ReactNode
  pageKey: string
  onRefresh: () => Promise<void> | void
  className?: string
}

export function CachedPageWrapper({ 
  children, 
  pageKey, 
  onRefresh,
  className = '' 
}: CachedPageWrapperProps) {
  const { getCache, setCache } = usePageCache()
  const [cachedContent, setCachedContent] = useState<ReactNode | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const hasCacheRef = useRef(false)

  // Check if we have cached content on mount
  useEffect(() => {
    const cached = getCache(pageKey)
    if (cached) {
      setCachedContent(cached)
      hasCacheRef.current = true
    }
    setIsInitialized(true)
  }, [getCache, pageKey])

  // Cache the content when it's rendered
  useEffect(() => {
    if (isInitialized && !hasCacheRef.current) {
      setCache(pageKey, children)
      setCachedContent(children)
      hasCacheRef.current = true
    }
  }, [children, isInitialized, pageKey, setCache])

  // Handle refresh
  const handleRefresh = async () => {
    // Clear the cache for this page
    // This will force a fresh render on next visit
    // For immediate refresh, we'll call the onRefresh callback
    
    try {
      await Promise.resolve(onRefresh())
      // After refresh completes, update the cache with new content
      setCache(pageKey, children)
    } catch (error) {
      console.error('Refresh failed:', error)
    }
  }

  // Show cached content if available, otherwise show children
  const contentToShow = cachedContent || children

  if (!isInitialized) {
    // Show a loading state while checking cache
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className={className}>
      {contentToShow}
    </PullToRefresh>
  )
}