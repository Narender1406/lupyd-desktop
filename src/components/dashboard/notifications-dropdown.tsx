"use client"

import { useState } from "react"
import { Bell, Check, Clock, User, MessageSquare, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock notifications data
const notifications = [
  {
    id: "notif1",
    type: "follow",
    user: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "SJ",
    },
    content: "started following you",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "notif2",
    type: "like",
    user: {
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "AC",
    },
    content: "liked your post",
    time: "15 minutes ago",
    read: false,
  },
  {
    id: "notif3",
    type: "comment",
    user: {
      name: "Emily Wong",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "EW",
    },
    content: "commented on your post",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "notif4",
    type: "mention",
    user: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=40&width=40",
      avatarFallback: "MB",
    },
    content: "mentioned you in a comment",
    time: "3 hours ago",
    read: true,
  },
]

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [notifs, setNotifs] = useState(notifications)

  const unreadCount = notifs.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "follow":
        return <User className="h-4 w-4 text-blue-500" />
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "mention":
        return <Star className="h-4 w-4 text-yellow-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const filteredNotifications =
    activeTab === "all" ? notifs : activeTab === "unread" ? notifs.filter((n) => !n.read) : notifs.filter((n) => n.read)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-black text-white rounded-full text-[10px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-2 pt-1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="max-h-[300px] overflow-y-auto">
            <DropdownMenuGroup>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="p-0 focus:bg-transparent">
                    <div
                      className={`flex items-start w-full p-2 ${!notification.read ? "bg-gray-50" : ""} hover:bg-gray-100 rounded-md`}
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={notification.user.avatar} alt={notification.user.name} />
                        <AvatarFallback>{notification.user.avatarFallback}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <p className="text-sm">
                            <span className="font-medium">{notification.user.name}</span>{" "}
                            <span className="text-muted-foreground">{notification.content}</span>
                          </p>
                          <div className="flex items-center">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{notification.time}</span>
                          <span className="ml-2 flex items-center">{getNotificationIcon(notification.type)}</span>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">No notifications to display</div>
              )}
            </DropdownMenuGroup>
          </TabsContent>
        </Tabs>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm font-medium">View all notifications</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
