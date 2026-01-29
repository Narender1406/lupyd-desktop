
"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"

import { useApiService } from "./apiService"

type SavedPostsContextType = {
  savedPostIds: string[]
  savePost: (postId: string) => void
}

const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined)


export function SavedPostsDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ savedPostIds: string[] }>({ savedPostIds: [] })

  const apiService = useApiService()

  useEffect(() => {
    // Defensive check - getSavedPosts may not be implemented in API
    const apiWithSavedPosts = apiService.api as any
    if (typeof apiWithSavedPosts.getSavedPosts === 'function') {
      apiWithSavedPosts.getSavedPosts()
        .then((ids: string[]) => setState({ savedPostIds: ids }))
        .catch((err: Error) => {
          console.error('Error fetching saved posts:', err)
          setState({ savedPostIds: [] })
        })
    } else {
      console.warn('getSavedPosts method not available in API service')
      setState({ savedPostIds: [] })
    }
  }, [apiService])


  const savePost = (postId: string) => {
    // Defensive check - savePost may not be implemented in API
    const apiWithSavePost = apiService.api as any
    if (typeof apiWithSavePost.savePost === 'function') {
      apiWithSavePost.savePost(postId)
        .then(() => console.log(`saved post ${postId}`))
        .catch((err: Error) => console.error('Error saving post:', err))
    } else {
      console.warn('savePost method not available in API service')
    }

    setState((prev) => {
      return {
        savedPostIds: Array.from(new Set([...prev.savedPostIds, postId]))
      }
    })
  }





  return <SavedPostsContext.Provider value={{ savedPostIds: state.savedPostIds, savePost }}>{children}</SavedPostsContext.Provider>
}

export function useSavedPosts() {
  const context = useContext(SavedPostsContext)
  if (context == undefined) {
    throw new Error("useSavedPosts must be used within an SavedPostsDataProvider")
  }
  return context
}
