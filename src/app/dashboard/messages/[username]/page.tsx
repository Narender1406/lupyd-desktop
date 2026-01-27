'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { protos as FireflyProtos } from "firefly-client-js"

import { useAuth } from '@/context/auth-context'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar } from '@/components/user-avatar'
import { useFirefly } from "@/context/firefly-context"
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  File,
  Loader,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
  X,
} from "lucide-react"

import { useApiService } from "@/context/apiService"
import { bUserMessageToUserMessage, checkIfFileExists, decryptStreamAndSave, EncryptionPlugin, getFileUrl, type UserMessage } from "@/context/encryption-plugin"
import { useScrollBoundaryGuard } from "@/hooks/use-scroll-boundary-guard"
import { toast } from "@/hooks/use-toast"
import { encryptBlobV1, formatNumber, SIZE_LOOKUP_TABLE } from "@/lib/utils"
import InfiniteScroll from "react-infinite-scroll-component"

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
  const navigate = useNavigate();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const [messages, setMessages] = useState<UserMessage[]>([])

  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const firefly = useFirefly()

  const [autoShouldScrollDown, setAutoShouldScrollDown] = useState(false)


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

  // Apply the scroll boundary guard hook
  useScrollBoundaryGuard(messagesContainerRef)

  function addMessage(prev: UserMessage[], msg: UserMessage) {
    const message = FireflyProtos.UserMessageInner.decode(msg.text)
    if (message.callMessage && !(message.callMessage.type == FireflyProtos.CallMessageType.ended || message.callMessage.type == FireflyProtos.CallMessageType.rejected)) {
      return prev;
    }

    // Robust merge: concat + dedupe + sort
    const combined = [...prev, msg]
    const uniqueMap = new Map<number, UserMessage>()

    // Deduplicate by id, keeping the latest version
    for (const m of combined) {
      uniqueMap.set(m.id, m)
    }

    // Sort by id (ascending)
    return Array.from(uniqueMap.values()).sort((a, b) => {
      if (a.id < b.id) return -1
      if (a.id > b.id) return 1
      return 0
    })
  }

  // Check if user is at bottom of messages
  const checkIfAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isBottom = scrollHeight - scrollTop - clientHeight < 100 // 100px threshold for better UX
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
    const COUNT = 15

    // TODO: this is not good


    console.log({ getLastMessages: { other: receiver!, limit: COUNT, before: lastTs } })

    const { result } = await EncryptionPlugin.getLastMessages({ other: receiver!, limit: COUNT, before: lastTs })

    setMessages((prev) => {
      let newMessages = prev

      // not the most efficient way, but good enough
      for (const msg of result) {
        newMessages = addMessage(newMessages, bUserMessageToUserMessage(msg))
      }

      return newMessages
    })
  }


  useEffect(() => {
    const callback = async (message: UserMessage) => {


      if (message.other != receiver) {

        return
      }

      setMessages(prev => addMessage(prev, message))

      // Increment new messages counter if not at bottom
      if (!isAtBottom) {
        setNewMessagesCount(prev => prev + 1)
      }


      EncryptionPlugin.markAsReadUntil({ username: message.other, ts: message.id })

    }

    firefly.addEventListener(callback)
    return () => firefly.removeEventListener(callback)
  }, [auth, isAtBottom])

  useEffect(() => {
    getOlderMessages()
  }, [])



  const [messageText, setMessageText] = useState("")
  const [replyingTo, setReplyingTo] = useState<UserMessage | null>(null)

  const [endOfOlderMessages] = useState(false)
  function handleReaction(_msg: UserMessage, _emoji: string): void {
    // TODO: Implement reaction functionality
    console.log('Adding reaction', _emoji, 'to message', _msg);
  }

  function handleReply(message: UserMessage): void {
    setReplyingTo(message)
  }


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

    const payload = FireflyProtos.UserMessageInner.encode(userMessageInner).finish();
    // const msg = await firefly.encryptAndSend(BigInt(currentConvoId), receiver!, payload)

    const msg = await firefly.encryptAndSend(receiver!, payload)

    setMessages(prev => addMessage(prev, msg))
  }

  async function handleSendMessage() {
    const msg = messageText.trim()
    if (msg.length == 0 && files.length == 0) return

    if (sendingMessage) {
      return
    }
    setSendingMessage(true)
    try {
      const encryptedFiles = FireflyProtos.EncryptedFiles.create()
      for (const file of files) {
        const { reader, key } = encryptBlobV1(file)
        const objectKey = await api.uploadFile(file.name, "application/octet-stream", reader, file.size)

        let contentType = ContentType.Unknown
        if (file.type.startsWith("image/")) {
          contentType = ContentType.Image
        } else if (file.type.startsWith("video/")) {
          contentType = ContentType.Video
        }

        encryptedFiles.files.push(FireflyProtos.EncryptedFile.create({
          url: `${cdnUrl}/${objectKey}`,
          secretKey: key,
          contentType,
          contentLength: file.size,
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
    navigate(`/messages/${receiver}/call?requested=true&sessionId=${Math.floor(Math.random() * 99999)}`)
  }



  // Set viewport meta tag for mobile optimization
  useEffect(() => {
    // Ensure proper viewport settings
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      (viewportMeta as HTMLMetaElement).name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    (viewportMeta as HTMLMetaElement).content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  }, []);


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
          <Button variant="ghost" size="icon" onClick={undefined}>
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

        {/* Scroll to bottom button - WhatsApp style */}
        {!isAtBottom && newMessagesCount > 0 && (
          <Button
            className="absolute bottom-4 right-4 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-xl border border-gray-200 dark:border-gray-700 w-12 h-12 z-30 transition-all"
            size="icon"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-5 w-5" />
            {newMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-md">
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
                  Replying to {!replyingTo.sentByOther ? "yourself" : receiver}
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

        {/* File Preview - Enhanced with thumbnails */}
        {files.length > 0 && (
          <div className="px-2 py-2 mb-2 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-3 gap-2">
              {files.map((file, index) => {
                const isImage = file.type.startsWith('image/')
                const previewUrl = isImage ? URL.createObjectURL(file) : null

                return (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-white border flex items-center justify-center">
                      {isImage && previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2">
                          <File className="h-8 w-8 text-gray-400" />
                          <span className="text-[10px] text-gray-500 mt-1 truncate max-w-full px-1">
                            {file.name.split('.').pop()?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (previewUrl) URL.revokeObjectURL(previewUrl)
                        setFiles(files.filter((_, i) => i !== index))
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )
              })}
            </div>
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


export function MessageElement(props: { message: UserMessage, sender: string, handleReply?: (message: UserMessage) => void, handleReaction?: (message: UserMessage, emoji: string) => void }) {
  const { message, handleReaction, handleReply } = props;
  const isMine = !message.sentByOther;


  const date = new Date(message.id / 1000)
  const timestamp = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isMine ? "bg-primary text-primary-foreground" : "bg-white border border-gray-200"} rounded-2xl px-3 py-2 m-0.5`}>
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

  enum Status {
    uninit,
    downloading,
    downloaded,
    error,
  }

  const [status, setStatus] = useState(Status.uninit)
  const [src, setSrc] = useState("")

  useEffect(() => {

    (async () => {
      const { url, token } = await EncryptionPlugin.getFileServerUrl()
      if (status == Status.uninit) {
        if (await checkIfFileExists(file)) {
          setSrc(getFileUrl(file.url, url, token))
          setStatus(Status.downloaded)
        } else {
          setStatus(Status.downloading)
          try {
            await decryptStreamAndSave(file)
            setSrc(getFileUrl(file.url, url, token))
            setStatus(Status.downloaded)
          } catch (err) {
            setStatus(Status.error)
            console.error(err)
          }
        }
      }
    }

    )()

  }, [])



  if (status == Status.downloading || status == Status.uninit) {
    // Show placeholder to prevent layout shift
    if (isImage || isVideo) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 animate-pulse" style={{ minHeight: '200px' }}>
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <Loader className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </div>
      )
    }
    return <div className="text-sm text-gray-500">Downloading...</div>
  }

  if (status == Status.error) {
    return <div className="text-sm text-red-500">Failed to load file</div>
  }



  if (isImage) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden" style={{ minHeight: '200px' }}>
        <img
          src={src}
          alt="Shared image"
          className="max-w-full h-auto rounded-lg object-cover max-h-80"
        />
      </div>
    )
  }

  if (isVideo) {
    return (
      <div className="mt-2 rounded-lg overflow-hidden max-h-80" style={{ minHeight: '200px' }}>
        <video
          src={src}
          className="max-w-full h-auto rounded-lg"
          controls
        />
      </div>
    )
  }

  const segments = file.url.split("/")
  const filename = segments[segments.length - 1]

  const fileSize = formatNumber(file.contentLength, 2, SIZE_LOOKUP_TABLE)

  return (
    <div className="mt-2 flex items-center p-2 bg-gray-100 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900 whitespace-normal">{filename}</p>
        <p className="text-xs text-gray-500">{fileSize}</p>
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
