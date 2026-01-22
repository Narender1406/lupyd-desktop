"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ChannelChat } from "@/components/groups/channel-chat"
import { ChannelList } from "@/components/groups/channel-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserAvatar } from "@/components/user-avatar"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import { Hash, Plus, SendHorizontal, Settings, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"


type OverrideValue = "inherit" | "allow" | "deny"




export default function GroupChannelsPage() {
  const { id } = useParams()

  const [groupInfo, setGroupInfo] = useState<BGroupInfo | undefined>(undefined)

  const [extension, setExtension] = useState<protos.FireflyGroupExtension | undefined>(undefined)

  useEffect(() => {

    EncryptionPlugin.getGroupInfoAndExtension({ groupId: Number(id) }).then(result => {

      setGroupInfo(result)
      setExtension(protos.FireflyGroupExtension.decode(fromBase64(result.extensionB64)))


    })

  }, [id])


  const channels = useMemo(() => extension?.channels || [], [extension])

  const navigate = useNavigate()

  const [selectedChannelId, setSelectedChannelId] = useState(channels.length == 0 ? -1 : channels[0].id)
  const [filter, setFilter] = useState("")
  const [creating, setCreating] = useState(false)
  const [newChannelName, setNewChannelName] = useState("new-channel")
  const [newChannelPrivate, setNewChannelPrivate] = useState(false)
  const [newChannelCategory, setNewChannelCategory] = useState<string>("Text")

  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId) ?? channels[0],
    [channels, selectedChannelId],
  )

  // deep link support via query ?c=
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get("c")
    if (c && channels.some((ch) => ch.id === Number(c))) {
      setSelectedChannelId(Number(c))
    }
  }, [channels])

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("c", selectedChannelId.toString())
    window.history.replaceState({}, "", url.toString())
  }, [selectedChannelId])

  const addChannel = () => {

  }

  const updateChannel = (patch: any) => {

  }

  const updateChannelOverrides = (roleId: any, permission: any, value: any) => {

  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-88px)] -m-4 md:-m-6">
        {/* Left: Channel list */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-white">
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <p className="font-semibold truncate">Group #{id}</p>
              <p className="text-xs text-muted-foreground">Channels</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setCreating((v) => !v)}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-3">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter channels"
              className="bg-gray-100 border-none"
            />
          </div>

          {creating && (
            <div className="px-3 pb-3 space-y-2">
              <Input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="channel-name"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">Private</span>
                <Switch checked={newChannelPrivate} onCheckedChange={setNewChannelPrivate} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Category</span>
                <Select value={newChannelCategory} onValueChange={setNewChannelCategory}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Text">Text</SelectItem>
                    <SelectItem value="Projects">Projects</SelectItem>
                    <SelectItem value="Voice">Voice</SelectItem>
                    <SelectItem value="Announcements">Announcements</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={addChannel}>
                Create Channel
              </Button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <ChannelList
              channels={channels}
              filter={filter}
              selectedId={selectedChannelId}
              onSelect={setSelectedChannelId}
            />
          </div>

          <div className="p-3 border-t">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => navigate(`/groups/${id}/settings`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Group Settings
            </Button>
          </div>
        </aside>

        {/* Mobile channel selector header */}
        <div className="md:hidden flex flex-col w-full">
          <div className="border-b p-3 flex items-center justify-between">
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => navigate(`/dashboard/groups/${id}/info`)}
            >
              <Users className="h-4 w-4 mr-2" />
              Group
            </Button>
            <Select value={selectedChannelId.toString()} onValueChange={(v) => setSelectedChannelId(Number(v))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channels.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id.toString()}>
                    {"# "}
                    {ch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Center: Chat */}
        <section className="flex-1 flex flex-col bg-white">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Hash className="h-5 w-5" />
              <h1 className="font-semibold truncate">{selectedChannel?.name || "channel"}</h1>

            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => navigate(`/dashboard/groups/${id}/info`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Group
              </Button>
            </div>
          </div>

          {
            extension &&
            <ChannelChat channelId={selectedChannelId} extension={extension} groupId={Number(id)} />
          }

          {/* Composer */}
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Input placeholder={`Message #${selectedChannel?.name}`} className="bg-gray-100 border-none" />
              <Button className="bg-black text-white hover:bg-gray-800">
                <SendHorizontal className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </section>

        {/* Right: Info / Settings / Project Tools */}
        <aside className="hidden lg:flex w-[380px] flex-col border-l bg-white">
          <Tabs defaultValue="info" className="flex-1 flex flex-col">
            <div className="border-b px-4 py-3">
              <TabsList className="bg-transparent p-0 h-auto gap-2">
                <TabsTrigger
                  value="info"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent px-2 py-1"
                >
                  Info
                </TabsTrigger>
                {/* <TabsTrigger
                  value="permissions"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent px-2 py-1"
                >
                  Permissions
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent px-2 py-1"
                >
                  Projects
                </TabsTrigger> */}
              </TabsList>
            </div>

            <TabsContent value="info" className="flex-1 overflow-y-auto p-4">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Channel Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Privacy</span>
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4" />

                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="outline" className="text-xs">
                      {channelTypeToText(selectedChannel?.type || 0)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm mt-4">
                <CardHeader>
                  <CardTitle>Members with Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {extension?.members?.map((m) => (
                    <div key={m.username} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserAvatar username={m.username} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{m.username}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {m.role}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/*
            <TabsContent value="permissions" className="flex-1 overflow-y-auto p-4">
               <ChannelPermissions
                roles={defaultRoles}
                permissions={defaultPermissions}
                overrides={selectedChannel?.overrides || { owner: {}, admin: {}, moderator: {}, member: {}, guest: {} }}
                onChange={(roleId, perm, val) => updateChannelOverrides(roleId, perm, val)}
              /> 
            </TabsContent>
              */}

            {/* <TabsContent value="projects" className="flex-1 overflow-y-auto p-4">
              <ChannelProjects members={extension?.members ?? []} />
            </TabsContent> */}
          </Tabs>
        </aside>
      </div>
    </DashboardLayout>
  )
}


function channelTypeToText(ty: number) {
  switch (ty) {
    case 1:
      return "Text"
    case 2:
      return "Voice"
    default:
      return "unknown"
  }
}
