
"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { RoleManager } from "@/components/groups/role-manager"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/context/auth-context"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { toast } from "@/hooks/use-toast"
import { fromBase64 } from "@/lib/utils"
import { GroupPermission, hasPermission, type GroupRole } from "@/types/permission-types"
import { protos } from "firefly-client-js"
import {
  AlertTriangle,
  ArrowLeft,
  Info,
  Save,
  Trash2,
  Upload
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"



export default function GroupSettingsPage() {



  const navigate = useNavigate()
  const { id } = useParams()
  const auth = useAuth()
  const [groupInfo, setGroupInfo] = useState<BGroupInfo | undefined>(undefined)
  const [newMemberUsername, setNewMemberUsername] = useState("")

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

  // Get current user's role and permissions
  const userRole = useMemo(() => {
    if (!extension || !auth.username) return null
    const member = extension.members?.find(m => m.username === auth.username)
    if (!member) return null
    return extension.roles?.find(r => r.id === member.role) || null
  }, [extension, auth.username])

  const canManageRoles = useMemo(() => {
    if (!userRole) return false
    return hasPermission(userRole.permissions, GroupPermission.ManageRole)
  }, [userRole])

  const canManageMembers = useMemo(() => {
    if (!userRole) return false
    return hasPermission(userRole.permissions, GroupPermission.ManageMember)
  }, [userRole])



  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)



  const handleInputChange = (field: string, value: string | boolean) => {
    // setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // TODO: Implement updateGroupInfo in EncryptionPlugin
      toast({
        title: "Settings saved",
        description: "Your group settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteGroup = async () => {
    await new Promise((resolve) => setTimeout(resolve, 700))
    navigate("/groups")
  }



  const addMember = async () => {
    if (!newMemberUsername.trim()) return

    try {
      await EncryptionPlugin.addGroupMember({
        groupId: Number(id),
        username: newMemberUsername,
        roleId: 0
      })

      toast({
        title: "Member added",
        description: `${newMemberUsername} has been added to the group.`
      })

      setNewMemberUsername("")
      updateState()
    } catch (error) {
      console.error("Failed to add member:", error)
      toast({
        title: "Error",
        description: "Failed to add member. Please check the username and try again.",
        variant: "destructive"
      })
    }
  }

  const updateMember = async (username: string, role: number) => {
    try {
      await EncryptionPlugin.updateGroupUsers({
        groupId: Number(id),
        users: [{ username, roleId: role }]
      })
      updateState()
    } catch (error) {
      console.error("Failed to update member role:", error)
      toast({
        title: "Error",
        description: "Failed to update member role.",
        variant: "destructive"
      })
    }
  }

  const deleteMember = async (username: string) => {
    try {
      await EncryptionPlugin.kickGroupMember({ groupId: Number(id), username })
      toast({
        title: "Member removed",
        description: `${username} has been removed from the group.`
      })
      updateState()
    } catch (error) {
      console.error("Failed to remove member:", error)
      toast({
        title: "Error",
        description: "Failed to remove member.",
        variant: "destructive"
      })
    }
  }


  const getRoleIcon = (role: number) => {
    const roleObj = extension?.roles?.find((e: any) => e.id == role)
    if (!roleObj) return null
    return <p>{roleObj.name}</p>
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto pb-[calc(env(safe-area-inset-bottom)+4rem)]" style={{ paddingTop: '1.5rem' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              onClick={() => navigate(`/groups/${id}`)}
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
            className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300 w-full sm:w-auto"
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

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roles" disabled={!canManageRoles}>
              Roles
            </TabsTrigger>
            <TabsTrigger value="members" disabled={!canManageMembers}>
              Members
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Basic Information */}
            <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Basic Information</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => navigate(`/groups/${id}/info`)} title="Group Info">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </Button>
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
                        onClick={() => toast({ title: "Not Supported", description: "Avatar upload is not yet implemented." })}
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
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <RoleManager
              groupId={Number(id)}
              roles={(extension?.roles || []) as GroupRole[]}
              onUpdate={updateState}
              canManageRoles={canManageRoles}
            />
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
                <CardDescription>Manage roles and remove members from the group</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Username to add"
                      value={newMemberUsername}
                      onChange={(e) => setNewMemberUsername(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addMember()
                        }
                      }}
                    />
                    <Button onClick={addMember} disabled={!newMemberUsername.trim()}>
                      Add Member
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {extension?.members?.map((member: any) => (
                      <div
                        key={member.username}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar username={member.username} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium truncate">{member.username}</h3>
                              {getRoleIcon(member.role)}
                            </div>
                            <p className="text-sm text-muted-foreground">{member.username}</p>
                          </div>
                        </div>

                        {canManageMembers && member.username !== auth.username && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                            onClick={() => deleteMember(member.username)}
                            title="Remove member"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
