"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedCard } from "@/components/animated-card"
import {
  Bell,
  MessageSquare,
  Users,
  Compass,
  BarChart,
  Settings,
  Search,
  UserPlus,
  Filter,
  Home,
  Activity,
  LogOut,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState("connections")
  const router = useNavigate()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white">
        <div className="p-4 border-b">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold">Lupyd</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
            onClick={() => setActiveTab("feed")}
          >
            <span className="mr-3">🏠</span>
            <span>Home</span>
          </Link>
          <Link
            to="/dashboard/messages"
            className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
            onClick={() => setActiveTab("messages")}
          >
            <MessageSquare className="mr-3 h-5 w-5" />
            <span>Messages</span>
          </Link>
          <Link
            to="/dashboard/connections"
            className="flex items-center px-3 py-2 rounded-md bg-gray-100"
            onClick={() => setActiveTab("connections")}
          >
            <Users className="mr-3 h-5 w-5" />
            <span>Connections</span>
          </Link>
          <Link
            to="/dashboard/discover"
            className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
            onClick={() => setActiveTab("discover")}
          >
            <Compass className="mr-3 h-5 w-5" />
            <span>Discover</span>
          </Link>
          <Link
            to="/dashboard/analytics"
            className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart className="mr-3 h-5 w-5" />
            <span>Analytics</span>
          </Link>
          
          <Link
            to="/dashboard/settings"
            className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-3 h-5 w-5" />
            <span>Settings</span>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center">
            <Avatar>
              <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">@johndoe</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center md:hidden">
              <Link to="/dashboard">
                <span className="text-xl font-bold">Lupyd</span>
              </Link>
            </div>
            <div className="relative w-full max-w-md mx-4 hidden md:block">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search connections..." className="pl-8 bg-gray-100 border-none" />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-black rounded-full"></span>
              </Button>
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 md:hidden cursor-pointer">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">John Doe</p>
                      <p className="text-xs leading-none text-muted-foreground">@johndoe</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router("/dashboard")}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router("/dashboard/messages")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router("/dashboard/connections")}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Connections</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router("/dashboard/discover")}>
                    <Compass className="mr-2 h-4 w-4" />
                    <span>Discover</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router("/dashboard/activity")}>
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Activity</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router("/dashboard/analytics")}>
                    <BarChart className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Connections</h1>
              <p className="text-muted-foreground">Manage your network and discover new connections</p>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-black text-white hover:bg-gray-800">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Connection
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 bg-transparent border-b w-full justify-start rounded-none p-0 h-auto">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
              >
                All Connections
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
              >
                Pending
              </TabsTrigger>
              <TabsTrigger
                value="suggestions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-2 px-4"
              >
                Suggestions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatedCard delay={0.1}>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Sarah Johnson" />
                          <AvatarFallback>SJ</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">Sarah Johnson</h3>
                        <p className="text-muted-foreground mb-2">UX Designer at DesignCo</p>
                        <p className="text-sm text-muted-foreground mb-4">Connected since May 2023</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Message
                          </Button>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>

                <AnimatedCard delay={0.2}>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Alex Chen" />
                          <AvatarFallback>AC</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">Alex Chen</h3>
                        <p className="text-muted-foreground mb-2">Software Engineer at TechCorp</p>
                        <p className="text-sm text-muted-foreground mb-4">Connected since June 2023</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Message
                          </Button>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>

                <AnimatedCard delay={0.3}>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Emily Wong" />
                          <AvatarFallback>EW</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">Emily Wong</h3>
                        <p className="text-muted-foreground mb-2">Product Manager at InnovateCo</p>
                        <p className="text-sm text-muted-foreground mb-4">Connected since April 2023</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Message
                          </Button>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>

                <AnimatedCard delay={0.4}>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Michael Brown" />
                          <AvatarFallback>MB</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">Michael Brown</h3>
                        <p className="text-muted-foreground mb-2">Marketing Director at BrandX</p>
                        <p className="text-sm text-muted-foreground mb-4">Connected since July 2023</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Message
                          </Button>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="mt-0">
              <div className="grid grid-cols-1 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Pending Connections</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>You have no pending connection requests at this time.</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatedCard delay={0.1}>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Sophia Lee" />
                          <AvatarFallback>SL</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">Sophia Lee</h3>
                        <p className="text-muted-foreground mb-2">Product Designer at DesignHub</p>
                        <p className="text-sm text-muted-foreground mb-4">12 mutual connections</p>
                        <Button className="w-full bg-black text-white hover:bg-gray-800">Connect</Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>

                <AnimatedCard delay={0.2}>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage src="/placeholder.svg?height=80&width=80" alt="David Kim" />
                          <AvatarFallback>DK</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">David Kim</h3>
                        <p className="text-muted-foreground mb-2">Frontend Developer at WebTech</p>
                        <p className="text-sm text-muted-foreground mb-4">8 mutual connections</p>
                        <Button className="w-full bg-black text-white hover:bg-gray-800">Connect</Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>

                <AnimatedCard delay={0.3}>
                  <Card className="border-none shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-4">
                          <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Jessica Martinez" />
                          <AvatarFallback>JM</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg">Jessica Martinez</h3>
                        <p className="text-muted-foreground mb-2">Content Strategist at ContentLab</p>
                        <p className="text-sm text-muted-foreground mb-4">5 mutual connections</p>
                        <Button className="w-full bg-black text-white hover:bg-gray-800">Connect</Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
