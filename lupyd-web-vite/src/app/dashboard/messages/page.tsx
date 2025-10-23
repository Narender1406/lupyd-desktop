"use client"


import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedCard } from "@/components/animated-card"
import { useAuth } from "@/context/auth-context"
import { useFirefly } from "@/context/firefly-context"
import { CDN_STORAGE, dateToRelativeString, getTimestampFromUlid } from "lupyd-js"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { FireflyClient, protos as FireflyProtos } from "firefly-client-js"
import { UserAvatar } from "@/components/user-avatar"




// Emoji picker options
// const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨", "🎉", "👏"]



export default function MessagesPage() {
  const router = useNavigate()
  const [activeTab, setActiveTab] = useState("messages")
  // const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [replyingTo, setReplyingTo] = useState<FireflyProtos.UserMessage | null>(null)
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


  const [lastConversations, setLastConversations] = useState<FireflyProtos.UserMessage[]>([])

  const auth = useAuth()

  const onMessageCallback = (_: FireflyClient, message: FireflyProtos.ServerMessage) => {


    if (message.userMessage) {
      setLastConversations(lastMessages => {

        const newLastMessages: FireflyProtos.UserMessage[] = []
        const newOther = message.userMessage!.from == auth.username ? message.userMessage!.to : message.userMessage!.from


        newLastMessages.push(message.userMessage!)
        for (let i = 0; i < lastMessages.length; i++) {
          const msg = lastMessages[i]

          const other = msg.from == auth.username ? msg.to : msg.from
          if (newOther == other) {
            continue;
          }
          newLastMessages.push(msg)
        }


        return newLastMessages

      })
    }




  }

  const firefly = useFirefly()



  useEffect(() => {
    firefly.addEventListener(onMessageCallback);

    return () => {
      firefly.removeEventListener(onMessageCallback)
    }
  }, [])


  useEffect(() => {
    if (!auth.username) return

    firefly.client.getUserChats().then((messages) => {
      messages = messages.sort((a, b) => getTimestampFromUlid(a.id) - getTimestampFromUlid(b.id))
      setLastConversations(messages)
    })

    // getLastMessagesForEachUser().then((messages) => {
    //   const result = messages.sort((a, b) => {
    //     const lastMsgTsA = Math.max(Number(a.lastMessageSeenByOther.ts), Number(a.lastMessageSeenByMe.ts))
    //     const lastMsgTsB = Math.max(Number(b.lastMessageSeenByOther.ts), Number(b.lastMessageSeenByMe.ts))
    //     return lastMsgTsA - lastMsgTsB
    //   })
    //   console.log({ result })
    //   setLastConversations(result)
    // }).catch(console.error)
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

  const handleReply = (message: FireflyProtos.UserMessage) => {
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


      <div className="divide-y w-full">
        {lastConversations.length == 0 &&
          <div className="flex items-center justify-center h-screen">
            <h2 className="text-center font-bold text-xl">You have no open conversations</h2>
          </div>}
        {

          lastConversations.map((conversation, index) => {

            const username = auth.username == conversation.from ? conversation.to : conversation.from
            const unread = false

            const lastMsg = conversation.text
            const lastTs = new Date(getTimestampFromUlid(conversation.id))


            return (
              <AnimatedCard key={username} delay={0.1 * (index + 1)}>
                <Link to={`/messages/${username}`}>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <UserAvatar username={username}/>
                        {false && (
                          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500 border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="w-full">
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
