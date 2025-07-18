"use client"

import { Activity, MessageSquare, Phone, Server, Users } from "lucide-react"
import { MetricCard } from "@/components/ui/metric-card"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const usageData = [
  { name: "Jan", calls: 4000, chats: 2400, messages: 2400 },
  { name: "Feb", calls: 3000, chats: 1398, messages: 2210 },
  { name: "Mar", calls: 2000, chats: 9800, messages: 2290 },
  { name: "Apr", calls: 2780, chats: 3908, messages: 2000 },
  { name: "May", calls: 1890, chats: 4800, messages: 2181 },
  { name: "Jun", calls: 2390, chats: 3800, messages: 2500 },
]

const trafficData = [
  { time: "00:00", requests: 120 },
  { time: "04:00", requests: 80 },
  { time: "08:00", requests: 300 },
  { time: "12:00", requests: 450 },
  { time: "16:00", requests: 380 },
  { time: "20:00", requests: 200 },
]

export function OverviewPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Monitor your API services and client activity</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Calls"
          value="45,231"
          change={{ value: "+20.1%", type: "increase" }}
          icon={<Phone className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Chats"
          value="12,234"
          change={{ value: "+15.3%", type: "increase" }}
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <MetricCard
          title="API Requests"
          value="573,204"
          change={{ value: "+7.2%", type: "increase" }}
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Users"
          value="2,350"
          change={{ value: "+3.1%", type: "increase" }}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Server Health"
          value="99.9%"
          change={{ value: "Stable", type: "neutral" }}
          icon={<Server className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Usage Trends</CardTitle>
            <CardDescription>Monthly service usage comparison</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  calls: { label: "Calls", color: "hsl(var(--chart-1))" },
                  chats: { label: "Chats", color: "hsl(var(--chart-2))" },
                  messages: { label: "Messages", color: "hsl(var(--chart-3))" },
                }}
                className="h-[250px] md:h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={usageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stackId="1"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="chats"
                      stackId="1"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      stackId="1"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Analysis</CardTitle>
            <CardDescription>API requests throughout the day</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  requests: { label: "Requests", color: "hsl(var(--chart-1))" },
                }}
                className="h-[250px] md:h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trafficData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="requests" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Status */}
      <Card>
        <CardHeader>
          <CardTitle>Server Status</CardTitle>
          <CardDescription>Real-time monitoring of all services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Call Server</h4>
              <StatusIndicator status="online" label="Online - 99.9% uptime" />
              <p className="text-sm text-muted-foreground">Latency: 45ms</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Chat Server</h4>
              <StatusIndicator status="online" label="Online - 99.8% uptime" />
              <p className="text-sm text-muted-foreground">Latency: 32ms</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Messaging API</h4>
              <StatusIndicator status="warning" label="High Load - 98.5% uptime" />
              <p className="text-sm text-muted-foreground">Latency: 78ms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
