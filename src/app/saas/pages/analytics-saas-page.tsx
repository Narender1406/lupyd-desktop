"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { DashboardLayout } from "../layout/dashboard-layoutsaas"

const performanceData = [
  { name: "Mon", calls: 4000, chats: 2400, messages: 2400 },
  { name: "Tue", calls: 3000, chats: 1398, messages: 2210 },
  { name: "Wed", calls: 2000, chats: 9800, messages: 2290 },
  { name: "Thu", calls: 2780, chats: 3908, messages: 2000 },
  { name: "Fri", calls: 1890, chats: 4800, messages: 2181 },
  { name: "Sat", calls: 2390, chats: 3800, messages: 2500 },
  { name: "Sun", calls: 3490, chats: 4300, messages: 2100 },
]

const usageDistribution = [
  { name: "Call Server", value: 45, color: "hsl(var(--chart-1))" },
  { name: "Chat Server", value: 35, color: "hsl(var(--chart-2))" },
  { name: "Messaging API", value: 20, color: "hsl(var(--chart-3))" },
]

const responseTimeData = [
  { time: "00:00", responseTime: 45 },
  { time: "04:00", responseTime: 32 },
  { time: "08:00", responseTime: 78 },
  { time: "12:00", responseTime: 65 },
  { time: "16:00", responseTime: 52 },
  { time: "20:00", responseTime: 38 },
]

export function AnalyticssaasPage() {
  return (
    <DashboardLayout>
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Detailed insights into your API performance and usage</p>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Weekly Performance</CardTitle>
            <CardDescription>API usage across all services</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="w-full overflow-hidden">
              <ChartContainer
                config={{
                  calls: { label: "Calls", color: "hsl(var(--chart-1))" },
                  chats: { label: "Chats", color: "hsl(var(--chart-2))" },
                  messages: { label: "Messages", color: "hsl(var(--chart-3))" },
                }}
                className="h-[200px] sm:h-[250px] md:h-[300px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={performanceData} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} width={30} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="calls" fill="hsl(var(--chart-1))" radius={[1, 1, 0, 0]} />
                    <Bar dataKey="chats" fill="hsl(var(--chart-2))" radius={[1, 1, 0, 0]} />
                    <Bar dataKey="messages" fill="hsl(var(--chart-3))" radius={[1, 1, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Usage Distribution</CardTitle>
            <CardDescription>Service usage breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="w-full overflow-hidden flex justify-center">
              <ChartContainer
                config={{
                  usage: { label: "Usage", color: "hsl(var(--chart-1))" },
                }}
                className="h-[200px] sm:h-[250px] md:h-[300px] w-full max-w-[280px] sm:max-w-[320px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={usageDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                      labelLine={false}
                      fontSize={10}
                    >
                      {usageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            {/* Legend for mobile */}
            <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
              {usageDistribution.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate">
                    {entry.name}: {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Response Time Trends</CardTitle>
          <CardDescription>Average response time throughout the day</CardDescription>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div className="w-full overflow-hidden">
            <ChartContainer
              config={{
                responseTime: { label: "Response Time (ms)", color: "hsl(var(--chart-1))" },
              }}
              className="h-[200px] sm:h-[250px] md:h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseTimeData} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}>
                  <XAxis dataKey="time" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
