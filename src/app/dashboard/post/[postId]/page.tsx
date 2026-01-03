"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PostCard } from "@/components/dashboard/post-card"
import {  PostProtos, } from "lupyd-js"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useApiService } from "@/context/apiService"

export default function PostPage() {

  const params = useParams()

  const [post, setPost] = useState<PostProtos.FullPost | undefined>(undefined)
  const { api } = useApiService()

  useEffect(() => {
    const id = params.postId
    if (typeof id !== "string") return
    api.getPost(id).then(setPost).catch(console.error)
  }, [])

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

