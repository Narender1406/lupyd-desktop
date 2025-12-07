import localForage from 'localforage'
import { QueryClient } from '@tanstack/react-query'

// Utility functions for persistence across the app
export const persistence = {
  // Save data to persistent storage
  async save<T>(key: string, data: T): Promise<void> {
    try {
      await localForage.setItem(key, data)
    } catch (error) {
      console.log(`Failed to save data for key ${key}`, error)
    }
  },

  // Load data from persistent storage
  async load<T>(key: string): Promise<T | null> {
    try {
      return await localForage.getItem<T>(key)
    } catch (error) {
      console.log(`Failed to load data for key ${key}`, error)
      return null
    }
  },

  // Update query cache with persistent data
  async hydrateQueryCache(queryClient: QueryClient, queryKey: string, storageKey: string): Promise<void> {
    const cachedData = await this.load<unknown>(storageKey)
    if (cachedData) {
      queryClient.setQueryData([queryKey], cachedData)
    }
  },

  // Save query cache data to persistent storage
  async dehydrateQueryCache(queryClient: QueryClient, queryKey: string, storageKey: string): Promise<void> {
    const data = queryClient.getQueryData([queryKey])
    if (data) {
      await this.save(storageKey, data)
    }
  }
}