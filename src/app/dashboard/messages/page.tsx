"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedCard } from "@/components/animated-card"
import {
  Bell,
  MessageSquare,
  Users,
  Compass,
  BarChart,
  Settings,
  Search,
  Home,
  Activity,
  LogOut,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/context/auth-context"
import { CDN_STORAGE, dateToRelativeString, getLastMessagesForEachUser, type LastChatMessagePair } from "lupyd-js"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

// Types for our data structure
interface Message {
  id: string
  sender: "me" | "them"
  text: string
  time: string
  replyTo?: {
    id: string
    text: string
    sender: "me" | "them"
  }
  reactions?: string[]
}

interface Conversation {
  id: string
  user: {
    name: string
    avatar: string
    avatarFallback: string
    isOnline: boolean
  }
  lastMessage: string
  time: string
  unread: boolean
  messages: Message[]
}

// Mock conversations data with unique messages for each conversation
const conversations: Conversation[] = [
  {
    id: "conv1",
    user: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=48&width=48",
      avatarFallback: "SJ",
      isOnline: true,
    },
    lastMessage: "Hey, what do you think about the new design?",
    time: "12:34 PM",
    unread: true,
    messages: [
      {
        id: "msg1-1",
        sender: "them",
        text: "Hey, what do you think about the new design?",
        time: "12:34 PM",
      },
      {
        id: "msg1-2",
        sender: "me",
        text: "I think it looks great! I especially like the new color scheme.",
        time: "12:36 PM",
      },
      {
        id: "msg1-3",
        sender: "them",
        text: "Thanks! I was worried about the typography, but I think it works well with the overall aesthetic.",
        time: "12:38 PM",
      },
      {
        id: "msg1-4",
        sender: "me",
        text: "The typography is perfect. Very readable and modern. Do you have the final mockups ready?",
        time: "12:40 PM",
        replyTo: {
          id: "msg1-3",
          text: "Thanks! I was worried about the typography, but I think it works well with the overall aesthetic.",
          sender: "them",
        },
      },
      {
        id: "msg1-5",
        sender: "them",
        text: "Almost! I'm just finalizing a few details. I'll send them over by the end of the day.",
        time: "12:42 PM",
      },
    ],
  },
  {
    id: "conv2",
    user: {
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=48&width=48",
      avatarFallback: "AC",
      isOnline: false,
    },
    lastMessage: "Thanks for sharing that article!",
    time: "Yesterday",
    unread: false,
    messages: [
      {
        id: "msg2-1",
        sender: "me",
        text: "Hey Alex, I found this interesting article about AI in design. Thought you might like it: https://example.com/ai-design",
        time: "10:15 AM",
      },
      {
        id: "msg2-2",
        sender: "them",
        text: "Thanks for sharing that article! I've been looking for resources on this topic.",
        time: "11:30 AM",
      },
      {
        id: "msg2-3",
        sender: "them",
        text: "Just finished reading it. There are some great insights about how AI can help with prototyping.",
        time: "1:45 PM",
      },
      {
        id: "msg2-4",
        sender: "me",
        text: "Glad you found it useful! I'm thinking of implementing some of those techniques in our next project.",
        time: "2:20 PM",
        replyTo: {
          id: "msg2-3",
          text: "Just finished reading it. There are some great insights about how AI can help with prototyping.",
          sender: "them",
        },
      },
      {
        id: "msg2-5",
        sender: "them",
        text: "That would be awesome! Let me know if you need any help with that.",
        time: "3:05 PM",
        reactions: ["👍", "🚀"],
      },
    ],
  },
  {
    id: "conv3",
    user: {
      name: "Michael Brown",
      avatar: "/placeholder.svg?height=48&width=48",
      avatarFallback: "MB",
      isOnline: true,
    },
    lastMessage: "Are we still meeting tomorrow at 2pm?",
    time: "Monday",
    unread: false,
    messages: [
      {
        id: "msg3-1",
        sender: "them",
        text: "Hi there! Just checking in about our project timeline.",
        time: "9:30 AM",
      },
      {
        id: "msg3-2",
        sender: "me",
        text: "Hey Michael! I'm working on the final deliverables now. Should be ready by tomorrow.",
        time: "10:15 AM",
      },
      {
        id: "msg3-3",
        sender: "them",
        text: "Sounds good. Are we still meeting tomorrow at 2pm?",
        time: "10:45 AM",
      },
      {
        id: "msg3-4",
        sender: "me",
        text: "Yes, that works for me. I'll prepare a presentation of what we've accomplished so far.",
        time: "11:20 AM",
      },
      {
        id: "msg3-5",
        sender: "them",
        text: "Perfect! Looking forward to seeing the progress.",
        time: "11:45 AM",
        reactions: ["👍"],
      },
    ],
  },
  {
    id: "conv4",
    user: {
      name: "Design Team",
      avatar: "/placeholder.svg?height=48&width=48",
      avatarFallback: "DT",
      isOnline: false,
    },
    lastMessage: "Emily: I've uploaded the new assets to the shared folder",
    time: "Sunday",
    unread: false,
    messages: [
      {
        id: "msg4-1",
        sender: "them",
        text: "Team, we need to finalize the design system by Friday. Any blockers?",
        time: "3:30 PM",
      },
      {
        id: "msg4-2",
        sender: "me",
        text: "I'm working on the component library. Should be done by Thursday.",
        time: "3:45 PM",
      },
      {
        id: "msg4-3",
        sender: "them",
        text: "Great! Emily, how's the icon set coming along?",
        time: "4:00 PM",
      },
      {
        id: "msg4-4",
        sender: "them",
        text: "Emily: Almost done! I've uploaded the new assets to the shared folder.",
        time: "4:15 PM",
      },
      {
        id: "msg4-5",
        sender: "me",
        text: "Awesome work everyone! Let's sync up tomorrow to review everything together.",
        time: "4:30 PM",
        replyTo: {
          id: "msg4-4",
          text: "Emily: Almost done! I've uploaded the new assets to the shared folder.",
          sender: "them",
        },
      },
    ],
  },
]

