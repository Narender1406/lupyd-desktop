"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  CalendarIcon,
  Clock,
  Eye,
  ImageIcon,
  Video,
  FileText,
  AlertTriangle,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Edit3,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  List,
  Link,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import {
  CDN_STORAGE,
  createPost,
  createPostWithFiles,
  type PickedFileUrl,
  PostProtos,
  sanitizeFilename,
  ulidStringify,
  Utils,
} from "lupyd-js"
import { Progress } from "@/components/ui/progress"


const format = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: 'long', day: 'numeric', year: 'numeric'
  })

interface MediaItem {
  file: File
  type: "image" | "video"
  previewUrl: string
}

interface EditHistory {
  title: string
  description: string
  timestamp: number
}

export default function CreatePostPage() {
  const router = useNavigate()
  const { username } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSensitive, setIsSensitive] = useState(false)
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined)
  const [scheduleTime, setScheduleTime] = useState<string>("12:00")
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [activeTab, setActiveTab] = useState("create")
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // For draft functionality
  const [isDraft, setIsDraft] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(null)

  // Edit functionality
  const [isEditing, setIsEditing] = useState(false)
  const [editHistory, setEditHistory] = useState<EditHistory[]>([])
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1)
  const [originalContent, setOriginalContent] = useState({ title: "", description: "" })

  // Load draft if it exists
  useEffect(() => {
    const savedDraft = localStorage.getItem("postDraft")
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        setTitle(draft.title || "")
        setDescription(draft.description || "")
        setTags(draft.tags || [])
        setIsAnonymous(draft.isAnonymous || false)
        setIsSensitive(draft.isSensitive || false)
        setScheduleDate(draft.scheduleDate ? new Date(draft.scheduleDate) : undefined)
        setScheduleTime(draft.scheduleTime || "12:00")
        setDraftId(draft.id || null)
        setIsDraft(true)

        // We can't restore actual files from localStorage, but we can note that there were files
        if (draft.mediaCount > 0) {
          toast({
            title: "Media files in draft",
            description: `Your draft contains ${draft.mediaCount} media files that need to be re-uploaded.`,
            duration: 5000,
          })
        }
      } catch (error) {
        console.error("Error loading draft:", error)
      }
    }
  }, [])

  // Save to edit history
  const saveToHistory = () => {
    const newEntry: EditHistory = {
      title,
      description,
      timestamp: Date.now(),
    }

    const newHistory = editHistory.slice(0, currentHistoryIndex + 1)
    newHistory.push(newEntry)
    setEditHistory(newHistory)
    setCurrentHistoryIndex(newHistory.length - 1)
  }

  // Start editing mode
  const startEditing = () => {
    setOriginalContent({ title, description })
    setIsEditing(true)
    saveToHistory()
    setActiveTab("edit")
  }

  // Cancel editing
  const cancelEditing = () => {
    setTitle(originalContent.title)
    setDescription(originalContent.description)
    setIsEditing(false)
    setActiveTab("create")
  }

  // Apply edit changes
  const applyEdits = () => {
    setIsEditing(false)
    setOriginalContent({ title, description })
    saveToHistory()
    setActiveTab("create")
    toast({
      title: "Changes applied",
      description: "Your post has been updated with the changes.",
      duration: 3000,
    })
  }

  // Undo edit
  const undoEdit = () => {
    if (currentHistoryIndex > 0) {
      const prevIndex = currentHistoryIndex - 1
      const prevEntry = editHistory[prevIndex]
      setTitle(prevEntry.title)
      setDescription(prevEntry.description)
      setCurrentHistoryIndex(prevIndex)
    }
  }

  // Redo edit
  const redoEdit = () => {
    if (currentHistoryIndex < editHistory.length - 1) {
      const nextIndex = currentHistoryIndex + 1
      const nextEntry = editHistory[nextIndex]
      setTitle(nextEntry.title)
      setDescription(nextEntry.description)
      setCurrentHistoryIndex(nextIndex)
    }
  }

  // Text formatting functions
  const formatText = (format: string) => {
    const textarea = document.getElementById("description") as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = description.substring(start, end)
    let formattedText = ""

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "underline":
        formattedText = `<u>${selectedText}</u>`
        break
      case "list":
        formattedText = `\n- ${selectedText}`
        break
      case "link":
        formattedText = `[${selectedText}](url)`
        break
      default:
        formattedText = selectedText
    }

    const newDescription = description.substring(0, start) + formattedText + description.substring(end)
    setDescription(newDescription)
  }

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)

      const newMediaItems: MediaItem[] = newFiles.map((file) => {
        const type = file.type.startsWith("image/") ? "image" : "video"
        return {
          file,
          type,
          previewUrl: URL.createObjectURL(file),
        }
      })

      setMediaItems([...mediaItems, ...newMediaItems])
    }

    // Reset the file input so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Remove a media item
  const removeMediaItem = (index: number) => {
    const updatedItems = [...mediaItems]
    URL.revokeObjectURL(updatedItems[index].previewUrl)
    updatedItems.splice(index, 1)
    setMediaItems(updatedItems)

    // Reset current slide index if needed
    if (currentSlideIndex >= updatedItems.length) {
      setCurrentSlideIndex(Math.max(0, updatedItems.length - 1))
    }
  }

  // Add a tag
  const addTag = () => {
    if (currentTag && !tags.includes(currentTag)) {
      setTags([...tags, currentTag])
      setCurrentTag("")
    }
  }

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Handle tag input keydown (add tag on Enter)
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  // Navigate through slides
  const nextSlide = () => {
    if (mediaItems.length > 0) {
      setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % mediaItems.length)
    }
  }

  const prevSlide = () => {
    if (mediaItems.length > 0) {
      setCurrentSlideIndex((prevIndex) => (prevIndex - 1 + mediaItems.length) % mediaItems.length)
    }
  }

  // Save as draft
  const saveAsDraft = () => {
    const draft = {
      id: draftId || `draft-${Date.now()}`,
      title,
      description,
      tags,
      isAnonymous,
      isSensitive,
      scheduleDate: scheduleDate?.toISOString(),
      scheduleTime,
      mediaCount: mediaItems.length,
      lastSaved: new Date().toISOString(),
    }

    localStorage.setItem("postDraft", JSON.stringify(draft))
    setDraftId(draft.id)
    setIsDraft(true)
    setDraftSaved(true)

    toast({
      title: "Draft saved",
      description: "Your post has been saved as a draft.",
      duration: 3000,
    })

    // Reset the saved indicator after a delay
    setTimeout(() => {
      setDraftSaved(false)
    }, 3000)
  }

  // Delete draft
  const deleteDraft = () => {
    localStorage.removeItem("postDraft")
    setIsDraft(false)
    setDraftId(null)

    toast({
      title: "Draft deleted",
      description: "Your draft has been deleted.",
      duration: 3000,
    })
  }

  // Handle form submission
  const auth = useAuth()
  const [uploadingPost, setUploadingPost] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0.0)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.isAuthenticated) {
      toast({ title: "User is not authenticated" })
    }

    const submitter = (e.nativeEvent as SubmitEvent).submitter
    if (!submitter || submitter.id !== "publish-button") {
      return
    }

    // In a real app, this would send the post data to the server
    console.log({
      title,
      description,
      tags,
      isAnonymous,
      isSensitive,
      scheduleDate,
      scheduleTime,
      mediaItems,
    })

    let postType = 0
    if (isAnonymous) {
      postType = PostProtos.postType.ANONYMOUS | postType
    }
    if (tags.includes("nsfw")) {
      postType = PostProtos.postType.NSFW | postType
    }
    if (tags.includes("dangerous")) {
      postType = PostProtos.postType.DANGEROUS | postType
    }
    if (postType == 0) {
      postType = PostProtos.postType.SAFE
    }

    if (uploadingPost) {
      return
    }
    try {
      setUploadingPost(true)
      setUploadProgress(0.0)


      if (mediaItems.length == 0) {
        const details = PostProtos.CreatePostDetails.create({
          title,
          body: PostProtos.PostBody.create({ plainText: description }),
          postType,
        })

        // fake interpolate for better user experience
        setUploadProgress(0.4)
        const post = await createPost(details)
        if (post) {
          console.log(`Post Uploaded successfully ${ulidStringify(post.id)}`)
        } else {
          throw Error(`Post failed to upload`)
        }

        setUploadProgress(1.0)
      } else {
        const postFiles: PickedFileUrl[] = []
        let bodyMarkdown = description

        for (const e of mediaItems) {
          const cdnUrl = `${CDN_STORAGE}/posts/${sanitizeFilename(e.file.name)}`
          // const url = e.previewUrl // for preview
          const url = cdnUrl
          let name = e.file.name
          const mimeType = e.file.type

          if (mimeType.startsWith("image")) {
            bodyMarkdown += `\n![${name}](${url})`
          } else if (mimeType.startsWith("video")) {
            bodyMarkdown += `\n![|Video|${name}](${url})`
          } else if (mimeType.startsWith("audio")) {
            bodyMarkdown += `\n![|Audio|${name}](${url})`
          } else {
            bodyMarkdown += `\n![|File|${name}](${url})`
          }

          const length = BigInt(e.file.size)
          name = cdnUrl // will be replaced by /apicdn with an actual url
          const file = PostProtos.File.create({ length, name, mimeType })
          postFiles.push({
            blobUrl: e.previewUrl,
            cdnUrl,
            file,
          })
        }

        console.log(`Final markdown "${bodyMarkdown}"`)
        const fields = PostProtos.CreatePostDetails.create({
          title,
          body: PostProtos.PostBody.create({ markdown: bodyMarkdown }),
          postType,
        })
        const files = postFiles.map((e) => e.file)
        const details = PostProtos.CreatePostWithFiles.create({
          fields,
          files,
        })
        const post = await createPostWithFiles(
          details,
          mediaItems.map((e) => e.previewUrl),
          (total, sent) => {
            console.log(`uploading: ${sent}/${total}`);
            setUploadProgress(sent / total)
          },
        )
        setUploadProgress(1.0)
        if (post) {
          const s = `Post Uploaded successfully ${ulidStringify(post.id)}`
          console.log(s)
          toast({ title: s })
        } else {
          throw Error(`Failed to upload post`)
        }
      }

      // Navigate back to dashboard after posting
      router("/")

    } catch (e) {
      console.error(e)
      toast({
        title: "Failed to upload post"
      })

    } finally {
      setUploadingPost(false)
    }

    // Clear draft if it exists
    if (isDraft) {
      localStorage.removeItem("postDraft")
    }

  }

  return (
    <DashboardLayout /*activeTab="create-post"*/>
      <div className="container max-w-6xl px-4 py-6 mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isDraft ? "Edit Draft" : "Create Post"}
          {isDraft && (
            <Badge variant="outline" className="ml-2">
              Draft
            </Badge>
          )}
          {isEditing && (
            <Badge variant="secondary" className="ml-2">
              Editing
            </Badge>
          )}
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto overflow-x-auto">
            <TabsTrigger
              value="create"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Create
            </TabsTrigger>
            <TabsTrigger
              value="edit"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
              disabled={!isEditing}
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit}>
                  <Card className="border-none shadow-sm mb-6">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Post Details</CardTitle>
                      <CardDescription>Fill in the details for your new post</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            placeholder="Add a title to your post"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="What's on your mind?"
                            className="min-h-[120px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tags">Tags</Label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                #{tag}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-4 w-4 p-0 hover:bg-transparent"
                                  onClick={() => removeTag(tag)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              id="tags"
                              placeholder="Add tags (e.g., design, tech)"
                              value={currentTag}
                              onChange={(e) => setCurrentTag(e.target.value)}
                              onKeyDown={handleTagKeyDown}
                              className="flex-1"
                            />
                            <Button type="button" variant="outline" onClick={addTag} disabled={!currentTag}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm mb-6">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Media Gallery</CardTitle>
                      <CardDescription>Add multiple photos and videos to your post</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      {mediaItems.length > 0 && (
                        <div className="mb-6">
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                            {mediaItems.map((item, index) => (
                              <div
                                key={index}
                                className={`relative rounded-md overflow-hidden aspect-square bg-gray-100 cursor-pointer border-2 ${index === currentSlideIndex ? "border-black" : "border-transparent"
                                  }`}
                                onClick={() => setCurrentSlideIndex(index)}
                              >
                                {item.type === "image" ? (
                                  <img
                                    src={item.previewUrl || "/placeholder.svg"}
                                    alt={`Media ${index}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <Video className="h-8 w-8 text-white" />
                                  </div>
                                )}
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-1 right-1 h-5 w-5"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeMediaItem(index)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                                <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
                                  {item.type === "image" ? "Image" : "Video"}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="relative rounded-md overflow-hidden aspect-video bg-gray-100 mb-4">
                            {mediaItems[currentSlideIndex].type === "image" ? (
                              <img
                                src={mediaItems[currentSlideIndex].previewUrl || "/placeholder.svg"}
                                alt={`Preview ${currentSlideIndex}`}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <video
                                src={mediaItems[currentSlideIndex].previewUrl}
                                controls
                                className="w-full h-full object-contain"
                              />
                            )}

                            {mediaItems.length > 1 && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="absolute top-1/2 left-2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                                  onClick={prevSlide}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                                  onClick={nextSlide}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                                  {currentSlideIndex + 1} / {mediaItems.length}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="border-2 border-dashed rounded-md p-6 text-center">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="flex space-x-4">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                            <Video className="h-8 w-8 text-gray-400" />
                            <FileText className="h-8 w-8 text-gray-400" />
                          </div>
                          <div className="text-sm text-gray-500">
                            <Label
                              htmlFor="file-upload"
                              className="relative cursor-pointer text-black font-medium hover:underline"
                            >
                              <span>Upload files</span>
                              <Input
                                id="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                accept="image/*,video/*"
                                multiple
                                ref={fileInputRef}
                              />
                            </Label>
                            <p className="mt-1">or drag and drop</p>
                            <p className="text-xs mt-1">PNG, JPG, GIF, MP4 up to 10MB</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-sm mb-6">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Post Settings</CardTitle>
                      <CardDescription>Configure additional settings for your post</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="anonymous">Post Anonymously</Label>
                            <p className="text-sm text-muted-foreground">Hide your identity from this post</p>
                          </div>
                          <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="sensitive" className="flex items-center gap-2">
                              Sensitive Content
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Mark this post as containing sensitive content
                            </p>
                          </div>
                          <Switch id="sensitive" checked={isSensitive} onCheckedChange={setIsSensitive} />
                        </div>

                        <div className="pt-2 border-t">
                          <Label className="mb-2 block">Schedule Post</Label>
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal bg-transparent"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {scheduleDate ? format(scheduleDate) : "Select date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={scheduleDate}
                                    onSelect={setScheduleDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <Select value={scheduleTime} onValueChange={setScheduleTime}>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select time" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 24 }).map((_, hour) => (
                                      <>
                                        <SelectItem key={`${hour}:00`} value={`${hour.toString().padStart(2, "0")}:00`}>
                                          {hour.toString().padStart(2, "0")}:00
                                        </SelectItem>
                                        <SelectItem key={`${hour}:30`} value={`${hour.toString().padStart(2, "0")}:30`}>
                                          {hour.toString().padStart(2, "0")}:30
                                        </SelectItem>
                                      </>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 flex flex-wrap gap-3">

                      <Progress value={Math.floor(100 * uploadProgress)}/>

                      
                      <Button type="submit" className="flex-1 sm:flex-none" id="publish-button">
                        Publish Now
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 sm:flex-none bg-transparent"
                        disabled={!scheduleDate}
                      >
                        Schedule Post
                      </Button>
                      <Button type="button" variant="secondary" className="flex-1 sm:flex-none" onClick={saveAsDraft}>
                        <Save className="h-4 w-4 mr-2" />
                        {draftSaved ? "Saved!" : "Save Draft"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 sm:flex-none bg-transparent"
                        onClick={startEditing}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Post
                      </Button>
                      {isDraft && (
                        <Button
                          type="button"
                          variant="destructive"
                          className="flex-1 sm:flex-none"
                          onClick={deleteDraft}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Draft
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </form>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <Card className="border-none shadow-sm mb-6">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Tips for Great Posts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="bg-black text-white rounded-full h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            1
                          </span>
                          <span>Keep your title clear and engaging</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-black text-white rounded-full h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            2
                          </span>
                          <span>Add relevant tags to help others discover your post</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-black text-white rounded-full h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            3
                          </span>
                          <span>Include high-quality images or videos when possible</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-black text-white rounded-full h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            4
                          </span>
                          <span>Be respectful and follow community guidelines</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="bg-black text-white rounded-full h-5 w-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                            5
                          </span>
                          <span>Mark sensitive content appropriately</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Button
                    variant="outline"
                    className="w-full mb-4 bg-transparent"
                    onClick={() => setActiveTab("preview")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Post
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="edit" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-none shadow-sm mb-6">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Edit Post Content</CardTitle>
                        <CardDescription>Make changes to your post before publishing</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={undoEdit}
                          disabled={currentHistoryIndex <= 0}
                          title="Undo"
                        >
                          <Undo className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={redoEdit}
                          disabled={currentHistoryIndex >= editHistory.length - 1}
                          title="Redo"
                        >
                          <Redo className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-title">Title</Label>
                        <Input
                          id="edit-title"
                          placeholder="Add a title to your post"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="edit-description">Description</Label>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => formatText("bold")}
                              title="Bold"
                            >
                              <Bold className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => formatText("italic")}
                              title="Italic"
                            >
                              <Italic className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => formatText("underline")}
                              title="Underline"
                            >
                              <Underline className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => formatText("list")}
                              title="List"
                            >
                              <List className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 bg-transparent"
                              onClick={() => formatText("link")}
                              title="Link"
                            >
                              <Link className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          id="edit-description"
                          placeholder="What's on your mind?"
                          className="min-h-[200px]"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>

                      {editHistory.length > 0 && (
                        <div className="pt-4 border-t">
                          <Label className="text-sm font-medium">Edit History</Label>
                          <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                            {editHistory.map((entry, index) => (
                              <div
                                key={index}
                                className={`text-xs p-2 rounded border cursor-pointer ${index === currentHistoryIndex ? "bg-black text-white" : "bg-gray-50 hover:bg-gray-100"
                                  }`}
                                onClick={() => {
                                  setTitle(entry.title)
                                  setDescription(entry.description)
                                  setCurrentHistoryIndex(index)
                                }}
                              >
                                <div className="font-medium">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                                <div className="truncate">
                                  {entry.title || "Untitled"} - {entry.description.substring(0, 50)}...
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 flex gap-3">
                    <Button onClick={applyEdits} className="flex-1 sm:flex-none">
                      Apply Changes
                    </Button>
                    <Button variant="outline" onClick={cancelEditing} className="flex-1 sm:flex-none bg-transparent">
                      Cancel
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Edit Tools</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Formatting</p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => formatText("bold")}
                              className="justify-start"
                            >
                              <Bold className="h-3 w-3 mr-2" />
                              Bold
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => formatText("italic")}
                              className="justify-start"
                            >
                              <Italic className="h-3 w-3 mr-2" />
                              Italic
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => formatText("list")}
                              className="justify-start"
                            >
                              <List className="h-3 w-3 mr-2" />
                              List
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => formatText("link")}
                              className="justify-start"
                            >
                              <Link className="h-3 w-3 mr-2" />
                              Link
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Actions</p>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={undoEdit}
                              disabled={currentHistoryIndex <= 0}
                              className="w-full justify-start bg-transparent"
                            >
                              <Undo className="h-3 w-3 mr-2" />
                              Undo
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={redoEdit}
                              disabled={currentHistoryIndex >= editHistory.length - 1}
                              className="w-full justify-start"
                            >
                              <Redo className="h-3 w-3 mr-2" />
                              Redo
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Changes</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {editHistory.length} edit{editHistory.length !== 1 ? "s" : ""} made
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-none shadow-sm mb-6">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg">Post Preview</CardTitle>
                    <CardDescription>This is how your post will appear to others</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    {isSensitive && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <p className="text-sm text-yellow-700">This post contains sensitive content</p>
                      </div>
                    )}

                    {mediaItems.length > 0 && (
                      <div className="mb-4">
                        <div className="relative rounded-md overflow-hidden aspect-video bg-gray-100">
                          {mediaItems[currentSlideIndex].type === "image" ? (
                            <img
                              src={mediaItems[currentSlideIndex].previewUrl || "/placeholder.svg"}
                              alt={`Preview ${currentSlideIndex}`}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <video
                              src={mediaItems[currentSlideIndex].previewUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          )}

                          {mediaItems.length > 1 && (
                            <>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute top-1/2 left-2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                                onClick={prevSlide}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
                                onClick={nextSlide}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                                {currentSlideIndex + 1} / {mediaItems.length}
                              </div>
                            </>
                          )}
                        </div>

                        {mediaItems.length > 1 && (
                          <div className="flex overflow-x-auto gap-2 py-2 scrollbar-hide">
                            {mediaItems.map((item, index) => (
                              <div
                                key={index}
                                className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${index === currentSlideIndex ? "border-black" : "border-transparent"
                                  }`}
                                onClick={() => setCurrentSlideIndex(index)}
                              >
                                {item.type === "image" ? (
                                  <img
                                    src={item.previewUrl || "/placeholder.svg"}
                                    alt={`Thumbnail ${index}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                    <Video className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold">{title || "Your post title will appear here"}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/test.webp" />
                            <AvatarFallback>
                              {isAnonymous
                                ? "AN"
                                : username
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{isAnonymous ? "Anonymous" : username || "User"}</p>
                            <p className="text-xs text-gray-500">Just now</p>
                          </div>
                        </div>
                      </div>

                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{description || "Your post content will appear here"}</p>
                      </div>
                    </div>

                    {tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {scheduleDate && (
                      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Scheduled for {format(scheduleDate)} at {scheduleTime}
                        </p>
                      </div>
                    )}

                    {isDraft && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700 flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          This post is saved as a draft
                        </p>
                      </div>
                    )}

                    {isEditing && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <p className="text-sm text-orange-700 flex items-center gap-2">
                          <Edit3 className="h-4 w-4" />
                          This post has unsaved edits
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 flex flex-col sm:flex-row gap-3">
                    <Button type="button" onClick={() => setActiveTab("create")} className="w-full sm:w-auto">
                      Edit Post
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto bg-transparent"
                      onClick={() => router("/")}
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <Card className="border-none shadow-sm">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Post Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium">Title</p>
                          <p className="text-sm text-gray-500">{title || "No title provided"}</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Author</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="/test.webp" />
                              <AvatarFallback>
                                {isAnonymous
                                  ? "AN"
                                  : username
                                    ?.split(" ")
                                    .map((n) => n[0])
                                    .join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <p className="text-sm">{isAnonymous ? "Anonymous" : username || "User"}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Media</p>
                          <p className="text-sm text-gray-500">{mediaItems.length} file(s) attached</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium">Settings</p>
                          <div className="flex flex-col gap-1 mt-1">
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <span
                                className={`h-2 w-2 rounded-full ${isAnonymous ? "bg-green-500" : "bg-gray-300"}`}
                              ></span>
                              Anonymous: {isAnonymous ? "Yes" : "No"}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <span
                                className={`h-2 w-2 rounded-full ${isSensitive ? "bg-yellow-500" : "bg-gray-300"}`}
                              ></span>
                              Sensitive Content: {isSensitive ? "Yes" : "No"}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <span
                                className={`h-2 w-2 rounded-full ${scheduleDate ? "bg-blue-500" : "bg-gray-300"}`}
                              ></span>
                              Scheduled: {scheduleDate ? "Yes" : "No"}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <span
                                className={`h-2 w-2 rounded-full ${isDraft ? "bg-purple-500" : "bg-gray-300"}`}
                              ></span>
                              Draft: {isDraft ? "Yes" : "No"}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <span
                                className={`h-2 w-2 rounded-full ${isEditing ? "bg-orange-500" : "bg-gray-300"}`}
                              ></span>
                              Editing: {isEditing ? "Yes" : "No"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

