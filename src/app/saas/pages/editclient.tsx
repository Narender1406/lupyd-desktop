"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

// Mock client data
const clientData = {
  1: {
    id: 1,
    name: "TechCorp Inc.",
    email: "admin@techcorp.com",
    phone: "+1 (555) 123-4567",
    plan: "enterprise",
    status: "Active",
    apiLimit: "unlimited",
    description: "Leading technology corporation specializing in enterprise software solutions.",
    isActive: true,
    billingEmail: "billing@techcorp.com",
  },
  2: {
    id: 2,
    name: "StartupXYZ",
    email: "dev@startupxyz.com",
    phone: "+1 (555) 987-6543",
    plan: "pro",
    status: "Active",
    apiLimit: "100000",
    description: "Innovative startup focused on AI-powered business automation tools.",
    isActive: true,
    billingEmail: "finance@startupxyz.com",
  },
  3: {
    id: 3,
    name: "Enterprise Solutions",
    email: "it@enterprise.com",
    phone: "+1 (555) 456-7890",
    plan: "enterprise",
    status: "Inactive",
    apiLimit: "unlimited",
    description: "Enterprise-grade solutions provider for Fortune 500 companies.",
    isActive: false,
    billingEmail: "accounts@enterprise.com",
  },
}

export function EditClientPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const client = clientData[id as keyof typeof clientData]

  const [formData, setFormData] = useState({
    companyName: client?.name || "",
    contactEmail: client?.email || "",
    phone: client?.phone || "",
    billingEmail: client?.billingEmail || "",
    plan: client?.plan || "",
    apiLimit: client?.apiLimit || "",
    description: client?.description || "",
    isActive: client?.isActive || true,
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Updated client data:", formData)
    navigate(`/clients/${id}`)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Edit Client</h2>
          <p className="text-muted-foreground">Update client information and settings</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the client's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  placeholder="Enter contact email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={formData.billingEmail}
                  onChange={(e) => handleInputChange("billingEmail", e.target.value)}
                  placeholder="Enter billing email"
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Configure the client's subscription and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Subscription Plan *</Label>
                <Select value={formData.plan} onValueChange={(value) => handleInputChange("plan", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter - $99/month</SelectItem>
                    <SelectItem value="pro">Pro - $299/month</SelectItem>
                    <SelectItem value="enterprise">Enterprise - $2,499/month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiLimit">API Call Limit</Label>
                <Input
                  id="apiLimit"
                  value={formData.apiLimit}
                  onChange={(e) => handleInputChange("apiLimit", e.target.value)}
                  placeholder="e.g., 10000 or unlimited"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable client access</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Optional details about the client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter any additional notes about the client..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(`/clients/${id}`)}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
