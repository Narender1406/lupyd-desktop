import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'
import localForage from 'localforage'
import { useEffect } from 'react'

// Generic hook for persistent queries
export function usePersistentQuery<T>({
  queryKey,
  queryFn,
  storageKey,
  ...options
}: {
  queryKey: QueryKey,
  queryFn: () => Promise<T>,
  storageKey: string,
  staleTime?: number,
  refetchOnMount?: boolean,
  refetchOnWindowFocus?: boolean,
}) {
  const queryClient = useQueryClient()
  
  const query = useQuery<T>({
    queryKey,
    queryFn,
    ...options
  })

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedData = await localForage.getItem<T>(storageKey)
        if (cachedData) {
          queryClient.setQueryData(queryKey, cachedData)
        }
      } catch (error) {
        console.log(`Failed to load cached data for ${storageKey}`, error)
      }
    }
    
    loadCachedData()
  }, [queryClient, queryKey, storageKey])

  // Persist data when it changes
  useEffect(() => {
    if (query.data) {
      localForage.setItem(storageKey, query.data).catch((error) => {
        console.log(`Failed to persist data for ${storageKey}`, error)
      })
    }
  }, [query.data, storageKey])

  return query
}