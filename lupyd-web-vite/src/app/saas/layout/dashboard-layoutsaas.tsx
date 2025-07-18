"use client"

import { Routes, Route } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/app/saas/layout/app-sidebar"
import { DashboardHeader } from "@/app/saas/layout/dashboard-headersaas"
import { SidebarInset } from "@/components/ui/sidebar"

// Pages
import { OverviewPage } from "@/app/saas/pages/overview-page"
import { ClientsPage } from "@/app/saas/pages/clients-page"
import { ServicesPage } from "@/app/saas/pages/services-page"
import { AnalyticsPage } from "@/app/saas/pages/analytics-page"
import { MonitoringPage } from "@/app/saas/pages/monitoring-page"
import { BillingPage } from "@/app/saas/pages/billing-page"
import { SupportPage } from "@/app/saas/pages/support-page"
import { AddClientPage } from "@/app/saas/pages/add-client-page"
import { AddServicePage } from "@/app/saas/pages/add-service-page"
import { EditClientPage } from "../pages/editclient"
import { ApiKeyPage } from "../pages/api-key-page"
import { ClientDetailsPage } from "../pages/clientdetails"

export function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 space-y-4 p-2 md:p-4 lg:p-8 pt-4 md:pt-6 min-h-0 overflow-auto">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/saas/pages/clients-page" element={<ClientsPage />} />
            <Route path="/saas/pages/services-page" element={<ServicesPage />} />
            <Route path="/saas/pages/analytics-page" element={<AnalyticsPage />} />
            <Route path="/saas/pages/monitoring-page" element={<MonitoringPage />} />
            <Route path="/saas/pages/billing-page" element={<BillingPage />} />
            <Route path="/saas/pages/support-page" element={<SupportPage />} />
            <Route path ="/saas/pages/add-client-page" element = {<AddClientPage />} />
            <Route path ="/saas/pages/edit-client-page" element = {<EditClientPage />} />
            <Route path ="/saas/pages/api-key-page" element = {<ApiKeyPage />} />
            <Route path ="/saas/pages/clientdetails" element = {<ClientDetailsPage />} />
            <Route path ="/saas/pages/add-service-page" element = {<AddServicePage />} />
          </Routes>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
