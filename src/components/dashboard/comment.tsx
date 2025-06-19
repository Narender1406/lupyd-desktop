"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThumbsUp, ThumbsDown, MessageCircle, MoreHorizontal } from "lucide-react"
import { AnimatedCard } from "@/components/animated-card"

export interface CommentAuthor {
  id: string
  name: string
  avatar: string
  avatarFallback: string
}

export interface CommentData {
  id: string
  author: CommentAuthor
  content: string
  timestamp: string
  likes: number
  dislikes?: number
  replies?: CommentData[]
}

interface CommentProps {
  comment: CommentData
  level?: number
  delay?: number
  maxLevel?: number
}

export function Comment({ comment, level = 0, delay = 0, maxLevel = 3 }: CommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [showAllReplies, setShowAllReplies] = useState(level < 1)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes)
  const [dislikeCount, setDislikeCount] = useState(comment.dislikes || 0)

  const hasReplies = comment.replies && comment.replies.length > 0
  const isMaxLevel = level >= maxLevel

  const handleReply = () => {
    // In a real app, this would send the reply to the server
    console.log(`Replying to comment ${comment.id}: ${replyText}`)
    setReplyText("")
    setShowReplyInput(false)
    // For demo purposes, we'd add the reply to the comment's replies array
  }

  const handleLike = () => {
    if (disliked) {
      setDisliked(false)
      setDislikeCount(dislikeCount - 1)
    }

    if (liked) {
      setLiked(false)
      setLikeCount(likeCount - 1)
    } else {
      setLiked(true)
      setLikeCount(likeCount + 1)
    }
  }

  const handleDislike = () => {
    if (liked) {
      setLiked(false)
      setLikeCount(likeCount - 1)
    }

    if (disliked) {
      setDisliked(false)
      setDislikeCount(dislikeCount - 1)
    } else {
      setDisliked(true)
      setDislikeCount(dislikeCount + 1)
    }
  }

  return (
    <AnimatedCard delay={delay}>
      <div className={`${level > 0 ? "pl-4 md:pl-8 border-l border-gray-200" : ""}`}>
        <div className="flex space-x-3 py-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.avatarFallback}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{comment.timestamp}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm">{comment.content}</p>
            <div className="flex items-center space-x-4 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 text-xs ${liked ? "text-black" : ""}`}
                onClick={handleLike}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                <span>{likeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 text-xs ${disliked ? "text-black" : ""}`}
                onClick={handleDislike}
              >
                <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                <span>{dislikeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1" />
                <span>Reply</span>
              </Button>
            </div>

            {showReplyInput && (
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  className="h-8 bg-black text-white hover:bg-gray-800"
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                >
                  Reply
                </Button>
              </div>
            )}
          </div>
        </div>

        {hasReplies && (
          <div className="mt-1">
            {!showAllReplies && (
              <Button variant="ghost" size="sm" className="text-xs ml-11 mb-2" onClick={() => setShowAllReplies(true)}>
                Show {comment.replies!.length} {comment.replies!.length === 1 ? "reply" : "replies"}
              </Button>
            )}

            {showAllReplies && (
              <div className="space-y-1 mt-1">
                {comment.replies!.map((reply, index) => (
                  <Comment key={reply.id} comment={reply} level={level + 1} delay={0.1 * index} maxLevel={maxLevel} />
                ))}
              </div>
            )}

            {showAllReplies && comment.replies!.length > 2 && (
              <Button variant="ghost" size="sm" className="text-xs ml-11 mt-1" onClick={() => setShowAllReplies(false)}>
                Hide replies
              </Button>
            )}
          </div>
        )}
      </div>
    </AnimatedCard>
  )
}
