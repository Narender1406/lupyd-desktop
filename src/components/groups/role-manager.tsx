"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import type { UpdateRoleProposal } from "@/context/encryption-plugin"
import { EncryptionPlugin } from "@/context/encryption-plugin"
import {
    addPermission,
    getAllPermissions,
    getPermissionDescription,
    getPermissionLabel,
    GroupPermission,
    hasPermission,
    removePermission,
    type GroupRole
} from "@/types/permission-types"
import { Edit2, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface RoleManagerProps {
    groupId: number
    roles: GroupRole[]
    onUpdate: () => void
    canManageRoles: boolean
}

export function RoleManager({ groupId, roles, onUpdate, canManageRoles }: RoleManagerProps) {
    const [isCreating, setIsCreating] = useState(false)
    const [editingRole, setEditingRole] = useState<GroupRole | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const handleCreateRole = async (name: string, permissions: number) => {
        setIsSaving(true)
        try {
            // Find next available role ID
            const maxId = Math.max(...roles.map(r => r.id), 0)
            const newRoleId = maxId + 1

            const proposal: UpdateRoleProposal = {
                name,
                roleId: newRoleId,
                permissions,
                delete: false,
            }

            await EncryptionPlugin.updateGroupRoles({
                groupId,
                roles: [proposal],
            })

            toast({
                title: "Role created",
                description: `Role "${name}" has been created successfully.`,
            })

            setIsCreating(false)
            onUpdate()
        } catch (error) {
            console.error("Failed to create role:", error)
            toast({
                title: "Error",
                description: "Failed to create role. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleUpdateRole = async (roleId: number, name: string, permissions: number) => {
        setIsSaving(true)
        try {
            const proposal: UpdateRoleProposal = {
                name,
                roleId,
                permissions,
                delete: false,
            }

            await EncryptionPlugin.updateGroupRoles({
                groupId,
                roles: [proposal],
            })

            toast({
                title: "Role updated",
                description: `Role "${name}" has been updated successfully.`,
            })

            setEditingRole(null)
            onUpdate()
        } catch (error) {
            console.error("Failed to update role:", error)
            toast({
                title: "Error",
                description: "Failed to update role. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeleteRole = async (role: GroupRole) => {
        setIsSaving(true)
        try {
            const proposal: UpdateRoleProposal = {
                name: role.name,
                roleId: role.id,
                permissions: role.permissions,
                delete: true,
            }

            await EncryptionPlugin.updateGroupRoles({
                groupId,
                roles: [proposal],
            })

            toast({
                title: "Role deleted",
                description: `Role "${role.name}" has been deleted.`,
            })

            onUpdate()
        } catch (error) {
            console.error("Failed to delete role:", error)
            toast({
                title: "Error",
                description: "Failed to delete role. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (!canManageRoles) {
        return (
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Role Management</CardTitle>
                    <CardDescription>You don't have permission to manage roles</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="border-none shadow-sm">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Role Management</CardTitle>
                        <CardDescription>Create and manage custom roles with specific permissions</CardDescription>
                    </div>
                    <Dialog open={isCreating} onOpenChange={setIsCreating}>
                        <DialogTrigger asChild>
                            <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300">
                                <Plus className="h-4 w-4 mr-2" />
                                Create Role
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <RoleEditor
                                mode="create"
                                onSave={handleCreateRole}
                                onCancel={() => setIsCreating(false)}
                                isSaving={isSaving}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {roles.map(role => (
                        <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{role.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {getAllPermissions()
                                        .filter(p => hasPermission(role.permissions, p))
                                        .map(p => getPermissionLabel(p))
                                        .join(", ") || "No permissions"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <Dialog open={editingRole?.id === role.id} onOpenChange={(open) => !open && setEditingRole(null)}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingRole(role)}
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                        <RoleEditor
                                            mode="edit"
                                            initialRole={role}
                                            onSave={(name, permissions) => handleUpdateRole(role.id, name, permissions)}
                                            onCancel={() => setEditingRole(null)}
                                            isSaving={isSaving}
                                        />
                                    </DialogContent>
                                </Dialog>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteRole(role)}
                                    disabled={isSaving}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {roles.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No roles yet. Create your first role to get started.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

interface RoleEditorProps {
    mode: "create" | "edit"
    initialRole?: GroupRole
    onSave: (name: string, permissions: number) => void
    onCancel: () => void
    isSaving: boolean
}

function RoleEditor({ mode, initialRole, onSave, onCancel, isSaving }: RoleEditorProps) {
    const [name, setName] = useState(initialRole?.name || "")
    const [permissions, setPermissions] = useState(initialRole?.permissions || 0)

    const togglePermission = (permission: GroupPermission) => {
        if (hasPermission(permissions, permission)) {
            setPermissions(removePermission(permissions, permission))
        } else {
            setPermissions(addPermission(permissions, permission))
        }
    }

    const handleSubmit = () => {
        if (!name.trim()) {
            toast({
                title: "Error",
                description: "Role name is required",
                variant: "destructive",
            })
            return
        }
        onSave(name.trim(), permissions)
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>{mode === "create" ? "Create New Role" : "Edit Role"}</DialogTitle>
                <DialogDescription>
                    {mode === "create"
                        ? "Create a custom role with specific permissions"
                        : "Update role name and permissions"}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
                <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                        id="role-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Moderator, Editor, Viewer"
                        maxLength={50}
                    />
                </div>

                <div className="space-y-3">
                    <Label>Permissions</Label>
                    <div className="space-y-3">
                        {getAllPermissions().map(permission => (
                            <div key={permission} className="flex items-start gap-3 p-3 border rounded-lg">
                                <Switch
                                    id={`permission-${permission}`}
                                    checked={hasPermission(permissions, permission)}
                                    onCheckedChange={() => togglePermission(permission)}
                                />
                                <div className="flex-1 min-w-0">
                                    <Label
                                        htmlFor={`permission-${permission}`}
                                        className="font-medium cursor-pointer"
                                    >
                                        {getPermissionLabel(permission)}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {getPermissionDescription(permission)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={isSaving || !name.trim()}
                    className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-300"
                >
                    {isSaving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>{mode === "create" ? "Create Role" : "Save Changes"}</>
                    )}
                </Button>
            </DialogFooter>
        </>
    )
}
