"use client"

import { MoreHorizontal, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useNavigate } from "react-router-dom"



const clients = [
  {
    id: 1,
    name: "TechCorp Inc.",
    email: "admin@techcorp.com",
    plan: "Enterprise",
    status: "Active",
    apiCalls: "125,430",
    lastActive: "2 hours ago",
  },
  {
    id: 2,
    name: "StartupXYZ",
    email: "dev@startupxyz.com",
    plan: "Pro",
    status: "Active",
    apiCalls: "45,230",
    lastActive: "1 day ago",
  },
  {
    id: 3,
    name: "Enterprise Solutions",
    email: "it@enterprise.com",
    plan: "Enterprise",
    status: "Inactive",
    apiCalls: "89,120",
    lastActive: "1 week ago",
  },
]

export function ClientsPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground">Manage your API clients and their subscriptions</p>
        </div>
        
        <Button onClick={() => navigate("/saas/pages/add-client-page")} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
        
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-full md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." className="pl-8" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Overview</CardTitle>
          <CardDescription>All registered clients and their current status</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            <div className="space-y-4 p-4">
              {clients.map((client) => (
                <Card key={client.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                        <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{client.name}</div>
                        <div className="text-sm text-muted-foreground truncate">{client.email}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant={client.plan === "Enterprise" ? "default" : "secondary"} className="text-xs">
                            {client.plan}
                          </Badge>
                          <Badge variant={client.status === "Active" ? "default" : "secondary"} className="text-xs">
                            {client.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Client</DropdownMenuItem>
                        <DropdownMenuItem>Generate API Key</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Suspend Client</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">API Calls:</span>
                      <div className="font-medium">{client.apiCalls}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Active:</span>
                      <div className="font-medium">{client.lastActive}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>API Calls</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                            <AvatarFallback>{client.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{client.name}</div>
                            <div className="text-sm text-muted-foreground">{client.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.plan === "Enterprise" ? "default" : "secondary"}>{client.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={client.status === "Active" ? "default" : "secondary"}>{client.status}</Badge>
                      </TableCell>
                      <TableCell>{client.apiCalls}</TableCell>
                      <TableCell className="text-muted-foreground">{client.lastActive}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate("/saas/pages/clientdetails")}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/saas/pages/edit-client-page")}>Edit Client</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/saas/pages/api-key-page")}>Generate API Key</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Suspend Client</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
