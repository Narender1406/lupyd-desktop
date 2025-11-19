"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
    <Card className="border-none shadow-sm bg-white dark:bg-black">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <UserAvatar username={username ?? ""} />
          <div className="flex-1">
            <Input
              placeholder="What's on your mind?"
              className="
                bg-white text-black placeholder-gray-600
                dark:bg-black dark:text-white dark:placeholder-gray-400
                border border-gray-300 dark:border-gray-600
                rounded-md
                focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700
              "
              onMouseDown={goToCreatePost}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
