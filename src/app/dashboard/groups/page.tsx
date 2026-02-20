"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { Plus, Trash2, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "@/hooks/use-toast"

export default function GroupsPage() {
  const navigate = useNavigate()
  const [groupInfos, setGroupInfos] = useState<BGroupInfo[]>([])

  // Load all groups
  const loadGroups = () => {
    EncryptionPlugin.getGroupInfos().then(({ result }) => {
      setGroupInfos(result)
    })
  }

  useEffect(() => {
    loadGroups()

    // Listen for groups-updated event
    const handleGroupsUpdated = () => {
      loadGroups()
    }

    window.addEventListener("groups-updated", handleGroupsUpdated)
    return () => window.removeEventListener("groups-updated", handleGroupsUpdated)
  }, [])

  const handleSelectGroup = (groupId: number) => {
    navigate(`/groups/${groupId}`)
  }

  const handleCreateGroup = () => {
    navigate("/groups/create")
  }

  const handleDeleteGroup = async (groupId: number, groupName: string) => {
    // TODO: Implement backend delete functionality
    // For now, show a toast message
    toast({
      title: "Delete Group",
      description: `Backend integration for deleting "${groupName}" is pending.`,
      variant: "destructive",
    })

    // When backend is ready, uncomment and implement:
    // try {
    //   await EncryptionPlugin.deleteGroup({ groupId })
    //   setGroupInfos(prev => prev.filter(g => g.groupId !== groupId))
    //   toast({
    //     title: "Group Deleted",
    //     description: `"${groupName}" has been deleted successfully.`,
    //   })
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to delete group",
    //     variant: "destructive",
    //   })
    // }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Your Groups</h1>
            <p className="text-muted-foreground mt-1">
              Manage and join group conversations
            </p>
          </div>
          <Button onClick={handleCreateGroup} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Groups List */}
        {groupInfos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Groups Yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first group to start collaborating with your team or community.
              </p>
              <Button onClick={handleCreateGroup}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {groupInfos.map((group) => (
              <Card
                key={group.groupId}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectGroup(group.groupId)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Group Icon */}
                      <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-xl font-bold text-primary">
                          {group.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>

                      {/* Group Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold mb-1">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {group.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteGroup(group.groupId, group.name)
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
