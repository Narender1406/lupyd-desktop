"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EncryptionPlugin } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { protos } from "firefly-client-js"
import { useState } from "react"

interface CreateChannelDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    groupId: number
    onSuccess?: () => void
}

export function CreateChannelDialog({ open, onOpenChange, groupId, onSuccess }: CreateChannelDialogProps) {
    const [name, setName] = useState("")
    const [channelType, setChannelType] = useState<"1" | "2">("1") // 1 = text, 2 = voice
    const [creating, setCreating] = useState(false)

    const handleCreate = async () => {
        if (!name.trim()) return

        setCreating(true)
        try {


            const extensionB64 = await EncryptionPlugin.getGroupExtension({ groupId })
            const extension = protos.FireflyGroupExtension.decode(fromBase64(extensionB64.resultB64))

            const channelId = extension.channels.reduce((max, channel) => Math.max(max, channel.id), 0) + 1


            await EncryptionPlugin.updateGroupChannel({
                groupId,
                id: channelId,
                delete: false,
                name: name.trim(),
                channelTy: Number(channelType),
                defaultPermissions: 0, // Default permissions
            })            

            // Reset form
            setName("")
            setChannelType("1")
            onOpenChange(false)

            // Call success callback to refresh data
            if (onSuccess) {
                setTimeout(onSuccess, 500) // Small delay to allow backend to process
            }
        } catch (error) {
            console.error("Failed to create channel:", error)
            alert("Failed to create channel. Please try again.")
        } finally {
            setCreating(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                    <DialogDescription>
                        Add a new channel to your server. Choose between text and voice channels.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Channel Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="general"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !creating) {
                                    handleCreate()
                                }
                            }}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="type">Channel Type</Label>
                        <Select value={channelType} onValueChange={(v) => setChannelType(v as "1" | "2")}>
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">💬 Text Channel</SelectItem>
                                <SelectItem value="2">🔊 Voice Channel</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={creating}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={!name.trim() || creating}>
                        {creating ? "Creating..." : "Create Channel"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
