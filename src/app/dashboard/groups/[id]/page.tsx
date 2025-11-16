"use client"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { GroupWorkspacePane } from "@/components/groups/group-workspace-pane"
import { ArrowLeft, Settings } from "lucide-react"
import { ChannelList } from "@/components/groups/channel-list"
import { ChannelChat } from "@/components/groups/channel-chat"
import { ChannelProjects } from "@/components/groups/channel-projects"

type RoleKey = "owner" | "admin" | "moderator" | "member" | "guest"

interface Member {
  id: string
  name: string
  username: string
  avatar: string
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
}

const mockMembers: Member[] = [
  { id: "1", name: "Sarah Chen", username: "@sarahc", avatar: "/sarah-avatar.jpg", role: "owner", isOnline: true },
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
  { id: "general", name: "general", topic: "Group-wide announcements and chat", category: "Text" },
  { id: "design", name: "design", topic: "Design reviews and assets", category: "Projects" },
  {
    id: "engineering",
    name: "engineering",
    topic: "Engineering updates and PR reviews",
    category: "Projects",
    isPrivate: true,
  },
]

export default function GroupWorkspaceRoutePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [groupName, setGroupName] = useState("Group")
  const [channels, setChannels] = useState<Channel[]>(initialChannels)
  const [selectedChannelId, setSelectedChannelId] = useState<string>(initialChannels[0].id)
  const [currentRole, setCurrentRole] = useState<RoleKey>("member")
  const [filter, setFilter] = useState("")
  const [creating, setCreating] = useState(false)
  const [newChannelName, setNewChannelName] = useState("new-channel")
  const [newChannelPrivate, setNewChannelPrivate] = useState(false)
  const [newChannelCategory, setNewChannelCategory] = useState<string>("Text")

  // Demo: pull a name based on id (replace with real fetch)
  useEffect(() => {
    if (!id) return
    const names: Record<string, string> = {
      "1": "Design Enthusiasts",
      "2": "Engineering Hub",
      "3": "Creators Lounge",
      "4": "Product Squad",
    }
    setGroupName(names[id] || `Group #${id}`)
  }, [id])

  // read ?c= from location
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const c = params.get("c")
    if (c && channels.some((ch) => ch.id === c)) setSelectedChannelId(c)
  }, [window.location.search, channels])

  // write ?c= to URL
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("c", selectedChannelId)
    window.history.replaceState({}, "", url.toString())
  }, [selectedChannelId])

  const selectedChannel = channels.find((c) => c.id === selectedChannelId) ?? channels[0]

  const addChannel = () => {
    const idSafe = newChannelName.trim().toLowerCase().replace(/\s+/g, "-")
    if (!idSafe || channels.some((c) => c.id === idSafe)) return
    const newCh: Channel = {
      id: idSafe,
      name: idSafe,
      topic: "",
      isPrivate: newChannelPrivate,
      category: newChannelCategory || "Text",
      slowMode: false,
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

  if (!id) return null

  return (
    <DashboardLayout>
      <div className="mb-3 flex items-center justify-between" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        <Button variant="outline" className="bg-transparent" onClick={() => navigate("/dashboard/groups")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          All Groups
        </Button>
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => navigate(`/dashboard/groups/${id}/settings`)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
      <GroupWorkspacePane groupId={id} groupName={groupName}>
        <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-88px)] -m-4 md:-m-6">
          {/* Left: Channel list (Desktop) */}
          <aside className="hidden md:flex w-72 flex-col border-r bg-white">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <p className="font-semibold truncate">{groupName}</p>
                <p className="text-xs text-muted-foreground">Channels</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setCreating((v) => !v)} title="New channel">
                +
              </Button>
            </div>

            <div className="p-3 space-y-3">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter channels"
                className="bg-gray-100 border-none"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Viewing as</span>
                <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value as RoleKey)}>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="member">Member</option>
                  <option value="guest">Guest</option>
                </select>
              </div>
            </div>

            {creating && (
              <div className="px-3 pb-3 space-y-2">
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="channel-name"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Private</span>
                  <select
                    value={newChannelPrivate ? "yes" : "no"}
                    onChange={(e) => setNewChannelPrivate(e.target.value === "yes")}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Category</span>
                  <select value={newChannelCategory} onChange={(e) => setNewChannelCategory(e.target.value)}>
                    <option value="Text">Text</option>
                    <option value="Projects">Projects</option>
                    <option value="Announcements">Announcements</option>
                  </select>
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
                onClick={() => navigate(`/dashboard/groups/${id}/settings`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Group Settings
              </Button>
            </div>
          </aside>

          {/* Top (Mobile): Quick header with channel selector */}
          <div className="md:hidden flex flex-col w-full">
            <div className="border-b p-3 flex items-center justify-between gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => navigate("/dashboard/groups")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Groups
              </Button>
              <select value={selectedChannelId} onChange={(e) => setSelectedChannelId(e.target.value)}>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.isPrivate ? "🔒 " : "# "}
                    {ch.name}
                  </option>
                ))}
              </select>
              <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value as RoleKey)}>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="member">Member</option>
                <option value="guest">Guest</option>
              </select>
            </div>
          </div>

          {/* Center: Chat */}
          <section className="flex-1 flex flex-col bg-white">
            {/* Channel header */}
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {selectedChannel.isPrivate ? "🔒" : "#"}
                <h1 className="font-semibold truncate">{selectedChannel.name || "channel"}</h1>
                {selectedChannel.topic && (
                  <span className="text-sm text-muted-foreground truncate">— {selectedChannel.topic}</span>
                )}
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => {
                    const topic = prompt("Set channel topic", selectedChannel.topic ?? "") ?? selectedChannel.topic
                    if (topic !== undefined) updateChannel({ topic: topic ?? "" })
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Topic
                </Button>
              </div>
            </div>

            {/* Chat content */}
            <ChannelChat channelId={selectedChannelId} members={mockMembers} />

            {/* Composer */}
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <input placeholder={`Message #${selectedChannel.name}`} className="bg-gray-100 border-none" />
                <Button className="bg-black text-white hover:bg-gray-800">Send</Button>
              </div>
            </div>
          </section>

          {/* Right: Info and Projects (Permissions moved to Group Settings) */}
          <aside className="hidden lg:flex w-[400px] flex-col border-l bg-white">
            <div className="flex-1 flex flex-col">
              <div className="border-b px-4 py-3 flex items-center justify-between">
                <div className="bg-transparent p-0 h-auto gap-2">
                  <div className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent px-2 py-1">
                    Info
                  </div>
                  <div className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:bg-transparent px-2 py-1">
                    Projects
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Channel</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      {selectedChannel.isPrivate ? "🔒" : "#"} {selectedChannel.name}
                    </div>
                    {selectedChannel.topic && (
                      <p className="mt-2 text-sm text-muted-foreground">{selectedChannel.topic}</p>
                    )}
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Privacy</span>
                      <span className="text-xs">{selectedChannel.isPrivate ? "Private" : "Public"}</span>
                    </div>
                    <div className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="text-xs">{selectedChannel.category || "Text"}</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-2">Members</div>
                    <div className="space-y-2">
                      {mockMembers.map((m) => (
                        <div key={m.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-gray-100 overflow-hidden">
                              <img
                                src={m.avatar || "/placeholder.svg?height=32&width=32&query=avatar"}
                                alt={m.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{m.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{m.username}</p>
                            </div>
                          </div>
                          <span className="text-xs capitalize">{m.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="flex-1 overflow-y-auto p-4">
                <ChannelProjects members={mockMembers} />
              </div>
            </div>
          </aside>
        </div>
      </GroupWorkspacePane>
    </DashboardLayout>
  )
}
