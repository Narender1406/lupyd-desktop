"use client"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { GroupWorkspacePane } from "@/components/groups/groups-workspace-pane"

import { ChannelChat } from "@/components/groups/channel-chat"
import { ChannelList } from "@/components/groups/channel-list"
import { UserAvatar } from "@/components/user-avatar"
import { useAuth } from "@/context/auth-context"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import { ArrowLeft, Settings } from "lucide-react"




export default function GroupWorkspaceRoutePage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [groupInfo, setGroupInfo] = useState<BGroupInfo | undefined>(undefined)

  const auth = useAuth()

  const [extension, setExtension] = useState<protos.FireflyGroupExtension | undefined>(undefined)

  useEffect(() => {

    EncryptionPlugin.getGroupInfoAndExtension({ groupId: Number(id) }).then((result) => {
      setGroupInfo(result)
      setExtension(protos.FireflyGroupExtension.decode(fromBase64(result.extensionB64)))
    })

  }, [])

  const currenRole = useMemo(() => {

    if (!auth.username) {
      return
    }

    if (!extension) {
      return
    }

    const member = extension.members.find(e => e.username == auth.username)

    if (!member) {
      return
    }

    const role = extension.roles.find(e => e.id == member.role)

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
    const params = new URLSearchParams(window.location.search)
    const c = params.get("c")
    if (c && extension && extension.channels.some((ch) => ch.id === Number(c))) setSelectedChannelId(Number(c))
  }, [window.location.search, extension])

  // write ?c= to URL
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("c", selectedChannelId.toString())
    window.history.replaceState({}, "", url.toString())
  }, [selectedChannelId])

  const selectedChannel = useMemo(() => extension?.channels.find(e => e.id == selectedChannelId), [extension, selectedChannelId])

  const addChannel = () => {
    // const idSafe = newChannelName.trim().toLowerCase().replace(/\s+/g, "-")
    // if (!idSafe || channels.some((c) => c.id === idSafe)) return
    // const newCh: Channel = {
    //   id: idSafe,
    //   name: idSafe,
    //   topic: "",
    //   isPrivate: newChannelPrivate,
    //   category: newChannelCategory || "Text",
    //   slowMode: false,
    // }
    // setChannels((prev) => [...prev, newCh])
    // setCreating(false)
    // setNewChannelName("new-channel")
    // setNewChannelPrivate(false)
    // setNewChannelCategory("Text")
    // setSelectedChannelId(newCh.id)
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
      <GroupWorkspacePane groupId={Number(id)} groupName={groupInfo?.name ?? ""}>
        <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-88px)] -m-4 md:-m-6">
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
          <div className="md:hidden flex flex-col w-full">
            <div className="border-b p-3 flex items-center justify-between gap-2">
              <Button variant="outline" className="bg-transparent" onClick={() => navigate("/groups")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Groups
              </Button>
              <select value={selectedChannelId} onChange={(e) => setSelectedChannelId(Number(e.target.value))}>
                {extension?.channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {`# ${ch.name}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Center: Chat */}
          <section className="flex-1 flex flex-col bg-white">
            {/* Channel header */}
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {"#"}
                <h1 className="font-semibold truncate">{selectedChannel?.name || "channel"}</h1>
              </div>
            </div>

            {/* Chat content */}
            {
              (extension && groupInfo) && (
                <ChannelChat channelId={selectedChannelId} extension={extension} groupId={groupInfo.groupId} />
              )
            }

            {/* Composer */}
            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <input placeholder={`Message #${selectedChannel?.name}`} className="bg-gray-100 border-none" />
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
                      {extension?.members.map((m) => (
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
      </GroupWorkspacePane>
    </DashboardLayout>
  )

  function roleFromRoleId(id: number) {
    return extension?.roles.find(r => r.id == id)
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
