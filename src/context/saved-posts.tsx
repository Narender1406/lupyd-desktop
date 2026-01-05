
"use client"

import { createContext, type ReactNode, useContext, useEffect, useState } from "react"

import { useApiService } from "./apiService"

type SavedPostsContextType = {
  savedPostIds: string[]
  savePost: (postId: string) => void
}

const SavedPostsContext = createContext<SavedPostsContextType| undefined>(undefined)


export function SavedPostsDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ savedPostIds: string[] }>({ savedPostIds: [] })

  const apiService = useApiService()

  useEffect(() => {
    apiService.api.getSavedPosts().then(ids => setState({ savedPostIds: ids})).catch(console.error)

  }, [apiService])


  const savePost = (postId: string) => {
    apiService.api.savePost(postId).then(() => console.log(`saved post ${postId}`)).catch(console.error)

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
