'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { protos as FireflyProtos } from "firefly-client-js"

import { useAuth } from '@/context/auth-context';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate, useParams } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from '@/components/user-avatar';
import {
  ArrowLeft,
  Camera,
  File,
  Forward,
  ImageIcon,
  Info,
  Loader,
  Mic,
  MoreHorizontal,
  MoreVertical,
  Paperclip,
  Phone,
  Reply,
  Send,
  Smile,
  Video,
  X,
  ChevronDown,
} from "lucide-react";
import { useFirefly } from "@/context/firefly-context";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "@/hooks/use-toast";
import { bUserMessageToUserMessage, checkIfFileExists, decryptStreamAndSave, EncryptionPlugin, getFileUrl, userMessageToBUserMessage, type BUserMessage, type UserMessage } from "@/context/encryption-plugin";
import { useApiService } from "@/context/apiService";
import { encryptBlobV1, formatNumber, SIZE_LOOKUP_TABLE, toBase64 } from "@/lib/utils";

const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨", "🎉", "👏"]



enum ContentType {
  Unknown = 0,
  Image = 1,
  Video = 2,
}




export default function UserMessagePage() {
  const params = useParams();
  const receiver = params.username?.toString();
  const auth = useAuth()
  const navigate = useNavigate();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  const [messages, setMessages] = useState<UserMessage[]>([])

  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const firefly = useFirefly()

  function addMessage(prev: UserMessage[], msg: UserMessage) {
    const message = FireflyProtos.UserMessageInner.decode(msg.text)
    if (message.callMessage && !(message.callMessage.type == FireflyProtos.CallMessageType.ended || message.callMessage.type == FireflyProtos.CallMessageType.rejected)) {



      return prev;
    }

    if (prev.length > 0) {
      if (prev[prev.length - 1].id < msg.id) {
        return [...prev, msg]
      } else {
        let i = 0;
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
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isBottom = scrollHeight - scrollTop - clientHeight < 50; // 50px threshold
      setIsAtBottom(isBottom);

      // Reset new messages count when user scrolls to bottom
      if (isBottom) {
        setNewMessagesCount(0);
      }
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      setNewMessagesCount(0);
    }
  };

  // Handle file selection
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Show attachment options
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const handleCameraSelect = () => {
    setShowAttachmentMenu(false);
    // TODO: Implement photo capture functionality
    console.log('Taking photo');
    // For now, we'll just show an alert
    alert('Camera functionality would open here');


  };

  const handleFilesSelect = () => {
    setShowAttachmentMenu(false);
    handleFileSelect();
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    getOlderMessages()
    // Add scroll listener
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkIfAtBottom);
      return () => container.removeEventListener('scroll', checkIfAtBottom);
    }
  }, [])

  const getOlderMessages = async () => {
    const lastTs = messages.length == 0 ? Date.now() * 1000 : messages[0].id
    const count = 100

    // TODO: this is not good


    console.log({ getLastMessages: { other: receiver!, limit: count, before: lastTs }})

    const { result } = await EncryptionPlugin.getLastMessages({ other: receiver!, limit: count, before: lastTs })

    setMessages((prev) => {
      let newMessages = prev

      // not the most efficient way, but good enough
      for (const msg of result) {
        newMessages = addMessage(newMessages, bUserMessageToUserMessage(msg))
      }

      return newMessages
    })
  }


  // const myCallSession = new CallSession({
  //   onSendMessage: (callMessage) => {
  //     sendMessage(FireflyProtos.UserMessageInner.create({ callMessage }))
  //   }
  // })

  useEffect(() => {
    const callback = async (message: UserMessage) => {


      // if (msg.callMessage) {
      //   const obj = JSON.parse(new TextDecoder().decode(msg.callMessage.message))

      //   if (isCallRequestMessage(obj)) {
      //     if (obj.exp > Date.now()) {
      //       console.log(`Call expired ${JSON.stringify(obj)}`)
      //       return
      //     }
      //     EncryptionPlugin.showCallNotification({
      //       caller: message.from,
      //       sessionId: obj.sessionId,
      //       conversationId: message.convoId
      //     })
      //   }
      //   return
      // }

      if (message.other != receiver) {

        return
      }
      // const decryptedMessage = FireflyProtos.UserMessageInner.decode(msg.text)

      // if (decryptedMessage.callMessage) {
      //   myCallSession.handleCallMessage(decryptedMessage.callMessage)
      // }

      setMessages(prev => addMessage(prev, message))

      // Increment new messages counter if not at bottom
      if (!isAtBottom) {
        setNewMessagesCount(prev => prev + 1);
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

  const sender = useMemo(() => auth.username, [auth])

  function addEmoji(_emoji: string) {
    // TODO: Implement emoji functionality
    console.log('Adding emoji', _emoji);
  }

  async function sendMessage(userMessageInner: FireflyProtos.UserMessageInner) {

    const payload = FireflyProtos.UserMessageInner.encode(userMessageInner).finish();
    // const msg = await firefly.encryptAndSend(BigInt(currentConvoId), receiver!, payload)

    const msg = await firefly.encryptAndSend( receiver!, payload)

    setMessages(prev => addMessage(prev, msg))
  }

  const [sendingMessage, setSendingMessage] = useState(false);

  const { api, cdnUrl } = useApiService()

  async function handleSendMessage() {
    const msg = messageText.trim()
    if (msg.length == 0) return

    if (sendingMessage) {
      return;
    }
    setSendingMessage(true);
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
          contentType,
          contentLength: file.size,
        }))
      }

      // TODO: can just send files away immediately individually, instead of sending all of them at once

      const userMessage =
        FireflyProtos.UserMessageInner.create({
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
  // Create fake conversation for testing
  const createFakeConversation = () => {
    const fakeMessages: BUserMessage[] = [];
    const now = Date.now() * 1000;

    // Create different types of messages
    const messageTypes = [
      'Hello there! 👋 How are you doing today? I hope you are having a great day!',
      'Check out this image [image]',
      'Here\'s a video for you [video]',
      'I\'ve attached the project requirements document [file]',
      'This is a longer message to test how the text wrapping works in our chat interface. It should wrap properly without breaking words too early.',
      'This is another image [image]',
      'Meeting notes from our discussion today [file]',
      'Tutorial video showing how to use the new features [video]',
      'Quick update: We\'ve made some changes to the design and functionality.',
      'Can you review this quarterly_report_final_v3.pdf when you have a chance? [file]'
    ];

    for (let i = 0; i < 20; i++) {
      const isSender = i % 2 === 0;
      const messageType = messageTypes[i % messageTypes.length];


      throw new Error(`Ain't doing that`)

    //   const fakeMessage: DMessage = {
    //     id: now - (i * 1000000),
    //     convoId: 1,
    //     from: isSender ? sender! : receiver!,
    //     to: isSender ? receiver! : sender!,
    //     text: FireflyProtos.UserMessageInner.encode(
    //       FireflyProtos.UserMessageInner.create({
    //         messagePayload: FireflyProtos.MessagePayload.create({
    //           text: messageType
    //         })
    //       })
    //     ).finish()
    //   };
    //   fakeMessages.push(fakeMessage);
    }

    // setMessages(fakeMessages.reverse());
  };

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

  // Prevent page jump on keyboard open
  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const container = messagesContainerRef.current;
      const inputContainer = document.querySelector('.message-input-container') as HTMLElement;

      // Get viewport and keyboard height
      const viewport = window.visualViewport!;
      const keyboardHeight = window.innerHeight - viewport.height - viewport.offsetTop;

      // When keyboard is visible
      if (keyboardHeight > 100) {
        // Keep chat content visible
        if (container) {
          container.style.height = `calc(100vh - ${keyboardHeight + 60}px)`; // adjust for input height
          container.scrollTop = container.scrollHeight; // keep at bottom
        }
        if (inputContainer) {
          inputContainer.style.bottom = `${keyboardHeight}px`;
        }
        document.body.style.overflow = "hidden";
      } else {
        // Reset after keyboard closes
        if (container) {
          container.style.height = "calc(100vh - 120px)";
        }
        if (inputContainer) {
          inputContainer.style.bottom = "0px";
        }
        document.body.style.overflow = "";
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () => window.visualViewport!.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="flex-1 flex flex-col h-full relative overflow-hidden"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* Chat Header - Fixed at top with safe area padding */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b px-2 sm:px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-2 flex items-center justify-between shadow-sm w-full md:w-[calc(100%-16rem)] fixed-header">
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Back button on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <UserAvatar username={receiver || ""} />

          <div>
            <p className="font-medium text-sm sm:text-base">{receiver}</p>
            {/*            <p className="text-xs text-muted-foreground">
              {selectedConversationData?.user.isOnline ? "Online" : "Offline"}
            </p>*/}
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button variant="ghost" size="icon" onClick={startCall}>
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Info className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={createFakeConversation}>
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages container with fixed height */}
      <div className="flex-1 relative overflow-hidden pt-16">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-3 lupyd-message-container"
          style={{
            height: "calc(100vh - 130px)", // keeps consistent spacing
            paddingBottom: replyingTo ? "90px" : "75px", // reduced to close the gap
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
            scrollBehavior: "smooth",
          }}
        >

          <InfiniteScroll next={getOlderMessages}
            hasMore={!endOfOlderMessages}
            loader={<Loader />}
            dataLength={messages.length}
            inverse={true}
          >
            {messages.map((message) =>
              <MessageElement key={message.id.toString()} message={message} handleReaction={handleReaction} handleReply={handleReply} sender={sender!} />
            )}
          </InfiniteScroll>



          <div />
        </div>

        {/* Scroll to bottom button - only show when not at bottom and there are new messages */}
        {!isAtBottom && newMessagesCount > 0 && (
          <Button
            className="absolute bottom-24 right-4 rounded-full bg-black text-white hover:bg-gray-800 z-40 shadow-lg"
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

      {/* Message Input Area - Fixed at bottom */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 w-full md:w-[calc(100%-16rem)] message-input-container shadow-[0_-1px_4px_rgba(0,0,0,0.08)]"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          transform: 'translateZ(0)',
        }}
      >
        {replyingTo && (
          <div className="px-2 sm:px-4 py-2 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center flex-1 overflow-hidden">
              <div className="w-1 h-6 bg-black mr-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">
                  Replying to {!replyingTo.sentByOther ? "yourself" : sender}
                </p>
                <p className="text-xs text-muted-foreground truncate"><MessageBody inner={replyingTo.text}></MessageBody></p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={cancelReply}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="p-2 sm:p-4 pb-4">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <div className="hidden sm:flex space-x-1">
              <DropdownMenu open={showAttachmentMenu} onOpenChange={setShowAttachmentMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={5}>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={5}>
                  <DropdownMenuItem onClick={handleCameraSelect}>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleFilesSelect}>
                    <File className="h-4 w-4 mr-2" />
                    Choose from Files
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon">
                <Mic className="h-5 w-5" />
              </Button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Paperclip className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={5}>
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
              className="bg-gray-100 border-none text-sm sm:text-base"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="end" sideOffset={5}>
                <div className="grid grid-cols-5 gap-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      className="text-2xl hover:bg-gray-100 p-2 rounded"
                      onClick={() => {
                        addEmoji(emoji)
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <Button
              size="icon"
              className="bg-black text-white hover:bg-gray-800"
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Send className="h-5 w-5" />
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
    </div>
  )



}


export function MessageElement(props: { message: UserMessage, sender: string, handleReply?: (message: UserMessage) => void, handleReaction?: (message: UserMessage, emoji: string) => void }) {
  const { message, handleReaction, handleReply } = props;
  const isMine = !message.sentByOther;

  // const [relativeTimestamp, setRelativeTimestamp] = useState(dateToRelativeString(new Date(Number(message.id / 1000))))

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setRelativeTimestamp(dateToRelativeString(new Date(Number(message.id / 1000))))
  //   }, 1000)

  //   return () => { clearInterval(interval) }
  // }, [])


  const date = new Date(message.id / 1000)
  const timestamp = `${date.getHours() % 12}:${date.getMinutes()}`

  return (
    <div
      key={message.id}
      className={`px-4 py-2 flex flex-col ${isMine ? "items-end" : "items-start"} "lupyd-message"`}
    >
      <div className={`flex items-end space-x-2 max-w-full ${isMine ? "flex-row-reverse space-x-reverse" : ""}`}>
        <div className="max-w-[75%] sm:max-w-[80%] md:max-w-[85%] w-auto min-w-[100px]">
          {/* Message content */}
          <div
            className={`${isMine ? "bg-black text-white" : "bg-gray-100"
              } rounded-lg p-2 sm:p-3 relative group overflow-hidden`}
          >
            <div className="text-xs sm:text-sm break-words whitespace-normal overflow-hidden min-w-[40px]">
              <MessageBody inner={message.text}></MessageBody>
            </div>
            <p
              className={`text-[10px] sm:text-xs ${isMine ? "text-gray-300" : "text-muted-foreground"} mt-1`}
            >
              {timestamp}
            </p>

            {/* Message actions - Fixed position for better visibility */}
            <div
              className={`absolute ${isMine ? "left-0 translate-x-[-50%]" : "right-0 translate-x-[50%]"} top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full shadow-md flex items-center scale-75 md:scale-100 z-10`}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Smile className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-2"
                  side={isMine ? "left" : "right"}
                  align="center"
                  sideOffset={5}
                >
                  <div className="flex gap-1">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        className="text-lg hover:bg-gray-100 p-1 rounded"
                        onClick={handleReply ? () => handleReaction!(message, emoji) : undefined}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleReply ? () => handleReply!(message) : handleReply}
              >
                <Reply className="h-3 w-3" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side={isMine ? "left" : "right"}>
                  <DropdownMenuItem className="flex items-center">
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center">
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  {isMine && (
                    <DropdownMenuItem className="flex items-center text-red-600">
                      <X className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Reactions
                    {message.reactions && message.reactions.length > 0 && (
                      <div className={`flex mt-1 ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className="bg-white rounded-full shadow-sm px-1.5 py-0.5 text-xs sm:text-sm flex items-center">
                          {message.reactions.map((emoji, index) => (
                            <span key={index} className="mx-0.5">
                              {emoji}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    */}
        </div>
      </div>
    </div>
  )
}


export function MessageBody(props: { inner: Uint8Array }) {
  const message = FireflyProtos.UserMessageInner.decode(props.inner);

  // Handle plain text messages
  if (message.plainText) {
    const text = new TextDecoder().decode(message.plainText);
    return <div className="whitespace-pre-wrap">{text}</div>
  }

  if (message.messagePayload) {
    const cleanText = message.messagePayload.text
    const files = message.messagePayload.files?.files ?? []

    return (
      <div className="space-y-2">
        {cleanText && <div className="whitespace-pre-wrap">{cleanText}</div>}
        {
          files.map(file => <MessageFileElement file={file} />
          )
        }
      </div>
    );
  }
  // TODO: make it pretty
  if (message.callMessage) {
    if (message.callMessage.type == FireflyProtos.CallMessageType.ended) {
      const { duration } = JSON.parse(message.callMessage.jsonBody)
      const totalSeconds = Math.floor(duration / 1_000_000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60

      return <div>Call {minutes}:{seconds} s</div>
    }
    if (message.callMessage.type == FireflyProtos.CallMessageType.rejected) {
      return <div>Call Rejected</div>
    }
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


  if (status == Status.downloading) {
    //TODO: make it pretty
    return <div>Downloading...</div>
  }

  if (status == Status.error) {
    //TODO: make it pretty, maybe retry?
    return <div>Something went wrong</div>
  }


  if (isImage) {

    return (<div className="mt-2">
      <img
        src={src}
        alt="Shared content"
        className="rounded-lg max-w-full h-auto object-contain"
        style={{ aspectRatio: '3/2', maxHeight: '200px' }}
      />
    </div>

    )
  }

  if (isVideo) {
    return (
      <div className="mt-2 relative" style={{ aspectRatio: '3/2', maxHeight: '200px' }}>
        <video
          src={src}
          className="rounded-lg w-full h-full object-cover"
          controls
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 rounded-full p-3">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    )
  }


  const segments = file.url.split("/")
  const filename = segments[segments.length - 1]

  const fileSize = formatNumber(file.contentLength, 2, SIZE_LOOKUP_TABLE)

  return (
    <div className="mt-2 flex items-center p-3 bg-gray-100 rounded-lg max-w-xs">
      <div className="flex-shrink-0 w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-900 whitespace-normal">{filename}</p>
        <p className="text-xs text-gray-500">{fileSize}</p>
      </div>
    </div>
  )
}
