"use client"


import react, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { AnimatedCard } from "@/components/animated-card"
import { useAuth } from "@/context/auth-context"
import { isCallRequestMessage, useFirefly } from "@/context/firefly-context"
import { dateToRelativeString } from "lupyd-js"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { protos as FireflyProtos, FireflyWsClient } from "firefly-client-js"
import { UserAvatar } from "@/components/user-avatar"
import { MessageBody } from "./[username]/page"
import { bMessageToDMessage, EncryptionPlugin, type DMessage } from "@/context/encryption-plugin"


// Emoji picker options
// const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨", "🎉", "👏"]



export default function MessagesPage() {
  // const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

  // const [replyingTo, setReplyingTo] = useState<FireflyProtos.UserMessage | null>(null)

  // const messagesEndRef = useRef<HTMLDivElement>(null)
  // const messagesContainerRef = useRef<HTMLDivElement>(null)
  // const inputContainerRef = useRef<HTMLDivElement>(null)


  // Find the selected conversation data
  // const selectedConversationData = conversations.find((conv) => conv.id === selectedConversation)

  // Function to update layout dimensions
  // const updateLayoutDimensions = () => {
  //   // Get viewport dimensions
  //   const vh = window.innerHeight
  //   const vw = window.innerWidth

  //   // Update message container height
  //   if (messagesContainerRef.current) {
  //     const headerHeight = 64 // Approximate header height
  //     const inputHeight = replyingTo ? 140 : 80 // Approximate input height
  //     const availableHeight = vh - headerHeight - inputHeight

  //     messagesContainerRef.current.style.height = `${availableHeight}px`
  //     messagesContainerRef.current.style.maxHeight = `${availableHeight}px`
  //   }

  //   // Update input container position
  //   if (inputContainerRef.current) {
  //     const sidebarWidth = vw >= 768 ? 256 : 0 // 256px is the width of the sidebar on desktop

  //     inputContainerRef.current.style.position = "fixed"
  //     inputContainerRef.current.style.bottom = "0"
  //     inputContainerRef.current.style.width = vw >= 768 ? `calc(100% - ${sidebarWidth}px)` : "100%"
  //     inputContainerRef.current.style.left = vw >= 768 ? `${sidebarWidth}px` : "0"
  //     inputContainerRef.current.style.zIndex = "50" // Ensure it's above other elements
  //   }

  //   // Force scroll to bottom after layout updates
  //   if (messagesEndRef.current) {
  //     setTimeout(() => {
  //       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  //     }, 100)
  //   }
  // }


  const [lastConversations, setLastConversations] = react.useState<DMessage[]>([])

  const auth = useAuth()


  const onMessageCallback = (_: FireflyWsClient, message: DMessage) => {

    const inner = FireflyProtos.UserMessageInner.decode(message.text)

    if (inner.callMessage) {
      return
    }

    setLastConversations(lastMessages => {
      const newLastMessages: DMessage[] = []
      const newOther = message!.from == auth.username ? message!.to : message!.from

      newLastMessages.push(message)
      for (let i = 0; i < lastMessages.length; i++) {
        const msg = lastMessages[i]

        const other = msg!.from == auth.username ? msg!.to : msg!.from
        if (newOther == other) {
          continue;
        }
        newLastMessages.push(msg)
      }

      return newLastMessages
    })

  }

  const firefly = useFirefly()



  react.useEffect(() => {
    firefly.addEventListener(onMessageCallback);

    return () => {
      firefly.removeEventListener(onMessageCallback)
    }
  }, [])




  const addLastConversation = (convo: DMessage) => {
    setLastConversations(prev => {
      const newConversations: DMessage[] = []

      let alreadyPushed = false;

      for (const c of prev) {
        const other = c.from == auth.username ? c.to : c.from
        if (other == convo.from || other == convo.to) {
          if (c.id > convo.id) {
            newConversations.push(c)
          } else {
            newConversations.push(convo)
          }
          alreadyPushed = true;
        } else {
          newConversations.push(c)
        }
      }

      if (!alreadyPushed) {
        newConversations.push(convo)
      }

      return newConversations.sort((a, b) => b.id - a.id)
    })
  }


  react.useEffect(() => {
    if (!auth.username) return

    EncryptionPlugin.getLastMessagesFromAllConversations().then((result) => {
      console.log({ result })
      const messages = result.result
      // could be more efficient if batch processed
      for (const message of messages) {
        addLastConversation(bMessageToDMessage(message))
      }
    })


    firefly.service.getConversations().then(conversations => {
      for (const conversation of conversations.conversations) {
        addLastConversation(
          {
            id: 0,
            convoId: Number(conversation.id),
            from: conversation.startedBy,
            to: conversation.other,
            text: FireflyProtos.UserMessageInner.encode(FireflyProtos.UserMessageInner.create()).finish()
          }
        )
      }
    })
  }, [auth])

  // Scroll to bottom of messages when conversation changes or new message is added
  // useEffect(() => {
  //   // Initial layout update
  //   updateLayoutDimensions()

  //   // Set up event listeners for layout updates
  //   window.addEventListener("resize", updateLayoutDimensions)
  //   window.addEventListener("orientationchange", updateLayoutDimensions)

  //   // Cleanup
  //   return () => {
  //     window.removeEventListener("resize", updateLayoutDimensions)
  //     window.removeEventListener("orientationchange", updateLayoutDimensions)
  //   }
  // },
  //   // [selectedConversation, selectedConversationData?.messages.length, replyingTo]

  // )


  return (<DashboardLayout>
    <div className="flex flex-1 overflow-hidden">
      <div className="divide-y w-full">
        {lastConversations.length == 0 &&
          <div className="flex items-center justify-center h-screen">
            <h2 className="text-center font-bold text-xl">You have no open conversations</h2>
          </div>}
        {

          lastConversations.map((conversation, index) => <ConversationElement conversation={conversation} index={index} sender={auth.username!} />)
        }
      </div>
    </div>

  </DashboardLayout>)

}


function ConversationElement(props: { conversation: DMessage, sender: string, index: number }) {

  const { conversation, sender, index } = props

  console.log({ conversation })


  const username = sender == conversation.from ? conversation.to : conversation.from

  const lastTs = new Date(Number(conversation.id / 1000))
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0)

  const unread = useMemo(() => unreadMessagesCount > 0, [unreadMessagesCount])

  useEffect(() => {

    (async () => {

      const result = await EncryptionPlugin.getLastSeenUserMessageTimestamp({ username })
      if (result && "ts" in result && typeof result["ts"] == "number") {
        const { count } = await EncryptionPlugin.getNumberOfMessagesInBetweenSince({
          from: conversation.from,
          to: conversation.to,
          since: result.ts
        })

        setUnreadMessagesCount(count)

      }

    })()
  }, [])


  return (
    <AnimatedCard key={username} delay={0.1 * (index + 1)}>
      <Link to={`/messages/${username}`}>
        <div className="p-4 hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <UserAvatar username={username} />
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
                <MessageBody inner={conversation.text}></MessageBody>
              </p>
            </div>
          </div>
        </div>
      </Link>
    </AnimatedCard>
  )
}
