"use client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"



import { ChannelChat } from "@/components/groups/channel-chat"
import { ChannelList } from "@/components/groups/channel-list"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/context/auth-context"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import { ArrowLeft, Menu, Settings } from "lucide-react"




export default function GroupWorkspaceRoutePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [groupInfo, setGroupInfo] = useState<BGroupInfo | undefined>(undefined)

  const auth = useAuth()

  const [extension, setExtension] = useState<protos.FireflyGroupExtension | undefined>(undefined)

  useEffect(() => {
    if (!id) return;
    setGroupInfo(undefined) // clear previous info
    setExtension(undefined) // clear previous extension

    EncryptionPlugin.getGroupInfoAndExtension({ groupId: Number(id) }).then((result) => {
      setGroupInfo(result)
      setExtension(protos.FireflyGroupExtension.decode(fromBase64(result.extensionB64)))
    })

  }, [id])

  const currenRole = useMemo(() => {

    if (!auth.username) {
      return
    }

    if (!extension) {
      return
    }

    const member = extension.members?.find(e => e.username == auth.username)

    if (!member) {
      return
    }

    const role = extension.roles?.find(e => e.id == member.role)

    return role
  }, [auth, extension])


  const [selectedChannelId, setSelectedChannelId] = useState<number>(0)
  const [filter, setFilter] = useState("")
  const [creating, setCreating] = useState(false)
  const [newChannelName, setNewChannelName] = useState("new-channel")
  const [newChannelPrivate, setNewChannelPrivate] = useState(false)
  const [newChannelCategory, setNewChannelCategory] = useState<string>("Text")


  // read ?c= from location
  useEffect(() => {
    if (!extension) return
    const channels = extension.channels ?? []
    if (channels.length === 0) return

    const params = new URLSearchParams(window.location.search)
    const c = params.get("c")

    if (c && channels.some((ch: any) => ch.id === Number(c))) {
      setSelectedChannelId(Number(c))
    } else if (selectedChannelId === 0 || !channels.some((ch: any) => ch.id === selectedChannelId)) {
      // Select first channel (prefer Text type if possible, otherwise first)
      // types: 1=Text, 2=Voice.
      const defaultChannel = channels.find((ch: any) => ch.type === 1) || channels[0]
      if (defaultChannel) {
        setSelectedChannelId(defaultChannel.id)
      }
    }
  }, [extension])

  // write ?c= to URL
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("c", selectedChannelId.toString())
    window.history.replaceState({}, "", url.toString())
  }, [selectedChannelId])

  const selectedChannel = useMemo(() => extension?.channels?.find((e: any) => e.id == selectedChannelId), [extension, selectedChannelId])

  const addChannel = async () => {
    if (!newChannelName.trim()) return
    // Simple random ID generation for new channel
    const newId = Math.floor(Math.random() * 1000000)

    try {
      console.log("extension: ", JSON.stringify(extension, undefined, " "))
      let channelId = 1
      if (extension?.channels && extension.channels.length > 0) {
        channelId = extension.channels[extension.channels.length - 1].id + 1
      }
      
      const payload = {
        groupId: Number(id),
        id: channelId, // Try 0 to see if backend auto-assigns
        delete: false,
        name: newChannelName.trim(),
        channelTy: newChannelCategory === "Voice" ? 2 : 1,
        defaultPermissions: 4 // AddMessage Permission is 4
      }
      console.log("DEBUG: Calling updateGroupChannel with:", JSON.stringify(payload, null, 2))

      await EncryptionPlugin.updateGroupChannel(payload)

      // Refresh extension to show new channel
      // We might need a small delay or retry as consistency might not be instant
      // But for now just re-fetch
      setTimeout(() => {
        EncryptionPlugin.getGroupInfoAndExtension({ groupId: Number(id) }).then((result) => {
          setGroupInfo(result)
          setExtension(protos.FireflyGroupExtension.decode(fromBase64(result.extensionB64)))
        })
      }, 500)

      setCreating(false)
      setNewChannelName("new-channel")
      setNewChannelPrivate(false)
      setNewChannelCategory("Text")

      // Optionally select the new channel? 
      // setSelectedChannelId(newId) 
    } catch (e) {
      console.error("Failed to create channel", e)
    }
  }

  const updateChannel = (patch: any) => {
    // setChannels((prev) => prev.map((c) => (c.id === selectedChannelId ? { ...c, ...patch } : c)))
  }

  if (!id) return null

  return (
    <DashboardLayout>
      <div className="mb-3 flex items-center justify-between" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
        <Button variant="outline" className="bg-transparent" onClick={() => navigate("/groups")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          All Groups
        </Button>
        <Button
          variant="outline"
          className="bg-transparent"
          onClick={() => navigate(`/groups/${id}/settings`)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
      <div className="w-full h-full">
        {/* On mobile: no negative margins, flex col. Desktop: negative margins to bleed to edges */}
        <div className="flex flex-col h-[calc(100vh-80px)] md:py-0 md:h-[calc(100vh-88px)] md:-m-6 md:flex-row">
          {/* Left: Channel list (Desktop) */}
          <aside className="hidden md:flex w-72 flex-col border-r bg-white">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <p className="font-semibold truncate">{groupInfo?.name}</p>
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
                    <option value="Voice">Voice</option>
                  </select>
                </div>
                <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={addChannel}>
                  Create Channel
                </Button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <ChannelList
                channels={extension?.channels ?? []}
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

          {/* Top (Mobile): Quick header with channel selector */}
          <div className="md:hidden flex flex-col w-full bg-white border-b sticky top-0 z-10">
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate("/groups")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2 max-w-[200px]">
                      <span className="truncate"># {selectedChannel?.name || "Select Channel"}</span>
                      <Menu className="h-4 w-4 ml-1 opacity-50" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 bg-white dark:bg-black">
                    <SheetHeader className="p-4 border-b text-left">
                      <SheetTitle>{groupInfo?.name}</SheetTitle>
                    </SheetHeader>
                    <div className="h-full overflow-y-auto pb-6">
                      {/* Re-use channel list logic or component */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-muted-foreground">Channels</span>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setCreating(v => !v)}>+</Button>
                        </div>

                        {creating && (
                          <div className="pb-3 space-y-2 border-b mb-3">
                            <input
                              type="text"
                              value={newChannelName}
                              onChange={(e) => setNewChannelName(e.target.value)}
                              placeholder="channel-name"
                              className="w-full p-2 text-sm border rounded"
                            />
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Private</span>
                              <select
                                value={newChannelPrivate ? "yes" : "no"}
                                onChange={(e) => setNewChannelPrivate(e.target.value === "yes")}
                                className="p-1 text-sm border rounded"
                              >
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                              </select>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Category</span>
                              <select
                                value={newChannelCategory}
                                onChange={(e) => setNewChannelCategory(e.target.value)}
                                className="p-1 text-sm border rounded flex-1"
                              >
                                <option value="Text">Text</option>
                                <option value="Voice">Voice</option>
                              </select>
                            </div>
                            <Button className="w-full bg-black text-white hover:bg-gray-800 h-8 text-xs" onClick={addChannel}>
                              Create Channel
                            </Button>
                          </div>
                        )}
                        <ChannelList
                          channels={extension?.channels ?? []}
                          filter={""}
                          selectedId={selectedChannelId}
                          onSelect={(id) => {
                            setSelectedChannelId(id)
                            // Close sheet? ideally yes but controlled sheet is complex here without extra state. 
                            // User can just swipe away or click backdrop.
                          }}
                        />
                        <div className="mt-4 pt-4 border-t">
                          <Button variant="ghost" className="w-full justify-start px-2" onClick={() => navigate(`/groups/${id}/settings`)}>
                            <Settings className="h-4 w-4 mr-2" />
                            Group Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {/* Center: Chat */}
          <section className="flex-1 flex flex-col bg-white">
            {/* Desktop Channel header */}
            <div className="hidden md:flex border-b px-4 py-3 items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {"#"}
                <h1 className="font-semibold truncate">{selectedChannel?.name || "channel"}</h1>
              </div>
            </div>

            {/* Chat content */}
            {/* Chat content usually */}
            <div className="flex-1 overflow-hidden relative">
              {(!extension?.channels || extension.channels.length === 0) ? (
                <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Settings className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Channels Created</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm">
                    This group doesn't have any channels yet. Create one to start communicating.
                  </p>
                  <Button onClick={() => setCreating(true)}>
                    Create First Channel
                  </Button>
                </div>
              ) : (
                (extension && groupInfo) && (
                  <ChannelChat channelId={selectedChannelId} groupId={groupInfo.groupId} />
                )
              )}
            </div>

            {/* Composer */}
            <div className="border-t bg-white dark:bg-black hidden md:block p-3">
              {/* Desktop composer is handled by ChannelChat currently? No, ChannelChat handles it. */}
              {/* Wait, ChannelChat HAS an inline composer for mobile, but desktop layout here adds another one? */}
              {/* Looking at lines 274-279 in original, it has a dummy composer. Removing it since ChannelChat has one. */}
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
                      {"# "} {selectedChannel?.name}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Privacy</span>
                      <span className="text-xs">{"Public"}</span>
                    </div>
                    <div className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="text-xs">{channelTypeToText(selectedChannel?.type ?? 0)}</span>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground mb-2">Members</div>
                    <div className="space-y-2">
                      {extension?.members?.map((m: any) => (
                        <div key={m.username} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar username={m.username} />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground truncate">{m.username}</p>
                            </div>
                          </div>
                          <span className="text-xs capitalize">{roleFromRoleId(m.role)?.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects 
              <div className="flex-1 overflow-y-auto p-4">
                <ChannelProjects members={extension?.members ?? []} />
              </div>
              */}
            </div>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  )

  function roleFromRoleId(id: number) {
    return extension?.roles?.find((r: any) => r.id == id)
  }
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
