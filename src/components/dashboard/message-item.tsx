"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedCard } from "@/components/animated-card"

export interface MessageItemProps {
  id: string
  sender: {
    id: string
    name: string
    avatar: string
    avatarFallback: string
    isOnline?: boolean
  }
  preview: string
  timestamp: string
  isUnread?: boolean
  isActive?: boolean
  onClick?: () => void
  delay?: number
}

export function MessageItem({
  sender,
  preview,
  timestamp,
  isUnread = false,
  isActive = false,
  onClick,
  delay = 0,
}: MessageItemProps) {
  return (
    <AnimatedCard delay={delay}>
      <div className={`p-4 hover:bg-gray-50 cursor-pointer ${isActive ? "bg-gray-50" : ""}`} onClick={onClick}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={sender.avatar} alt={sender.name} />
              <AvatarFallback>{sender.avatarFallback}</AvatarFallback>
            </Avatar>
            {sender.isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className={`font-medium truncate ${isUnread ? "text-black" : ""}`}>{sender.name}</p>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
            </div>
            <p className={`text-sm truncate ${isUnread ? "text-black font-medium" : "text-muted-foreground"}`}>
              {preview}
            </p>
          </div>
        </div>
      </div>
    </AnimatedCard>
  )
}

