"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EncryptionPlugin, type UpdateUserProposal } from "@/context/encryption-plugin"
import { toast } from "@/hooks/use-toast"
import type { GroupRole } from "@/types/permission-types"
import { useState } from "react"

interface MemberRoleSelectorProps {
    groupId: number
    username: string
    currentRoleId: number
    roles: GroupRole[]
    canManageMembers: boolean
    onRoleChanged: () => void
}

export function MemberRoleSelector({
    groupId,
    username,
    currentRoleId,
    roles,
    canManageMembers,
    onRoleChanged,
}: MemberRoleSelectorProps) {
    const [isChanging, setIsChanging] = useState(false)

    const handleRoleChange = async (newRoleId: string) => {
        if (!canManageMembers) {
            toast({
                title: "Permission denied",
                description: "You don't have permission to change member roles.",
                variant: "destructive",
            })
            return
        }

        setIsChanging(true)
        try {
            const proposal: UpdateUserProposal = {
                username,
                roleId: Number(newRoleId),
            }

            await EncryptionPlugin.updateGroupUsers({
                groupId,
                users: [proposal],
            })

            toast({
                title: "Role updated",
                description: `${username}'s role has been updated.`,
            })

            onRoleChanged()
        } catch (error) {
            console.error("Failed to update member role:", error)
            toast({
                title: "Error",
                description: "Failed to update role. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsChanging(false)
        }
    }

    const currentRole = roles.find(r => r.id === currentRoleId)

    if (!canManageMembers) {
        return (
            <span className="text-sm text-muted-foreground">
                {currentRole?.name || "Unknown role"}
            </span>
        )
    }

    return (
        <Select
            value={currentRoleId.toString()}
            onValueChange={handleRoleChange}
            disabled={isChanging}
        >
            <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
