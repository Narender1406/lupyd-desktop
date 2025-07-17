"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { DashboardLayout } from "@/app/saas/layout/dashboard-layoutsaas"
import "@/app/saas/globals.css"

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DashboardLayout />
    </ThemeProvider>
  )
}
