"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  ArrowLeft,
  Upload,
  Globe,
  Lock,
  Crown,
  Shield,
  UserMinus,
  Trash2,
  AlertTriangle,
  Save,
  Bell,
  MessageSquare,
} from "lucide-react"
import {
  PermissionsMatrix,
  type RoleKey,
  type PermissionKey,
  type OverrideValue,
} from "@/components/groups/permissions-matrix"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

// Mock data for the group
const groupData = {
  id: "1",
  name: "Design Enthusiasts",
  description: "A community for designers to share ideas, get feedback, and collaborate on projects.",
  avatar: "/placeholder.svg?height=80&width=80",
  isPrivate: false,
  allowMemberInvites: true,
  allowFileSharing: true,
  muteNotifications: false,
  autoDeleteMessages: false,
  messageRetention: "never",
  members: [
    {
      id: "1",
      name: "Sarah Chen",
      username: "@sarahc",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin",
      isOnline: true,
    },
    {
      id: "2",
      name: "Marcus Johnson",
      username: "@marcusj",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "moderator",
      isOnline: false,
    },
    {
      id: "3",
      name: "Emma Rodriguez",
      username: "@emmar",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      isOnline: true,
    },
    {
      id: "4",
      name: "David Kim",
      username: "@davidk",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "member",
      isOnline: true,
    },
  ],
}

