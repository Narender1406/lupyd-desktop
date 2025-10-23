"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type RoleKey = "owner" | "admin" | "moderator" | "member" | "guest"
export type PermissionKey =
  | "viewChannel"
  | "sendMessages"
  | "manageMessages"
  | "attachFiles"
  | "pinMessages"
  | "createThreads"
  | "manageChannel"
  | "manageRoles"
export type OverrideValue = "inherit" | "allow" | "deny"

export function PermissionsMatrix({
  roles,
  permissions,
  overrides,
  onChange,
}: {
  roles: { id: RoleKey; name: string }[]
  permissions: PermissionKey[]
  overrides: Record<RoleKey, Partial<Record<PermissionKey, OverrideValue>>>
  onChange: (roleId: RoleKey, perm: PermissionKey, value: OverrideValue) => void
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 pr-2">Permission</th>
            {roles.map((r) => (
              <th key={r.id} className="text-left py-2 px-2 whitespace-nowrap">
                {r.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {permissions.map((p) => (
            <tr key={p} className="border-t">
              <td className="py-2 pr-2 whitespace-nowrap font-medium">{label(p)}</td>
              {roles.map((r) => (
                <td key={r.id} className="py-2 px-2">
                  <Select
                    value={(overrides?.[r.id]?.[p] as OverrideValue) || "inherit"}
                    onValueChange={(v: OverrideValue) => onChange(r.id, p, v)}
                  >
                    <SelectTrigger className="h-8 w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inherit">Inherit</SelectItem>
                      <SelectItem value="allow">Allow</SelectItem>
                      <SelectItem value="deny">Deny</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3">
        <Button className="bg-black text-white hover:bg-gray-800">Save Permissions</Button>
      </div>
    </div>
  )
}

function label(p: PermissionKey) {
  switch (p) {
    case "viewChannel":
      return "View channel"
    case "sendMessages":
      return "Send messages"
    case "manageMessages":
      return "Manage messages"
    case "attachFiles":
      return "Attach files"
    case "pinMessages":
      return "Pin messages"
    case "createThreads":
      return "Create threads"
    case "manageChannel":
      return "Manage channel"
    case "manageRoles":
      return "Manage roles"
  }
}
