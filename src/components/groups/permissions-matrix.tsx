"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { protos } from "firefly-client-js"



export type OverrideValue = "inherit" | "allow" | "deny"

enum UserPermission {
    AddMessage = 4,
    ManageChannel = 8,
    ManageRole = 16,
    ManageMember = 32,
}

export type PermissionKey = UserPermission


export function PermissionsMatrix({
  roles,
  overrides,
  onChange,
}: {
  roles: protos.FireflyGroupRole[]
  overrides: Record<number, Partial<Record<PermissionKey, OverrideValue>>>
  onChange: (role: protos.FireflyGroupRole, perm: PermissionKey, value: OverrideValue) => void
}) {
  const permissions = [
    UserPermission.AddMessage,
    UserPermission.ManageChannel,
    UserPermission.ManageRole,
    UserPermission.ManageMember,
  ]


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
                    onValueChange={(v: OverrideValue) => onChange(r, p, v)}
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
    case UserPermission.AddMessage:
      return "Add message"
    case UserPermission.ManageChannel:
      return "Manage channel"
    case UserPermission.ManageRole:
      return "Manage role"
    case UserPermission.ManageMember:
      return "Manage member"
  }
}
