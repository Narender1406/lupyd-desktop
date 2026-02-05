"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { CreateChannelDialog } from "@/components/groups/create-channel-dialog"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import { Hash, Menu, Plus, Settings, Volume2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

export default function GroupChannelListPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [groupInfo, setGroupInfo] = useState<BGroupInfo | undefined>(undefined)
  const [extension, setExtension] = useState<protos.FireflyGroupExtension | undefined>(undefined)
  const [groupInfos, setGroupInfos] = useState<BGroupInfo[]>([])
  const [showServerSheet, setShowServerSheet] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Load group data
  const loadGroupData = () => {
    if (!id) return

    EncryptionPlugin.getGroupInfoAndExtension({ groupId: Number(id) }).then((result) => {
      setGroupInfo(result)
      setExtension(protos.FireflyGroupExtension.decode(fromBase64(result.extensionB64)))
    })
  }

  useEffect(() => {
    loadGroupData()
  }, [id])

  // Load all groups for server switcher
  useEffect(() => {
    EncryptionPlugin.getGroupInfos().then(({ result }) => {
      setGroupInfos(result)
    })
  }, [])

  const channels = useMemo(() => extension?.channels || [], [extension])

  const textChannels = useMemo(
    () => channels.filter((ch) => ch.type === 1),
    [channels]
  )

  const voiceChannels = useMemo(
    () => channels.filter((ch) => ch.type === 2),
    [channels]
  )

  const handleSelectChannel = (channelId: number) => {
    navigate(`/groups/${id}/channels?c=${channelId}`)
  }

  const handleSelectGroup = (groupId: number) => {
    setShowServerSheet(false)
    navigate(`/groups/${groupId}`)
  }

  const handleCreateSuccess = () => {
    loadGroupData() // Reload group data to show new channel
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-65px)] -m-4 md:-m-6">
        {/* Desktop: Server Rail */}
        <aside className="hidden md:flex flex-col gap-3 items-center py-3 w-[72px] shrink-0 bg-gray-50 border-r overflow-y-auto">
          {/* Create Group Button */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="h-12 w-12 grid place-items-center rounded-2xl bg-gray-200 hover:bg-green-600 hover:text-white hover:rounded-xl transition-all text-green-600"
                  onClick={() => navigate("/groups/create")}
                  aria-label="Create group"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-sm">Create Server</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-10 h-px bg-gray-300" />

          {/* Group Icons */}
          {groupInfos.map((group) => (
            <TooltipProvider key={group.groupId} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`h-12 w-12 flex items-center justify-center rounded-2xl transition-all border ${group.groupId === Number(id)
                        ? "rounded-xl bg-primary text-primary-foreground"
                        : "bg-white hover:rounded-xl hover:bg-primary hover:text-primary-foreground"
                      }`}
                    onClick={() => handleSelectGroup(group.groupId)}
                    aria-label={`Open ${group.name}`}
                  >
                    <span className="text-sm font-semibold">
                      {group.name.slice(0, 2).toUpperCase()}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="text-sm">{group.name}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </aside>

        {/* Desktop: Channel Rail Sidebar */}
        <aside className="hidden md:flex flex-col gap-2 py-3 w-[240px] shrink-0 bg-white border-r">
          {/* Group Header */}
          <div className="px-3 mb-2">
            <h2 className="font-semibold text-lg truncate">{groupInfo?.name || `Group #${id}`}</h2>
            <p className="text-xs text-gray-500">Channels</p>
          </div>

          <div className="flex-1 overflow-y-auto px-2">
            {/* Text Channels */}
            {textChannels.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1 px-2">
                  Text Channels
                </h3>
                <div className="space-y-0.5">
                  {textChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleSelectChannel(channel.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition group text-left"
                    >
                      <Hash className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-sm font-medium truncate">{channel.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Channels */}
            {voiceChannels.length > 0 && (
              <div className="mb-3">
                <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1 px-2">
                  Voice Channels
                </h3>
                <div className="space-y-0.5">
                  {voiceChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleSelectChannel(channel.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 transition group text-left"
                    >
                      <Volume2 className="h-4 w-4 text-gray-500 shrink-0" />
                      <span className="text-sm font-medium truncate">{channel.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Channels Message */}
            {channels.length === 0 && (
              <div className="px-2 py-4 text-center">
                <p className="text-sm text-gray-500 mb-3">No channels yet</p>
              </div>
            )}
          </div>

          {/* Create Channel Button */}
          <div className="px-3 pt-2 border-t shrink-0">
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="w-full"
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Channel
            </Button>
          </div>

          {/* Settings Button */}
          <div className="px-3 pb-2 shrink-0">
            <Button
              variant="ghost"
              onClick={() => navigate(`/groups/${id}/settings`)}
              className="w-full"
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </aside>

        {/* Desktop: Welcome/Empty State */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-6">
            <div className="mx-auto w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Hash className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold mb-2">Select a Channel</h2>
            <p className="text-gray-600 mb-4">
              Choose a channel from the sidebar to start chatting
            </p>
            {channels.length === 0 && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Channel
              </Button>
            )}
          </div>
        </div>

        {/* Mobile View */}
        <div className="flex-1 flex flex-col md:hidden bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              {/* Server Menu Button */}
              <Sheet open={showServerSheet} onOpenChange={setShowServerSheet}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 flex flex-col">
                  <SheetHeader className="p-4 border-b shrink-0">
                    <SheetTitle>Your Servers</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {groupInfos.map((group) => (
                      <button
                        key={group.groupId}
                        onClick={() => handleSelectGroup(group.groupId)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${group.groupId === Number(id)
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-gray-100"
                          }`}
                      >
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${group.groupId === Number(id) ? "bg-primary-foreground/20" : "bg-gray-200"
                          }`}>
                          <span className="font-semibold text-sm">
                            {group.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium truncate">{group.name}</span>
                      </button>
                    ))}
                    <Button
                      onClick={() => {
                        setShowServerSheet(false)
                        navigate("/groups/create")
                      }}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Server
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <h1 className="font-semibold text-lg truncate">
                {groupInfo?.name || `Group #${id}`}
              </h1>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/groups/${id}/settings`)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Text Channels */}
            {textChannels.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2 px-2">
                  Text Channels
                </h2>
                <div className="space-y-1">
                  {textChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleSelectChannel(channel.id)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 transition group"
                    >
                      <Hash className="h-5 w-5 text-gray-500 shrink-0" />
                      <span className="font-medium truncate">{channel.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Voice Channels */}
            {voiceChannels.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-semibold uppercase text-gray-500 mb-2 px-2">
                  Voice Channels
                </h2>
                <div className="space-y-1">
                  {voiceChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleSelectChannel(channel.id)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-100 transition group"
                    >
                      <Volume2 className="h-5 w-5 text-gray-500 shrink-0" />
                      <span className="font-medium truncate">{channel.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Create Channel Button */}
            <div className="mt-4">
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="w-full"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Channel
              </Button>
            </div>

            {/* No Channels */}
            {channels.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Hash className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2">No channels yet</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create your first channel to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Channel Dialog */}
      <CreateChannelDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        groupId={Number(id)}
        onSuccess={handleCreateSuccess}
      />
    </DashboardLayout>
  )
}
