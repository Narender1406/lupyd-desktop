"use client"

import { useState, useEffect, useMemo } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { PostCard } from "@/components/dashboard/post-card"
import { Loader2 } from "lucide-react"

import { FetchType, type GetPostsData, ulidFromString, ulidStringify } from "lupyd-js"

// Import the post data type from post-card.tsx
import { PostProtos } from "lupyd-js"
import store from "store2"
import { useUserData } from "@/context/userdata-context"
import { useAuth } from "@/context/auth-context"
import { useApiService } from "@/context/apiService"


export function PostFeed() {

  const { api } = useApiService()


  const [items, setItems] = useState<PostProtos.FullPost[]>([])
  const [hasMore, setHasMore] = useState(true)
  let [minimumPostId, setMinimumPostId] = useState<Uint8Array | undefined>(undefined)


  const userData = useUserData()
  // let maximumPostId: Uint8Array | undefined = undefined


  const fetchItems = async () => {

    const details: GetPostsData = {
      fetchType: FetchType.Latest,
      start: minimumPostId ? ulidStringify(minimumPostId) : undefined,
      allowedPostTypes: Number(store.get("allowedPostsTypes") ?? "1"),
    }

    console.log({ details })

    const posts = await api.getPosts(details)
    if (posts.length === 0) { setHasMore(false); return }


    let minimumId = posts.map(e => ulidStringify(e.id)).reduce((a, b) => a > b ? b : a)
    if (!minimumPostId || ulidStringify(minimumPostId) > minimumId) {
      setMinimumPostId(ulidFromString(minimumId))
    }

    setItems((prev) => {
      const prevIds = new Set(prev.map(e => ulidStringify(e.id)))
      const newPosts = [...prev];
      for (const post of posts) {
        if (!prevIds.has(ulidStringify(post.id))) {
          newPosts.push(post)
        }
      }
      return newPosts
    })

  }


  const fetchFollowedUsersPosts = async () => {
    const follows = userData.follows
    if (follows.length == 0) return

    const usersPosts = await api.getPosts({ fetchType: FetchType.Users, fetchTypeFields: follows })
    setItems((prev) => {
      const prevIds = new Set(prev.map(e => ulidStringify(e.id)))
      const newItems = [...prev]
      for (const post of usersPosts) {
        if (!prevIds.has(ulidStringify(post.id))) {
          newItems.push(post)
        }
      }
      return newItems
    })
  }

  const auth = useAuth()

  useEffect(() => {
    if (auth.username) {
      fetchFollowedUsersPosts()
    }
  }, [auth])


  useEffect(() => {
    fetchItems()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <InfiniteScroll
      dataLength={items.length}
      next={fetchItems}
      hasMore={hasMore}
      loader={
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      }
      endMessage={<p className="text-center py-4 text-sm text-muted-foreground">You've seen all posts for now!</p>}
    >
      {items.map((post) => {
        const id = ulidStringify(post.id)
        return (
          <div key={id} className="mb-6">
            <PostCard post={post} onDelete={(id) => setItems((prev) => prev.filter(e => !indexedDB.cmp(e.id, id)))} />
          </div>
        )
      })}
    </InfiniteScroll>
  )
}
