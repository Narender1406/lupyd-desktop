"use client"

import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Edit, Key, Trash2, Activity, Calendar, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

// Mock client data - in real app, this would come from API
const clientData = {
  1: {
    id: 1,
    name: "TechCorp Inc.",
    email: "admin@techcorp.com",
    phone: "+1 (555) 123-4567",
    plan: "Enterprise",
    status: "Active",
    apiCalls: "125,430",
    lastActive: "2 hours ago",
    joinDate: "2023-06-15",
    apiKey: "tc_live_sk_1234567890abcdef",
    monthlyLimit: "Unlimited",
    currentUsage: "125,430",
    billingEmail: "billing@techcorp.com",
    description: "Leading technology corporation specializing in enterprise software solutions.",
  },
  2: {
    id: 2,
    name: "StartupXYZ",
    email: "dev@startupxyz.com",
    phone: "+1 (555) 987-6543",
    plan: "Pro",
    status: "Active",
    apiCalls: "45,230",
    lastActive: "1 day ago",
    joinDate: "2023-09-22",
    apiKey: "sxyz_live_sk_abcdef1234567890",
    monthlyLimit: "100,000",
    currentUsage: "45,230",
    billingEmail: "finance@startupxyz.com",
    description: "Innovative startup focused on AI-powered business automation tools.",
  },
  3: {
    id: 3,
    name: "Enterprise Solutions",
    email: "it@enterprise.com",
    phone: "+1 (555) 456-7890",
    plan: "Enterprise",
    status: "Inactive",
    apiCalls: "89,120",
    lastActive: "1 week ago",
    joinDate: "2023-03-10",
    apiKey: "es_live_sk_fedcba0987654321",
    monthlyLimit: "Unlimited",
    currentUsage: "89,120",
    billingEmail: "accounts@enterprise.com",
    description: "Enterprise-grade solutions provider for Fortune 500 companies.",
  },
}

const usageData = [
  { date: "Jan", calls: 12000 },
  { date: "Feb", calls: 15000 },
  { date: "Mar", calls: 18000 },
  { date: "Apr", calls: 22000 },
  { date: "May", calls: 25000 },
  { date: "Jun", calls: 28000 },
]

export function ClientDetailsPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const client = clientData[id as keyof typeof clientData]

  if (!client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Client not found</h3>
          <Button onClick={() => navigate("/clients")} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Client Details</h2>
          <p className="text-muted-foreground">Manage client information and API access</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/clients/${id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => navigate(`/clients/${id}/api-key`)}>
            <Key className="mr-2 h-4 w-4" />
            API Key
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Client Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
                  <AvatarFallback className="text-lg">{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{client.name}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge variant={client.plan === "Enterprise" ? "default" : "secondary"}>{client.plan}</Badge>
                  <Badge variant={client.status === "Active" ? "default" : "secondary"}>{client.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{client.description}</p>
              <Separator className="my-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Join Date</span>
                  <div className="font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {client.joinDate}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Active</span>
                  <div className="font-medium flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    {client.lastActive}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Monthly Limit</span>
                  <div className="font-medium">{client.monthlyLimit}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Current Usage</span>
                  <div className="font-medium">{client.currentUsage}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Chart */}
          <Card>
            <CardHeader>
              <CardTitle>API Usage Trend</CardTitle>
              <CardDescription>Monthly API calls over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              <div className="w-full overflow-hidden">
                <ChartContainer
                  config={{
                    calls: { label: "API Calls", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[200px] md:h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="calls" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{client.apiCalls}</div>
                <div className="text-sm text-muted-foreground">Total API Calls</div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Plan</span>
                  <span className="font-medium">{client.plan}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Status</span>
                  <span className="font-medium">{client.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Billing Email</span>
                  <span className="font-medium truncate">{client.billingEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => navigate(`/clients/${id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Client
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start bg-transparent"
                onClick={() => navigate(`/clients/${id}/api-key`)}
              >
                <Key className="mr-2 h-4 w-4" />
                Manage API Keys
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Suspend Client
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
