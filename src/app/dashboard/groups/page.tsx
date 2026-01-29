"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { GroupWorkspacePane } from "@/components/groups/groups-workspace-pane"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { bGroupMessageToGroupMessage, EncryptionPlugin, type BGroupInfo, type GroupMessage } from "@/context/encryption-plugin"
import { useFirefly, type GroupMessageCallbackType } from "@/context/firefly-context"
import { Menu, Plus, Search, Settings, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"


import { fromBase64 } from "@/lib/utils"
import { protos as FireflyProtos } from "firefly-client-js"



export default function GroupsPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState("")


  const [groupLastMessages, setGroupLastMessages] = useState<GroupMessage[]>([])

  const [groupInfos, setGroupInfos] = useState<BGroupInfo[]>([])

  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined)
  const [openSheet, setOpenSheet] = useState(false)


  const firefly = useFirefly()


  useEffect(() => {

    EncryptionPlugin.getGroupInfos().then(({ result }) => {
      const groups = result
      setGroupInfos(groups)
    })

    EncryptionPlugin.getLastGroupMessages().then(({ result }) => {
      const messages = result
      const newMessages = messages.sort((a, b) => b.id - a.id).map(bGroupMessageToGroupMessage)

      setGroupLastMessages(newMessages)
    })

    const listener: GroupMessageCallbackType = (message) => {
      setGroupLastMessages(prev => {

        const newMessages = [message, ...prev.filter(e => e.groupId != message.groupId)]

        return newMessages
      })
    }

    firefly.addGroupEventListener(listener)


    return () => firefly.removeGroupEventListener(listener)

  }, [])




  const GroupRailButton = ({ g }: { g: BGroupInfo }) => {
    const isActive = g.groupId === selectedGroupId
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              key={g.groupId}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden transition-all hover:rounded-xl ${isActive ? "ring-2 ring-black" : "ring-1 ring-transparent"
                }`}
              onClick={() => setSelectedGroupId(g.groupId)}
              aria-label={`Open ${g.name}`}
            >
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            <div className="text-sm">{g.name}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const GroupListItem = ({ g }: { g: BGroupInfo }) => {

    const [extension, setExtension] = useState(new Uint8Array())


    const groupExtension = useMemo(() =>
      FireflyProtos.FireflyGroupExtension.decode(extension), [extension])

    useEffect(() => {
      EncryptionPlugin.getGroupExtension({ groupId: g.groupId }).then(({ resultB64 }) => {
        const extension = fromBase64(resultB64)
        setExtension(extension)
      })
    })





    return (
      <button
        key={g.groupId}
        className={`w-full text-left rounded-md p-2 hover:bg-gray-100 transition ${g.groupId === selectedGroupId ? "bg-gray-100" : ""
          }`}
        onClick={() => {
          setSelectedGroupId(g.groupId)
          setOpenSheet(false)
        }}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md overflow-hidden bg-muted/40">

            <div className="h-full w-full grid place-items-center text-xs font-semibold">
              {g.name.slice(0, 2).toUpperCase()}
            </div>

          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {groupExtension.members.length.toLocaleString()}
            </div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row min-h-[70vh] gap-3 lg:gap-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        {/* Discord-like rail (desktop) */}
        <aside className="hidden md:flex md:w-20 shrink-0 flex-col gap-3 items-center py-3 border rounded-lg bg-white">
          {/* Top actions */}
          <button
            className="h-12 w-12 grid place-items-center rounded-2xl bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => navigate("/groups/create")}
            aria-label="Create group"
            title="Create group"
          >
            <Plus className="h-5 w-5" />
          </button>

          <Separator className="w-10" />

          {/* Group icons */}
          <div className="flex-1 overflow-y-auto flex flex-col items-center gap-3">
            {groupInfos.map((g) => (
              <GroupRailButton key={g.groupId} g={g} />
            ))}
            {groupInfos?.length === 0 && (
              <div className="text-[10px] text-muted-foreground text-center px-2">No groups</div>
            )}
          </div>
        </aside>

        {/* Mobile: header with group picker + settings */}
        <div className="md:hidden w-full">
          <div className="flex items-center justify-between mb-3">
            <Sheet open={openSheet} onOpenChange={setOpenSheet}>
              <SheetTrigger asChild>
                <Button variant="outline" className="bg-transparent">
                  <Menu className="h-4 w-4 mr-2" />
                  Groups
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle>Groups</SheetTitle>
                </SheetHeader>
                <div className="p-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search groups..."
                      className="pl-8 bg-gray-100 border-none"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>
                </div>
                <button
                  className="h-12 w-12 grid place-items-center rounded-2xl bg-gray-100 hover:bg-gray-200 transition"
                  onClick={() => navigate("/groups/create")}
                  aria-label="Create group"
                  title="Create group"
                >
                  <Plus className="h-5 w-5" />
                </button>
                <Separator className="w-10" />

                <div className="p-2 space-y-1 overflow-y-auto">
                  {groupInfos.map((g) => (
                    <GroupListItem key={g.groupId} g={g} />
                  ))}
                  {groupInfos.length === 0 && (
                    <div className="text-xs text-muted-foreground px-2 py-3">No groups found for “{q}”.</div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => navigate(`/groups/${selectedGroupId}/settings`)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>


        {selectedGroupId != undefined ? (
          <div className="w-full md:flex-1 min-w-0">
            <GroupWorkspacePane groupId={selectedGroupId!} groupName={groupInfos.find(e => e.groupId == selectedGroupId)?.name ?? ""} />
          </div>
        ) : (
          <div className="w-full md:flex-1 min-w-0 flex items-center justify-center">
            <div className="text-center max-w-md px-6 py-12">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Groups</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create or join groups to connect with communities, share ideas, and collaborate with others.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => navigate("/groups/create")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Group
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
