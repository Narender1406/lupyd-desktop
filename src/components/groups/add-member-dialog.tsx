"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { EncryptionPlugin } from "@/context/encryption-plugin"
import { toast } from "@/hooks/use-toast"
import type { GroupRole } from "@/types/permission-types"
import { UserPlus } from "lucide-react"
import { useState } from "react"

interface AddMemberDialogProps {
    groupId: number
    roles: GroupRole[]
    onMemberAdded: () => void
    canManageMembers: boolean
    trigger?: React.ReactNode
}

export function AddMemberDialog({
    groupId,
    roles,
    onMemberAdded,
    canManageMembers,
    trigger,
}: AddMemberDialogProps) {
    const [open, setOpen] = useState(false)
    const [username, setUsername] = useState("")
    const [selectedRoleId, setSelectedRoleId] = useState<string>("")
    const [isAdding, setIsAdding] = useState(false)

    const handleAddMember = async () => {
        if (!username.trim()) {
            toast({
                title: "Error",
                description: "Username is required",
                variant: "destructive",
            })
            return
        }

        if (!selectedRoleId) {
            toast({
                title: "Error",
                description: "Please select a role",
                variant: "destructive",
            })
            return
        }

        setIsAdding(true)
        try {
            await EncryptionPlugin.addGroupMember({
                groupId,
                username: username.trim(),
                roleId: Number(selectedRoleId),
            })

            toast({
                title: "Member added",
                description: `${username} has been added to the group.`,
            })

            setUsername("")
            setSelectedRoleId("")
            setOpen(false)
            onMemberAdded()
        } catch (error) {
            console.error("Failed to add member:", error)
            toast({
                title: "Error",
                description: "Failed to add member. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsAdding(false)
        }
    }

    if (!canManageMembers) {
        return null
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Member</DialogTitle>
                    <DialogDescription>
                        Add a new member to this group and assign them a role.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            autoComplete="off"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id.toString()}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {roles.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No roles available. Create a role first.
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isAdding}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddMember}
                        disabled={isAdding || !username.trim() || !selectedRoleId || roles.length === 0}
                        className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300"
                    >
                        {isAdding ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Member
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
