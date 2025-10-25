"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Hash, Lock, Plus, Settings, Shield, Users, SendHorizontal, Clock } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ChannelPermissions } from "@/components/groups/channel-permissions"
import { ChannelProjects } from "@/components/groups/channel-projects"
import { ChannelList } from "@/components/groups/channel-list"
import { ChannelChat } from "@/components/groups/channel-chat"

type RoleKey = "owner" | "admin" | "moderator" | "member" | "guest"

type PermissionKey =
  | "viewChannel"
  | "sendMessages"
  | "manageMessages"
  | "attachFiles"
  | "pinMessages"
  | "createThreads"
  | "manageChannel"
  | "manageRoles"

type OverrideValue = "inherit" | "allow" | "deny"

interface Role {
  id: RoleKey
  name: string
  description: string
}

interface Member {
  id: string
  name: string
  avatar: string
  username: string
  role: RoleKey
  isOnline?: boolean
}

interface Channel {
  id: string
  name: string
  topic?: string
  isPrivate?: boolean
  category?: string
  slowMode?: boolean
  defaultPermissions: Record<RoleKey, Partial<Record<PermissionKey, boolean>>>
  overrides: Record<RoleKey, Partial<Record<PermissionKey, OverrideValue>>>
}

const defaultRoles: Role[] = [
  { id: "owner", name: "Owner", description: "Full control of the group" },
  { id: "admin", name: "Admin", description: "Manage channels, members, and settings" },
  { id: "moderator", name: "Moderator", description: "Moderate content and manage messages" },
  { id: "member", name: "Member", description: "Standard access to channels and messaging" },
  { id: "guest", name: "Guest", description: "Limited, read-only access" },
]

const defaultPermissions: PermissionKey[] = [
  "viewChannel",
  "sendMessages",
  "manageMessages",
  "attachFiles",
  "pinMessages",
  "createThreads",
  "manageChannel",
  "manageRoles",
]

// Mock group and channels data
const mockMembers: Member[] = [
  {
    id: "1",
    name: "Sarah Chen",
    username: "@sarahc",
    avatar: "/sarah-avatar.jpg",
    role: "owner",
    isOnline: true,
  },
  { id: "2", name: "Marcus Johnson", username: "@marcusj", avatar: "/marcus-avatar.jpg", role: "admin" },
  {
    id: "3",
    name: "Emma Rodriguez",
    username: "@emmar",
    avatar: "/emma-avatar.png",
    role: "moderator",
    isOnline: true,
  },
  { id: "4", name: "David Kim", username: "@davidk", avatar: "/david-avatar.png", role: "member" },
  { id: "5", name: "Lisa Wang", username: "@lisaw", avatar: "/lisa-avatar.jpg", role: "member" },
]

const initialChannels: Channel[] = [
  {
    id: "general",
    name: "general",
    topic: "Group-wide announcements and chat",
    category: "Text",
    defaultPermissions: {
      owner: {
        viewChannel: true,
        sendMessages: true,
        manageMessages: true,
        manageChannel: true,
        manageRoles: true,
        attachFiles: true,
        pinMessages: true,
        createThreads: true,
      },
      admin: {
        viewChannel: true,
        sendMessages: true,
        manageMessages: true,
        manageChannel: true,
        attachFiles: true,
        pinMessages: true,
        createThreads: true,
      },
      moderator: {
        viewChannel: true,
        sendMessages: true,
        manageMessages: true,
        attachFiles: true,
        pinMessages: true,
        createThreads: true,
      },
      member: { viewChannel: true, sendMessages: true, attachFiles: true, createThreads: true },
      guest: { viewChannel: true },
    },
    overrides: {
      owner: {},
      admin: {},
      moderator: {},
      member: {},
      guest: {},
    },
  },
  {
    id: "design",
    name: "design",
    topic: "Design reviews and assets",
    category: "Projects",
    isPrivate: false,
    defaultPermissions: {
      owner: {
        viewChannel: true,
        sendMessages: true,
        manageMessages: true,
        manageChannel: true,
        manageRoles: true,
        attachFiles: true,
        pinMessages: true,
        createThreads: true,
      },
      admin: {
        viewChannel: true,
        sendMessages: true,
        manageMessages: true,
        manageChannel: true,
        attachFiles: true,
        pinMessages: true,
        createThreads: true,
      },
      moderator: {
        viewChannel: true,
        sendMessages: true,
        manageMessages: true,
        attachFiles: true,
        pinMessages: true,
        createThreads: true,
      },
      member: { viewChannel: true, sendMessages: true, attachFiles: true, createThreads: true },
      guest: { viewChannel: true },
    },
    overrides: { owner: {}, admin: {}, moderator: {}, member: {}, guest: {} },
  },
  {
    id: "engineering",
    name: "engineering",
    topic: "Engineering updates and PR reviews",
    category: "Projects",
    isPrivate: true,
    defaultPermissions: {
      owner: {
        viewChannel: true,
        sendMessages: true,
        manageMessages: true,
        manageChannel: true,
        manageRoles: true,
        attachFiles: true,
        pinMessages: true,
        createThreads: true,
      },
      admin: {
        viewChannel: true,
        sendMessages: true,
        manageMessages: true,
        manageChannel: true,
        attachFiles: true,
        pinMessages: true,
        createThreads: true,
      },
      moderator: {
        viewChannel: true,
        sendMessages: true,
        manageMessages: true,
        attachFiles: true,
        pinMessages: true,
        createThreads: true,
      },
      member: { viewChannel: true, sendMessages: true, attachFiles: true, createThreads: true },
      guest: { viewChannel: false },
    },
    overrides: { owner: {}, admin: {}, moderator: {}, member: {}, guest: {} },
    slowMode: false,
  },
]

