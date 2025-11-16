"use client"

import React, { createContext, useContext, useRef } from 'react'
import type { ReactNode } from 'react'

type CacheContextType = {
  cache: Map<string, ReactNode>
  setCache: (key: string, element: ReactNode) => void
  getCache: (key: string) => ReactNode | undefined
  clearCache: (key: string) => void
  clearAllCache: () => void
}

const CacheContext = createContext<CacheContextType | undefined>(undefined)

export function PageCacheProvider({ children }: { children: ReactNode }) {
  const cacheRef = useRef<Map<string, ReactNode>>(new Map())

  const setCache = (key: string, element: ReactNode) => {
    cacheRef.current.set(key, element)
  }

  const getCache = (key: string) => {
    return cacheRef.current.get(key)
  }

  const clearCache = (key: string) => {
    cacheRef.current.delete(key)
  }

  const clearAllCache = () => {
    cacheRef.current.clear()
  }

  return (
    <CacheContext.Provider value={{ 
      cache: cacheRef.current, 
      setCache, 
      getCache, 
      clearCache, 
      clearAllCache 
    }}>
      {children}
    </CacheContext.Provider>
  )
}

export function usePageCache() {
  const context = useContext(CacheContext)
  if (context === undefined) {
    throw new Error('usePageCache must be used within a PageCacheProvider')
  }
  return context
}