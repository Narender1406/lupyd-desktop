"use client"

import type React from "react"

import { Bell, Heart, MessageCircle, UserPlus, MoreHorizontal, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { dateToRelativeString,  getTimestampFromUlid, ulidStringify, type NotificationProtos } from "lupyd-js"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/context/auth-context"
import { useApiService } from "@/context/apiService"


function NotificationIcon({ type }: { type: NotificationProtos.NotificationType }) {
  const iconClass = "h-4 w-4"

  if (type.comment) {
    return <MessageCircle className={`${iconClass} text-blue-500`} />
  }

  if (type.like) {
    return <Heart className={`${iconClass} text-red-500`} fill="currentColor" />
  }

  if (type.follow) {

    return <UserPlus className={`${iconClass} text-green-500`} />
  }

  // case "mention":
  //   return <AtSign className={`${iconClass} text-purple-500`} />
  // case "share":
  //   return <Share2 className={`${iconClass} text-orange-500`} />
  return <Bell className={`${iconClass} text-gray-500`} />
}

export function NotificationItem({ notification, onMarkAsRead }: { notification: NotificationProtos.Notification; onMarkAsRead: (id: Uint8Array) => void }) {
  const handleClick = () => {
    // Handle notification click - could expand details, mark as read, etc.
    console.log("Notification clicked:", notification.id)
    if (!notification.seen) {
      onMarkAsRead(notification.id)
    }
  }

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMarkAsRead(notification.id)
  }

  const timestamp = getTimestampFromUlid(notification.id);

  const otherUsername = notification.notificationType?.comment?.commentedBy ||
    notification.notificationType?.follow?.uname || notification.notificationType?.like?.likedBy;


  const getContent = () => {
    if (notification.notificationType?.comment) {
      return "commented on your post"
    }
    if (notification.notificationType?.like) {
      return "liked your post"
    }
    if (notification.notificationType?.follow) {
      return "started following you"
    }

    return "";
  }




  return (
    <div
      className={`flex items-start gap-4 p-6 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${!notification.seen ? "bg-blue-50 border-l-4 border-l-blue-500" : "bg-white"
        }`}
      onClick={handleClick}
    >
      <div className="relative">
        <UserAvatar username={otherUsername || ""}></UserAvatar>

        <div className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-300 rounded-full p-1.5">
          <NotificationIcon type={notification.notificationType!} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-semibold text-black text-base">{otherUsername}</span>
          <span className="text-gray-500 text-sm">{dateToRelativeString(new Date(timestamp))}</span>
          {!notification.seen && (
            <Badge variant="secondary" className="bg-black text-white text-xs px-2 py-1 font-medium">
              New
            </Badge>
          )}
        </div>
        <p className="text-gray-700 text-sm mb-3 leading-relaxed">{
          getContent()}</p>
        {(notification.notificationType?.like || notification.notificationType?.comment) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm">
            {       /*     <p className="text-gray-800 leading-relaxed">{notification.comment || notification.post}</p>*/
            }          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!notification.seen && (
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
  const [notifications, setNotifications] = useState<NotificationProtos.Notification[]>([])
  const navigate = useNavigate()

  const unreadCount = notifications.filter((n) => !n.seen).length

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const handleMarkAsRead = (id: Uint8Array) => {
    setNotifications((prev) =>
      prev.map((notif) => (indexedDB.cmp(notif.id, id) ? { ...notif, read: true } : notif))
    )
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const auth = useAuth()
  const { api } = useApiService()

  useEffect(() => {
    if (auth.username) {
      api.getNotifications().then((result) => setNotifications(result.notifications))
    }
  }, [auth])

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back Arrow */}
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-6 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white 
                     hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-all duration-200"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </Button>

        <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-black dark:text-white text-2xl font-bold">
                <Bell className="h-6 w-6" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-black dark:bg-white text-white dark:text-black text-sm px-3 py-1">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 
                             hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black 
                             transition-all duration-200 bg-white dark:bg-black font-medium"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0 bg-white dark:bg-black">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">No notifications yet</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  {"When you get notifications, they'll show up here"}
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={ulidStringify(notification.id)}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
