"use client"

import { useEffect, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Member {
  id: string
  name: string
  username: string
  avatar: string
  isOnline?: boolean
}

interface Message {
  id: string
  channelId: string
  senderId: string
  content: string
  createdAt: string
}

export function ChannelChat({
  channelId = "general",
  members = [],
}: {
  channelId?: string
  members?: Member[]
}) {
  const [messages, setMessages] = useState<Message[]>(() => seedMessages(channelId))
  const [draft, setDraft] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMessages(seedMessages(channelId))
    setDraft("")
  }, [channelId])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages])

  const nameById = (id: string) => members.find((m) => m.id === id)?.name || "User"
  const avatarById = (id: string) => members.find((m) => m.id === id)?.avatar || "/abstract-geometric-shapes.png"

  function send() {
    const content = draft.trim()
    if (!content) return
    setMessages((prev) => [
      ...prev,
      {
        id: `m${prev.length + 1}`,
        channelId,
        senderId: members[0]?.id || "1",
        content,
        createdAt: new Date().toISOString(),
      },
    ])
    setDraft("")
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={containerRef} className="flex-1 overflow-y-auto bg-white px-4 py-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={avatarById(m.senderId) || "/placeholder.svg?height=32&width=32&query=avatar"}
                alt={nameById(m.senderId)}
              />
              <AvatarFallback>{nameById(m.senderId).slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium truncate">{nameById(m.senderId)}</span>
                <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-sm">{m.content}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Inline composer (used when parent doesn’t render its own) */}
      <div className="border-t p-2 md:hidden">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={"Message #" + channelId}
            className="bg-gray-100 border-none"
          />
          <Button className="bg-black text-white hover:bg-gray-800" onClick={send}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

function seedMessages(channelId: string): Message[] {
  const now = Date.now()
  return [
    {
      id: "m1",
      channelId,
      senderId: "1",
      content: `Welcome to #${channelId}!`,
      createdAt: new Date(now - 3600_000).toISOString(),
    },
    {
      id: "m2",
      channelId,
      senderId: "3",
      content: "Remember to keep discussions on-topic.",
      createdAt: new Date(now - 1800_000).toISOString(),
    },
    {
      id: "m3",
      channelId,
      senderId: "2",
      content: "Drop your updates below.",
      createdAt: new Date(now - 600_000).toISOString(),
    },
  ]
}
