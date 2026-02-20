"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserAvatar } from "@/components/user-avatar"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import {
  ArrowLeft,
  File,
  FileText,
  Globe,
  Hash,
  ImageIcon,
  Settings,
  UserPlus,
  Users,
  Video
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { usePathParams } from "@/hooks/use-path-params"


export default function GroupInfoPage() {
  const navigate = useNavigate()
  const { id } = usePathParams<{ id: string }>('/groups/:id')
  const [activeTab, setActiveTab] = useState("overview")

  const [groupInfo, setGroupInfo] = useState<BGroupInfo | undefined>(undefined)

  const [extension, setExtension] = useState<protos.FireflyGroupExtension | undefined>(undefined)

  useEffect(() => {

    EncryptionPlugin.getGroupInfoAndExtension({ groupId: Number(id) }).then(result => {

      setGroupInfo(result)
      setExtension(protos.FireflyGroupExtension.decode(fromBase64(result.extensionB64)))


    })



  }, [id])

  const getRoleIcon = (role: number) => {
    const roleObj = extension?.roles?.find((e: any) => e.id == role)
    if (!roleObj) return null
    return <p>{roleObj.name}</p>
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
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 min-w-0 overflow-x-hidden supports-[overflow:clip]:overflow-x-clip" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate(`/groups/${id}/settings`)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
        </div>

        {/* Group Header */}
        <Card className="border-none shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-20 w-20 mx-auto md:mx-0">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-2xl">{groupInfo?.name?.slice(0, 2).toUpperCase() || "GR"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <h1 className="text-2xl font-bold">{groupInfo?.name || "Loading..."}</h1>
                  <Globe className="h-5 w-5 text-gray-500" />
                </div>
                <p className="text-muted-foreground mb-4">{groupInfo?.description || "No description available"}</p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {extension?.members?.length || 0} members
                  </div>
                  <div className="flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    0 media files
                  </div>
                  <div className="flex items-center gap-1">
                    <File className="h-4 w-4" />
                    0 files shared
                  </div>
                </div>

                <Badge variant="secondary" className="mb-4">
                  Group
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
              Members ({extension?.members?.length || 0})
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Media (0)
            </TabsTrigger>
            <TabsTrigger
              value="files"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
            >
              Files (0)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <div className="grid gap-4">
              {extension?.members?.map((member: any, index: number) => (
                <Card key={index} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <UserAvatar username={member.username} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{member.username || "Unknown"}</h3>
                          {getRoleIcon(member.role)}
                          <Badge variant="outline" className="text-xs">
                            {member.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.username || "No username"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-4 text-center text-muted-foreground">
                      No members found
                    </CardContent>
                  </Card>
                )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            {/* Images */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Images (0)
              </h3>
              <Card className="border-none shadow-sm">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No images shared yet
                </CardContent>
              </Card>
            </div>

            {/* Videos */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Video className="h-5 w-5" />
                Videos (0)
              </h3>
              <Card className="border-none shadow-sm">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No videos shared yet
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 text-center text-muted-foreground">
                No files shared yet
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
