import { useAuth } from "@/context/auth-context"
import { EncryptionPlugin } from "@/context/encryption-plugin"
import { fromBase64 } from "@/lib/utils"
import { GroupPermission, hasPermission, type GroupRole } from "@/types/permission-types"
import { protos } from "firefly-client-js"
import { useEffect, useMemo, useState } from "react"

/**
 * Hook for checking user permissions in a group
 */
export function useGroupPermissions(groupId: number) {
    const auth = useAuth()
    const [extension, setExtension] = useState<protos.FireflyGroupExtension | undefined>()
    const [loading, setLoading] = useState(true)

    // Load group extension
    useEffect(() => {
        if (!groupId) return

        setLoading(true)
        EncryptionPlugin.getGroupExtension({ groupId })
            .then(({ resultB64 }) => {
                const ext = protos.FireflyGroupExtension.decode(fromBase64(resultB64))
                setExtension(ext)
            })
            .catch(err => {
                console.error("Failed to load group extension:", err)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [groupId])

    // Find current user's member info
    const currentMember = useMemo(() => {
        if (!auth.username || !extension) return undefined
        return (extension.members as any)?.find((m: any) => m.username === auth.username)
    }, [auth.username, extension])

    // Find current user's role
    const currentRole = useMemo(() => {
        if (!currentMember || !extension) return undefined
        return (extension.roles as any)?.find((r: any) => r.id === currentMember.role)
    }, [currentMember, extension])

    // Permission checking function
    const checkPermission = useMemo(() => {
        return (permission: GroupPermission): boolean => {
            if (!currentRole) return false
            return hasPermission(currentRole.permissions, permission)
        }
    }, [currentRole])

    // Convenience permission flags
    const canViewChannel = checkPermission(GroupPermission.ViewChannel)
    const canSendMessages = checkPermission(GroupPermission.AddMessage)
    const canManageChannels = checkPermission(GroupPermission.ManageChannel)
    const canManageRoles = checkPermission(GroupPermission.ManageRole)
    const canManageMembers = checkPermission(GroupPermission.ManageMember)

    return {
        loading,
        extension,
        currentMember,
        currentRole,
        hasPermission: checkPermission,
        canViewChannel,
        canSendMessages,
        canManageChannels,
        canManageRoles,
        canManageMembers,
    }
}
