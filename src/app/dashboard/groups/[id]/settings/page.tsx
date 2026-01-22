"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import {
  AlertTriangle,
  ArrowLeft,
  Save,
  Trash2,
  Upload
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"



export default function GroupSettingsPage() {



  const navigate = useNavigate()
  const { id } = useParams()
  const [groupInfo, setGroupInfo] = useState<BGroupInfo | undefined>(undefined)

  const [extension, setExtension] = useState<protos.FireflyGroupExtension | undefined>(undefined)

  useEffect(() => {

    updateState()

  }, [id])

  const updateState = () => {
    EncryptionPlugin.getGroupInfoAndExtension({ groupId: Number(id) }).then(result => {

      setGroupInfo(result)
      setExtension(protos.FireflyGroupExtension.decode(fromBase64(result.extensionB64)))


    })

  }



  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)




  const handleInputChange = (field: string, value: string | boolean) => {
    // setSettings((prev) => ({ ...prev, [field]: value }))
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



  const addMember = async (username: string, role: number) => {
    await EncryptionPlugin.updateGroupMember({
      groupId: Number(id),
      username,
      roleId: role
    })
    updateState()
  }


  const updateMember = (username: string, role: number) => {
    return addMember(username, role)
  }


  const deleteMember = (username: string) => { }


  const getRoleIcon = (role: number) => {
    const roleObj = extension?.roles.find(e => e.id == role)
    if (!roleObj) return null
    return <p>{roleObj.name}</p>
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
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
                      <AvatarImage src={"/placeholder.svg?height=80&width=80"} />
                      <AvatarFallback className="text-lg">{groupInfo?.name.slice(0, 2).toUpperCase()}</AvatarFallback>
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
                  value={groupInfo?.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">{groupInfo?.name?.length ?? 0}/50 characters</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={groupInfo?.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">{groupInfo?.description.length ?? 0}/200 characters</p>
              </div>
            </CardContent>
          </Card>


          {/* Role & Channel Permissions */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Role & Channel Permissions</CardTitle>
              <CardDescription>Configure per-role permissions for channels in this group</CardDescription>
            </CardHeader>
          </Card>

          {/* Member Management */}
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Member Management</CardTitle>
              <p className="text-sm text-muted-foreground">Manage roles and remove members from the group</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {extension?.members?.map((member) => (
                  <div
                    key={member.username}
                    className="flex flex-col md:flex-row md:items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar username={member.username} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{member.username}</h3>
                          {getRoleIcon(member.role)}
                          {/*<div
                            className={`w-2 h-2 rounded-full ${member.isOnline ? "bg-green-500" : "bg-gray-300"}`}
                            aria-label={member.isOnline ? "Online" : "Offline"}
                          />*/}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.username}</p>
                      </div>
                    </div>

                    {/* <div className="flex items-center gap-2 md:ml-auto">
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
                    </div>*/}
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
                          Are you sure you want to delete "{groupInfo?.name}"? This action will:
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
