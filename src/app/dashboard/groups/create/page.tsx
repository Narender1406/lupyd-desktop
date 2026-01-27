"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useFirefly } from "@/context/firefly-context"
import { ArrowLeft, Globe, Lock, Upload } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { EncryptionPlugin } from "@/context/encryption-plugin"
import { toast } from "@/hooks/use-toast"
import { useRef } from "react"


export default function CreateGroupPage() {
  const navigate = useNavigate()
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    avatar: "",
    isPrivate: false,
  })

  const [isCreating, setIsCreating] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)



  const handleInputChange = (field: string, value: string | boolean) => {
    setGroupData((prev) => ({ ...prev, [field]: value }))
  }


  const firefly = useFirefly()


  const handleCreateGroup = async () => {
    setIsCreating(true)

    try {

      if (groupData.name.length == 0) {
        toast({
          title: "Group name required",
          description: "Please enter a name for your group.",
          variant: "destructive",
        })
        return
      }
      const groupInfo = await EncryptionPlugin.createGroup({
        groupName: groupData.name,
        //@ts-ignore
        description: groupData.description
      })

      toast({
        title: "Group created!",
        description: `${groupData.name} has been created successfully.`,
      })

      navigate(`/groups/${groupInfo.groupId}`)

    } catch (e) {
      console.error(`failed to create group`, e)
      toast({
        title: "Error creating group",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setGroupData(prev => ({ ...prev, avatar: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }


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
                      onClick={handleAvatarClick}
                      type="button"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
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
            <div className="h-[20vh]"></div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
