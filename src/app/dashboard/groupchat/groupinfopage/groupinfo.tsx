"use client"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Users,
  Hash,
  Calendar,
  Crown,
  Shield,
  Settings,
  UserPlus,
  UserMinus,
  MoreVertical,
  Download,
  ExternalLink,
  ImageIcon,
  Video,
  FileText,
  Archive,
} from "lucide-react"

// Mock group data (in real app, this would come from API)
const groupData = {
  id: "group1",
  name: "Design Team",
  description:
    "UI/UX Design discussions and collaboration space for our creative team. We share ideas, feedback, and work together on amazing projects.",
  avatar: "/placeholder.svg?height=80&width=80",
  memberCount: 12,
  isPrivate: false,
  createdAt: "March 15, 2024",
  createdBy: {
    name: "Sarah Chen",
    username: "sarahc",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  members: [
    {
      id: "user1",
      name: "Sarah Chen",
      username: "sarahc",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin",
      isOnline: true,
      joinedAt: "March 15, 2024",
    },
    {
      id: "user2",
      name: "Mike Johnson",
      username: "mikej",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "moderator",
      isOnline: true,
      joinedAt: "March 16, 2024",
    },
    {
      id: "user3",
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      isOnline: false,
      lastSeen: "2 hours ago",
      joinedAt: "March 18, 2024",
    },
    {
      id: "user4",
      name: "Alex Rivera",
      username: "alexr",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      isOnline: true,
      joinedAt: "March 20, 2024",
    },
    {
      id: "user5",
      name: "Lisa Park",
      username: "lisap",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      isOnline: false,
      lastSeen: "1 day ago",
      joinedAt: "March 22, 2024",
    },
  ],
  media: {
    images: [
      {
        id: "img1",
        url: "/placeholder.svg?height=200&width=200",
        name: "Homepage_Mockup_v2.png",
        uploadedBy: "Sarah Chen",
        uploadedAt: "2 days ago",
        size: "2.4 MB",
      },
      {
        id: "img2",
        url: "/placeholder.svg?height=200&width=200",
        name: "Color_Palette_2024.jpg",
        uploadedBy: "Mike Johnson",
        uploadedAt: "3 days ago",
        size: "1.8 MB",
      },
      {
        id: "img3",
        url: "/placeholder.svg?height=200&width=200",
        name: "Mobile_Wireframes.png",
        uploadedBy: "Emma Wilson",
        uploadedAt: "1 week ago",
        size: "3.1 MB",
      },
      {
        id: "img4",
        url: "/placeholder.svg?height=200&width=200",
        name: "Logo_Concepts.png",
        uploadedBy: "Alex Rivera",
        uploadedAt: "1 week ago",
        size: "1.2 MB",
      },
    ],
    videos: [
      {
        id: "vid1",
        url: "/placeholder.svg?height=200&width=300",
        name: "Design_Process_Demo.mp4",
        uploadedBy: "Sarah Chen",
        uploadedAt: "5 days ago",
        size: "45.2 MB",
        duration: "3:24",
      },
      {
        id: "vid2",
        url: "/placeholder.svg?height=200&width=300",
        name: "Prototype_Walkthrough.mov",
        uploadedBy: "Mike Johnson",
        uploadedAt: "1 week ago",
        size: "78.9 MB",
        duration: "7:12",
      },
    ],
    files: [
      {
        id: "file1",
        name: "Design_System_Guidelines.pdf",
        uploadedBy: "Sarah Chen",
        uploadedAt: "3 days ago",
        size: "5.7 MB",
        type: "pdf",
      },
      {
        id: "file2",
        name: "Brand_Assets.zip",
        uploadedBy: "Emma Wilson",
        uploadedAt: "1 week ago",
        size: "12.4 MB",
        type: "archive",
      },
      {
        id: "file3",
        name: "Meeting_Notes_March.docx",
        uploadedBy: "Lisa Park",
        uploadedAt: "2 weeks ago",
        size: "234 KB",
        type: "document",
      },
    ],
  },
}

export default function GroupInfoPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [selectedTab, setSelectedTab] = useState("overview")

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
      case "document":
        return <FileText className="h-8 w-8 text-red-500" />
      case "archive":
        return <Archive className="h-8 w-8 text-gray-500" />
      default:
        return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-black">Group Info</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/groups/${id}/settings`)}
            className="border-gray-300 text-gray-700 hover:bg-black hover:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Group Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={groupData.avatar || "/placeholder.svg"} alt={groupData.name} />
                <AvatarFallback className="bg-gray-100 text-black text-2xl font-bold">
                  {groupData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-black">{groupData.name}</h2>
                  {groupData.isPrivate && <Hash className="h-5 w-5 text-gray-500" />}
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {groupData.memberCount} members
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-4">{groupData.description}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {groupData.createdAt}
                  </div>
                  <div className="flex items-center">
                    <span>by {groupData.createdBy.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Members
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 bg-transparent">
                  <UserMinus className="h-4 w-4 mr-2" />
                  Leave Group
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Recent Members
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {groupData.members.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback className="bg-gray-100 text-black">{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {member.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-black">{member.name}</p>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-sm text-muted-foreground">Joined {member.joinedAt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Group Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Members</span>
                    <span className="font-medium">{groupData.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Media Shared</span>
                    <span className="font-medium">{groupData.media.images.length + groupData.media.videos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Files Shared</span>
                    <span className="font-medium">{groupData.media.files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group Type</span>
                    <span className="font-medium">{groupData.isPrivate ? "Private" : "Public"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>All Members ({groupData.memberCount})</CardTitle>
                <CardDescription>Manage group members and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupData.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                            <AvatarFallback className="bg-gray-100 text-black">{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {member.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-black">{member.name}</p>
                            {getRoleIcon(member.role)}
                          </div>
                          <p className="text-sm text-muted-foreground">@{member.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.isOnline ? "Online" : member.lastSeen || "Offline"} • Joined {member.joinedAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            member.role === "admin" ? "default" : member.role === "moderator" ? "secondary" : "outline"
                          }
                        >
                          {member.role}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <div className="space-y-6">
              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Images ({groupData.media.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {groupData.media.images.map((image) => (
                      <div key={image.id} className="group relative">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image.url || "/placeholder.svg"}
                            alt={image.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                            <Button size="icon" variant="secondary" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-8 w-8">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium truncate">{image.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {image.uploadedBy} • {image.uploadedAt} • {image.size}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Videos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Video className="h-5 w-5 mr-2" />
                    Videos ({groupData.media.videos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupData.media.videos.map((video) => (
                      <div key={video.id} className="group relative">
                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={video.url || "/placeholder.svg"}
                            alt={video.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black bg-opacity-50 rounded-full p-3">
                              <Video className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium truncate">{video.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {video.uploadedBy} • {video.uploadedAt} • {video.size}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Files ({groupData.media.files.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupData.media.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="font-medium text-black">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {file.uploadedBy} • {file.uploadedAt} • {file.size}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
