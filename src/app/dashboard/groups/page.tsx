"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { Menu, Plus, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function GroupsPage() {
  const navigate = useNavigate()
  const [groupInfos, setGroupInfos] = useState<BGroupInfo[]>([])
  const [showServerSheet, setShowServerSheet] = useState(false)

  // Load all groups
  useEffect(() => {
    EncryptionPlugin.getGroupInfos().then(({ result }) => {
      setGroupInfos(result)
    })
  }, [])

  const handleSelectGroup = (groupId: number) => {
    setShowServerSheet(false)
    navigate(`/groups/${groupId}`)
  }

  const handleCreateGroup = () => {
    setShowServerSheet(false)
    navigate("/groups/create")
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-65px)] -m-4 md:-m-6">
        {/* Desktop: Server Rail Sidebar */}
        <aside className="hidden md:flex flex-col gap-3 items-center py-3 w-[72px] shrink-0 bg-gray-50 border-r overflow-y-auto">
          {/* Create Group Button */}
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="h-12 w-12 grid place-items-center rounded-2xl bg-gray-200 hover:bg-green-600 hover:text-white hover:rounded-xl transition-all text-green-600"
                  onClick={handleCreateGroup}
                  aria-label="Create group"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div className="text-sm">Create Group</div>
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
                    className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white hover:rounded-xl hover:bg-primary hover:text-primary-foreground transition-all border"
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

        {/* Mobile: Header with Server Menu */}
        <div className="flex-1 flex flex-col md:hidden">
          <div className="flex items-center justify-between p-3 border-b bg-white">
            <div className="flex items-center gap-2">
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
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition"
                      >
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center shrink-0">
                          <span className="font-semibold text-sm">
                            {group.name.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium truncate">{group.name}</span>
                      </button>
                    ))}
                    <Button
                      onClick={handleCreateGroup}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Server
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <span className="font-semibold">Groups</span>
            </div>
          </div>

          {/* Welcome Screen */}
          <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
            <div className="text-center max-w-sm">
              <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">Welcome to Groups</h2>
              <p className="text-gray-600 mb-4">
                Select a server from the menu to start chatting, or create a new one.
              </p>
              <Button onClick={() => setShowServerSheet(true)}>
                Open Server List
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop: Welcome Screen */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center max-w-md px-6 py-12">
            <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <Users className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Welcome to Groups</h2>
            <p className="text-gray-600 mb-8">
              Select a server from the sidebar to start chatting, or create a new one.
            </p>
            <Button size="lg" onClick={handleCreateGroup}>
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Server
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
