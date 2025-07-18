"use client"

import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Copy, Eye, EyeOff, Key, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

// Mock client data
const clientData = {
  1: { name: "TechCorp Inc." },
  2: { name: "StartupXYZ" },
  3: { name: "Enterprise Solutions" },
}

const apiKeys = [
  {
    id: 1,
    name: "Production API Key",
    key: "tc_live_sk_1234567890abcdef1234567890abcdef",
    status: "Active",
    created: "2023-06-15",
    lastUsed: "2 hours ago",
    permissions: ["read", "write"],
  },
  {
    id: 2,
    name: "Development API Key",
    key: "tc_test_sk_abcdef1234567890abcdef1234567890",
    status: "Active",
    created: "2023-07-01",
    lastUsed: "1 day ago",
    permissions: ["read"],
  },
  {
    id: 3,
    name: "Legacy API Key",
    key: "tc_live_sk_fedcba0987654321fedcba0987654321",
    status: "Inactive",
    created: "2023-05-10",
    lastUsed: "2 weeks ago",
    permissions: ["read", "write"],
  },
]

export function ApiKeyPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { toast } = useToast()
  const client = clientData[id as keyof typeof clientData]

  const [visibleKeys, setVisibleKeys] = useState<Set<number>>(new Set())
  const [newKeyName, setNewKeyName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

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

  const toggleKeyVisibility = (keyId: number) => {
    const newVisible = new Set(visibleKeys)
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId)
    } else {
      newVisible.add(keyId)
    }
    setVisibleKeys(newVisible)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    })
  }

  const maskKey = (key: string) => {
    return key.substring(0, 12) + "..." + key.substring(key.length - 4)
  }

  const handleCreateKey = () => {
    // Handle API key creation
    console.log("Creating API key:", newKeyName)
    setNewKeyName("")
    setIsCreateDialogOpen(false)
    toast({
      title: "API Key Created",
      description: "New API key has been generated successfully",
    })
  }

  const handleDeleteKey = (keyId: number) => {
    // Handle API key deletion
    console.log("Deleting API key:", keyId)
    toast({
      title: "API Key Deleted",
      description: "API key has been permanently deleted",
      variant: "destructive",
    })
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">Manage API keys for {client.name}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key for {client.name}. Give it a descriptive name to help identify its purpose.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
                Generate Key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage API keys for secure access to your services. Keep your keys secure and rotate them regularly.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            <div className="space-y-4 p-4">
              {apiKeys.map((apiKey) => (
                <Card key={apiKey.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{apiKey.name}</div>
                        <div className="text-sm text-muted-foreground">Created: {apiKey.created}</div>
                      </div>
                      <Badge variant={apiKey.status === "Active" ? "default" : "secondary"} className="text-xs">
                        {apiKey.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                          readOnly
                          className="font-mono text-xs"
                        />
                        <Button variant="outline" size="icon" onClick={() => toggleKeyVisibility(apiKey.id)}>
                          {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(apiKey.key)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last used: {apiKey.lastUsed}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteKey(apiKey.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : maskKey(apiKey.key)}
                        </code>
                        <Button variant="ghost" size="icon" onClick={() => toggleKeyVisibility(apiKey.id)}>
                          {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(apiKey.key)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={apiKey.status === "Active" ? "default" : "secondary"}>{apiKey.status}</Badge>
                    </TableCell>
                    <TableCell>{apiKey.created}</TableCell>
                    <TableCell>{apiKey.lastUsed}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteKey(apiKey.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
