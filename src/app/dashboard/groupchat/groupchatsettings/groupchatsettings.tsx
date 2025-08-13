"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Camera,
  Save,
  Trash2,
  Shield,
  Bell,
  Lock,
  Globe,
  Users,
  MessageSquare,
  ImageIcon,
  FileText,
  Crown,
  UserX,
  AlertTriangle,
} from "lucide-react"

// Mock group data
const groupData = {
  id: "group1",
  name: "Design Team",
  description: "UI/UX Design discussions and collaboration space for our creative team.",
  avatar: "/placeholder.svg?height=80&width=80",
  memberCount: 12,
  isPrivate: false,
  allowMemberInvites: true,
  allowFileSharing: true,
  allowMediaSharing: true,
  muteNotifications: false,
  autoDeleteMessages: false,
  messageRetentionDays: 30,
  members: [
    {
      id: "user1",
      name: "Sarah Chen",
      username: "sarahc",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin",
    },
    {
      id: "user2",
      name: "Mike Johnson",
      username: "mikej",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "moderator",
    },
    {
      id: "user3",
      name: "Emma Wilson",
      username: "emmaw",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
    },
  ],
}

export default function GroupSettingsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [groupName, setGroupName] = useState(groupData.name)
  const [groupDescription, setGroupDescription] = useState(groupData.description)
  const [groupAvatar, setGroupAvatar] = useState(groupData.avatar)
  const [isPrivate, setIsPrivate] = useState(groupData.isPrivate)
  const [allowMemberInvites, setAllowMemberInvites] = useState(groupData.allowMemberInvites)
  const [allowFileSharing, setAllowFileSharing] = useState(groupData.allowFileSharing)
  const [allowMediaSharing, setAllowMediaSharing] = useState(groupData.allowMediaSharing)
  const [muteNotifications, setMuteNotifications] = useState(groupData.muteNotifications)
  const [autoDeleteMessages, setAutoDeleteMessages] = useState(groupData.autoDeleteMessages)
  const [messageRetentionDays, setMessageRetentionDays] = useState(groupData.messageRetentionDays.toString())

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

  const handleSaveSettings = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    // Show success message or navigate back
  }

  const handleDeleteGroup = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    navigate("/dashboard/groups")
  }

  const handleRemoveMember = (memberId: string) => {
    // Handle member removal
    console.log("Remove member:", memberId)
  }

  const handleChangeRole = (memberId: string, newRole: string) => {
    // Handle role change
    console.log("Change role:", memberId, newRole)
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-3"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-black">Group Settings</h1>
          </div>
          <Button onClick={handleSaveSettings} disabled={isLoading} className="bg-black text-white hover:bg-gray-800">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your group's basic information and appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Group Avatar */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={groupAvatar || "/placeholder.svg"} alt="Group avatar" />
                  <AvatarFallback className="bg-gray-100 text-black text-xl">{groupName.charAt(0)}</AvatarFallback>
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
                <p className="text-sm text-muted-foreground">Upload a new image to change your group's avatar</p>
              </div>
            </div>

            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="group-name" className="text-black font-medium">
                Group Name
              </Label>
              <Input
                id="group-name"
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
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="bg-gray-100 border-none resize-none"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Privacy & Permissions
            </CardTitle>
            <CardDescription>Control who can access and interact with your group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Group Privacy */}
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

            {/* Member Invites */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-black">Allow Member Invites</p>
                  <p className="text-sm text-muted-foreground">Let members invite others to join the group</p>
                </div>
              </div>
              <Switch checked={allowMemberInvites} onCheckedChange={setAllowMemberInvites} />
            </div>

            {/* File Sharing */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-black">File Sharing</p>
                  <p className="text-sm text-muted-foreground">Allow members to share files and documents</p>
                </div>
              </div>
              <Switch checked={allowFileSharing} onCheckedChange={setAllowFileSharing} />
            </div>

            {/* Media Sharing */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ImageIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-black">Media Sharing</p>
                  <p className="text-sm text-muted-foreground">Allow members to share images and videos</p>
                </div>
              </div>
              <Switch checked={allowMediaSharing} onCheckedChange={setAllowMediaSharing} />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences for this group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-black">Mute Notifications</p>
                  <p className="text-sm text-muted-foreground">Stop receiving notifications from this group</p>
                </div>
              </div>
              <Switch checked={muteNotifications} onCheckedChange={setMuteNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Message Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Message Settings
            </CardTitle>
            <CardDescription>Configure message retention and auto-deletion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Auto Delete Messages */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-black">Auto-Delete Messages</p>
                  <p className="text-sm text-muted-foreground">Automatically delete old messages after a set period</p>
                </div>
              </div>
              <Switch checked={autoDeleteMessages} onCheckedChange={setAutoDeleteMessages} />
            </div>

            {/* Message Retention */}
            {autoDeleteMessages && (
              <div className="space-y-2">
                <Label htmlFor="retention-days" className="text-black font-medium">
                  Delete messages after (days)
                </Label>
                <Select value={messageRetentionDays} onValueChange={setMessageRetentionDays}>
                  <SelectTrigger className="bg-gray-100 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="365">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Member Management */}
        <Card>
          <CardHeader>
            <CardTitle>Member Management</CardTitle>
            <CardDescription>Manage member roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groupData.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback className="bg-gray-100 text-black">{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-black">{member.name}</p>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-sm text-muted-foreground">@{member.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select value={member.role} onValueChange={(value) => handleChangeRole(member.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {member.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">Delete Group</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this group and all its messages. This action cannot be undone.
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the group "{groupName}" and remove
                        all messages, media, and member data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700">
                        Delete Group
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
