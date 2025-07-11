"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Share2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {Link} from "react-router-dom"

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: "like",
    user: { name: "Sarah Chen", username: "sarahc", avatar: "/placeholder.svg?height=40&width=40" },
    content: "liked your post",
    post: "Amazing sunset at the beach today! 🌅",
    timestamp: "2 min ago",
    read: false,
  },
  {
    id: 2,
    type: "comment",
    user: { name: "Mike Johnson", username: "mikej", avatar: "/placeholder.svg?height=40&width=40" },
    content: "commented on your post",
    comment: "Beautiful shot! What camera did you use?",
    timestamp: "5 min ago",
    read: false,
  },
  {
    id: 3,
    type: "follow",
    user: { name: "Emma Wilson", username: "emmaw", avatar: "/placeholder.svg?height=40&width=40" },
    content: "started following you",
    timestamp: "1 hour ago",
    read: true,
  },
  {
    id: 4,
    type: "mention",
    user: { name: "Alex Rivera", username: "alexr", avatar: "/placeholder.svg?height=40&width=40" },
    content: "mentioned you in a post",
    post: "Great collaboration with @yourhandle on this project!",
    timestamp: "2 hours ago",
    read: true,
  },
]

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
  const [notifications, setNotifications] = useState(mockNotifications)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

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
    navigate("/dashboard/notification")
  }

  const markAsRead = (id: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = (event: React.MouseEvent) => {
    event.stopPropagation()
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const handleNotificationClick = (notification: any) => {
    // Mark as read when clicked
    setNotifications((prev) => prev.map((notif) => (notif.id === notification.id ? { ...notif, read: true } : notif)))

    // Navigate to full notifications page
    navigate("/dashboard/notification")
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
      {showDropdown && !isMobile && (
        <div
          className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          onMouseEnter={() => {
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current)
              hideTimeoutRef.current = null
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-black text-white text-sm">
                    {unreadCount}
                  </Badge>
                )}
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-black text-xs"
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="relative">
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name} />
                    <AvatarFallback className="bg-gray-100 text-black text-sm">
                      {notification.user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-200 rounded-full p-1">
                    <NotificationIcon type={notification.type} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-black text-sm">{notification.user.name}</span>
                    <span className="text-gray-500 text-xs">{notification.timestamp}</span>
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                  <p className="text-gray-700 text-sm mb-1">{notification.content}</p>
                  {(notification.post || notification.comment) && (
                    <p className="text-gray-600 text-xs bg-gray-100 rounded p-2 line-clamp-2">
                      {notification.comment || notification.post}
                    </p>
                  )}
                </div>

                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-green-600 p-1"
                    onClick={(e) => markAsRead(notification.id, e)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full text-center text-black hover:bg-gray-100 font-medium"
              onClick={() => navigate("/dashboard/notification")}
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
