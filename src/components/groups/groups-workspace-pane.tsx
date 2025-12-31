"use client"
import { ChannelChat } from "@/components/groups/channel-chat"
import { ChannelList } from "@/components/groups/channel-list"
import { ChannelProjects } from "@/components/groups/channel-projects"
import { GroupTasks, type Member as TaskMember } from "@/components/groups/group-tasks"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import { EncryptionPlugin } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import { ListChecks, Settings, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

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

export function GroupWorkspacePane({
  groupId,
  groupName = "Group",
}: {
  groupId: number
  groupName?: string
}) {
  const navigate = useNavigate()


  const [extensionBytes, setExtensionBytes] = useState(new Uint8Array())


  useEffect(() => {

    EncryptionPlugin.getGroupExtension({ groupId }).then(({ resultB64 }) => {
      const extension = fromBase64(resultB64)
      setExtensionBytes(extension)
    })

  }, [])



  const groupExtension = useMemo(() => protos.FireflyGroupExtension.decode(extensionBytes), [extensionBytes])

  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>(groupExtension.channels?.channels[0]?.id)
  const [filter, setFilter] = useState("")

  const auth = useAuth()

  const role = useMemo(() => {

    const member = groupExtension.members?.members?.find(e => e.username == auth.username)
    if (member) {
      const role = groupExtension.roles?.roles?.find(e => e.id == member.role)
      if (role) {
        return role.name
      }
    }

    return undefined

  }, [auth, groupExtension])


  const [openChannelsSheet, setOpenChannelsSheet] = useState(false)
  const [openTasks, setOpenTasks] = useState(false)


  useEffect(() => {
    const url = new URL(window.location.href)
    if (selectedChannelId) {
      url.searchParams.set("c", selectedChannelId!.toString())
      window.history.replaceState({}, "", url.toString())
    }
  }, [selectedChannelId])


  const selectedChannel = useMemo(() =>
    groupExtension?.channels?.channels?.find(e => e.id == selectedChannelId), [selectedChannelId, groupExtension])


  const header = (
    <div className="flex items-center justify-between px-3 md:px-4 py-2 border-b bg-white dark:bg-black">
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
          <SheetContent
            side="left"
            className="p-0 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-black"
          >
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
                className="bg-gray-100 dark:bg-neutral-900 border-none text-black dark:text-white"
              />
            </div>

            <div className="overflow-y-auto">
              <ChannelList
                channels={groupExtension.channels?.channels ?? []}
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
          className="bg-transparent dark:text-white"
          onClick={() => setOpenTasks(true)}
          aria-label="Open tasks"
        >
          <ListChecks className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Tasks</span>
        </Button>

        {/* Settings */}
        <Button
          variant="outline"
          className="bg-transparent dark:text-white"
          onClick={() => navigate(`/groups/${groupId}/settings`)}
          aria-label="Group settings"
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{groupName}-Settings</span>
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col bg-white dark:bg-black border rounded-lg w-full max-w-full overflow-hidden overflow-x-hidden supports-[overflow:clip]:overflow-x-clip">
      {/* Header */}
      {header}

      {/* Tasks */}
      <GroupTasks
        open={openTasks}
        onOpenChange={setOpenTasks}
        groupName={groupName}
        members={mockMembers as unknown as TaskMember[]}
      />

      <div className="grid w-full max-w-full [--aside-w:260px] md:grid-cols-[minmax(240px,var(--aside-w))_minmax(0,1fr)] min-h-[70vh] md:gap-0 overflow-hidden overflow-x-hidden supports-[overflow:clip]:overflow-x-clip">
        {/* Channel list (desktop) */}
        <aside className="hidden md:flex md:flex-col border-r shrink-0 w-[var(--aside-w)] max-w-full overflow-x-hidden">
          <div className="p-3 space-y-3">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter channels"
              className="bg-gray-100 dark:bg-neutral-900 border-none text-black dark:text-white"
            />

          </div>

          <div className="flex-1 overflow-y-auto">
            <ChannelList
              channels={groupExtension.channels?.channels ?? []}
              filter={filter}
              selectedId={selectedChannelId}
              onSelect={(id) => {
                setSelectedChannelId(id)
                setOpenChannelsSheet(false)
              }}
            />
          </div>
        </aside>

        {/* Chat column */}
        <section className="flex min-h-[60vh] flex-col min-w-0 max-w-full overflow-x-hidden supports-[overflow:clip]:overflow-x-clip break-words">

          {/* Channel header */}
          <div className="px-3 md:px-4 py-2 border-b flex items-center justify-between bg-white dark:bg-black">
            <div className="flex items-center gap-2 min-w-0">

              <h2 className="font-semibold truncate">{selectedChannel?.name}</h2>

              {selectedChannel?.type && (
                <Badge variant="outline" className="text-xs">
                  {channelTypeToText(selectedChannel.type)}
                </Badge>
              )}
            </div>
          </div>

          {/* Chat */}
          {
            selectedChannelId &&
            <div className="flex-1 min-h-0">
              <ChannelChat channelId={selectedChannelId} groupId={groupId} extension={groupExtension} />
            </div>}

          {/* Composer */}
          <div className="border-t p-2 md:p-3 sticky bottom-0 bg-white dark:bg-black hidden md:block">
            <div className="flex items-center gap-2">
              <Input
                placeholder={`Message #${selectedChannel?.name}`}
                className="bg-gray-100 dark:bg-neutral-900 border-none text-black dark:text-white"
              />
              <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300">
                Send
              </Button>
            </div>
          </div>

          {/* Channel details */}
          <div className="border-t">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="projects">
                <AccordionTrigger className="px-4 dark:text-white">
                  Projects
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4 dark:text-white">
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

function channelTypeToText(ty: number) {
  switch (ty) {
    case 1:
      return "Text"
    case 2:
      return "Voice"
  }
}