"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {  type NotificationProtos } from "lupyd-js"
import { useAuth } from "@/context/auth-context"
import { useApiService } from "@/context/apiService"

// Mock notifications data
// const mockNotifications = [
//   {
//     id: 1,
//     type: "like",
//     user: { name: "Sarah Chen", username: "sarahc", avatar: "/placeholder.svg?height=40&width=40" },
//     content: "liked your post",
//     post: "Amazing sunset at the beach today! 🌅",
//     timestamp: "2 min ago",
//     read: false,
//   },
//   {
//     id: 2,
//     type: "comment",
//     user: { name: "Mike Johnson", username: "mikej", avatar: "/placeholder.svg?height=40&width=40" },
//     content: "commented on your post",
//     comment: "Beautiful shot! What camera did you use?",
//     timestamp: "5 min ago",
//     read: false,
//   },
//   {
//     id: 3,
//     type: "follow",
//     user: { name: "Emma Wilson", username: "emmaw", avatar: "/placeholder.svg?height=40&width=40" },
//     content: "started following you",
//     timestamp: "1 hour ago",
//     read: true,
//   },
//   {
//     id: 4,
//     type: "mention",
//     user: { name: "Alex Rivera", username: "alexr", avatar: "/placeholder.svg?height=40&width=40" },
//     content: "mentioned you in a post",
//     post: "Great collaboration with @yourhandle on this project!",
//     timestamp: "2 hours ago",
//     read: true,
//   },
// ]



export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationProtos.Notification[]>([])

  const navigate = useNavigate()
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const auth = useAuth()
  const {api }= useApiService()

  useEffect(() => {
    if (auth.username) {
      api.getNotifications().then(result => setNotifications(result.notifications));
    }
  }, [auth])



  const unreadCount = notifications.filter((n) => !n.seen).length

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    hoverTimeoutRef.current = setTimeout(() => {
      // setShowDropdown(true)
    }, 200)
  }

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    hideTimeoutRef.current = setTimeout(() => {
      // setShowDropdown(false)
    }, 300)
  }

  const handleClick = () => {
    navigate("/notification")
  }



  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <Button variant="ghost" size="icon" className="relative" onClick={handleClick}>
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown - Only show on desktop when hovering */}
      
    </div>
  )
}
