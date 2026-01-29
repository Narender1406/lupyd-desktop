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

  // Save and restore scroll position
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('feed-scroll')
    if (savedScroll) {
      // Restore scroll position after a short delay to ensure content is loaded
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScroll))
      }, 100)
    }

    // Save scroll position before unmount
    return () => {
      sessionStorage.setItem('feed-scroll', window.scrollY.toString())
    }
  }, [])

  return <PostFeed />
}