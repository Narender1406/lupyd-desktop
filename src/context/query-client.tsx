"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Global configuration for React Query
export const queryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
}

const queryClient = new QueryClient(queryConfig)

export function QueryClientProviderWrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}