"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DashboardLayout } from "../layout/dashboard-layoutsaas"

export function AddServicePage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    serviceName: "",
    serviceType: "",
    description: "",
    version: "",
    endpoint: "",
    port: "",
    maxConnections: "",
    rateLimit: "",
    isEnabled: true,
    requiresAuth: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Service form submitted:", formData)
    navigate("/services")
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Service</h2>
          <p className="text-muted-foreground">Configure a new API service for your platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Service Information
              </CardTitle>
              <CardDescription>Basic details about the service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={formData.serviceName}
                  onChange={(e) => handleInputChange("serviceName", e.target.value)}
                  placeholder="e.g., Video Call API"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={formData.serviceType} onValueChange={(value) => handleInputChange("serviceType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">Call Server</SelectItem>
                    <SelectItem value="chat">Chat Server</SelectItem>
                    <SelectItem value="messaging">Messaging API</SelectItem>
                    <SelectItem value="notification">Notification Service</SelectItem>
                    <SelectItem value="storage">Storage API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">Version *</Label>
                <Input
                  id="version"
                  value={formData.version}
                  onChange={(e) => handleInputChange("version", e.target.value)}
                  placeholder="e.g., v1.0.0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe what this service does..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Configuration</CardTitle>
              <CardDescription>Server and API configuration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint *</Label>
                <Input
                  id="endpoint"
                  value={formData.endpoint}
                  onChange={(e) => handleInputChange("endpoint", e.target.value)}
                  placeholder="e.g., /api/v1/calls"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  value={formData.port}
                  onChange={(e) => handleInputChange("port", e.target.value)}
                  placeholder="e.g., 8080"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxConnections">Max Connections</Label>
                <Input
                  id="maxConnections"
                  value={formData.maxConnections}
                  onChange={(e) => handleInputChange("maxConnections", e.target.value)}
                  placeholder="e.g., 1000"
                  type="number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rateLimit">Rate Limit (requests/minute)</Label>
                <Input
                  id="rateLimit"
                  value={formData.rateLimit}
                  onChange={(e) => handleInputChange("rateLimit", e.target.value)}
                  placeholder="e.g., 100"
                  type="number"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Service Settings</CardTitle>
            <CardDescription>Configure service behavior and security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isEnabled">Enable Service</Label>
                <p className="text-sm text-muted-foreground">Make this service available to clients</p>
              </div>
              <Switch
                id="isEnabled"
                checked={formData.isEnabled}
                onCheckedChange={(checked) => handleInputChange("isEnabled", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="requiresAuth">Requires Authentication</Label>
                <p className="text-sm text-muted-foreground">Require API key authentication for access</p>
              </div>
              <Switch
                id="requiresAuth"
                checked={formData.requiresAuth}
                onCheckedChange={(checked) => handleInputChange("requiresAuth", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/services")}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Create Service
          </Button>
        </div>
      </form>
    </div>
    </DashboardLayout>
  )
}
