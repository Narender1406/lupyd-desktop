"use client"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Hash, Lock, Menu, Settings, Users, ListChecks } from "lucide-react"
import { ChannelList } from "@/components/groups/channel-list"
import { ChannelChat } from "@/components/groups/channel-chat"
import { ChannelProjects } from "@/components/groups/channel-projects"
import { GroupTasks, type Member as TaskMember } from "@/components/groups/group-tasks"

type RoleKey = "owner" | "admin" | "moderator" | "member" | "guest"

interface Channel {
  id: string
  name: string
  topic?: string
  isPrivate?: boolean
  category?: string
  slowMode?: boolean
}

interface Member {
  id: string
  name: string
  username: string
  avatar: string
  role: RoleKey
  isOnline?: boolean
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

function seedChannels(groupId: string): Channel[] {
  return [
    { id: "general", name: "general", topic: "Announcements and chat", category: "Text" },
    { id: "design", name: "design", topic: "Design reviews & assets", category: "Projects" },
    {
      id: "engineering",
      name: "engineering",
      topic: "Updates & PR reviews",
      category: "Projects",
      isPrivate: groupId === "2",
    },
  ]
}

export function GroupWorkspacePane({
  groupId,
  groupName = "Group",
}: {
  groupId: string
  groupName?: string
}) {
  const navigate = useNavigate()

  const [channels, setChannels] = useState<Channel[]>(() => seedChannels(groupId))
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || "general")
  const [filter, setFilter] = useState("")
  const [role, setRole] = useState<RoleKey>("member")
  const [openChannelsSheet, setOpenChannelsSheet] = useState(false)
  const [openTasks, setOpenTasks] = useState(false)

  useEffect(() => {
    const seeded = seedChannels(groupId)
    setChannels(seeded)
    setSelectedChannelId(seeded[0]?.id || "general")
  }, [groupId])

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("c", selectedChannelId)
    window.history.replaceState({}, "", url.toString())
  }, [selectedChannelId])

  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId) ?? channels[0],
    [channels, selectedChannelId],
  )

  const header = (
    <div className="flex items-center justify-between px-3 md:px-4 py-2 border-b bg-white">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold truncate">{groupName}</span>
          <Badge variant="outline" className="hidden sm:inline-flex text-xs">
            #{groupId}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Channels (mobile) */}
        <Sheet open={openChannelsSheet} onOpenChange={setOpenChannelsSheet}>
          
          <SheetContent side="left" className="p-0 w-80 max-w-[calc(100vw-1rem)]">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Channels
              </SheetTitle>
            </SheetHeader>
            <div className="p-3 space-y-3">
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter channels"
                className="bg-gray-100 border-none"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Role</span>
                <Select value={role} onValueChange={(v: RoleKey) => setRole(v)}>
                  <SelectTrigger className="h-8 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-y-auto">
              <ChannelList
                channels={channels}
                filter={filter}
                selectedId={selectedChannelId}
                onSelect={(id) => {
                  setSelectedChannelId(id)
                  setOpenChannelsSheet(false)
                }}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Tasks button */}
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => setOpenTasks(true)}
          aria-label="Open tasks"
          title="Open tasks"
        >
          <ListChecks className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Tasks</span>
        </Button>

        {/* Settings */}
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => navigate(`/groups/${groupId}/settings`)}
          aria-label="Group settings"
          title="Group settings"
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{groupName}-Settings</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col bg-white border rounded-lg w-full max-w-full overflow-hidden overflow-x-hidden supports-[overflow:clip]:overflow-x-clip">
      {/* Header */}
      {header}

      {/* Tasks sheet */}
      <GroupTasks
        open={openTasks}
        onOpenChange={setOpenTasks}
        groupName={groupName}
        members={mockMembers as unknown as TaskMember[]}
      />

      <div className="grid w-full max-w-full [--aside-w:260px] md:grid-cols-[minmax(240px,var(--aside-w))_minmax(0,1fr)] min-h-[70vh] md:gap-0 overflow-hidden overflow-x-hidden supports-[overflow:clip]:overflow-x-clip [&>*]:min-w-0">
        {/* Channel list (desktop) */}
        <aside className="hidden md:flex md:flex-col border-r shrink-0 w-[var(--aside-w)] max-w-full overflow-x-hidden">
          <div className="p-3 space-y-3">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter channels"
              className="bg-gray-100 border-none"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Role</span>
              <Select value={role} onValueChange={(v: RoleKey) => setRole(v)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ChannelList
              channels={channels}
              filter={filter}
              selectedId={selectedChannelId}
              onSelect={setSelectedChannelId}
            />
          </div>
        </aside>

        {/* Chat column */}
        <section className="flex min-h-[60vh] flex-col min-w-0 max-w-full overflow-x-hidden supports-[overflow:clip]:overflow-x-clip break-words">
          {/* Channel header */}
          <div className="px-3 md:px-4 py-2 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {selectedChannel?.isPrivate ? <Lock className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
              <h2 className="font-semibold truncate">{selectedChannel?.name || "channel"}</h2>
              {selectedChannel?.category && (
                <Badge variant="outline" className="text-xs">
                  {selectedChannel.category}
                </Badge>
              )}
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => {
                  const topic = prompt("Set channel topic", selectedChannel?.topic ?? "") ?? selectedChannel?.topic
                  if (topic !== undefined) {
                    setChannels((prev) =>
                      prev.map((c) => (c.id === selectedChannelId ? { ...c, topic: topic ?? "" } : c)),
                    )
                  }
                }}
              >
                Edit Topic
              </Button>
            </div>
          </div>

          {/* Chat content */}
          <div className="flex-1 min-h-0">
            <ChannelChat channelId={selectedChannelId} members={mockMembers} />
          </div>

          {/* Composer - sticky to avoid falling under viewport on mobile */}
          <div className="border-t p-2 md:p-3 sticky bottom-0 bg-white hidden md:block">
            <div className="flex items-center gap-2">
              <Input placeholder={`Message #${selectedChannel?.name}`} className="bg-gray-100 border-none" />
              <Button className="bg-black text-white hover:bg-gray-800">Send</Button>
            </div>
          </div>

          {/* Channel details below chat on all sizes */}
          <div className="border-t">
            <Accordion type="single" collapsible className="w-full">
              
              <AccordionItem value="projects">
                <AccordionTrigger className="px-4">Projects</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ChannelProjects members={mockMembers} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
    </div>
  )
}
