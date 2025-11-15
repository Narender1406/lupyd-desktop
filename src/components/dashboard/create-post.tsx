"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImageIcon, Video, FileText, Smile } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { UserAvatar } from "../user-avatar"
import { useNavigate } from "react-router-dom"

export function CreatePost() {
  const { username } = useAuth()
  const router = useNavigate()

  const goToCreatePost = () => {
    router("/create-post")
  }
  

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <UserAvatar username={username ?? ""}/>
          <div className="flex-1">
            <Input placeholder="What's on your mind?" className="bg-gray-100 border-none"  onMouseDown={goToCreatePost}/>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
