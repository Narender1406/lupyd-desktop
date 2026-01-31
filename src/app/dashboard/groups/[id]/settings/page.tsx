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
  Info,
  Save,
  Trash2,
  Upload
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "@/hooks/use-toast"



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
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)
  const [newRoleName, setNewRoleName] = useState("")
  // Permissions state (mocked for UI structure)
  const [permissions, setPermissions] = useState({
    sendMessages: true,
    createChannels: false,
    manageRoles: false,
    kickMembers: false
  })




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



  const addMember = async (username: string, role: number) => {
    await EncryptionPlugin.updateGroupUsers({
      groupId: Number(id),
      users: [{ username, roleId: role }]
    })
    updateState()
  }


  const updateMember = (username: string, role: number) => {
    return addMember(username, role)
  }


  const deleteMember = (username: string) => { }


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


          {/* Role & Channel Permissions */}
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Role & Channel Permissions</CardTitle>
                <CardDescription>Configure per-role permissions for channels in this group</CardDescription>
              </div>
              <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => { setEditingRole(null); setNewRoleName(""); }}>
                    + Create Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Role Name</Label>
                      <Input
                        placeholder="e.g. Moderator"
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="space-y-2 border p-3 rounded-md">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="perm-send" checked={permissions.sendMessages} onChange={(e) => setPermissions({ ...permissions, sendMessages: e.target.checked })} />
                          <label htmlFor="perm-send" className="text-sm">Send Messages</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="perm-create" checked={permissions.createChannels} onChange={(e) => setPermissions({ ...permissions, createChannels: e.target.checked })} />
                          <label htmlFor="perm-create" className="text-sm">Create Channels</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="perm-manage" checked={permissions.manageRoles} onChange={(e) => setPermissions({ ...permissions, manageRoles: e.target.checked })} />
                          <label htmlFor="perm-manage" className="text-sm">Manage Roles</label>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-black text-white" onClick={async () => {
                      if (!newRoleName.trim()) return

                      try {
                        const newRoleId = editingRole ? editingRole.id : Math.floor(Math.random() * 100000)
                        // Minimal permission mapping for demo: 
                        // In real app, you'd map individual permissions to bits
                        let permValue = 0
                        if (permissions.sendMessages) permValue |= 1
                        if (permissions.createChannels) permValue |= 2
                        if (permissions.manageRoles) permValue |= 4

                        const payload = {
                          groupId: Number(id),
                          roles: [{
                            roleId: editingRole ? editingRole.id : 0, // Try 0 for new role
                            name: newRoleName,
                            permissions: permValue,
                            delete: false
                          }]
                        }
                        console.log("DEBUG: Calling updateGroupRoles with:", JSON.stringify(payload, null, 2))

                        await EncryptionPlugin.updateGroupRoles(payload)

                        toast({ title: "Success", description: `Role ${editingRole ? "updated" : "created"} successfully.` })
                        setShowRoleDialog(false)
                        // Refresh state
                        setTimeout(updateState, 500)
                      } catch (e) {
                        console.error(e)
                        toast({ title: "Error", description: "Failed to save role.", variant: "destructive" })
                      }
                    }}>
                      {editingRole ? "Save Changes" : "Create Role"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {extension?.roles?.map((role: any) => (
                  <div key={role.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 grid place-items-center text-xs font-bold">
                        {role.name.slice(0, 1).toUpperCase()}
                      </div>
                      <span className="font-medium">{role.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingRole(role)
                      setNewRoleName(role.name)
                      setShowRoleDialog(true)
                    }}>Edit</Button>
                  </div>
                ))}
                {(!extension?.roles || extension.roles.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No roles defined yet.</p>
                )}
              </div>
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
                {extension?.members?.map((member: any) => (
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
