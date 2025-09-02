"use client"

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ThumbsUp, ThumbsDown, MessageCircle, Bookmark, Send, MoreVertical, Flag, Delete } from "lucide-react"
import { Link } from "react-router-dom"
import { ShareModal } from "@/components/dashboard/share-modal"
import { useAuth } from "@/context/auth-context"
import { useGlobalDialog } from "@/context/dialog-context"
import van from "vanjs-core"
import { UserAvatar } from "../user-avatar"
import LazyLoad from "react-lazyload"
import { toast } from "@/hooks/use-toast"
import {
  createPost,
  dateToRelativeString,
  deletePost,
  FetchType,
  getPosts,
  type GetPostsData,
  getTimestampFromUlid,
  type PickedFileUrl,
  PostProtos,
  putVote,
  reportPost,
  ulidStringify,
} from "lupyd-js"
import type { Extension, HtmlExtension } from "micromark-util-types"

type FullPost = PostProtos.FullPost
type PostBodies = PostProtos.PostBodies
type PostBody = PostProtos.PostBody

export function PostCard(props: { post: FullPost; onDelete?: (id: Uint8Array) => void }) {
  const post = props.post
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [liked, setLiked] = useState(post.vote?.val === true ? true : false)
  const [disliked, setDisliked] = useState(post.vote?.val === false ? true : false)
  const [likeCount, setLikeCount] = useState(Number(post.upvotes))
  const [dislikeCount, setDislikeCount] = useState(Number(post.downvotes))

  const [comments, setComments] = useState<FullPost[]>([])

  const auth = useAuth()

  const toggleComments = async () => {
    if (comments.length == 0) {
      const details: GetPostsData = {
        fetchType: FetchType.Replies,
        fetchTypeFields: ulidStringify(post.id),
      }

      const posts = await getPosts(details)
      setComments(posts)
    }
    setShowComments(!showComments)
  }

  const handleComment = () => {
    console.log(`Commenting on post ${ulidStringify(post.id)}: ${commentText}`)

    const details = PostProtos.CreatePostDetails.create({
      replyingTo: post.id,
      postType: post.postType,
      expiry: post.expiry,
      body: PostProtos.PostBody.create({ plainText: commentText }),
    })

    toast({ title: "Commenting..." })
    // TODO: have better way to show progress
    createPost(details)
      .then((comment) => {
        if (comment) {
          setComments((comments) => [comment, ...comments])
        }
        setCommentText("")
      })
      .catch((err) => {
        console.error(err)
        toast({ title: "Failed to create comment" })
      })
  }

  const handleLike = async () => {
    let val: PostProtos.BoolValue | undefined = undefined
    if (disliked) {
      setDisliked(false)
      setDislikeCount(dislikeCount - 1)
      val = PostProtos.BoolValue.create({ val: true })
    }

    if (liked) {
      setLiked(false)
      setLikeCount(likeCount - 1)
    } else {
      setLiked(true)
      setLikeCount(likeCount + 1)
      val = PostProtos.BoolValue.create({ val: true })
    }

    await putVote(PostProtos.Vote.create({ id: post.id, val }))
  }

  const handleDislike = async () => {
    let val: PostProtos.BoolValue | undefined = undefined
    if (liked) {
      setLiked(false)
      setLikeCount(likeCount - 1)
      val = PostProtos.BoolValue.create({ val: false })
    }

    if (disliked) {
      setDisliked(false)
      setDislikeCount(dislikeCount - 1)
    } else {
      setDisliked(true)
      setDislikeCount(dislikeCount + 1)
      val = PostProtos.BoolValue.create({ val: false })
    }

    await putVote(PostProtos.Vote.create({ id: post.id, val }))
  }

  const postUrl = `${window.origin}/post/${ulidStringify(post.id)}`

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const report = async () => {
    await reportPost(post.id, "")
    setIsDropdownOpen(false)
    toast({ title: "Post has been reported" })
  }

  const deleteThisPost = async () => {
    await deletePost(post.id)
    toast({ title: "Post has been deleted" })
    if (props.onDelete) {
      props.onDelete(post.id)
    }
  }

  function savePost() {
    alert("Successfully Saved Post")
  }

  return (
    <Card className="border-none shadow-sm mx-auto w-full max-w-[560px] sm:max-w-[640px] md:max-w-[700px] lg:max-w-[740px]">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <Link to={`/user/${post.by}`}>
            <div className="flex items-center space-x-3">
              <UserAvatar username={post.by} />
              <div>
                <CardTitle className="text-base">{post.by}</CardTitle>
                <CardDescription className="text-xs">
                  {dateToRelativeString(new Date(getTimestampFromUlid(post.id)))}
                </CardDescription>
              </div>
            </div>
          </Link>
          <DropdownMenu open={isDropdownOpen} onOpenChange={(e) => setIsDropdownOpen(e)}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={report}>
                <div className="flex items-center cursor-pointer">
                  <Flag className="mr-2 h-4 w-4" />
                  <span>Report</span>
                </div>
              </DropdownMenuItem>

              {auth.username === post.by && (
                <DropdownMenuItem onClick={deleteThisPost}>
                  <div className="flex items-center cursor-pointer">
                    <Delete className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </div>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="mb-4">{post.title}</p>
        {post.body.length > 0 && (
          <LazyLoad>
            <PostBodiesElement {...PostProtos.PostBodies.decode(post.body)} />
          </LazyLoad>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 px-2 ${liked ? "text-black" : ""}`}
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{likeCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 px-2 ${disliked ? "text-black" : ""}`}
              onClick={handleDislike}
            >
              <ThumbsDown className="h-4 w-4" />
              <span>{dislikeCount}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-1 px-2" onClick={toggleComments}>
              <MessageCircle className="h-4 w-4" />
              <span>{post.replies}</span>
            </Button>
            <ShareModal title={post.title} url={postUrl} />
          </div>
          <Button variant="ghost" size="sm" className="px-2" onClick={savePost}>
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Your Avatar" />
                <AvatarFallback>YA</AvatarFallback>
              </Avatar>
              <Input
                placeholder="Write a comment..."
                className="flex-1"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button
                size="icon"
                className="bg-black text-white hover:bg-gray-800"
                disabled={!commentText.trim()}
                onClick={handleComment}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {comments.length > 0 ? (
              <div className="space-y-1">
                {comments.map((comment, _index) => (
                  <div key={ulidStringify(comment.id)}>
                    <PostCard
                      post={comment}
                      onDelete={(id) => setComments((prev) => prev.filter((c) => !indexedDB.cmp(c.id, id)))}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function PostBodiesElement(bodies: PostBodies) {
  return bodies.bodies.length > 0 ? <PostBodyElement {...bodies.bodies[bodies.bodies.length - 1]} /> : <div /> // TODO: support edits
}

export function PostBodyElement(body: PostBody) {
  if (body.markdown) {
    const props = {
      markdown: body.markdown,
      pickedFileUrls: [],
    }
    return <MarkdownToHTMLElement {...props} />
  } else if (body.plainText) {
    return <p>{body.plainText}</p>
  } else {
    return <p></p>
  }
}

function MarkdownToHTMLElement(props: { markdown: string; pickedFileUrls: PickedFileUrl[] }) {
  const { markdown, pickedFileUrls } = props

  const _ref = useRef<HTMLDivElement>(null)
  const { showDialog, closeDialog } = useGlobalDialog()

  const onLinkClicked = (href: string) => {
    let url: URL | undefined
    try {
      url = new URL(href)
    } catch (err) {
      if (href.startsWith("/")) {
        url = new URL(window.location.origin + href)
      } else {
        url = new URL(window.location.origin + window.location.pathname + "/" + href)
      }
    }

    if (!url) return
    if (url.host != window.location.host) {
      showDialog(
        <Card>
          <p>The url might take you somewhere unsafe, Do you wish to proceed?</p>
          <b>{url.toString()}</b>
          <Button
            onClick={() => {
              window.open(url, "_blank", "noopener,noreferrer")
              closeDialog()
            }}
          >
            Continue
          </Button>
        </Card>,
      )
    }
  }

  useEffect(() => {
    if (_ref.current) {
      buildHtmlElementFromMarkdown(markdown, pickedFileUrls, onLinkClicked).then((elements) =>
        _ref.current?.replaceChildren(elements),
      )
    }
  }, [])

  return (
    <div ref={_ref} className="lupyd-markdown">
      {markdown}
    </div>
  )
}

async function buildHtmlElementFromMarkdown(
  markdown: string,
  pickedFileUrls: PickedFileUrl[],
  onLinkClicked: (url: string) => void,
) {
  const { micromark } = await import("micromark")

  let modifiedMarkdown = markdown

  for (const f of pickedFileUrls) {
    modifiedMarkdown = modifiedMarkdown.replaceAll(f.blobUrl, f.cdnUrl)
  }
  const extensions: Extension[] = []
  const htmlExtensions: HtmlExtension[] = []

  const outputHtml = micromark(modifiedMarkdown, {
    allowDangerousHtml: false,
    allowDangerousProtocol: false,
    extensions,
    htmlExtensions,
  })

  let finalHtml = outputHtml
  for (const f of pickedFileUrls) {
    finalHtml = finalHtml.replaceAll(f.cdnUrl, f.blobUrl)
  }
  const { span, div, audio, video } = van.tags
  const el = div({ innerHTML: finalHtml, class: "lupyd-markdown" })

  // 1) Images: wrap each in a fixed-height responsive window using object-contain
  Array.from(el.querySelectorAll("img")).forEach((i: HTMLImageElement) => {
    i.loading = "lazy"
    try {
      // @ts-expect-error decoding exists on HTMLImageElement
      i.decoding = "async"
    } catch {}
    i.classList.add("w-full", "h-full", "object-contain")
    const mediaWindow = div(
      {
        class:
          "media-image-window relative rounded-md overflow-hidden mb-4 bg-black/5 w-full h-[360px] sm:h-[440px] md:h-[520px]",
      },
      i.cloneNode(),
    )
    i.replaceWith(mediaWindow)
  })

  // 2) Convert links to media/audio/files and external links (keep as in your logic)
  el.querySelectorAll("a").forEach((anchor) => {
    const src = anchor.href
    if (anchor.textContent && anchor.textContent.startsWith("|Video|")) {
      const title = (anchor.textContent ?? "").replace("|Video|", "")
      const videoEl = video({
        preload: "metadata",
        controls: true,
        title,
      })
      videoEl.setAttribute("data-src", src)
      ;(videoEl as any).className = "w-full h-full object-contain bg-black/90"
      const vWrap = div(
        {
          class:
            "media-video-window relative rounded-md overflow-hidden mb-4 w-full h-[360px] sm:h-[440px] md:h-[520px] bg-black/5",
        },
        videoEl,
      )
      anchor.replaceWith(vWrap)
    } else if (anchor.textContent && anchor.textContent.startsWith("|Audio|")) {
      const title = (anchor.textContent ?? "").replace("|Audio|", "")
      const audioEl = audio({
        title,
        controls: true,
        preload: "metadata",
      })
      audioEl.setAttribute("data-src", src)
      anchor.replaceWith(div({ class: "rounded-md overflow-hidden mb-4" }, audioEl))
    } else if (anchor.textContent && anchor.textContent.startsWith("|File|")) {
      let title = (anchor.textContent ?? "").replace("|File|", "")
      let size = ""
      const nextIndex = title.indexOf("|")
      if (nextIndex > 0) {
        size = title.slice(0, nextIndex)
        if (new RegExp(/[0-9]+(\.[0-9]+)?[KMGTP]?B/).test(size)) {
          title = title.slice(nextIndex + 1)
        } else {
          size = ""
        }
      }
      anchor.download = title
      anchor.target = "_blank"
      anchor.classList.add("theme-anchor")
      anchor.replaceChildren(span(title), span(size))
    } else {
      anchor.classList.add("theme-anchor")
      anchor.target = "_blank"
      anchor.onclick = (e) => {
        e.preventDefault()
        onLinkClicked(anchor.href)
      }
    }
  })

  // 3) Flatten <p> wrappers that only contain a single media image window
  Array.from(el.querySelectorAll("p")).forEach((p) => {
    if (
      p.childElementCount === 1 &&
      (p.textContent ?? "").trim() === "" &&
      (p.firstElementChild as HTMLElement | null)?.classList.contains("media-image-window")
    ) {
      const only = p.firstElementChild as HTMLElement
      p.replaceWith(only)
    }
  })

  // 4) Group consecutive image windows into a horizontal side-scroll container
  const children = Array.from(el.childNodes)
  let buffer: HTMLElement[] = []
  const finalizeGroup = () => {
    if (buffer.length > 1) {
      // Build a horizontally scrollable track with snap
      const track = div({
        class: "flex overflow-x-auto gap-2 snap-x snap-mandatory scroll-smooth w-full -mx-0", // use padding of CardContent
      })
      buffer.forEach((item) => {
        // Ensure each slide takes full width of content area
        const slide = div({ class: "w-full shrink-0 snap-center" }, item)
        track.appendChild(slide)
      })
      const carousel = div({ class: "relative mb-4" }, track)
      buffer[0].replaceWith(carousel)
      for (let i = 1; i < buffer.length; i++) buffer[i].remove()
    }
    buffer = []
  }

  children.forEach((n) => {
    if (n.nodeType === 1) {
      const elNode = n as HTMLElement
      if (elNode.classList.contains("media-image-window")) {
        buffer.push(elNode)
        return
      }
    }
    finalizeGroup()
  })
  finalizeGroup()

  return el
}
