import type { protos } from "firefly-client-js"

/**
 * Backend permission bitfield flags
 * These match the backend permission model exactly
 */
export enum GroupPermission {
    ViewChannel = 1,
    AddMessage = 4,
    ManageChannel = 8,
    ManageRole = 16,
    ManageMember = 32,
}

/**
 * Permission checking utilities
 */
export function hasPermission(userPermissions: number, required: GroupPermission): boolean {
    return (userPermissions & required) === required
}

export function addPermission(current: number, permission: GroupPermission): number {
    return current | permission
}

export function removePermission(current: number, permission: GroupPermission): number {
    return current & ~permission
}

export function togglePermission(current: number, permission: GroupPermission): number {
    return current ^ permission
}

/**
 * Get all permissions as an array
 */
export function getAllPermissions(): GroupPermission[] {
    return [
        GroupPermission.ViewChannel,
        GroupPermission.AddMessage,
        GroupPermission.ManageChannel,
        GroupPermission.ManageRole,
        GroupPermission.ManageMember,
    ]
}

/**
 * Get human-readable permission name
 */
export function getPermissionLabel(permission: GroupPermission): string {
    switch (permission) {
        case GroupPermission.ViewChannel:
            return "View Channel"
        case GroupPermission.AddMessage:
            return "Send Messages"
        case GroupPermission.ManageChannel:
            return "Manage Channel"
        case GroupPermission.ManageRole:
            return "Manage Roles"
        case GroupPermission.ManageMember:
            return "Manage Members"
        default:
            return "Unknown"
    }
}

/**
 * Get permission description
 */
export function getPermissionDescription(permission: GroupPermission): string {
    switch (permission) {
        case GroupPermission.ViewChannel:
            return "Can view and access this channel"
        case GroupPermission.AddMessage:
            return "Can send messages in this channel"
        case GroupPermission.ManageChannel:
            return "Can edit channel settings, delete messages, and manage channel"
        case GroupPermission.ManageRole:
            return "Can create, edit, and delete roles"
        case GroupPermission.ManageMember:
            return "Can add, remove, and change member roles"
        default:
            return ""
    }
}

/**
 * Role type from backend
 */
export interface GroupRole {
    id: number
    name: string
    permissions: number
    color?: string
}

/**
 * Member type from backend
 */
export interface GroupMember {
    username: string
    role: number // role ID
}

/**
 * Get all permissions that a role has
 */
export function getRolePermissions(role: GroupRole): GroupPermission[] {
    return getAllPermissions().filter(p => hasPermission(role.permissions, p))
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(role: GroupRole, permission: GroupPermission): boolean {
    return hasPermission(role.permissions, permission)
}
