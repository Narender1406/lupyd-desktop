"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  MoreVertical,
  ArrowLeft,
  Users,
  Settings,
  UserPlus,
  Crown,
  Shield,
  X,
  ImageIcon,
  Hash,
  Pin,
  Reply,
  Forward,
  MoreHorizontal,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

// Types for group chat data
interface GroupMember {
  id: string
  name: string
  username: string
  avatar: string
  role: "admin" | "moderator" | "member"
  isOnline: boolean
  lastSeen?: string
}

interface GroupMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  text: string
  time: string
  replyTo?: {
    id: string
    text: string
    senderName: string
  }
  reactions?: string[]
  isPinned?: boolean
}

interface Group {
  id: string
  name: string
  description: string
  avatar: string
  memberCount: number
  isPrivate: boolean
  members: GroupMember[]
  messages: GroupMessage[]
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
}

// Mock group data
const groups: Group[] = [
  {
    id: "group1",
    name: "Design Team",
    description: "UI/UX Design discussions and collaboration",
    avatar: "/placeholder.svg?height=48&width=48",
    memberCount: 12,
    isPrivate: false,
    members: [
      {
        id: "user1",
        name: "Sarah Chen",
        username: "sarahc",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
        isOnline: true,
      },
      {
        id: "user2",
        name: "Mike Johnson",
        username: "mikej",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "moderator",
        isOnline: true,
      },
      {
        id: "user3",
        name: "Emma Wilson",
        username: "emmaw",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        isOnline: false,
        lastSeen: "2 hours ago",
      },
    ],
    messages: [
      {
        id: "msg1",
        senderId: "user1",
        senderName: "Sarah Chen",
        senderAvatar: "/placeholder.svg?height=32&width=32",
        text: "Hey everyone! I've uploaded the new design system components to Figma. Please take a look and share your feedback.",
        time: "10:30 AM",
        isPinned: true,
      },
      {
        id: "msg2",
        senderId: "user2",
        senderName: "Mike Johnson",
        senderAvatar: "/placeholder.svg?height=32&width=32",
        text: "Great work Sarah! The color palette looks much more cohesive now.",
        time: "10:35 AM",
        reactions: ["👍", "🎨"],
      },
      {
        id: "msg3",
        senderId: "user3",
        senderName: "Emma Wilson",
        senderAvatar: "/placeholder.svg?height=32&width=32",
        text: "I love the new typography choices. Should we update the mobile components too?",
        time: "10:40 AM",
        replyTo: {
          id: "msg1",
          text: "Hey everyone! I've uploaded the new design system components to Figma.",
          senderName: "Sarah Chen",
        },
      },
    ],
    lastMessage: "I love the new typography choices. Should we update the mobile components too?",
    lastMessageTime: "10:40 AM",
    unreadCount: 3,
  },
  {
    id: "group2",
    name: "Project Alpha",
    description: "Development team for Project Alpha",
    avatar: "/placeholder.svg?height=48&width=48",
    memberCount: 8,
    isPrivate: true,
    members: [
      {
        id: "user4",
        name: "Alex Rivera",
        username: "alexr",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
        isOnline: true,
      },
      {
        id: "user5",
        name: "Lisa Park",
        username: "lisap",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "member",
        isOnline: false,
        lastSeen: "1 hour ago",
      },
    ],
    messages: [
      {
        id: "msg4",
        senderId: "user4",
        senderName: "Alex Rivera",
        senderAvatar: "/placeholder.svg?height=32&width=32",
        text: "The API integration is complete. Ready for testing phase.",
        time: "Yesterday",
      },
    ],
    lastMessage: "The API integration is complete. Ready for testing phase.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "group3",
    name: "Marketing Squad",
    description: "Marketing campaigns and strategy",
    avatar: "/placeholder.svg?height=48&width=48",
    memberCount: 15,
    isPrivate: false,
    members: [
      {
        id: "user6",
        name: "David Kim",
        username: "davidk",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "admin",
        isOnline: true,
      },
    ],
    messages: [
      {
        id: "msg5",
        senderId: "user6",
        senderName: "David Kim",
        senderAvatar: "/placeholder.svg?height=32&width=32",
        text: "Q4 campaign results are looking great! 📈",
        time: "2 days ago",
        reactions: ["🚀", "📈", "🎉"],
      },
    ],
    lastMessage: "Q4 campaign results are looking great! 📈",
    lastMessageTime: "2 days ago",
    unreadCount: 1,
  },
]

