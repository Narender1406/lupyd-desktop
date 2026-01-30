"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import { bGroupMessageToGroupMessage, EncryptionPlugin, type GroupMessage } from "@/context/encryption-plugin"
import { useFirefly, type GroupMessageCallbackType } from "@/context/firefly-context"
import { useScrollBoundaryGuard } from "@/hooks/use-scroll-boundary-guard"
import { toBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import { useRef, useMemo, useState, useEffect, memo } from "react"
import { UserAvatar } from "../user-avatar"
import React from "react"

const GroupChatMessageItem = memo(({ m }: { m: GroupMessage }) => {
  const decodedText = useMemo(() => {
    try {
      return protos.GroupMessageInner.decode(m.text).messagePayload?.text || ""
    } catch {
      return "[Failed to decode]"
    }
  }, [m.text])

  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition">
      <UserAvatar username={m.sender} />

      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium dark:text-white truncate">
            {m.sender}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(m.id / 1000).toLocaleString()}
          </span>
        </div>

        <div className="text-sm dark:text-white break-words">
          {decodedText}
        </div>
      </div>
    </div>
  )
})


export function ChannelChat({
  channelId,
  groupId,
}: {
  channelId: number
  groupId: number,
}) {
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [draft, setDraft] = useState("")
  const containerRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const addMessage = (prev: GroupMessage[], msg: GroupMessage) => {
    if (prev.length > 0) {
      if (prev[prev.length - 1].id < msg.id) {
        return [...prev, msg]
      } else {
        let i = 0
        for (; i < prev.length; i++) {
          if (prev[i].id > msg.id) {
            break
          }
          if (prev[i].id == msg.id) {
            return [...prev.slice(0, i), msg, ...prev.slice(i + 1)]
          }
        }
        return [...prev.slice(0, i), msg, ...prev.slice(i)]
      }
    } else {
      return [msg]
    }
  }

  const firefly = useFirefly()

  useEffect(() => {

    const listener: GroupMessageCallbackType = (msg) => {
      if (msg.groupId == groupId) {
        const message = protos.GroupMessageInner.decode(msg.text)
        if (message.channelId == channelId) {
          setMessages((prev) => addMessage(prev, msg))
        }
      }
    }

    firefly.addGroupEventListener(listener)

    return () => {
      firefly.removeGroupEventListener(listener)
    }

  }, [])




  // Apply scroll boundary guard to the chat container
  useScrollBoundaryGuard(containerRef)

  // TODO: load older messages as they scroll
  useEffect(() => {
    setMessages([]) // Clear messages on channel switch

    const startBefore = Number.MAX_SAFE_INTEGER
    const limit = 100

    EncryptionPlugin.getGroupMessages({ groupId, startBefore, limit }).then(({ result }) => {
      // Decode and filter once
      const relevantMessages: GroupMessage[] = []
      for (const msg of result.map(bGroupMessageToGroupMessage)) {
        try {
          const message = protos.GroupMessageInner.decode(msg.text)
          if (message.channelId == channelId) {
            relevantMessages.push(msg)
          }
        } catch (e) { console.warn("Failed to decode msg", e) }
      }
      setMessages(relevantMessages.sort((a, b) => a.id - b.id))
    })
  }, [groupId, channelId])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    // Scroll to bottom when messages load or change
    el.scrollTop = el.scrollHeight
  }, [messages])

  const auth = useAuth()
  async function send() {
    const content = draft.trim()
    if (!content) return

    const text = protos.GroupMessageInner.encode({
      channelId,
      messagePayload: protos.MessagePayload.create({
        text: content,
      })
    }).finish();

    const msg: GroupMessage = {
      groupId,
      text: text,
      sender: auth.username!,
      id: 0,
      channelId, // Add missing channelId
      epoch: 0, // Add missing epoch
    }

    try {
      // Optimistically add message to UI
      setMessages((prev) => addMessage(prev, msg))
      setDraft("")

      // Ensure input stays focused (keep keyboard open)
      inputRef.current?.focus()

      // Send message in background (fire and forget)
      // We don't await here so the UI thread is not blocked from clearing the input
      EncryptionPlugin.encryptAndSendGroupMessage({
        textB64: toBase64(text),
        ...msg
      }).then((msgId) => {
        // Update message ID after successful send
        setMessages((prev) => {
          const newMsg = { ...msg, id: msgId.messageId }

          // Remove the optimistic message (id 0) and add the real one
          const filtered = prev.filter(m => m.id !== 0)
          return addMessage(filtered, newMsg)
        })
      }).catch((error) => {
        console.error('Failed to send message:', error)
        // Remove optimistic message on error and restore draft?
        setMessages(prev => prev.filter(m => m.id !== 0))
        setDraft(content) // Restore draft
      })

    } catch (error) {
      console.error('Error preparing message:', error)
      setDraft(content)
    }

  }

  return (
    <div className="flex h-full flex-col">
      {/* Chat scroll area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-white dark:bg-black"
      >
        {messages.map((m: GroupMessage) => (
          <GroupChatMessageItem key={m.id} m={m} />
        ))}
      </div>

      {/* Inline composer (mobile only) */}
      <div className="border-t p-2 md:hidden bg-white dark:bg-black">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={"Message #" + channelId}
            className="bg-gray-100 dark:bg-neutral-900 border-none text-black dark:text-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          // Just let the natural focus behavior work
          />
          <Button
            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300"
            onClick={send}
            onMouseDown={(e) => e.preventDefault()}
            disabled={!draft.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}