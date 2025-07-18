"use client"

import { ShareModal } from "@/components/dashboard/share-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bookmark, Delete, Flag, MessageCircle, MoreVertical, Send, ThumbsDown, ThumbsUp } from "lucide-react"
import { createPost, dateToRelativeString, deletePost, FetchType, getPosts, type GetPostsData, getTimestampFromUlid, type PickedFileUrl, PostProtos, putVote, reportPost, UiIcon, ulidStringify } from "lupyd-js"
import { micromark } from "micromark"
import { type Extension, type HtmlExtension } from "micromark-util-types"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { useGlobalDialog } from "@/context/dialog-context"
import van from "vanjs-core"
import { useSnackbar } from "../snackbar"
import { UserAvatar } from "../user-avatar"


type FullPost = PostProtos.FullPost
type PostBodies = PostProtos.PostBodies
type PostBody = PostProtos.PostBody

// export interface PostAuthor {
//   id: string
//   name: string
//   avatar: string
//   avatarFallback: string
// }

// export interface PostContent {
//   text: string
//   image?: {
//     src: string
//     alt: string
//     width: number
//     height: number
//   }
//   link?: {
//     title: string
//     description: string
//     url: string
//   }
//   video?: {
//     src: string
//     poster?: string
//     title?: string
//   }
// }

// export interface PostStats {
//   likes: number
//   dislikes?: number
//   comments: number
// }

// export interface PostProps {
//   id: string
//   author: PostAuthor
//   content: PostContent
//   stats: PostStats
//   timestamp: string
//   comments?: CommentData[]
//   delay?: number
// }


export function PostCard(props: { post: FullPost, onDelete?: (id: Uint8Array) => void }) {
  const post = props.post;
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
        fetchTypeFields: ulidStringify(post.id)
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
      body: PostProtos.PostBody.create({ plainText: commentText })
    })

    snackbar("Commenting...")
    // TODO: have better way to show progress
    createPost(details).then((comment) => {
      setComments(comments => [comment, ...comments]);
      setCommentText("")
    }).catch(err => {
      console.error(err);
      snackbar("Failed to create comment");
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

  const postUrl = `${window.origin}/dashboard/post/${ulidStringify(post.id)}`

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const snackbar = useSnackbar()

  const report = async () => {
    await reportPost(post.id, "")
    setIsDropdownOpen(false)
    snackbar("Post has been reported")
  }

  const deleteThisPost = async () => {
    await deletePost(post.id)
    snackbar("Post has been deleted")
    if (props.onDelete) {
      props.onDelete(post.id)
    }
  }


  function savePost() {
    alert("Successfully Saved Post")
  }

  const element = (
    <Card className="border-none shadow-sm">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <Link to={`/dashboard/user/${post.by}`}>
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


              {auth.username === post.by && <DropdownMenuItem onClick={deleteThisPost}>
                <div className="flex items-center cursor-pointer">
                  <Delete className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </div>
              </DropdownMenuItem>}


            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <p className="mb-4">{post.title}</p>
        {post.body.length > 0 &&
          <PostBodiesElement {...PostProtos.PostBodies.decode(post.body)} />}

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
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-1 px-2"
              onClick={toggleComments}
            >
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
                    <PostCard post={comment} onDelete={(id) => setComments(prev => prev.filter(c => !indexedDB.cmp(c.id, id)))} />
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

  return element;
}


export function PostBodiesElement(bodies: PostBodies) {
  return bodies.bodies.length > 0 ? <PostBodyElement {...bodies.bodies[bodies.bodies.length - 1]} /> : <div /> // TODO: support edits
}

export function PostBodyElement(body: PostBody) {

  if (body.markdown) {
    const props = {
      markdown: body.markdown,
      pickedFileUrls: []
    }
    return <MarkdownToHTMLElement {...props} />
  } else if (body.plainText) {
    return <p>{body.plainText}</p>
  } else {
    return <p>unsupported body format</p>
  }
}


function MarkdownToHTMLElement(props: { markdown: string, pickedFileUrls: PickedFileUrl[] }) {
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
        url = new URL(window.location.origin + window.location.pathname + '/' + href)
      }
    }

    if (!url) return
    if (url.host != window.location.host) {
      showDialog(
        <Card>
          <p>The url might take you somewhere unsafe, Do you wish to proceed?</p>
          <b>{url.toString()}</b>
          <Button onClick={() => { window.open(url, '_blank', 'noopener,noreferrer'); closeDialog() }}>Continue</Button>
        </Card>
      )
    }

  }


  useEffect(() => {
    if (_ref.current) {
      _ref.current.replaceChildren(buildHtmlElementFromMarkdown(markdown, pickedFileUrls, onLinkClicked))
    }
  }, [])

  return (<div ref={_ref} className="lupyd-markdown"></div>)
}


function buildHtmlElementFromMarkdown(markdown: string, pickedFileUrls: PickedFileUrl[], onLinkClicked: (url: string) => void) {

  let modifiedMarkdown = markdown

  for (const f of pickedFileUrls) {
    modifiedMarkdown = modifiedMarkdown.replaceAll(f.blobUrl, f.cdnUrl)
  }
  let extensions: Extension[] = [];
  let htmlExtensions: HtmlExtension[] = [];

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
  const { span, div, audio, video } = van.tags;
  const el = div({ innerHTML: finalHtml, class: "lupyd-markdown" });

  Array.from(el.querySelectorAll("img")).forEach((i: HTMLImageElement) => {
    i.loading = "lazy";
    i.classList.add("w-full", "object-cover")
    i.replaceWith(div({ class: "rounded-md overflow-hidden mb-4" }, i.cloneNode()));
  });

  el.querySelectorAll("a").forEach((anchor) => {
    const src = anchor.href;
    if (anchor.textContent && anchor.textContent.startsWith("|Video|")) {
      const title = (anchor.textContent ?? "").replace("|Video|", "");
      const videoEl = video({
        preload: "metadata",
        controls: true,
        title,
      });

      videoEl.setAttribute("data-src", src);
      anchor.replaceWith(div({ class: "rounded-md overflow-hidden mb-4 aspect-video" }, videoEl));
    } else if (anchor.textContent && anchor.textContent.startsWith("|Audio|")) {
      const title = (anchor.textContent ?? "").replace("|Audio|", "");
      const audioEl = audio({
        title,
        controls: true,
        preload: "metadata",
      });
      audioEl.setAttribute("data-src", src);
      anchor.replaceWith(div({ class: "rounded-md overflow-hidden mb-4" }, audioEl));
    } else if (anchor.textContent && anchor.textContent.startsWith("|File|")) {
      let title = (anchor.textContent ?? "").replace("|File|", "");
      let size = "";
      const nextIndex = title.indexOf("|");
      if (nextIndex > 0) {
        size = title.slice(0, nextIndex);
        if (new RegExp(/[0-9]+(\.[0-9]+)?[KMGTP]?B/).test(size)) {
          title = title.slice(nextIndex + 1);
        } else {
          size = "";
        }
      }
      anchor.download = title;
      anchor.target = "_blank";
      anchor.classList.add("theme-anchor");
      anchor.replaceChildren(span(title), UiIcon("download"), span(size));
    } else {
      anchor.classList.add("theme-anchor");
      anchor.target = "_blank";
      anchor.onclick = (e) => {
        e.preventDefault()
        onLinkClicked(anchor.href)
      }
    }
  });

  return el;
}




