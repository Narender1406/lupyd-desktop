"use client"

import { MessageCircle, Phone, Mail, FileText, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "../layout/dashboard-layoutsaas"

const supportTickets = [
  {
    id: "TICK-001",
    client: "TechCorp Inc.",
    subject: "API rate limit exceeded",
    status: "Open",
    priority: "High",
    created: "2024-01-15",
  },
  {
    id: "TICK-002",
    client: "StartupXYZ",
    subject: "Integration assistance needed",
    status: "In Progress",
    priority: "Medium",
    created: "2024-01-14",
  },
  {
    id: "TICK-003",
    client: "Enterprise Solutions",
    subject: "Billing inquiry",
    status: "Resolved",
    priority: "Low",
    created: "2024-01-13",
  },
]

const faqItems = [
  {
    question: "How do I get started with the API?",
    category: "Getting Started",
  },
  {
    question: "What are the rate limits for each plan?",
    category: "API Usage",
  },
  {
    question: "How do I upgrade my subscription?",
    category: "Billing",
  },
  {
    question: "What authentication methods are supported?",
    category: "Security",
  },
]

export function SupportPage() {
  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Support</h2>
        <p className="text-muted-foreground">Get help and manage support tickets</p>
      </div>

      {/* Contact Options */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Chat
            </CardTitle>
            <CardDescription>Get instant help from our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Support
            </CardTitle>
            <CardDescription>Send us an email and we'll respond within 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              Send Email
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Support
            </CardTitle>
            <CardDescription>Call us for urgent issues (Enterprise only)</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full bg-transparent">
              Call Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>Track and manage client support requests</CardDescription>
            </div>
            <Button>New Ticket</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supportTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.id}</TableCell>
                  <TableCell>{ticket.client}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ticket.status === "Open"
                          ? "destructive"
                          : ticket.status === "In Progress"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        ticket.priority === "High"
                          ? "destructive"
                          : ticket.priority === "Medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.created}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Knowledge Base */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Knowledge Base
          </CardTitle>
          <CardDescription>Find answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search knowledge base..." className="pl-8" />
            </div>
            <div className="grid gap-2">
              {faqItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 hover:bg-muted rounded-lg cursor-pointer"
                >
                  <span className="text-sm">{item.question}</span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </DashboardLayout>
  )
}
