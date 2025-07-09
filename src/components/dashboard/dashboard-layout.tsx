"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import {
  Activity,
  BarChart,
  Bell,
  Bookmark,
  Compass,
  Crown,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  PlusSquare,
  Search,
  Settings,
  User,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { UserAvatar } from "../user-avatar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const router = { push: useNavigate() }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [searchText, setSearchText] = useState("")

  const [username, setUsername] = useState<string | null>(null)


  const auth = useAuth()


  useEffect(() => { setUsername(auth.username) }, [auth])

  // Mock user data
  // Navigation items
  const navItems = [
    { path: "/dashboard", label: "Home", icon: Home },
    { path: "/dashboard/create-post", label: "Create Post", icon: PlusSquare },
    { path: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { path: "/dashboard/discover", label: "Discover", icon: Compass },
    { path: "/dashboard/activity", label: "Activity", icon: Activity },
    { path: "/dashboard/saved-posts", label: "Saved", icon: Bookmark },
    { path: "/dashboard/analytics", label: "Analytics", icon: BarChart },
    { path: "/dashboard/subscription", label : "subscriptions", icon : Crown},
    { path: "/dashboard/settings", label: "Settings", icon: Settings },
  ]

  // Handle client-side hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }



  const searchSubmit = async (e: React.KeyboardEvent) => {
    const keyCode = e.code || e.key
    if (keyCode != 'Enter') {
      return
    }

    const to = `/dashboard/discover?q=${encodeURIComponent(searchText)}`
    router.push(to)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen flex-col w-64 border-r bg-white">
        <div className="p-4 border-b">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-xl font-bold">Lupyd</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md ${isActive ? "bg-gray-100" : "hover:bg-gray-100"}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {
          auth.isAuthenticated &&
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link to = {`/dashboard/user/${auth.username}`}>
                <UserAvatar username={username ?? ""} />
                </Link>
                <div className="ml-3">
                  <p className="text-sm font-medium">{username}</p>
                  <p className="text-xs text-muted-foreground">@{username}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => console.log("Logout")}
                className="text-gray-500 hover:text-black hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

        }

      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden md:ml-64">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <Link to="/dashboard" className="ml-2">
                <span className="text-xl font-bold">Lupyd</span>
              </Link>
            </div>
            <div className="relative w-full max-w-md mx-4 hidden md:block">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="pl-8 bg-gray-100 border-none"
                onKeyDown={searchSubmit}
                value={searchText}
                onChange={
                  (e) => { setSearchText(e.target.value); }
                } />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative" onClick={() => alert("Notifications not implemented")}>
                <Bell className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard/messages")}
                className="relative"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>

              {/*}<Link to={`/dashboard/user/${username}`}><UserAvatar username={username ?? ""}/></Link>*/}

              {/* Mobile Profile Dropdown */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">

                      <UserAvatar username={username ?? ""} />

                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{username}</p>
                        <p className="text-xs leading-none text-muted-foreground">@{username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/user/${username}`)}>
                      <div className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </div>
                    </DropdownMenuItem>
                    {navItems.map((item) => {
                      const Icon = item.icon
                      // Skip Profile since we already added it above
                      if (item.path === `/dashboard/user/${username}`) return null
                      return (
                        <DropdownMenuItem key={item.path} onClick={() => router.push(item.path)}>
                          <div className="cursor-pointer">
                            <Icon className="mr-2 h-4 w-4" />
                            <span>{item.label}</span>

                          </div>

                        </DropdownMenuItem>
                      )
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => username == null ? router.push("/signin") : auth.logout()} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{username == null ? "Sign In" : "Sign Out"}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b">
            <nav className="flex flex-col p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md ${isActive ? "bg-gray-100" : "hover:bg-gray-100"
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
            
            <div className="p-4 border-t">
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search..." className="pl-8 bg-gray-100 border-none w-full" value={searchText} onChange={(e) => { setSearchText(e.target.value); }} onKeyDown={searchSubmit} />
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 max-w-full">{children}</div>
        </div>
      </main>
    </div>
  )
}
