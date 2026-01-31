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
import { Menu, Plus, Search, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"


import { fromBase64 } from "@/lib/utils"
import { protos as FireflyProtos } from "firefly-client-js"



export default function GroupsPage() {
  const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  const [q, setQ] = useState("")


  const [groupLastMessages, setGroupLastMessages] = useState<GroupMessage[]>([])

  const [groupInfos, setGroupInfos] = useState<BGroupInfo[]>([])

  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(
    params.id ? parseInt(params.id) : undefined
  )
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

  // Sync selectedGroupId with URL params
  useEffect(() => {
    if (params.id) {
      const groupId = parseInt(params.id)
      if (groupId !== selectedGroupId) {
        setSelectedGroupId(groupId)
      }
    } else {
      setSelectedGroupId(undefined)
    }
  }, [params.id])




  const GroupRailButton = ({ g }: { g: BGroupInfo }) => {
    const isActive = g.groupId === selectedGroupId
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              key={g.groupId}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden transition-all hover:rounded-xl bg-gray-100 dark:bg-zinc-800 ${isActive ? "rounded-xl bg-primary text-primary-foreground" : ""
                }`}
              onClick={() => navigate(`/groups/${g.groupId}`)}
              aria-label={`Open ${g.name}`}
            >
              <span className="text-sm font-semibold">
                {g.name.slice(0, 2).toUpperCase()}
              </span>
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
    }, [g.groupId])




    return (
      <button
        key={g.groupId}
        className={`w-full text-left rounded-md p-2 hover:bg-gray-100 transition ${g.groupId === selectedGroupId ? "bg-gray-100" : ""
          }`}
        onClick={() => {
          navigate(`/groups/${g.groupId}`)
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
              {groupExtension.members?.length.toLocaleString()}
            </div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)] gap-0" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        {/* Discord-like rail (desktop) - Dark sidebar */}
        <aside className="hidden md:flex flex-col gap-3 items-center py-3 w-[72px] shrink-0 bg-zinc-900 dark:bg-zinc-950 overflow-y-auto hide-scrollbar z-50 rounded-tl-lg">

          {/* Create Group Button at Top (Since Home is in Global Nav) */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="h-12 w-12 grid place-items-center rounded-2xl bg-zinc-800 hover:bg-green-600 hover:text-white hover:rounded-xl transition-all text-green-500"
                  onClick={() => navigate("/groups/create")}
                  aria-label="Create group"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <div className="text-sm">Add a Group</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator className="w-10 bg-zinc-700 mx-auto" />

          {/* Group icons */}
          <div className="flex flex-col items-center gap-3 w-full">
            {groupInfos.map((g) => (
              <GroupRailButton key={g.groupId} g={g} />
            ))}
          </div>
        </aside>

        {/* Mobile: header with group picker */}
        <div className="md:hidden w-full flex flex-col h-full">
          <div className="flex items-center justify-between p-3 border-b bg-white dark:bg-black sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-ml-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 bg-white dark:bg-black">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Groups</SheetTitle>
                  </SheetHeader>
                  <div className="p-2">
                    <div className="space-y-1">
                      {groupInfos.map((g) => (
                        <GroupListItem key={g.groupId} g={g} />
                      ))}
                      <Button variant="outline" className="w-full mt-2" onClick={() => navigate("/groups/create")}>
                        <Plus className="h-4 w-4 mr-2" /> Create Group
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              <span className="font-semibold">Groups</span>
            </div>
          </div>

          {selectedGroupId != undefined ? (
            <div className="flex-1 w-full min-w-0 overflow-hidden">
              <GroupWorkspacePane groupId={selectedGroupId!} groupName={groupInfos.find(e => e.groupId == selectedGroupId)?.name ?? ""} />
            </div>
          ) : (
            <div className="flex-1 w-full flex items-center justify-center p-6">
              <div className="text-center max-w-sm">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Welcome to Groups</h2>
                <p className="text-muted-foreground mb-4">Select a group from the menu to start chatting, or create a new one.</p>
                <Button onClick={() => navigate("/groups/create")}>Create Group</Button>
              </div>
            </div>
          )}
        </div>


        {/* Desktop Workspace Area */}
        {selectedGroupId != undefined ? (
          <div className="hidden md:block flex-1 h-full min-w-0 overflow-hidden">
            <GroupWorkspacePane groupId={selectedGroupId!} groupName={groupInfos.find(e => e.groupId == selectedGroupId)?.name ?? ""} />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 h-full items-center justify-center bg-gray-50 dark:bg-zinc-900">
            <div className="text-center max-w-md px-6 py-12">
              <div className="mb-6">
                <div className="mx-auto w-24 h-24 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                  <Users className="h-12 w-12 text-zinc-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Welcome to Groups</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  You can now create servers, join voice channels, and chat with your friends in a dedicated space.
                </p>
                <Button
                  size="lg"
                  onClick={() => navigate("/groups/create")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg rounded-full px-8"
                >
                  Create Your First Group
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
