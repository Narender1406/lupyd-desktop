"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/app/saas/toggle/theme-togglesaas"
import { NotificationDropdown } from "@/components/ui/notification-dropdownsaas"
import { UserMenu } from "@/components/ui/user-menu"

export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex flex-1 items-center gap-2 min-w-0">
        <div className="relative max-w-sm flex-1 min-w-0">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8 w-full" />
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <ThemeToggle />
        <NotificationDropdown />
        <UserMenu />
      </div>
    </header>
  )
}
