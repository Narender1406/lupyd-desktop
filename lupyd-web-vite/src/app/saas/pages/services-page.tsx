"use client"

import { MessageSquare, Phone, Send, Settings, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusIndicator } from "@/components/ui/status-indicator"
import { Progress } from "@/components/ui/progress"
import { useNavigate } from "react-router-dom"

const services = [
  {
    name: "Call Server",
    description: "Voice calling API with WebRTC support",
    icon: Phone,
    status: "online",
    uptime: "99.9%",
    requests: "45,231",
    capacity: 85,
    version: "v2.1.0",
  },
  {
    name: "Chat Server",
    description: "Real-time messaging and chat functionality",
    icon: MessageSquare,
    status: "online",
    uptime: "99.8%",
    requests: "123,456",
    capacity: 72,
    version: "v1.8.2",
  },
  {
    name: "Messaging API",
    description: "SMS and push notification delivery",
    icon: Send,
    status: "warning",
    uptime: "98.5%",
    requests: "89,012",
    capacity: 94,
    version: "v3.0.1",
  },
]

export function ServicesPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">Monitor and manage your API services</p>
        </div>
        <Button onClick={() => navigate("/saas/pages/add-service-page")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <service.icon className="h-5 w-5" />
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusIndicator
                  status={service.status as "online" | "warning"}
                  label={service.status === "online" ? "Online" : "High Load"}
                />
                <Badge variant="outline">{service.version}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span className="font-medium">{service.uptime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Requests (24h)</span>
                  <span className="font-medium">{service.requests}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Capacity</span>
                  <span className="font-medium">{service.capacity}%</span>
                </div>
                <Progress value={service.capacity} className="h-2" />
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  View Logs
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  API Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>Integration guides and API references for developers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-medium">Quick Start Guide</h4>
              <p className="text-sm text-muted-foreground">Get started with our APIs in minutes</p>
              <Button variant="link" className="h-auto p-0">
                View Guide →
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">API Reference</h4>
              <p className="text-sm text-muted-foreground">Complete API documentation and examples</p>
              <Button variant="link" className="h-auto p-0">
                View Docs →
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">SDKs & Libraries</h4>
              <p className="text-sm text-muted-foreground">Official SDKs for popular programming languages</p>
              <Button variant="link" className="h-auto p-0">
                Download →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
