"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

type RoleKey = "owner" | "admin" | "moderator" | "member" | "guest"
type PermissionKey =
  | "viewChannel"
  | "sendMessages"
  | "manageMessages"
  | "attachFiles"
  | "pinMessages"
  | "createThreads"
  | "manageChannel"
  | "manageRoles"
type OverrideValue = "inherit" | "allow" | "deny"

export function ChannelPermissions({
  roles = [],
  permissions = [],
  overrides = { owner: {}, admin: {}, moderator: {}, member: {}, guest: {} },
  onChange,
}: {
  roles: { id: RoleKey; name: string; description?: string }[]
  permissions: PermissionKey[]
  overrides: Record<RoleKey, Partial<Record<PermissionKey, OverrideValue>>>
  onChange?: (roleId: RoleKey, perm: PermissionKey, value: OverrideValue) => void
}) {
  const [role, setRole] = useState<RoleKey>(roles[0]?.id ?? "owner")

  const legend = useMemo(
    () => ({
      inherit: { label: "Inherit", className: "bg-gray-100 text-gray-800" },
      allow: { label: "Allow", className: "bg-green-600 text-white" },
      deny: { label: "Deny", className: "bg-red-600 text-white" },
    }),
    [],
  )

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Permissions</span>
          <Select value={role} onValueChange={(v: RoleKey) => setRole(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Badge variant="secondary" className="text-xs">
            Inherit = use group default
          </Badge>
          <Badge className="text-xs bg-green-600">Allow</Badge>
          <Badge className="text-xs bg-red-600">Deny</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {permissions.map((perm) => {
          const val: OverrideValue = (overrides?.[role]?.[perm] ?? "inherit") as OverrideValue
          return (
            <div key={perm} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium capitalize">{humanize(perm)}</p>
                <p className="text-xs text-muted-foreground">{permDesc(perm)}</p>
              </div>
              <Select value={val} onValueChange={(v: OverrideValue) => onChange?.(role, perm, v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inherit">Inherit</SelectItem>
                  <SelectItem value="allow">Allow</SelectItem>
                  <SelectItem value="deny">Deny</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function humanize(k: string) {
  return k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
}

function permDesc(perm: PermissionKey) {
  switch (perm) {
    case "viewChannel":
      return "Can view this channel"
    case "sendMessages":
      return "Can send messages in this channel"
    case "manageMessages":
      return "Can delete and manage others' messages"
    case "attachFiles":
      return "Can upload files and images"
    case "pinMessages":
      return "Can pin messages in this channel"
    case "createThreads":
      return "Can create threads from messages"
    case "manageChannel":
      return "Can rename, archive, or delete this channel"
    case "manageRoles":
      return "Can update role permissions"
    default:
      return ""
  }
}