export default function GroupChannelsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [selectedChannelId, setSelectedChannelId] = useState<string>(initialChannels[0].id)
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
    if (c && channels.some((ch) => ch.id === c)) {
      setSelectedChannelId(c)
    }
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("c", selectedChannelId)
    window.history.replaceState({}, "", url.toString())
  }, [selectedChannelId])

  const addChannel = () => {
    const idSafe = newChannelName.trim().toLowerCase().replace(/\s+/g, "-")
    if (!idSafe || channels.some((c) => c.id === idSafe)) return
    const newCh: Channel = {
      id: idSafe,
      name: idSafe,
      topic: "",
      isPrivate: newChannelPrivate,
      category: newChannelCategory || "Text",
      defaultPermissions: {
        owner: {
          viewChannel: true,
          sendMessages: true,
          manageMessages: true,
          manageChannel: true,
          manageRoles: true,
          attachFiles: true,
          pinMessages: true,
          createThreads: true,
        },
        admin: {
          viewChannel: true,
          sendMessages: true,
          manageMessages: true,
          manageChannel: true,
          attachFiles: true,
          pinMessages: true,
          createThreads: true,
        },
        moderator: {
          viewChannel: true,
          sendMessages: true,
          manageMessages: true,
          attachFiles: true,
          pinMessages: true,
          createThreads: true,
        },
        member: { viewChannel: true, sendMessages: true, attachFiles: true, createThreads: true },
        guest: { viewChannel: !newChannelPrivate },
      },
      overrides: { owner: {}, admin: {}, moderator: {}, member: {}, guest: {} },
    }
    setChannels((prev) => [...prev, newCh])
    setCreating(false)
    setNewChannelName("new-channel")
    setNewChannelPrivate(false)
    setNewChannelCategory("Text")
    setSelectedChannelId(newCh.id)
  }

  const updateChannel = (patch: Partial<Channel>) => {
    setChannels((prev) => prev.map((c) => (c.id === selectedChannelId ? { ...c, ...patch } : c)))
  }

  const updateChannelOverrides = (roleId: RoleKey, permission: PermissionKey, value: OverrideValue) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === selectedChannelId
          ? {
              ...c,
              overrides: {
                ...c.overrides,
                [roleId]: { ...(c.overrides[roleId] || {}), [permission]: value },
              },
            }
          : c,
      ),
    )
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
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {channels.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.isPrivate ? "🔒 " : "# "}
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
              {selectedChannel?.isPrivate ? <Lock className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
              <h1 className="font-semibold truncate">{selectedChannel?.name || "channel"}</h1>
              {selectedChannel?.topic && (
                <span className="text-sm text-muted-foreground truncate">— {selectedChannel?.topic}</span>
              )}
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
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  const topic = prompt("Set channel topic", selectedChannel?.topic ?? "") ?? selectedChannel?.topic
                  if (topic !== undefined) updateChannel({ topic: topic ?? "" })
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Topic
              </Button>
            </div>
          </div>

          <ChannelChat channelId={selectedChannelId} members={mockMembers} />

          {/* Composer */}
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <Input placeholder={`Message #${selectedChannel?.name}`} className="bg-gray-100 border-none" />
              <Button className="bg-black text-white hover:bg-gray-800">
                <SendHorizontal className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Slow mode: {selectedChannel?.slowMode ? "On" : "Off"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                <span>Permissions per channel</span>
              </div>
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
                <TabsTrigger
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
                </TabsTrigger>
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
                      {selectedChannel?.isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                      <Badge variant="secondary" className="text-xs">
                        {selectedChannel?.isPrivate ? "Private" : "Public"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedChannel?.category || "Text"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Topic</span>
                    <Textarea
                      value={selectedChannel?.topic || ""}
                      onChange={(e) => updateChannel({ topic: e.target.value })}
                      placeholder="Add a topic to describe this channel"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Slow Mode</span>
                    <Switch
                      checked={!!selectedChannel?.slowMode}
                      onCheckedChange={(v) => updateChannel({ slowMode: v })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm mt-4">
                <CardHeader>
                  <CardTitle>Members with Access</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockMembers.map((m) => (
                    <div key={m.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={m.avatar || "/placeholder.svg"} alt={m.name} />
                          <AvatarFallback>{m.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.username}</p>
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

            <TabsContent value="permissions" className="flex-1 overflow-y-auto p-4">
              <ChannelPermissions
                roles={defaultRoles}
                permissions={defaultPermissions}
                overrides={selectedChannel?.overrides || { owner: {}, admin: {}, moderator: {}, member: {}, guest: {} }}
                onChange={(roleId, perm, val) => updateChannelOverrides(roleId, perm, val)}
              />
            </TabsContent>

            <TabsContent value="projects" className="flex-1 overflow-y-auto p-4">
              <ChannelProjects members={mockMembers} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </DashboardLayout>
  )
}
