"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { UserAvatar } from "@/components/user-avatar"
import { useApiService } from "@/context/apiService"
import { useAuth } from "@/context/auth-context"
import {
  bGroupMessageToGroupMessage,
  EncryptionPlugin,
  type BGroupInfo,
  type GroupMessage,
} from "@/context/encryption-plugin"
import { useFirefly, type GroupMessageCallbackType } from "@/context/firefly-context"
import { useScrollBoundaryGuard } from "@/hooks/use-scroll-boundary-guard"
import { toast } from "@/hooks/use-toast"
import { encryptBlobV1, formatNumber, fromBase64, SIZE_LOOKUP_TABLE } from "@/lib/utils"
import { protos } from "firefly-client-js"
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  File,
  Hash,
  Loader,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  X,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { usePathParams } from "@/hooks/use-path-params"

const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨", "🎉", "👏"]

enum ContentType {
  Unknown = 0,
  Image = 1,
  Video = 2,
}

export default function GroupChannelChatPage() {
  const { id } = usePathParams<{ id: string }>('/groups/:id')
  const navigate = useNavigate()
  const auth = useAuth()
  const firefly = useFirefly()
  const { api, cdnUrl } = useApiService()

  const [groupInfo, setGroupInfo] = useState<BGroupInfo | undefined>(undefined)
  const [extension, setExtension] = useState<protos.FireflyGroupExtension | undefined>(undefined)
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  // Chat state
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [messageText, setMessageText] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [newMessagesCount, setNewMessagesCount] = useState(0)
  const [viewportHeight, setViewportHeight] = useState("100%")

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)

  // Apply scroll boundary guard
  useScrollBoundaryGuard(messagesContainerRef)

  // Handle Viewport Resizing (Keyboard Open/Close)
  useEffect(() => {
    if (!window.visualViewport) return

    const handleResize = () => {
      setViewportHeight(`${window.visualViewport?.height}px`)

      if (document.activeElement === messageInputRef.current && isAtBottom) {
        setTimeout(scrollToBottom, 100)
      }
    }

    window.visualViewport.addEventListener("resize", handleResize)
    window.visualViewport.addEventListener("scroll", handleResize)

    handleResize()

    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize)
      window.visualViewport?.removeEventListener("scroll", handleResize)
    }
  }, [isAtBottom])

  // Load group data
  useEffect(() => {
    if (!id) return

    setLoading(true)

    EncryptionPlugin.getGroupInfoAndExtension({ groupId: Number(id) })
      .then((result) => {
        setGroupInfo(result)

        const ext = protos.FireflyGroupExtension.decode(fromBase64(result.extensionB64))
        setExtension(ext)

        const params = new URLSearchParams(window.location.search)
        const c = params.get("c")

        if (c) {
          setSelectedChannelId(Number(c))
        } else if (ext.channels && ext.channels.length > 0) {
          setSelectedChannelId(ext.channels[0].id)
        }

        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load group data:", error)
        setLoading(false)
      })
  }, [id])

  // Load messages when channel changes
  useEffect(() => {
    if (!id || !selectedChannelId) return

    EncryptionPlugin.getGroupMessages({
      groupId: Number(id),
      startBefore: Date.now() * 1000,
      limit: 50,
    }).then(({ result }) => {
      const channelMessages = result
        .filter((m) => m.channelId === selectedChannelId)
        .map(bGroupMessageToGroupMessage)
        .sort((a, b) => a.id - b.id)

      setMessages(channelMessages)

      setTimeout(() => {
        scrollToBottom()
      }, 100)
    })
  }, [id, selectedChannelId])


  function onGroupMessage(msg: GroupMessage) {
    if (msg.groupId === Number(id) && msg.channelId === selectedChannelId) {
      const newMessage = msg
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMessage.id)) return prev
        return [...prev, newMessage].sort((a, b) => a.id - b.id)
      })

      if (!isAtBottom) {
        setNewMessagesCount((prev) => prev + 1)
      }

      setTimeout(() => {
        if (isAtBottom) {
          scrollToBottom()
        }
      }, 100)
    }
  }


  // Listen for new messages
  useEffect(() => {
    if (!id || !selectedChannelId) return

    const callback: GroupMessageCallbackType = onGroupMessage

    firefly.addGroupEventListener(callback)
    return () => firefly.removeGroupEventListener(callback)
  }, [id, selectedChannelId, firefly, isAtBottom])

  // Check if user is at bottom
  const checkIfAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isBottom = scrollHeight - scrollTop - clientHeight < 100
      setIsAtBottom(isBottom)

      if (isBottom) {
        setNewMessagesCount(0)
      }
    }
  }

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      setNewMessagesCount(0)
    }
  }

  // Add scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", checkIfAtBottom)
      return () => container.removeEventListener("scroll", checkIfAtBottom)
    }
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && isAtBottom) {
      setTimeout(() => {
        scrollToBottom()
      }, 50)
    }
  }, [messages])

  const channels = useMemo(() => extension?.channels || [], [extension])

  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId),
    [channels, selectedChannelId]
  )

  const handleBack = () => {
    navigate(`/groups/${id}`)
  }

  // File handling
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleCameraSelect = () => {
    setShowAttachmentMenu(false)
    alert("Camera functionality would open here")
  }

  const handleFilesSelect = () => {
    setShowAttachmentMenu(false)
    handleFileSelect()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = async () => {
    const msg = messageText.trim()
    if (msg.length === 0 && files.length === 0) return

    if (sendingMessage) return

    setSendingMessage(true)
    try {
      const encryptedFiles = protos.EncryptedFiles.create()
      for (const file of files) {
        const { reader, key } = encryptBlobV1(file)
        const objectKey = await api.uploadFile(file.name, "application/octet-stream", reader)

        let contentType = ContentType.Unknown
        if (file.type.startsWith("image/")) {
          contentType = ContentType.Image
        } else if (file.type.startsWith("video/")) {
          contentType = ContentType.Video
        }

        encryptedFiles.files.push(
          protos.EncryptedFile.create({
            url: `${cdnUrl}/${objectKey}`,
            secretKey: key,
            contentType,
            contentLength: file.size,
          })
        )
      }

      const messageInner = protos.GroupMessageInner.encode({
        messagePayload: {
          text: msg,
          files: encryptedFiles,
          replyingTo: 0n, // allows replying to ui
        },
        channelId: selectedChannelId!,
      }).finish()

      const message = await firefly.encryptAndSendGroupMessage({
        groupId: Number(id),
        channelId: selectedChannelId!,
        text: messageInner,
        sender: auth.username ?? "",
        id: 0,
        epoch: 0, // let the lib fill it up
      })

      onGroupMessage(message)

      setMessageText("")
      setFiles([])
      messageInputRef.current?.focus()
    } catch (error) {
      console.error("Failed to send message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <div
      className="flex flex-col bg-gray-50 w-full"
      style={{
        height: viewportHeight,
        overflow: "hidden",
        position: "fixed",
        inset: 0,
      }}
    >
      {/* Header */}
      <div
        className="flex-none bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm z-20 touch-none"
        style={{
          paddingTop: "max(env(safe-area-inset-top), 0.75rem)",
        }}
      >
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Hash className="h-5 w-5 text-gray-500" />
          <div>
            <p className="font-semibold">{selectedChannel?.name || "channel"}</p>
            <p className="text-xs text-muted-foreground">
              {groupInfo?.name || `Group #${id}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 min-h-0 relative w-full">
        <div
          ref={messagesContainerRef}
          className="h-full overflow-y-auto p-4 w-full overscroll-y-none touch-pan-y"
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="mb-4">
                <GroupMessageElement message={message} />
              </div>
            ))
          )}

          <div className="h-2"></div>
        </div>

        {/* Scroll to bottom button */}
        {!isAtBottom && newMessagesCount > 0 && (
          <Button
            className="absolute bottom-4 right-4 rounded-full bg-white text-gray-700 hover:bg-gray-50 shadow-xl border w-12 h-12 z-30"
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

      {/* Input Area */}
      <div
        className="flex-none bg-white border-t p-2 shadow-lg z-20 w-full touch-none"
        style={{
          paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
        }}
      >
        {/* File Preview */}
        {files.length > 0 && (
          <div className="px-2 py-2 mb-2 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-3 gap-2">
              {files.map((file, index) => {
                const isImage = file.type.startsWith("image/")
                const isVideo = file.type.startsWith("video/")
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
                      ) : isVideo ? (
                        <div className="flex flex-col items-center justify-center p-2">
                          <File className="h-8 w-8 text-gray-400" />
                          <span className="text-[10px] text-gray-500 mt-1 truncate max-w-full px-1">
                            VIDEO
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-2">
                          <File className="h-8 w-8 text-gray-400" />
                          <span className="text-[10px] text-gray-500 mt-1 truncate max-w-full px-1">
                            {file.name.split(".").pop()?.toUpperCase()}
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
            ref={messageInputRef}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 border-none rounded-full py-2 px-3 text-sm"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ fontSize: "16px" }}
            disabled={sendingMessage}
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
                    onClick={() => setMessageText((prev) => prev + emoji)}
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
            onMouseDown={(e) => e.preventDefault()}
            disabled={sendingMessage || (!messageText.trim() && files.length === 0)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

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

function GroupMessageElement({ message }: { message: GroupMessage }) {
  const decodedMessage = useMemo(() => {
    try {
      return protos.GroupMessageInner.decode(message.text)
    } catch {
      return null
    }
  }, [message.text])

  const date = new Date(message.id / 1000)
  const timestamp = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`

  return (
    <div className="flex items-start gap-3">
      <UserAvatar username={message.sender} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium truncate">{message.sender}</span>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <div className="text-sm break-words mt-1">
          {decodedMessage?.messagePayload?.text || "[Failed to decode]"}
        </div>
        {decodedMessage?.messagePayload?.files?.files && (
          <div className="mt-2 space-y-2">
            {decodedMessage.messagePayload.files.files.map((file, index) => (
              <MessageFileElement key={index} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MessageFileElement({ file }: { file: protos.EncryptedFile }) {
  const isImage = (file.contentType & ContentType.Image) === ContentType.Image
  const isVideo = (file.contentType & ContentType.Video) === ContentType.Video

  enum Status {
    uninit,
    downloading,
    downloaded,
    error,
  }

  const [status, setStatus] = useState(Status.uninit)
  const [src, setSrc] = useState("")

  useEffect(() => {
    // File download logic would go here
    // For now, just show placeholder
    setStatus(Status.downloading)
  }, [])

  if (status === Status.downloading || status === Status.uninit) {
    if (isImage || isVideo) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden bg-gray-200 animate-pulse" style={{ minHeight: "200px" }}>
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <Loader className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </div>
      )
    }
    return <div className="text-sm text-gray-500">Downloading...</div>
  }

  if (status === Status.error) {
    return <div className="text-sm text-red-500">Failed to load file</div>
  }

  const segments = file.url.split("/")
  const filename = segments[segments.length - 1]
  const fileSize = formatNumber(file.contentLength, 2, SIZE_LOOKUP_TABLE)

  return (
    <div className="mt-2 flex items-center p-2 bg-gray-100 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
        <File className="w-5 h-5 text-blue-500" />
      </div>
      <div className="ml-2 flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{filename}</p>
        <p className="text-xs text-gray-500">{fileSize}</p>
      </div>
    </div>
  )
}
