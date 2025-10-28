'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { FireflyWsClient, protos as FireflyProtos, libsignal, newJsSessionStore, newJsIdentityStore } from "firefly-client-js"

import { useAuth } from '@/context/auth-context';
import { useEffect, useMemo, useState } from 'react';
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
} from "lucide-react";
import { useFirefly } from "@/context/firefly-context";
import { dateToRelativeString, getTimestampFromUlid, ulidFromString, ulidStringify } from "lupyd-js";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "@/hooks/use-toast";
import { UserMessageStore, type Message as DMessage } from "@/context/message-store";
import type { UserMessage } from "node_modules/firefly-client-js/dist/protos/message";

const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✨", "🎉", "👏"]

export default function UserMessagePage() {
  const params = useParams();
  const receiver = params.username?.toString();
  const auth = useAuth()
  const navigate = useNavigate();

  const [messages, setMessages] = useState<DMessage[]>([])

  const firefly = useFirefly()


  const localStore = new UserMessageStore();

  useEffect(() => () => localStore.close(), []);

  function mergeSorted(a: DMessage[], b: DMessage[]): DMessage[] {
    const result: DMessage[] = [];
    let i = 0, j = 0;

    while (i < a.length && j < b.length) {
      // if (compare(a[i], b[j]) <= 0) {}

      if (a[i].timestamp < b[j].timestamp) {
        result.push(a[i++]);
      } else {
        result.push(b[j++]);
      }
    }

    while (i < a.length) result.push(a[i++]);
    while (j < b.length) result.push(b[j++]);

    return result;
  }

  function addMessage(prev: DMessage[], msg: DMessage) {

    if (prev.length > 0) {
      if (prev[prev.length - 1].timestamp < msg.timestamp) {
        return [...prev, msg]
      } else {
        let i = 0;
        for (; i < prev.length; i++) {
          if (prev[i].timestamp > msg.timestamp) {
            break
          }
          if (prev[i].timestamp == msg.timestamp) {
            return [...prev.slice(0, i), msg, ...prev.slice(i + 1)]
          }
        }
        return [...prev.slice(0, i), msg, ...prev.slice(i)]
      }
    } else {
      return [msg]
    }
  }

  const getOlderMessages = async () => {
    const other = receiver
    const lastTs = messages.length != 0 ? BigInt(Date.now() * 1000) : messages[0].timestamp
    const count = 50

    const results = await Promise.all([
      localStore.getLastMessages(other!, auth.username!, count, lastTs),
      localStore.getLastMessages(auth.username!, other!, count, lastTs)
    ])

    setMessages((prev) => mergeSorted(prev, results.flat()))
  }

  const [currentConvoId, setCurrentConvoId] = useState(0n);

  async function getOnlineMessages() {
    if (currentConvoId == 0n) return
    const result = await firefly.service.getUserMessages({
      conversationId: Number(currentConvoId), startAfter:
        messages.length == 0 ? 0n : messages[messages.length - 1].timestamp,
      limit: 40
    })

    const dmessages: DMessage[] = []
    for (const msg of result.messages) {
      if (msg.from == sender) {
        continue;
      }
      try {
        const content = await firefly.decrypt(msg.text, msg.type, msg.to)
        dmessages.push({
          content,
          timestamp: msg.id,
          from: msg.from,
          to: msg.to,
          conversationId: msg.conversationId
        })
      } catch (err) {
        console.error(err)
      }
    }

    setMessages(prev => mergeSorted(prev, dmessages))
  }



  useEffect(() => {
    if (sender && receiver) {

    }
  }, [auth])


  useEffect(() => {
    if (!sender || !receiver) {
      return
    }


    const callback = async (_: FireflyWsClient, msg: DMessage) => {
      if (!(msg.from == receiver || msg.to == receiver)) {
        return
      }
      setMessages(prev => addMessage(prev, msg))
    }

    firefly.addEventListener(callback)

    return () => firefly.removeEventListener(callback)
  }, [auth])



  const [messageText, setMessageText] = useState("")
  const [replyingTo, setReplyingTo] = useState<DMessage | null>(null)

  const [endOfOlderMessages, setEndOfOlderMessages] = useState(false)
  function handleReaction(id: bigint, emoji: string): void {
    throw new Error('Function not implemented.');
  }

  function handleReply(message: DMessage): void {
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

  function addEmoji(emoji: string) {
    throw new Error('Function not implemented.');
  }


  async function sendMessage(userMessageInner: FireflyProtos.UserMessageInner) {

    const payload = FireflyProtos.UserMessageInner.encode(userMessageInner).finish();



  }

  async function handleSendMessage() {
    const msg = messageText.trim()
    if (msg.length == 0) return

    await sendMessage(FireflyProtos.UserMessageInner.create({
      plainText: new TextEncoder().encode(msg)
    }))
    setMessageText("")
    setReplyingTo(null)
  }

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      {/* Chat Header is now sticky */}
      <div className="sticky top-0 z-30 bg-white border-b p-2 sm:p-4 flex items-center justify-between shadow-sm">
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
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
            <Info className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages container with fixed height */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 lupyd-message-container"
          style={{
            height: "auto", // Will be set dynamically by JS
            maxHeight: "100%",
            paddingBottom: replyingTo ? "140px" : "100px",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch", // Improve smooth scrolling on iOS
          }}
        >

          <InfiniteScroll next={getOlderMessages}
            hasMore={!endOfOlderMessages}
            loader={<Loader />}
            dataLength={messages.length}
            inverse={true}
          >
            {messages.map((message) => {
              const isMine = message.from === sender;

              return (
                <div
                  key={message.timestamp}
                  className={`m-4 flex flex-col ${isMine ? "items-end" : "items-start"} "lupyd-message"`}
                >
                  <div
                    className={`flex items-end ${isMine ? "flex-row-reverse" : ""} space-x-2 ${isMine ? "space-x-reverse" : ""}`}
                  >
                    {!isMine && (
                      <UserAvatar username={receiver || ""} />
                    )}

                    <div className="max-w-[75%] sm:max-w-[70%] w-auto">
                      {/*message.replyTo && (
                      <div
                        className={`${message.sender === "me" ? "bg-gray-700" : "bg-gray-200"} rounded-t-lg px-2 sm:px-3 py-1 sm:py-2 text-[10px] sm:text-xs ${message.sender === "me" ? "text-gray-300" : "text-gray-600"} mb-1 border-l-2 ${message.sender === "me" ? "border-gray-500" : "border-gray-400"} overflow-hidden`}
                      >
                        <p className="font-medium">
                          {message.replyTo.sender === "me" ? "You" : selectedConversationData?.user.name}
                        </p>
                        <p className="truncate">{message.replyTo.text}</p>
                      </div>
                    )*/}

                      {/* Message content */}
                      <div
                        className={`${isMine ? "bg-black text-white" : "bg-gray-100"
                          } ${false ? "rounded-b-lg rounded-r-lg" : "rounded-lg"} p-2 sm:p-3 relative group overflow-hidden`}
                      >
                        <p className="text-xs sm:text-sm break-words whitespace-pre-wrap overflow-hidden text-ellipsis">
                          <MessageBody inner={message.content}></MessageBody>
                        </p>
                        <p
                          className={`text-[10px] sm:text-xs ${isMine ? "text-gray-300" : "text-muted-foreground"} mt-1`}
                        >
                          {dateToRelativeString(new Date(Number(message.timestamp / 1000n)))}
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
                                    onClick={() => handleReaction(message.timestamp, emoji)}
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

                    {isMine && (
                      <UserAvatar username={sender} />
                    )}
                  </div>
                </div>
              )
            })}
          </InfiniteScroll>



          <div />
        </div>

        {/* Message Input Area - Fixed at bottom */}
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 w-full md:w-[calc(100%-16rem)]"
          style={{ transform: "translateZ(0)" }} /* Force hardware acceleration */
        >
          {replyingTo && (
            <div className="px-2 sm:px-4 py-2 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center flex-1 overflow-hidden">
                <div className="w-1 h-6 bg-black mr-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">
                    Replying to {replyingTo.from === sender ? "yourself" : sender}
                  </p>
                  <p className="text-xs text-muted-foreground truncate"><MessageBody inner={replyingTo.content}></MessageBody></p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={cancelReply}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="p-2 sm:p-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="hidden sm:flex space-x-1">
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <Paperclip className="h-5 w-5" />
              </Button>
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
          </div>
        </div>
      </div>
    </div>
  )



}



function MessageBody(props: { inner: Uint8Array }) {
  const message = FireflyProtos.UserMessageInner.decode(props.inner);
  if (message.plainText) {
    return <div>{message.plainText}</div>
  } else {
    // handleCallMessage(message.callMessage)

    return <div>Received a Call Message</div>
  }
}