// Emoji picker options
const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨", "🎉", "👏"]

// Mock notifications
const notifications = [
  {
    id: "notif1",
    user: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "sent you a message",
    time: "2 minutes ago",
    read: false,
  },
  {
    id: "notif2",
    user: {
      name: "Alex Chen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "mentioned you in Design Team",
    time: "15 minutes ago",
    read: false,
  },
  {
    id: "notif3",
    user: {
      name: "Emily Wong",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "shared a document with you",
    time: "1 hour ago",
    read: true,
  },
]

export default function MessagesPage() {
  const { user, logout } = useAuth()
  const router = useNavigate()
  const [activeTab, setActiveTab] = useState("messages")
  // const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)






  // Find the selected conversation data
  // const selectedConversationData = conversations.find((conv) => conv.id === selectedConversation)

  // Function to update layout dimensions
  const updateLayoutDimensions = () => {
    // Get viewport dimensions
    const vh = window.innerHeight
    const vw = window.innerWidth

    // Update message container height
    if (messagesContainerRef.current) {
      const headerHeight = 64 // Approximate header height
      const inputHeight = replyingTo ? 140 : 80 // Approximate input height
      const availableHeight = vh - headerHeight - inputHeight

      messagesContainerRef.current.style.height = `${availableHeight}px`
      messagesContainerRef.current.style.maxHeight = `${availableHeight}px`
    }

    // Update input container position
    if (inputContainerRef.current) {
      const sidebarWidth = vw >= 768 ? 256 : 0 // 256px is the width of the sidebar on desktop

      inputContainerRef.current.style.position = "fixed"
      inputContainerRef.current.style.bottom = "0"
      inputContainerRef.current.style.width = vw >= 768 ? `calc(100% - ${sidebarWidth}px)` : "100%"
      inputContainerRef.current.style.left = vw >= 768 ? `${sidebarWidth}px` : "0"
      inputContainerRef.current.style.zIndex = "50" // Ensure it's above other elements
    }

    // Force scroll to bottom after layout updates
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }


  const [lastConversations, setLastConversations] = useState<LastChatMessagePair[]>([])

  const auth = useAuth()

  useEffect(() => {
    if (!auth.username) return
    getLastMessagesForEachUser().then((messages) => {
      const result = messages.sort((a, b) => {
        const lastMsgTsA = Math.max(Number(a.lastMessageSeenByOther.ts), Number(a.lastMessageSeenByMe.ts))
        const lastMsgTsB = Math.max(Number(b.lastMessageSeenByOther.ts), Number(b.lastMessageSeenByMe.ts))
        return lastMsgTsA - lastMsgTsB
      })
      console.log({ result })
      setLastConversations(result)
    }).catch(console.error)
  }, [auth])

  // Scroll to bottom of messages when conversation changes or new message is added
  useEffect(() => {
    // Initial layout update
    updateLayoutDimensions()

    // Set up event listeners for layout updates
    window.addEventListener("resize", updateLayoutDimensions)
    window.addEventListener("orientationchange", updateLayoutDimensions)

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateLayoutDimensions)
      window.removeEventListener("orientationchange", updateLayoutDimensions)
    }
  },
    // [selectedConversation, selectedConversationData?.messages.length, replyingTo]

  )

  // const handleSendMessage = () => {
  //   if (messageText.trim() && selectedConversation) {
  //     // In a real app, this would send the message to the server
  //     console.log(`Sending message to ${selectedConversation}: ${messageText}`)

  //     // For demo purposes, we'll add the message to the conversation
  //     const conversation = conversations.find((c) => c.id === selectedConversation)
  //     if (conversation) {
  //       const newMessage: Message = {
  //         id: `msg-new-${Date.now()}`,
  //         sender: "me",
  //         text: messageText,
  //         time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  //         ...(replyingTo
  //           ? {
  //               replyTo: {
  //                 id: replyingTo.id,
  //                 text: replyingTo.text,
  //                 sender: replyingTo.sender,
  //               },
  //             }
  //           : {}),
  //       }

  //       conversation.messages.push(newMessage)
  //       conversation.lastMessage = messageText
  //       conversation.time = "Just now"
  //     }

  //     setMessageText("")
  //     setReplyingTo(null)

  //     // Force layout update after sending message
  //     setTimeout(updateLayoutDimensions, 100)
  //   }
  // }

  // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter" && !e.shiftKey) {
  //     e.preventDefault()
  //     handleSendMessage()
  //   }
  // }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const addEmoji = (emoji: string) => {
    setMessageText((prev) => prev + emoji)
  }

  // const handleReaction = (messageId: string, emoji: string) => {
  //   if (selectedConversation) {
  //     const conversation = conversations.find((c) => c.id === selectedConversation)
  //     if (conversation) {
  //       const message = conversation.messages.find((m) => m.id === messageId)
  //       if (message) {
  //         if (!message.reactions) {
  //           message.reactions = []
  //         }

  //         // Toggle emoji (add if not present, remove if already there)
  //         const index = message.reactions.indexOf(emoji)
  //         if (index > -1) {
  //           message.reactions.splice(index, 1)
  //         } else {
  //           message.reactions.push(emoji)
  //         }
  //       }
  //     }
  //   }
  // }
  //


  return (<DashboardLayout>

    <div className="flex flex-1 overflow-hidden">
      <div className="divide-y">
        {lastConversations.map((conversation, index) => {
          const username = conversation.other
          const lastTs = new Date(Math.max(
            Number(conversation.lastMessageSeenByMe.ts),
            Number(conversation.lastMessageSeenByOther.ts),
          ))

          const unread = Number(conversation.lastMessageSeenByMe.ts) < Number(conversation.lastMessageSeenByOther.ts)

          const lastMsg = unread ? conversation.lastMessageSeenByOther.msg : conversation.lastMessageSeenByMe.msg


          return (
            <AnimatedCard key={username} delay={0.1 * (index + 1)}>
              <Link to={`/dashboard/messages/${username}`}>
                <div className="p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                        <AvatarImage
                          src={`${CDN_STORAGE}/users/${username}`}
                          alt={username}
                        />
                        <AvatarFallback>{username[0] ?? "U"}</AvatarFallback>
                      </Avatar>
                      {false && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-white"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="w-full flex justify-center">
                        <div className="flex items-center justify-between w-full max-w-[800px]" >
                          <p className={`font-medium truncate ${unread ? "text-black" : ""}`}>
                            {username}
                          </p>
                          <p className="text-xs text-muted-foreground">{dateToRelativeString(lastTs)}</p>
                        </div>
                      </div>
                      <p
                        className={`text-sm truncate ${unread ? "text-black font-medium" : "text-muted-foreground"}`}
                      >
                        {lastMsg}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </AnimatedCard>
          )
        })}
      </div>
    </div>

  </DashboardLayout>)

}
