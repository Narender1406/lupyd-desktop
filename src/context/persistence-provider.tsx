"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"
import { useQueryClient } from '@tanstack/react-query'
import { persistence } from '@/utils/persistence'

// Provider that handles global persistence hydration
export function PersistenceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  // Hydrate cache with persistent data on mount
  useEffect(() => {
    const hydrateCache = async () => {
      // Hydrate common data types
      await persistence.hydrateQueryCache(queryClient, "posts", "cachedPosts")
      // Add more cache hydration as needed
    }

    hydrateCache()
  }, [queryClient])

  return <>{children}</>
}