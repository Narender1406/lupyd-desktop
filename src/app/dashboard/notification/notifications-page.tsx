"use client"

import type React from "react"

import { Bell, Heart, MessageCircle, UserPlus, AtSign, Share2, MoreHorizontal, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

// Mock data for notifications
const initialNotifications = [
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
  {
    id: 5,
    type: "share",
    user: { name: "Lisa Park", username: "lisap", avatar: "/placeholder.svg?height=40&width=40" },
    content: "shared your post",
    post: "Tips for better photography composition",
    timestamp: "3 hours ago",
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

function NotificationItem({ notification, onMarkAsRead }: { notification: any; onMarkAsRead: (id: number) => void }) {
  const handleClick = () => {
    // Handle notification click - could expand details, mark as read, etc.
    console.log("Notification clicked:", notification.id)
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkAsRead(notification.id)
  }

  return (
    <div
      className={`flex items-start gap-4 p-6 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
        !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : "bg-white"
      }`}
      onClick={handleClick}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 border-2 border-gray-300">
          <AvatarImage src={notification.user.avatar || "/placeholder.svg"} alt={notification.user.name} />
          <AvatarFallback className="bg-white text-black border border-gray-300 font-medium">
            {notification.user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-300 rounded-full p-1.5">
          <NotificationIcon type={notification.type} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold text-black text-base">{notification.user.name}</span>
          <span className="text-gray-600 text-sm">@{notification.user.username}</span>
          <span className="text-gray-500 text-sm">{notification.timestamp}</span>
          {!notification.read && (
            <Badge variant="secondary" className="bg-black text-white text-xs px-2 py-1 font-medium">
              New
            </Badge>
          )}
        </div>
        <p className="text-gray-700 text-sm mb-3 leading-relaxed">{notification.content}</p>
        {(notification.post || notification.comment) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
            <p className="text-gray-800 leading-relaxed">{notification.comment || notification.post}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!notification.read && (
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-green-600 p-2"
            onClick={handleMarkAsRead}
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-black hover:bg-gray-100 rounded-full p-2">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const navigate = useNavigate()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const handleMarkAsRead = (id: number) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back Arrow */}
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6 text-gray-600 hover:text-black hover:bg-gray-100 p-2 rounded-full transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-black text-2xl font-bold">
                <Bell className="h-6 w-6" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-black text-white text-sm px-3 py-1">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-black hover:text-white hover:border-black transition-all duration-200 bg-white font-medium"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No notifications yet</p>
                <p className="text-gray-500 text-sm mt-2">{"When you get notifications, they'll show up here"}</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} onMarkAsRead={handleMarkAsRead} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
