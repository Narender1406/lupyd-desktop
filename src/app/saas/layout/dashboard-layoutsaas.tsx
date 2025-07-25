"use client"

import { Routes, Route } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/saas/layout/app-sidebar"
import { DashboardHeader } from "@/app/saas/layout/dashboard-headersaas"
import { SidebarInset } from "@/components/ui/sidebar"
// Pages

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 space-y-4 p-2 md:p-4 lg:p-8 pt-4 md:pt-6 min-h-0 overflow-auto">
          {
            children
          }
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