export default function GroupSettingsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [settings, setSettings] = useState(groupData)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [permOverrides, setPermOverrides] = useState<Record<RoleKey, Partial<Record<PermissionKey, OverrideValue>>>>({
    owner: {},
    admin: {},
    moderator: {},
    member: {},
    guest: {},
  })

  const allPerms: PermissionKey[] = [
    "viewChannel",
    "sendMessages",
    "manageMessages",
    "attachFiles",
    "pinMessages",
    "createThreads",
    "manageChannel",
    "manageRoles",
  ]

  const setOverride = (roleId: RoleKey, perm: PermissionKey, value: OverrideValue) => {
    setPermOverrides((prev) => ({
      ...prev,
      [roleId]: { ...(prev[roleId] || {}), [perm]: value },
    }))
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const handleDeleteGroup = async () => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    navigate("/groups")
  }

  const handleRemoveMember = (memberId: string) => {
    setSettings((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.id !== memberId),
    }))
  }

  const handleChangeRole = (memberId: string, newRole: string) => {
    setSettings((prev) => ({
      ...prev,
      members: prev.members.map((member) => (member.id === memberId ? { ...member, role: newRole } : member)),
    }))
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
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              onClick={() => navigate(`/groups/${id}/info`)}
              className="flex items-center gap-2 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold truncate">Group Settings</h1>
              <p className="text-muted-foreground text-sm truncate">Manage preferences and members</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="relative h-20 w-20">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={settings.avatar || "/placeholder.svg?height=80&width=80"} />
                      <AvatarFallback className="text-lg">{settings.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-white"
                      aria-label="Upload"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">Group Avatar</h3>
                  <p className="text-sm text-muted-foreground">Upload a new image to change your group&apos;s avatar</p>
                </div>
              </div>

              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">{settings.name.length}/50 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">{settings.description.length}/200 characters</p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Permissions */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Privacy & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Group Privacy */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {settings.isPrivate ? (
                    <Lock className="h-5 w-5 text-gray-600 shrink-0" />
                  ) : (
                    <Globe className="h-5 w-5 text-gray-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-medium">{settings.isPrivate ? "Private Group" : "Public Group"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {settings.isPrivate
                        ? "Only invited members can see and join"
                        : "Anyone can discover and join this group"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Switch
                    checked={settings.isPrivate}
                    onCheckedChange={(checked) => handleInputChange("isPrivate", checked)}
                  />
                </div>
              </div>

              {/* Member Invites */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Allow Member Invites</h3>
                  <p className="text-sm text-muted-foreground">Let members invite others to join the group</p>
                </div>
                <div className="flex justify-end">
                  <Switch
                    checked={settings.allowMemberInvites}
                    onCheckedChange={(checked) => handleInputChange("allowMemberInvites", checked)}
                  />
                </div>
              </div>

              {/* File Sharing */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">File Sharing</h3>
                  <p className="text-sm text-muted-foreground">Allow members to share files and media</p>
                </div>
                <div className="flex justify-end">
                  <Switch
                    checked={settings.allowFileSharing}
                    onCheckedChange={(checked) => handleInputChange("allowFileSharing", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Mute Notifications</h3>
                  <p className="text-sm text-muted-foreground">Turn off all notifications from this group</p>
                </div>
                <div className="flex justify-end">
                  <Switch
                    checked={settings.muteNotifications}
                    onCheckedChange={(checked) => handleInputChange("muteNotifications", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Settings */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Message Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Auto-delete Messages</h3>
                  <p className="text-sm text-muted-foreground">Automatically delete old messages after a set period</p>
                </div>
                <div className="flex justify-end">
                  <Switch
                    checked={settings.autoDeleteMessages}
                    onCheckedChange={(checked) => handleInputChange("autoDeleteMessages", checked)}
                  />
                </div>
              </div>

              {settings.autoDeleteMessages && (
                <div className="space-y-2">
                  <Label htmlFor="retention">Message Retention Period</Label>
                  <Select
                    value={settings.messageRetention}
                    onValueChange={(value) => handleInputChange("messageRetention", value)}
                  >
                    <SelectTrigger className="w-full sm:w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7days">7 days</SelectItem>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="90days">90 days</SelectItem>
                      <SelectItem value="1year">1 year</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role & Channel Permissions */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Role & Channel Permissions</CardTitle>
              <CardDescription>Configure per-role permissions for channels in this group</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 overflow-x-auto">
              <PermissionsMatrix
                roles={[
                  { id: "owner", name: "Owner" },
                  { id: "admin", name: "Admin" },
                  { id: "moderator", name: "Moderator" },
                  { id: "member", name: "Member" },
                  { id: "guest", name: "Guest" },
                ]}
                permissions={allPerms}
                overrides={permOverrides}
                onChange={setOverride}
              />
            </CardContent>
          </Card>

          {/* Member Management */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Member Management</CardTitle>
              <p className="text-sm text-muted-foreground">Manage roles and remove members from the group</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {settings.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col md:flex-row md:items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{member.name}</h3>
                          {getRoleIcon(member.role)}
                          <div
                            className={`w-2 h-2 rounded-full ${member.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                            aria-label={member.isOnline ? "Online" : "Offline"}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">{member.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:ml-auto">
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleChangeRole(member.id, value)}
                        disabled={member.role === "admin"}
                      >
                        <SelectTrigger className="w-full sm:w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>

                      {member.role !== "admin" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label={`Remove ${member.name}`}
                          title={`Remove ${member.name}`}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-none shadow-sm border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <p className="text-sm text-muted-foreground">Irreversible and destructive actions</p>
            </CardHeader>
            <CardContent>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-red-800">Delete Group</h3>
                    <p className="text-sm text-red-600">
                      Permanently delete this group and all its content. This action cannot be undone.
                    </p>
                  </div>
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Group
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                          <AlertTriangle className="h-5 w-5" />
                          Delete Group
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Are you sure you want to delete "{settings.name}"? This action will:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                          <li>• Permanently delete all messages and media</li>
                          <li>• Remove all members from the group</li>
                          <li>• Delete all group settings and data</li>
                          <li>• This action cannot be undone</li>
                        </ul>
                        <div className="space-y-2">
                          <Label htmlFor="confirm">Type "DELETE" to confirm:</Label>
                          <Input id="confirm" placeholder="Type DELETE here" />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button variant="destructive" onClick={handleDeleteGroup} className="flex-1">
                            Delete Group Permanently
                          </Button>
                          <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
