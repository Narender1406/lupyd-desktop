"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Lock, Globe, Search, Menu, Plus, Settings } from "lucide-react"
import { GroupWorkspacePane } from "@/components/groups/groups-workspace-pane"

type GroupItem = {
  id: string
  name: string
  description: string
  members: number
  isPrivate?: boolean
  cover?: string
  tags?: string[]
}

// Demo groups
const GROUPS: GroupItem[] = [
  {
    id: "1",
    name: "Design Enthusiasts",
    description: "Share design ideas, get feedback, and collaborate.",
    members: 1284,
    isPrivate: false,
    cover: "/cover-design-enthusiasts.jpg",
    tags: ["Design", "UI/UX", "Feedback"],
  },
  {
    id: "2",
    name: "Engineering Hub",
    description: "PR reviews, deployments, and tech talks.",
    members: 983,
    isPrivate: true,
    cover: "/cover-engineering-hub.jpg",
    tags: ["Dev", "Releases", "Code"],
  },
  {
    id: "3",
    name: "Creators Lounge",
    description: "Content, strategy, collabs and growth.",
    members: 2540,
    isPrivate: false,
    cover: "/cover-creators-lounge.jpg",
    tags: ["Content", "Growth", "Strategy"],
  },
  {
    id: "4",
    name: "Product Squad",
    description: "Roadmap, discovery, testing and PM syncs.",
    members: 642,
    isPrivate: true,
    cover: "/cover-product-squad.jpg",
    tags: ["Roadmap", "PM", "Testing"],
  },
]

export default function GroupsPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState("")
  const [selectedGroupId, setSelectedGroupId] = useState<string>(GROUPS[0].id)
  const [openSheet, setOpenSheet] = useState(false)

  // Deep link: read ?g= from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const g = params.get("g")
    if (g && GROUPS.some((gr) => gr.id === g)) {
      setSelectedGroupId(g)
    }
  }, [])

  // Keep ?g= in URL
  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set("g", selectedGroupId)
    window.history.replaceState({}, "", url.toString())
  }, [selectedGroupId])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return GROUPS
    return GROUPS.filter(
      (g) =>
        g.name.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term) ||
        (g.tags || []).some((t) => t.toLowerCase().includes(term)),
    )
  }, [q])

  const selectedGroup = GROUPS.find((g) => g.id === selectedGroupId) || GROUPS[0]

  const GroupRailButton = ({ g }: { g: GroupItem }) => {
    const isActive = g.id === selectedGroupId
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              key={g.id}
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden transition-all hover:rounded-xl ${
                isActive ? "ring-2 ring-black" : "ring-1 ring-transparent"
              }`}
              onClick={() => setSelectedGroupId(g.id)}
              aria-label={`Open ${g.name}`}
            >
              {g.cover ? (
                <img
                  src={g.cover || "/placeholder.svg"}
                  alt={g.name}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              ) : (
                <div className="h-full w-full grid place-items-center bg-muted/40 text-sm font-semibold">
                  {g.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              {g.isPrivate ? (
                <span className="absolute bottom-0 right-0 m-1">
                  <Lock className="h-3 w-3 text-white drop-shadow" />
                </span>
              ) : null}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            <div className="text-sm">{g.name}</div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const GroupListItem = ({ g }: { g: GroupItem }) => (
    <button
      key={g.id}
      className={`w-full text-left rounded-md p-2 hover:bg-gray-100 transition ${
        g.id === selectedGroupId ? "bg-gray-100" : ""
      }`}
      onClick={() => {
        setSelectedGroupId(g.id)
        setOpenSheet(false)
      }}
    >
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md overflow-hidden bg-muted/40">
          {g.cover ? (
            <img src={g.cover || "/placeholder.svg"} alt={g.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-xs font-semibold">
              {g.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold truncate">{g.name}</span>
            {g.isPrivate ? (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <Lock className="h-3 w-3" /> Private
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] gap-1">
                <Globe className="h-3 w-3" /> Public
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Users className="h-3 w-3" />
            {g.members.toLocaleString()}
          </div>
        </div>
      </div>
    </button>
  )

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
            {filtered.map((g) => (
              <GroupRailButton key={g.id} g={g} />
            ))}
            {filtered.length === 0 && (
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
                <div className="p-2 space-y-1 overflow-y-auto">
                  {filtered.map((g) => (
                    <GroupListItem key={g.id} g={g} />
                  ))}
                  {filtered.length === 0 && (
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

        {/* Workspace */}
        <div className="w-full md:flex-1 min-w-0">
          <GroupWorkspacePane groupId={selectedGroup.id} groupName={selectedGroup.name} />
        </div>
      </div>
    </DashboardLayout>
  )
}
