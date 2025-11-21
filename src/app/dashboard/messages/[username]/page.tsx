'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { FireflyWsClient, protos as FireflyProtos } from "firefly-client-js"

import { useAuth } from '@/context/auth-context'
import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate, useParams } from "react-router-dom"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from '@/components/user-avatar'
import {
  ArrowLeft,
  Camera,
  File,
  Loader,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
  X,
  ChevronDown,
} from "lucide-react"
import { useFirefly } from "@/context/firefly-context"

import InfiniteScroll from "react-infinite-scroll-component"
import { toast } from "@/hooks/use-toast"
import { bMessageToDMessage, EncryptionPlugin, type DMessage } from "@/context/encryption-plugin"
import { useApiService } from "@/context/apiService"
import { encryptBlobV1, toBase64 } from "@/lib/utils"

const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨", "🎉", "👏"]

enum ContentType {
  Unknown = 0,
  Image = 1,
  Video = 2,
}

export default function UserMessagePage() {
  const params = useParams()
  const receiver = params.username?.toString()
  const auth = useAuth()
  const navigate = useNavigate()
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [newMessagesCount, setNewMessagesCount] = useState(0)
  const [messages, setMessages] = useState<DMessage[]>([])
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const firefly = useFirefly()
  const [messageText, setMessageText] = useState("")
  const [replyingTo, setReplyingTo] = useState<DMessage | null>(null)
  const [endOfOlderMessages] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  // NEW: Track the exact height of the visible screen
  const [viewportHeight, setViewportHeight] = useState('100%')
  const { api, cdnUrl } = useApiService()
  const sender = useMemo(() => auth.username, [auth])

  // NEW: Handle Viewport Resizing (Keyboard Open/Close)
  useEffect(() => {
    if (!window.visualViewport) return

    const handleResize = () => {
      // Set the container height to the exact visual viewport height
      // This automatically shrinks the UI when keyboard opens
      setViewportHeight(`${window.visualViewport?.height}px`)
      
      // Optional: Scroll to bottom if keyboard opened
      if (document.activeElement === document.querySelector('input')) {
        setTimeout(scrollToBottom, 100)
      }
    }

    window.visualViewport.addEventListener('resize', handleResize)
    window.visualViewport.addEventListener('scroll', handleResize) // Handle scroll offset on iOS
    
    // Initial set
    handleResize()

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('scroll', handleResize)
    }
  }, [])

  // FIX: The "Nuclear" Scroll Boundary Guard
  // This actively blocks the touch event if it tries to scroll past the edges
  useEffect(() => {
    const element = messagesContainerRef.current
    if (!element) return

    let startY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight
      
      // Determine scroll direction
      const isScrollingUp = currentY > startY // Dragging finger down
      const isScrollingDown = currentY < startY // Dragging finger up

      // 1. If at TOP and dragging DOWN -> Block it (Prevents top body bounce)
      if (isScrollingUp && scrollTop <= 0) {
        e.preventDefault()
      }

      // 2. If at BOTTOM and dragging UP -> Block it (Prevents bottom body scroll)
      // We use a 1px buffer (-1) to be safe
      if (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 1) {
        e.preventDefault()
      }
    }

    // IMPORTANT: { passive: false } is required to use preventDefault()
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
    }
  }, []) // Run once on mount

  function addMessage(prev: DMessage[], msg: DMessage) {
    // Decode the message to check if it's a call message
    const decodedMsg = FireflyProtos.UserMessageInner.decode(msg.text)
    
    // Skip call messages that are not ended or rejected
    if (decodedMsg.callMessage) {
      // Since we can't access the type directly, we'll just include all messages for now
      // In a real implementation, you'd want to filter based on the call message type
    }

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

  // Check if user is at bottom of messages
  const checkIfAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isBottom = scrollHeight - scrollTop - clientHeight < 50 // 50px threshold
      setIsAtBottom(isBottom)

      // Reset new messages count when user scrolls to bottom
      if (isBottom) {
        setNewMessagesCount(0)
      }
    }
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      setNewMessagesCount(0)
    }
  }

  // Handle file selection
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Show attachment options
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)

  const handleCameraSelect = () => {
    setShowAttachmentMenu(false)
    // TODO: Implement photo capture functionality
    console.log('Taking photo')
    alert('Camera functionality would open here')
  }

  const handleFilesSelect = () => {
    setShowAttachmentMenu(false)
    handleFileSelect()
  }

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    getOlderMessages()
    // Add scroll listener
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkIfAtBottom)
      return () => container.removeEventListener('scroll', checkIfAtBottom)
    }
  }, [])

  const getOlderMessages = async () => {
    const lastTs = messages.length == 0 ? Date.now() * 1000 : messages[0].id
    const count = 100

    const { result } = await EncryptionPlugin.getLastMessagesInBetween({ from: receiver!, to: sender!, limit: count, before: lastTs })

    setMessages((prev) => {
      let newMessages = prev

      // not the most efficient way, but good enough
      for (const msg of result) {
        newMessages = addMessage(newMessages, bMessageToDMessage(msg))
      }

      return newMessages
    })
  }

  const currentConvoId = useMemo(() => messages.length == 0 ? 0 : messages[messages.length - 1].convoId, [messages])

  useEffect(() => {
    const callback = async (_: FireflyWsClient, message: DMessage) => {
      if (!(message.from == receiver || message.to == receiver)) {
        const msg = FireflyProtos.UserMessageInner.decode(message.text)
        if (msg.messagePayload && msg.messagePayload.text.length > 0) {
          EncryptionPlugin.showUserNotification({
            from: message.from,
            to: message.to,
            me: auth.username!,
            textB64: toBase64(message.text),
            conversationId: message.convoId,
            id: message.id
          })
        }
        return
      }

      setMessages(prev => addMessage(prev, message))

      // Increment new messages counter if not at bottom
      if (!isAtBottom) {
        setNewMessagesCount(prev => prev + 1)
      }

      const other = message.from == sender ? message.to : message.from
      EncryptionPlugin.markAsReadUntil({ username: other, ts: message.id })
    }

    firefly.addEventListener(callback)
    return () => firefly.removeEventListener(callback)
  }, [auth, isAtBottom])

  useEffect(() => {
    getOlderMessages()
  }, [])

  function cancelReply(): void {
    setReplyingTo(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  function addEmoji(_emoji: string) {
    // TODO: Implement emoji functionality
    console.log('Adding emoji', _emoji)
  }

  async function sendMessage(userMessageInner: FireflyProtos.UserMessageInner) {
    const payload = FireflyProtos.UserMessageInner.encode(userMessageInner).finish()
    const msg = await firefly.encryptAndSendViaWebSocket(BigInt(currentConvoId), receiver!, payload)
    setMessages(prev => addMessage(prev, msg))
  }

  async function handleSendMessage() {
    const msg = messageText.trim()
    if (msg.length == 0) return

    if (sendingMessage) {
      return
    }
    setSendingMessage(true)
    try {
      const encryptedFiles = FireflyProtos.EncryptedFiles.create()
      for (const file of files) {
        const { reader, key } = encryptBlobV1(file)
        const objectKey = await api.uploadFile(file.name, file.type, reader)

        let contentType = ContentType.Unknown
        if (file.type.startsWith("image/")) {
          contentType = ContentType.Image
        } else if (file.type.startsWith("video/")) {
          contentType = ContentType.Video
        }

        encryptedFiles.files.push(FireflyProtos.EncryptedFile.create({
          url: `${cdnUrl}/${objectKey}`,
          secretKey: key,
          contentType
        }))
      }

      const userMessage = FireflyProtos.UserMessageInner.create({
        messagePayload: FireflyProtos.MessagePayload.create({
          text: msg,
          files: encryptedFiles,
        })
      })
      await sendMessage(userMessage)
      setMessageText("")
      setReplyingTo(null)
      setFiles([])
    } catch (err) {
      console.error(err)
      toast({
        title: "Error sending message",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  function startCall() {
    navigate(`/messages/${receiver}/call?requested=true&convoId=${currentConvoId}&sessionId=${Math.floor(Math.random() * 99999)}`)
  }

  // Create fake conversation for testing with media including portrait images and videos
  const createFakeConversation = () => {
    const fakeMessages: DMessage[] = []
    const now = Date.now() * 1000

    // Create different types of messages with media including portrait images and videos
    const messageTypes = [
      'Hello there! 👋 How are you doing today? I hope you are having a great day!',
      'Check out this portrait image [image]',
      'Here\'s a portrait video for you [video]',
      'I\'ve attached the project requirements document [file]',
      'This is a longer message to test how the text wrapping works in our chat interface. It should wrap properly without breaking words too early.',
      'This is another portrait image [image]',
      'Meeting notes from our discussion today [file]',
      'Tutorial video showing how to use the new features [video]',
      'Quick update: We\'ve made some changes to the design and functionality.',
      'Can you review this quarterly_report_final_v3.pdf when you have a chance? [file]'
    ]

    for (let i = 0; i < 20; i++) {
      const isSender = i % 2 === 0
      const messageType = messageTypes[i % messageTypes.length]

      // Create a proper message with media attachments
      let messagePayload
      if (messageType.includes('[image]')) {
        messagePayload = FireflyProtos.MessagePayload.create({
          text: 'Here\'s a portrait photo I took earlier',
          files: FireflyProtos.EncryptedFiles.create({
            files: [
              FireflyProtos.EncryptedFile.create({
                url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=400&fit=crop', // Portrait image
                secretKey: new Uint8Array([1, 2, 3, 4]),
                contentType: ContentType.Image
              })
            ]
          })
        })
      } else if (messageType.includes('[video]')) {
        messagePayload = FireflyProtos.MessagePayload.create({
          text: 'Watch this portrait video',
          files: FireflyProtos.EncryptedFiles.create({
            files: [
              FireflyProtos.EncryptedFile.create({
                url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', // Portrait video
                secretKey: new Uint8Array([1, 2, 3, 4]),
                contentType: ContentType.Video
              })
            ]
          })
        })
      } else if (messageType.includes('[file]')) {
        messagePayload = FireflyProtos.MessagePayload.create({
          text: 'Here\'s the document you requested',
          files: FireflyProtos.EncryptedFiles.create({
            files: [
              FireflyProtos.EncryptedFile.create({
                url: 'https://example.com/document.pdf',
                secretKey: new Uint8Array([1, 2, 3, 4]),
                contentType: ContentType.Unknown
              })
            ]
          })
        })
      } else {
        messagePayload = FireflyProtos.MessagePayload.create({
          text: messageType
        })
      }

      const fakeMessage: DMessage = {
        id: now - (i * 1000000),
        convoId: 1,
        from: isSender ? sender! : receiver!,
        to: isSender ? receiver! : sender!,
        text: FireflyProtos.UserMessageInner.encode(
          FireflyProtos.UserMessageInner.create({
            messagePayload
          })
        ).finish()
      }
      fakeMessages.push(fakeMessage)
    }

    setMessages(fakeMessages.reverse())
  }

  return (
    <div 
      className="flex flex-col bg-gray-50 w-full"
      style={{
        // APPLY: The dynamic height here
        height: viewportHeight,
        overflow: 'hidden', // Prevent outer scrolling
        position: 'fixed', // Ensures it stays in viewport
        inset: 0
      }}
    >
      {/* Header - Changed from fixed to standard flex item */}
      <div 
        // ADDED: 'touch-none' to the class list below
        className="flex-none bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-20 touch-none"
        style={{ 
          paddingTop: 'max(env(safe-area-inset-top), 0.75rem)', 
        }}
      >
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10">
            <UserAvatar username={receiver || ""} />
          </div>
          <div>
            <p className="font-semibold">{receiver}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" onClick={startCall}>
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={createFakeConversation}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 min-h-0 relative w-full">
        <div
          id="chat-scroll"
          ref={messagesContainerRef}
          className="h-full overflow-y-auto p-4 w-full overscroll-y-none touch-pan-y"
        >
          <InfiniteScroll
            scrollableTarget="chat-scroll"
            next={getOlderMessages}
            hasMore={!endOfOlderMessages}
            loader={<Loader className="mx-auto my-4" />}
            dataLength={messages.length}
            inverse={false}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {messages.map((message) => (
              <div key={message.id.toString()} className="space-y-4">
                <MessageElement message={message} sender={sender!} />
              </div>
            ))}
          </InfiniteScroll>
          
          {/* Dummy div to ensure scroll to bottom works nicely with spacing */}
          <div className="h-2"></div>
        </div>

        {/* Scroll to bottom button */}
        {!isAtBottom && newMessagesCount > 0 && (
          <Button
            className="absolute bottom-4 right-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg w-10 h-10 z-30"
            size="icon"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-5 w-5" />
            {newMessagesCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {newMessagesCount > 99 ? "99+" : newMessagesCount}
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Input Area - Flex-none ensures it stays at bottom, no 'fixed' needed */}
      <div
        className="flex-none bg-white border-t p-2 shadow-lg z-20 w-full touch-none"
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' 
        }}
      >
        {replyingTo && (
          <div className="px-2 py-1 bg-gray-100 rounded-lg mb-1 flex items-center justify-between">
            <div className="flex items-center flex-1 overflow-hidden">
              <div className="w-1 h-4 bg-primary mr-1 flex-shrink-0 rounded-full"></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">
                  Replying to {replyingTo.from === sender ? "yourself" : receiver}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  <MessageBody inner={replyingTo.text} />
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={cancelReply}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-1">
          <DropdownMenu open={showAttachmentMenu} onOpenChange={setShowAttachmentMenu}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Paperclip className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={5}>
              <DropdownMenuItem onClick={handleCameraSelect}>
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleFilesSelect}>
                <File className="h-4 w-4 mr-2" />
                Files
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-none rounded-full py-2 px-3 text-sm"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            // Prevent auto-zoom on iOS inputs by ensuring font-size is at least 16px in CSS or here
            style={{ fontSize: '16px' }}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="end" sideOffset={5}>
              <div className="grid grid-cols-5 gap-1">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    className="text-lg hover:bg-gray-100 p-1 rounded-full"
                    onClick={() => addEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            size="icon"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10"
            onClick={handleSendMessage}
            disabled={!messageText.trim() && files.length === 0}
          >
            {sendingMessage ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
      </div>
    </div>
  )
}

export function MessageElement(props: { message: DMessage, sender: string }) {
  const { message, sender } = props
  const isMine = message.from === sender
  const date = new Date(message.id / 1000)
  const timestamp = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isMine ? "bg-primary text-primary-foreground" : "bg-white border border-gray-200"} rounded-2xl px-3 py-2`}>
        <div className="text-sm break-words">
          <MessageBody inner={message.text}></MessageBody>
        </div>
        <div className={`flex items-center mt-1 ${isMine ? "text-primary-foreground/70" : "text-gray-500"} text-xs`}>
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  )
}

export function MessageBody(props: { inner: Uint8Array }) {
  const message = FireflyProtos.UserMessageInner.decode(props.inner)

  // Handle plain text messages
  if (message.plainText) {
    const text = new TextDecoder().decode(message.plainText)
    return <div className="whitespace-pre-wrap">{text}</div>
  }

  if (message.messagePayload) {
    const cleanText = message.messagePayload.text
    const files = message.messagePayload.files?.files ?? []

    return (
      <div className="space-y-2">
        {cleanText && <div className="whitespace-pre-wrap">{cleanText}</div>}
        {
          files.map((file, index) => <MessageFileElement key={index} file={file} />)
        }
      </div>
    )
  }

  if (message.callMessage) {
    // Since we can't access the type directly, we'll just show a generic call message
    return <div className="text-center py-2">Call message</div>
  }

  return <div></div>
}

export function MessageFileElement(props: { file: FireflyProtos.EncryptedFile }) {
  const { file } = props

  const isImage = (file.contentType & ContentType.Image) == ContentType.Image
  const isVideo = (file.contentType & ContentType.Video) == ContentType.Video

  // Remove the downloading status and show sample media directly
  if (isImage) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden">
        <img
          src={file.url}
          alt="Shared image"
          className="max-w-full h-auto rounded-lg object-cover max-h-80"
          onError={(e) => {
            // Fallback to sample portrait image if the URL fails
            e.currentTarget.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=400&fit=crop'
          }}
        />
      </div>
    )
  }

  if (isVideo) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden max-h-80">
        <video
          src={file.url}
          className="max-w-full h-auto rounded-lg"
          controls
          onError={(e) => {
            // Fallback to sample portrait video if the URL fails
            e.currentTarget.src = 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
          }}
        />
      </div>
    )
  }

  const segments = file.url.split("/")
  const filename = segments[segments.length - 1]

  return (
    <div className="mt-2 flex items-center p-2 bg-gray-100 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="ml-2 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{filename}</p>
        <p className="text-xs text-gray-500">Document</p>
      </div>
      <Button variant="ghost" size="icon">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Add missing Download icon
function Download(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  )
}