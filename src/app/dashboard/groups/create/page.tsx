"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ArrowLeft, Upload, Users, Globe, Lock, Check, X, Search } from "lucide-react"

const availableUsers = [
  {
    id: "1",
    name: "Sarah Chen",
    username: "@sarahc",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    username: "@marcusj",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
  {
    id: "3",
    name: "Emma Rodriguez",
    username: "@emmar",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "4",
    name: "David Kim",
    username: "@davidk",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: true,
  },
  {
    id: "5",
    name: "Lisa Wang",
    username: "@lisaw",
    avatar: "/placeholder.svg?height=40&width=40",
    isOnline: false,
  },
]

export default function CreateGroupPage() {
  const navigate = useNavigate()
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    avatar: "",
    isPrivate: false,
  })
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInputChange = (field: string, value: string | boolean) => {
    setGroupData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreateGroup = async () => {
    setIsCreating(true)

    // Simulate group creation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Navigate to the new group (using a mock ID)
    navigate("/dashboard/groups/new-group-id")
  }

  const selectedMemberData = availableUsers.filter((user) => selectedMembers.includes(user.id))

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/groups")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create New Group</h1>
            <p className="text-muted-foreground">Build a community around your interests</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Group Setup */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={groupData.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">
                        {groupData.name.slice(0, 2).toUpperCase() || "GR"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Group Avatar</h3>
                    <p className="text-sm text-muted-foreground">Upload an image to represent your group</p>
                  </div>
                </div>

                {/* Group Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name *</Label>
                  <Input
                    id="name"
                    value={groupData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter group name"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">{groupData.name.length}/50 characters</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={groupData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe what your group is about..."
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground">{groupData.description.length}/200 characters</p>
                </div>

                {/* Privacy Setting */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {groupData.isPrivate ? (
                      <Lock className="h-5 w-5 text-gray-600" />
                    ) : (
                      <Globe className="h-5 w-5 text-gray-600" />
                    )}
                    <div>
                      <h3 className="font-medium">{groupData.isPrivate ? "Private Group" : "Public Group"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {groupData.isPrivate
                          ? "Only invited members can see and join"
                          : "Anyone can discover and join this group"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={groupData.isPrivate}
                    onCheckedChange={(checked) => handleInputChange("isPrivate", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Member Selection */}
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Invite Members</CardTitle>
                <p className="text-sm text-muted-foreground">Select people to invite to your group (optional)</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for people to invite..."
                    className="pl-10"
                  />
                </div>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Selected ({selectedMembers.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemberData.map((user) => (
                        <Badge key={user.id} variant="secondary" className="flex items-center gap-2 pr-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">{user.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          {user.name}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-red-100"
                            onClick={() => toggleMember(user.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Users */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedMembers.includes(user.id)
                          ? "bg-black text-white border-black"
                          : "hover:bg-gray-50 border-gray-200"
                      }`}
                      onClick={() => toggleMember(user.id)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {user.isOnline && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                        </div>
                        <p
                          className={`text-sm ${
                            selectedMembers.includes(user.id) ? "text-gray-300" : "text-muted-foreground"
                          }`}
                        >
                          {user.username}
                        </p>
                      </div>
                      {selectedMembers.includes(user.id) && <Check className="h-5 w-5" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Group Card Preview */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={groupData.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{groupData.name.slice(0, 2).toUpperCase() || "GR"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{groupData.name || "Group Name"}</h3>
                          {groupData.isPrivate ? (
                            <Lock className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Globe className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {groupData.description || "Group description will appear here"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {selectedMembers.length + 1} members
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {groupData.isPrivate ? "Private" : "Public"}
                      </Badge>
                    </div>
                  </div>

                  {/* Settings Summary */}
                  <div className="space-y-2 text-sm">
                    <h4 className="font-medium">Settings</h4>
                    <div className="space-y-1 text-muted-foreground">
                      <p>• {groupData.isPrivate ? "Private" : "Public"} group</p>
                      <p>• {selectedMembers.length} initial members</p>
                      <p>• You will be the group admin</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button
              onClick={handleCreateGroup}
              disabled={!groupData.name.trim() || isCreating}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Group...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
