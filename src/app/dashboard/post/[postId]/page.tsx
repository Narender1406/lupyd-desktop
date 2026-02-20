"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PostCard } from "@/components/dashboard/post-card"
import { PostProtos, } from "lupyd-js"
import { usePathParams } from "@/hooks/use-path-params"
import { useEffect, useState } from "react"
import { useApiService } from "@/context/apiService"

export default function PostPage() {

  const { postId } = usePathParams<{ postId: string }>('/post/:postId')

  const [post, setPost] = useState<PostProtos.FullPost | undefined>(undefined)
  const { api } = useApiService()

  useEffect(() => {
    if (!postId) return
    api.getPost(postId).then(setPost).catch(console.error)
  }, [postId])

  return (

    <DashboardLayout>
      <div className="flex justify-center pb-24 md:pb-0">
        <div className="w-fit">
          {post ? <PostCard post={post} /> : <div />}
        </div>
      </div>
    </DashboardLayout>
  )

}

