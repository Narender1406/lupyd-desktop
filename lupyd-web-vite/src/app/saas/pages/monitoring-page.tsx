"use client"

import { Activity, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DashboardLayout } from "../layout/dashboard-layoutsaas"

const serverMetrics = [
  {
    name: "Call Server",
    status: "online",
    uptime: 99.9,
    latency: 45,
    activeConnections: 1250,
    cpuUsage: 65,
    memoryUsage: 78,
  },
  {
    name: "Chat Server",
    status: "online",
    uptime: 99.8,
    latency: 32,
    activeConnections: 2340,
    cpuUsage: 45,
    memoryUsage: 62,
  },
  {
    name: "Messaging API",
    status: "warning",
    uptime: 98.5,
    latency: 78,
    activeConnections: 890,
    cpuUsage: 85,
    memoryUsage: 92,
  },
]

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "High CPU Usage",
    message: "Messaging API server CPU usage is above 80%",
    time: "2 minutes ago",
  },
  {
    id: 2,
    type: "error",
    title: "Memory Alert",
    message: "Messaging API server memory usage is above 90%",
    time: "5 minutes ago",
  },
  {
    id: 3,
    type: "info",
    title: "Maintenance Scheduled",
    message: "Scheduled maintenance for Call Server at 2:00 AM UTC",
    time: "1 hour ago",
  },
]

export function MonitoringPage() {
  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Monitoring</h2>
        <p className="text-muted-foreground">Real-time monitoring and system health overview</p>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Alerts</h3>
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={alert.type === "error" ? "destructive" : "default"}>
            {alert.type === "error" ? (
              <XCircle className="h-4 w-4" />
            ) : alert.type === "warning" ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>
              {alert.message} • {alert.time}
            </AlertDescription>
          </Alert>
        ))}
      </div>

      {/* Server Metrics */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {serverMetrics.map((server) => (
          <Card key={server.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{server.name}</CardTitle>
                <StatusIndicator status={server.status as "online" | "warning"} label="" />
              </div>
              <CardDescription>
                Uptime: {server.uptime}% • Latency: {server.latency}ms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Active Connections</span>
                  <span className="font-medium">{server.activeConnections.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span className="font-medium">{server.cpuUsage}%</span>
                </div>
                <Progress value={server.cpuUsage} className={`h-2 ${server.cpuUsage > 80 ? "bg-red-100" : ""}`} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span className="font-medium">{server.memoryUsage}%</span>
                </div>
                <Progress value={server.memoryUsage} className={`h-2 ${server.memoryUsage > 90 ? "bg-red-100" : ""}`} />
              </div>

              <Badge variant={server.status === "online" ? "default" : "destructive"} className="w-full justify-center">
                <Activity className="mr-1 h-3 w-3" />
                {server.status === "online" ? "Healthy" : "Needs Attention"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>Overall system health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.7%</div>
              <div className="text-sm text-muted-foreground">Overall Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">4,480</div>
              <div className="text-sm text-muted-foreground">Active Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">52ms</div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
