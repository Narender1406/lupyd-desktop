"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PostCard } from "@/components/dashboard/post-card"
import { getPost, PostProtos, } from "lupyd-js"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

export default function PostPage() {

  const params = useParams()

  const [post, setPost] = useState<PostProtos.FullPost | null>(null)

  useEffect(() => {
    const id = params.postId
    if (typeof id !== "string") return
    getPost(id).then(setPost).catch(console.error)
  }, [])

  return (

    <DashboardLayout>
      <div className="flex justify-center">
        <div className="w-fit">
          {post ? <PostCard post={post} /> : <div />}
        </div>
      </div>
    </DashboardLayout>
  )

}

