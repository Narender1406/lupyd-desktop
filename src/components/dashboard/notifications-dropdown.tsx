"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Share2  } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {  type NotificationProtos } from "lupyd-js"
import { NotificationItem } from "@/app/dashboard/notification/notifications-page"
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

function NotificationIcon({ type }: { type: string }) {
  const iconClass = "h-4 w-4"
  switch (type) {
    case "like":
      return <Heart className={`${iconClass} text-red-500`} fill="currentColor" />
    case "comment":
      return <MessageCircle className={`${iconClass} text-blue-500`} />
    case "follow":
      return <UserPlus className={`${iconClass} text-green-500`} />
    case "mention":
      return <AtSign className={`${iconClass} text-purple-500`} />
    case "share":
      return <Share2 className={`${iconClass} text-orange-500`} />
    default:
      return <Bell className={`${iconClass} text-gray-500`} />
  }
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationProtos.Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const unreadCount = notifications.filter((n) => !n.seen).length

  const handleMouseEnter = () => {
    if (isMobile) return

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setShowDropdown(true)
    }, 200)
  }

  const handleMouseLeave = () => {
    if (isMobile) return

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }

    hideTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false)
    }, 300)
  }

  const handleClick = () => {
    navigate("/notification")
  }

  const markAsRead = (id: Uint8Array, event: React.MouseEvent) => {
    event.stopPropagation()
    setNotifications((prev) => prev.map((notif) => (indexedDB.cmp(notif.id, id) ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = (event: React.MouseEvent) => {
    event.stopPropagation()
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const handleNotificationClick = (notification: NotificationProtos.Notification) => {
    // Mark as read when clicked
    setNotifications((prev) => prev.map((notif) => (indexedDB.cmp(notif.id, notification.id) ? { ...notif, read: true } : notif)))

    // Navigate to full notifications page
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
