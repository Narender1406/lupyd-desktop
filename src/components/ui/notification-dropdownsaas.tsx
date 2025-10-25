"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

const notifications = [
  {
    id: 1,
    title: "Server Alert",
    message: "High CPU usage detected on Call Server",
    time: "2 min ago",
    type: "warning",
  },
  {
    id: 2,
    title: "New Client",
    message: "TechCorp has subscribed to Premium plan",
    time: "1 hour ago",
    type: "info",
  },
  {
    id: 3,
    title: "API Limit",
    message: "Client approaching API rate limit",
    time: "3 hours ago",
    type: "warning",
  },
]

export function NotificationDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">3</Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => (
          <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
            <div className="flex w-full items-center justify-between">
              <span className="font-medium">{notification.title}</span>
              <span className="text-xs text-muted-foreground">{notification.time}</span>
            </div>
            <span className="text-sm text-muted-foreground">{notification.message}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
