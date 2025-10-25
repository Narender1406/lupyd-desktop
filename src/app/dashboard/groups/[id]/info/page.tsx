"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import {
  ArrowLeft,
  Users,
  Globe,
  Lock,
  Settings,
  UserPlus,
  Crown,
  Shield,
  Download,
  Eye,
  Play,
  FileText,
  ImageIcon,
  Video,
  File,
  Calendar,
  Hash,
} from "lucide-react"

// Mock data for the group
const groupData = {
  id: "1",
  name: "Design Enthusiasts",
  description: "A community for designers to share ideas, get feedback, and collaborate on projects.",
  avatar: "/placeholder.svg?height=80&width=80",
  isPrivate: false,
  memberCount: 1247,
  mediaCount: 89,
  filesCount: 23,
  createdAt: "2024-01-15",
  members: [
    {
      id: "1",
      name: "Sarah Chen",
      username: "@sarahc",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin",
      isOnline: true,
      joinedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Marcus Johnson",
      username: "@marcusj",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "moderator",
      isOnline: false,
      joinedAt: "2024-01-16",
    },
    {
      id: "3",
      name: "Emma Rodriguez",
      username: "@emmar",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      isOnline: true,
      joinedAt: "2024-01-18",
    },
    {
      id: "4",
      name: "David Kim",
      username: "@davidk",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      isOnline: true,
      joinedAt: "2024-01-20",
    },
    {
      id: "5",
      name: "Lisa Wang",
      username: "@lisaw",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      isOnline: false,
      joinedAt: "2024-01-22",
    },
  ],
  media: {
    images: [
      {
        id: "1",
        src: "/placeholder.svg?height=200&width=200",
        alt: "Design mockup",
        uploadedBy: "Sarah Chen",
        uploadedAt: "2024-01-25",
        size: "2.4 MB",
      },
      {
        id: "2",
        src: "/placeholder.svg?height=200&width=200",
        alt: "UI concept",
        uploadedBy: "Marcus Johnson",
        uploadedAt: "2024-01-24",
        size: "1.8 MB",
      },
      {
        id: "3",
        src: "/placeholder.svg?height=200&width=200",
        alt: "Brand identity",
        uploadedBy: "Emma Rodriguez",
        uploadedAt: "2024-01-23",
        size: "3.1 MB",
      },
      {
        id: "4",
        src: "/placeholder.svg?height=200&width=200",
        alt: "Website design",
        uploadedBy: "David Kim",
        uploadedAt: "2024-01-22",
        size: "2.7 MB",
      },
    ],
    videos: [
      {
        id: "1",
        src: "/placeholder-video.mp4",
        thumbnail: "/placeholder.svg?height=200&width=200",
        title: "Design Process Tutorial",
        duration: "5:32",
        uploadedBy: "Sarah Chen",
        uploadedAt: "2024-01-24",
        size: "45.2 MB",
      },
      {
        id: "2",
        src: "/placeholder-video.mp4",
        thumbnail: "/placeholder.svg?height=200&width=200",
        title: "Figma Tips & Tricks",
        duration: "8:15",
        uploadedBy: "Marcus Johnson",
        uploadedAt: "2024-01-21",
        size: "67.8 MB",
      },
    ],
    files: [
      {
        id: "1",
        name: "Brand Guidelines.pdf",
        type: "pdf",
        size: "4.2 MB",
        uploadedBy: "Sarah Chen",
        uploadedAt: "2024-01-25",
      },
      {
        id: "2",
        name: "Design System.sketch",
        type: "sketch",
        size: "12.8 MB",
        uploadedBy: "Emma Rodriguez",
        uploadedAt: "2024-01-23",
      },
      {
        id: "3",
        name: "Project Assets.zip",
        type: "zip",
        size: "28.4 MB",
        uploadedBy: "David Kim",
        uploadedAt: "2024-01-20",
      },
    ],
  },
}

export default function GroupInfoPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState("overview")

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "moderator":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />
      case "sketch":
        return <File className="h-8 w-8 text-orange-500" />
      case "zip":
        return <File className="h-8 w-8 text-purple-500" />
      default:
        return <File className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 min-w-0 overflow-x-hidden supports-[overflow:clip]:overflow-x-clip">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/groups")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Button>
        </div>

        {/* Group Header */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-20 w-20 mx-auto md:mx-0">
                <AvatarImage src={groupData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">{groupData.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{groupData.name}</h1>
                  {groupData.isPrivate ? (
                    <Lock className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Globe className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{groupData.description}</p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {groupData.memberCount.toLocaleString()} members
                  </div>
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    {groupData.mediaCount} media files
                  </div>
                  <div className="flex items-center gap-1">
                    <File className="h-4 w-4" />
                    {groupData.filesCount} files shared
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created {new Date(groupData.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <Badge variant="secondary" className="mb-4">
                  {groupData.isPrivate ? "Private Group" : "Public Group"}
                </Badge>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => navigate(`/groups/${id}/channels`)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Hash className="h-4 w-4" />
                  Open Channels
                </Button>
                <Button
                  onClick={() => navigate(`/groups/${id}/settings`)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button className="bg-black text-white hover:bg-gray-800 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Invite Members
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 bg-transparent border-b w-full max-w-full justify-start rounded-none p-0 h-auto overflow-x-auto overscroll-x-contain">
            <TabsTrigger
              value="overview"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Members ({groupData.members.length})
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Media ({groupData.media.images.length + groupData.media.videos.length})
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Files ({groupData.media.files.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Sarah Chen</span> shared a new design mockup
                      </p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>MJ</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Marcus Johnson</span> uploaded a tutorial video
                      </p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>ER</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">Emma Rodriguez</span> joined the group
                      </p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Group Stats */}
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Group Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Members</span>
                    <span className="font-semibold">{groupData.memberCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active Today</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Media Shared</span>
                    <span className="font-semibold">{groupData.mediaCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Files Shared</span>
                    <span className="font-semibold">{groupData.filesCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Messages Today</span>
                    <span className="font-semibold">89</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4">
              {groupData.members.map((member) => (
                <Card key={member.id} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        {member.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{member.name}</h3>
                          {getRoleIcon(member.role)}
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.username}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${member.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                        ></div>
                        <span className="text-xs text-muted-foreground">{member.isOnline ? "Online" : "Offline"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            {/* Images */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images ({groupData.media.images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {groupData.media.images.map((image) => (
                  <Card key={image.id} className="border-none shadow-sm overflow-hidden group">
                    <div className="relative aspect-square">
                      <img
                        src={image.src || "/placeholder.svg"}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs font-medium truncate">{image.alt}</p>
                      <p className="text-xs text-muted-foreground">By {image.uploadedBy}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">{image.size}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(image.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Videos */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5" />
                Videos ({groupData.media.videos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupData.media.videos.map((video) => (
                  <Card key={video.id} className="border-none shadow-sm overflow-hidden group">
                    <div className="relative aspect-video">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{video.title}</p>
                      <p className="text-xs text-muted-foreground">By {video.uploadedBy}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">{video.size}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(video.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="grid gap-4">
              {groupData.media.files.map((file) => (
                <Card key={file.id} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">{getFileIcon(file.type)}</div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Uploaded by {file.uploadedBy} • {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{file.size}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-8 bg-transparent">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="h-8 bg-transparent">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
