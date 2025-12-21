"use client"

import { useEffect } from "react"
import { useQueryClient } from '@tanstack/react-query'
import localForage from 'localforage'
import { PostFeed } from "@/components/dashboard/post-feed"
import { PostProtos } from "lupyd-js"

// Wrapper component that adds persistence to the existing PostFeed
export function PersistentPostFeed() {
  const queryClient = useQueryClient()
  
  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      try {
        const cachedPosts = await localForage.getItem<PostProtos.FullPost[]>("cachedPosts")
        if (cachedPosts) {
          queryClient.setQueryData(["posts"], cachedPosts)
        }
      } catch (error) {
        console.log("Failed to load cached posts", error)
      }
    }
    
    loadCachedData()
  }, [queryClient])

  return <PostFeed />
}