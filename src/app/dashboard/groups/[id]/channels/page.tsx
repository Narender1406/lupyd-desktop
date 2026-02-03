"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ChannelChat } from "@/components/groups/channel-chat"
import { Button } from "@/components/ui/button"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import { ArrowLeft, Hash } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

export default function GroupChannelChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [groupInfo, setGroupInfo] = useState<BGroupInfo | undefined>(undefined)
  const [extension, setExtension] = useState<protos.FireflyGroupExtension | undefined>(undefined)
  const [selectedChannelId, setSelectedChannelId] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  // Load group data
  useEffect(() => {
    if (!id) return

    setLoading(true)

    EncryptionPlugin.getGroupInfoAndExtension({ groupId: Number(id) })
      .then((result) => {
        setGroupInfo(result)

        const ext = protos.FireflyGroupExtension.decode(fromBase64(result.extensionB64))
        setExtension(ext)

        // Get channel ID from URL
        const params = new URLSearchParams(window.location.search)
        const c = params.get("c")

        if (c) {
          setSelectedChannelId(Number(c))
        } else if (ext.channels && ext.channels.length > 0) {
          setSelectedChannelId(ext.channels[0].id)
        }

        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to load group data:", error)
        setLoading(false)
      })
  }, [id])

  const channels = useMemo(() => extension?.channels || [], [extension])

  const selectedChannel = useMemo(
    () => channels.find((c) => c.id === selectedChannelId),
    [channels, selectedChannelId]
  )

  const handleBack = () => {
    navigate(`/groups/${id}`)
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-130px)] md:h-[calc(100vh-88px)] -m-4 md:-m-6">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-white shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Hash className="h-5 w-5 text-gray-500 shrink-0" />
            <h1 className="font-semibold text-base truncate">
              {selectedChannel?.name || "channel"}
            </h1>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden bg-gray-50">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Loading channel...</p>
            </div>
          ) : selectedChannelId && id ? (
            <ChannelChat channelId={selectedChannelId} groupId={Number(id)} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-2">No channel selected</p>
                <Button onClick={handleBack}>Go Back</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
