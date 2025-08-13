"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Users, Lock, Globe, Hash, Camera, X } from "lucide-react"

export default function CreateGroupPage() {
  const navigate = useNavigate()
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Mock users for member selection
  const availableUsers = [
    {
      id: "user1",
      name: "Sarah Chen",
      username: "sarahc",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user2",
      name: "Mike Johnson",
      username: "mikej",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user3",
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user4",
      name: "Alex Rivera",
      username: "alexr",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "user5",
      name: "Lisa Park",
      username: "lisap",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setGroupAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Navigate back to groups with success message
    navigate("/dashboard/groups")
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-3">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-black">Create Group</h1>
          </div>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || isLoading}
            className="bg-black text-white hover:bg-gray-800"
          >
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Group Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Group Details
            </CardTitle>
            <CardDescription>Set up your group with a name, description, and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Group Avatar */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={groupAvatar || "/placeholder.svg"} alt="Group avatar" />
                  <AvatarFallback className="bg-gray-100 text-black text-xl">
                    {groupName.charAt(0) || "G"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-2 -right-2 bg-black text-white rounded-full p-2 cursor-pointer hover:bg-gray-800"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-black">Group Avatar</p>
                <p className="text-sm text-muted-foreground">Upload an image to represent your group</p>
              </div>
            </div>

            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-black font-medium">
                Group Name *
              </Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="bg-gray-100 border-none"
              />
            </div>

            {/* Group Description */}
            <div className="space-y-2">
              <Label htmlFor="group-description" className="text-black font-medium">
                Description
              </Label>
              <Textarea
                id="group-description"
                placeholder="What's this group about?"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="bg-gray-100 border-none resize-none"
                rows={3}
              />
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {isPrivate ? <Lock className="h-5 w-5 text-gray-600" /> : <Globe className="h-5 w-5 text-gray-600" />}
                <div>
                  <p className="font-medium text-black">{isPrivate ? "Private Group" : "Public Group"}</p>
                  <p className="text-sm text-muted-foreground">
                    {isPrivate
                      ? "Only invited members can join and see content"
                      : "Anyone can find and join this group"}
                  </p>
                </div>
              </div>
              <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
            </div>
          </CardContent>
        </Card>

        {/* Add Members */}
        <Card>
          <CardHeader>
            <CardTitle>Add Members</CardTitle>
            <CardDescription>Select people to add to your group. You can add more members later.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedMembers.includes(user.id)
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  }`}
                  onClick={() => toggleMember(user.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-gray-100 text-black">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p
                        className={`text-sm ${selectedMembers.includes(user.id) ? "text-gray-300" : "text-muted-foreground"}`}
                      >
                        @{user.username}
                      </p>
                    </div>
                  </div>
                  {selectedMembers.includes(user.id) && (
                    <div className="bg-white text-black rounded-full p-1">
                      <X className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedMembers.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Selected members ({selectedMembers.length})</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((memberId) => {
                    const user = availableUsers.find((u) => u.id === memberId)
                    return user ? (
                      <div
                        key={memberId}
                        className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-gray-100 text-black text-xs">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleMember(memberId)
                          }}
                          className="text-gray-500 hover:text-black"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Group Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>This is how your group will appear to members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={groupAvatar || "/placeholder.svg"} alt={groupName} />
                  <AvatarFallback className="bg-gray-100 text-black font-medium">
                    {groupName.charAt(0) || "G"}
                  </AvatarFallback>
                </Avatar>
                {isPrivate && (
                  <div className="absolute -bottom-1 -right-1 bg-white border-2 border-gray-300 rounded-full p-1">
                    <Hash className="h-2 w-2 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="font-medium truncate text-black">{groupName || "Group Name"}</p>
                  {isPrivate && <Hash className="h-3 w-3 text-gray-500" />}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{selectedMembers.length + 1} members</p>
                <p className="text-sm truncate text-muted-foreground">
                  {groupDescription || "Group description will appear here"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
