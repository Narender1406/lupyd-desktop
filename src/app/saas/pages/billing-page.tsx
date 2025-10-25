"use client"

import { CreditCard, Download, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "../layout/dashboard-layoutsaas"

const billingData = [
  {
    client: "TechCorp Inc.",
    plan: "Enterprise",
    amount: "$2,499.00",
    status: "Paid",
    date: "2024-01-15",
    invoice: "INV-001",
  },
  {
    client: "StartupXYZ",
    plan: "Pro",
    amount: "$299.00",
    status: "Paid",
    date: "2024-01-15",
    invoice: "INV-002",
  },
  {
    client: "Enterprise Solutions",
    plan: "Enterprise",
    amount: "$2,499.00",
    status: "Overdue",
    date: "2024-01-10",
    invoice: "INV-003",
  },
]

export function BillingPage() {
  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing</h2>
        <p className="text-muted-foreground">Manage billing, invoices, and subscription plans</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 new this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Latest billing activity and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData.map((invoice) => (
                <TableRow key={invoice.invoice}>
                  <TableCell className="font-medium">{invoice.invoice}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.plan === "Enterprise" ? "default" : "secondary"}>{invoice.plan}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === "Paid" ? "default" : "destructive"}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Available plans and pricing tiers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Starter</h3>
              <div className="text-2xl font-bold">$99</div>
              <p className="text-sm text-muted-foreground">per month</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• 10,000 API calls</li>
                <li>• Basic support</li>
                <li>• 99% uptime SLA</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4 border-primary">
              <h3 className="font-semibold">Pro</h3>
              <div className="text-2xl font-bold">$299</div>
              <p className="text-sm text-muted-foreground">per month</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• 100,000 API calls</li>
                <li>• Priority support</li>
                <li>• 99.5% uptime SLA</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Enterprise</h3>
              <div className="text-2xl font-bold">$2,499</div>
              <p className="text-sm text-muted-foreground">per month</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li>• Unlimited API calls</li>
                <li>• 24/7 dedicated support</li>
                <li>• 99.9% uptime SLA</li>
                <li>• Custom integrations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