// Emoji options
const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨", "🎉", "👏"]

export default function GroupsPage() {
  const navigate = useNavigate()
  const auth = useAuth()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [replyingTo, setReplyingTo] = useState<GroupMessage | null>(null)
  const [showMembers, setShowMembers] = useState(false)
  const [searchText, setSearchText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedGroupData = groups.find((group) => group.id === selectedGroup)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [selectedGroupData?.messages])

  const handleSendMessage = () => {
    if (messageText.trim() && selectedGroup) {
      const group = groups.find((g) => g.id === selectedGroup)
      if (group) {
        const newMessage: GroupMessage = {
          id: `msg-new-${Date.now()}`,
          senderId: "current-user",
          senderName: auth.username || "You",
          senderAvatar: "/placeholder.svg?height=32&width=32",
          text: messageText,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          ...(replyingTo
            ? {
                replyTo: {
                  id: replyingTo.id,
                  text: replyingTo.text,
                  senderName: replyingTo.senderName,
                },
              }
            : {}),
        }

        group.messages.push(newMessage)
        group.lastMessage = messageText
        group.lastMessageTime = "Just now"
      }

      setMessageText("")
      setReplyingTo(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReply = (message: GroupMessage) => {
    setReplyingTo(message)
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const handleReaction = (messageId: string, emoji: string) => {
    if (selectedGroup) {
      const group = groups.find((g) => g.id === selectedGroup)
      if (group) {
        const message = group.messages.find((m) => m.id === messageId)
        if (message) {
          if (!message.reactions) {
            message.reactions = []
          }
          const index = message.reactions.indexOf(emoji)
          if (index > -1) {
            message.reactions.splice(index, 1)
          } else {
            message.reactions.push(emoji)
          }
        }
      }
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-3 w-3 text-yellow-500" />
      case "moderator":
        return <Shield className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchText.toLowerCase()) ||
      group.description.toLowerCase().includes(searchText.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Groups List - Hide on mobile when a group is selected */}
      <div
        className={`${selectedGroup ? "hidden md:block" : "block"} w-full md:w-80 border-r bg-white overflow-y-auto`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold text-black">Groups</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-black hover:text-white bg-transparent"
              onClick={() => navigate("/groupchat/creategroupchat")}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search groups..."
              className="pl-8 bg-gray-100 border-none"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        <div className="divide-y">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedGroup === group.id ? "bg-gray-50" : ""}`}
              onClick={() => setSelectedGroup(group.id)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.avatar || "/placeholder.svg"} alt={group.name} />
                    <AvatarFallback className="bg-gray-100 text-black font-medium">
                      {group.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {group.isPrivate && (
                    <div className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-300 rounded-full p-1">
                      <Hash className="h-2 w-2 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium truncate text-black">{group.name}</p>
                      {group.isPrivate && <Hash className="h-3 w-3 text-gray-500" />}
                    </div>
                    <div className="flex items-center space-x-1">
                      <p className="text-xs text-muted-foreground">{group.lastMessageTime}</p>
                      {group.unreadCount > 0 && (
                        <Badge className="bg-black text-white text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                          {group.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{group.memberCount} members</p>
                  <p className="text-sm truncate text-muted-foreground">{group.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedGroup ? (
        <div className="flex-1 flex flex-col h-screen">
          {/* Group Header */}
          <div className="bg-white border-b p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedGroup(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedGroupData?.avatar || "/placeholder.svg"} alt={selectedGroupData?.name} />
                <AvatarFallback className="bg-gray-100 text-black font-medium">
                  {selectedGroupData?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-black">{selectedGroupData?.name}</p>
                  {selectedGroupData?.isPrivate && <Hash className="h-4 w-4 text-gray-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{selectedGroupData?.memberCount} members</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowMembers(!showMembers)}>
                <Users className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/groupchat/groupinfo`)}>
                    <Info className="h-4 w-4 mr-2" />
                    Group Info
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/groupchat/groupchatsettings`)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Group Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <X className="h-4 w-4 mr-2" />
                    Leave Group
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedGroupData?.messages.map((message) => (
                  <div key={message.id} className="flex flex-col">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={message.senderAvatar || "/placeholder.svg"} alt={message.senderName} />
                        <AvatarFallback className="bg-gray-100 text-black text-xs">
                          {message.senderName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-sm text-black">{message.senderName}</p>
                          <p className="text-xs text-muted-foreground">{message.time}</p>
                          {message.isPinned && <Pin className="h-3 w-3 text-yellow-500" />}
                        </div>

                        {message.replyTo && (
                          <div className="bg-gray-100 border-l-2 border-gray-400 rounded-r-lg px-3 py-2 mb-2 text-xs">
                            <p className="font-medium text-gray-600">{message.replyTo.senderName}</p>
                            <p className="text-gray-600 truncate">{message.replyTo.text}</p>
                          </div>
                        )}

                        <div className="bg-gray-100 rounded-lg p-3 relative group">
                          <p className="text-sm break-words">{message.text}</p>

                          {/* Message actions */}
                          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-md flex items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Smile className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-auto p-2">
                                <div className="flex gap-1">
                                  {emojiOptions.map((emoji) => (
                                    <button
                                      key={emoji}
                                      className="text-lg hover:bg-gray-100 p-1 rounded"
                                      onClick={() => handleReaction(message.id, emoji)}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleReply(message)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Forward className="h-4 w-4 mr-2" />
                                  Forward
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Pin className="h-4 w-4 mr-2" />
                                  Pin Message
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex mt-1">
                            <div className="bg-white rounded-full shadow-sm px-2 py-1 text-xs flex items-center">
                              {message.reactions.map((emoji, index) => (
                                <span key={index} className="mx-0.5">
                                  {emoji}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t">
                {replyingTo && (
                  <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-1 h-6 bg-black mr-2"></div>
                      <div>
                        <p className="text-xs font-medium">Replying to {replyingTo.senderName}</p>
                        <p className="text-xs text-muted-foreground truncate">{replyingTo.text}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={cancelReply}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ImageIcon className="h-5 w-5" />
                    </Button>
                    <Input
                      placeholder={`Message ${selectedGroupData?.name}...`}
                      className="bg-gray-100 border-none"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button variant="ghost" size="icon">
                      <Smile className="h-5 w-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="bg-black text-white hover:bg-gray-800"
                      onClick={handleSendMessage}
                      disabled={!messageText.trim()}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Members Sidebar */}
            {showMembers && (
              <div className="w-64 bg-white border-l overflow-y-auto">
                <div className="p-4 border-b">
                  <h3 className="font-medium text-black">Members ({selectedGroupData?.memberCount})</h3>
                </div>
                <div className="p-4 space-y-3">
                  {selectedGroupData?.members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                          <AvatarFallback className="bg-gray-100 text-black text-xs">
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {member.isOnline && (
                          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 border border-white"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1">
                          <p className="text-sm font-medium text-black truncate">{member.name}</p>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {member.isOnline ? "Online" : member.lastSeen || "Offline"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="hidden md:flex flex-1 items-center justify-center bg-white">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a Group</h3>
            <p className="text-muted-foreground">Choose a group to start chatting</p>
          </div>
        </div>
      )}
    </div>
  )
}
