"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { AnimatedCard } from "@/components/animated-card"
import { UserProtos } from "lupyd-js"
import { UserAvatar } from "../user-avatar"

export interface UserCardProps {
  user: UserProtos.User,
  actionLabel?: string
  onAction?: () => void
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  delay?: number
  size?: "sm" | "md" | "lg"
  orientation?: "horizontal" | "vertical"
}

export function UserCard({
  user = UserProtos.User.create(),
  actionLabel = "Connect",
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  delay = 0,
  size = "md",
  orientation = "horizontal",
}: UserCardProps) {
  const avatarSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  }

  if (orientation === "vertical") {
    return (
      <AnimatedCard delay={delay}>
        <div className="flex flex-col items-center text-center p-4">
          <UserAvatar username={user.uname} />
          <div className="mt-3">
            <p className="font-medium">{user.uname}</p>
          </div>
          <div className="mt-3 flex space-x-2">
            {actionLabel && (
              <Button
                size="sm"
                variant={secondaryActionLabel ? "outline" : "default"}
                className={secondaryActionLabel ? "" : "bg-black text-white hover:bg-gray-800"}
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            )}
            {secondaryActionLabel && (
              <Button size="sm" variant="outline" onClick={onSecondaryAction}>
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        </div>
      </AnimatedCard>
    )
  }

  return (
    <AnimatedCard delay={delay}>
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-3">
          <UserAvatar username={user.uname} />
          <div>
          </div>
        </div>
        <div className="flex space-x-2">
          {actionLabel && (
            <Button
              size="sm"
              variant={secondaryActionLabel ? "outline" : "default"}
              className={secondaryActionLabel ? "" : "bg-black text-white hover:bg-gray-800"}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && (
            <Button size="sm" variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      </div>
    </AnimatedCard>
  )
}

