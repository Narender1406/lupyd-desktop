"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { BarChart3, Building2, CreditCard, HelpCircle, Home, Monitor, Server, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Overview",
    url: "/saas",
    icon: Home,
  },
  {
    title: "Clients",
    url: "/saas/pages/clients-page",
    icon: Users,
  },
  {
    title: "Services",
    url: "/saas/pages/services-page",
    icon: Server,
  },
  {
    title: "Analytics",
    url: "/saas/pages/analytics-saas-page",
    icon: BarChart3,
  },
  {
    title: "Monitoring",
    url: "/saas/pages/monitoring-page",
    icon: Monitor,
  },
  {
    title: "Billing",
    url: "/saas/pages/billing-page",
    icon: CreditCard,
  },
  {
    title: "Support",
    url: "/saas/pages/support-page",
    icon: HelpCircle,
  },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">LUPYD</span>
            <span className="text-xs text-muted-foreground">B2B PLATFORM</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    onClick={() => navigate(item.url)}
                  >
                    <button className="w-full">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
