"use client"

import { useState, useEffect } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { PostCard } from "@/components/dashboard/post-card"
import { Loader2 } from "lucide-react"
import { useQuery, useQueryClient } from '@tanstack/react-query'
import localForage from 'localforage'

import { FetchType, type GetPostsData, ulidFromString, ulidStringify, PostProtos } from "lupyd-js"

import store from "store2"
import { useUserData } from "@/context/userdata-context"
import { useAuth } from "@/context/auth-context"
import { useApiService } from "@/context/apiService"

export function PostFeed() {
  const { api } = useApiService()
  const queryClient = useQueryClient()
  const [hasMore, setHasMore] = useState(true)
  const [minimumPostId, setMinimumPostId] = useState<Uint8Array | undefined>(undefined)

  const userData = useUserData()
  const auth = useAuth()

  // Fetch posts function
  const fetchPosts = async () => {
    const details: GetPostsData = {
      fetchType: FetchType.Latest,
      start: minimumPostId ? ulidStringify(minimumPostId) : undefined,
      allowedPostTypes: Number(store.get("allowedPostsTypes") ?? "1"),
    }

    console.log({ details })

    const posts = await api.getPosts(details)

    // Update hasMore state
    if (posts.length === 0) {
      setHasMore(false)
      return []
    }

    // Update minimumPostId for pagination
    const minimumId = posts.map(e => ulidStringify(e.id)).reduce((a, b) => a > b ? b : a)
    if (!minimumPostId || ulidStringify(minimumPostId) > minimumId) {
      setMinimumPostId(ulidFromString(minimumId))
    }

    return posts
  }

  // Use React Query to fetch and cache posts
  const {
    data = []
  } = useQuery<PostProtos.FullPost[]>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnMount: false,
  })

  // ✅ CONTROLLED REFRESH (MERGE, DON'T REPLACE)
  const handleRefresh = async () => {
    const details: GetPostsData = {
      fetchType: FetchType.Latest,
      allowedPostTypes: Number(store.get("allowedPostsTypes") ?? "1"),
    }

    const newPosts = await api.getPosts(details)

    queryClient.setQueryData(["posts"], (oldPosts: PostProtos.FullPost[] = []) => {
      const oldIds = new Set(oldPosts.map((p) => ulidStringify(p.id)))

      // ✅ Only truly new posts get added
      const uniqueNewPosts = newPosts.filter(
        (p) => !oldIds.has(ulidStringify(p.id))
      )

      return [...uniqueNewPosts, ...oldPosts]; // ✅ Prepend new
    })
  }

  // Fetch more posts for infinite scroll
  const fetchMorePosts = async () => {
    const details: GetPostsData = {
      fetchType: FetchType.Latest,
      start: minimumPostId ? ulidStringify(minimumPostId) : undefined,
      allowedPostTypes: Number(store.get("allowedPostsTypes") ?? "1"),
    }

    const posts = await api.getPosts(details)

    if (posts.length === 0) {
      setHasMore(false)
      return
    }

    const minimumId = posts.map(e => ulidStringify(e.id)).reduce((a, b) => a > b ? b : a)
    if (!minimumPostId || ulidStringify(minimumPostId) > minimumId) {
      setMinimumPostId(ulidFromString(minimumId))
    }

    // Update query data with new posts
    queryClient.setQueryData(["posts"], (oldPosts: PostProtos.FullPost[] = []) => {
      const oldIds = new Set(oldPosts.map((p) => ulidStringify(p.id)))
      const uniqueNewPosts = posts.filter((p) => !oldIds.has(ulidStringify(p.id)))
      return [...oldPosts, ...uniqueNewPosts]
    })
  }

  // Fetch followed users posts
  const fetchFollowedUsersPosts = async () => {
    const follows = userData.follows
    if (follows.length == 0) return

    const usersPosts = await api.getPosts({ fetchType: FetchType.Users, fetchTypeFields: follows })

    queryClient.setQueryData(["posts"], (oldPosts: PostProtos.FullPost[] = []) => {
      const oldIds = new Set(oldPosts.map((p) => ulidStringify(p.id)))
      const uniqueNewPosts = usersPosts.filter((p) => !oldIds.has(ulidStringify(p.id)))
      return [...uniqueNewPosts, ...oldPosts]
    })
  }

  useEffect(() => {
    if (auth.username) {
      fetchFollowedUsersPosts()
    }
  }, [auth])

  // ✅ AFTER MERGING, PERSIST THE MERGED DATA
  useEffect(() => {
    if (data?.length) {
      localForage.setItem("cachedPosts", data).catch((error) => {
        console.log("Failed to persist posts to storage", error);
      });
    }
  }, [data]);

  return (
    <InfiniteScroll
      dataLength={data.length}
      next={fetchMorePosts}
      hasMore={hasMore}
      loader={
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      }
      endMessage={<p className="text-center py-4 text-sm text-muted-foreground">You've seen all posts for now!</p>}
      refreshFunction={handleRefresh}
      pullDownToRefresh
      pullDownToRefreshThreshold={50}
      pullDownToRefreshContent={
        <h3 className="text-center">&#8595; Pull down to refresh</h3>
      }
      releaseToRefreshContent={
        <h3 className="text-center">&#8593; Release to refresh</h3>
      }
      style={{
        overflowX: "hidden",
        width: "100%",
      }}
    >
      {data.map((post) => {
        const id = ulidStringify(post.id)
        return (
          <div key={id} className="mb-6">
            <PostCard post={post} onDelete={() => {
              // Remove deleted post from cache
              queryClient.setQueryData(["posts"], (oldPosts: PostProtos.FullPost[] = []) => {
                return oldPosts.filter((p) => ulidStringify(p.id) !== id)
              })
            }} />
          </div>
        )
      })}
    </InfiniteScroll>
  )
}