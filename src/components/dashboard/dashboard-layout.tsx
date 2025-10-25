"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/auth-context"
import {
  Activity,
  BarChart,
  Bookmark,
  BriefcaseBusinessIcon,
  Compass,
  Crown,
  Home,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  PlusSquare,
  Search,
  Settings,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { UserAvatar } from "../user-avatar"
import { NotificationsDropdown } from "./notifications-dropdown"

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

  useEffect(() => {
    setUsername(auth.username)
  }, [auth])

  // Navigation items
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/create-post", label: "Create Post", icon: PlusSquare },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/discover", label: "Discover", icon: Compass },
    { path: "/activity", label: "Activity", icon: Activity },
    { path: "/saved-posts", label: "Saved", icon: Bookmark },
    { path: "/analytics", label: "Analytics", icon: BarChart },
    { path: "/subscription", label: "Subscriptions", icon: Crown },
    { path: "/groups", label: "Groups", icon: MessageCircle },
    { path: "/business", label: "Business", icon: BriefcaseBusinessIcon },
    { path: "/settings", label: "Settings", icon: Settings },
  ]
  const dedupedNavItems = navItems.filter((item, idx, arr) => arr.findIndex((x) => x.path === item.path) === idx)

  // Handle client-side hydration
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = original
    }
  }, [mobileMenuOpen])

  if (!isMounted) {
    return null
  }

  const searchSubmit = async (e: React.KeyboardEvent) => {
    const keyCode = e.code || e.key
    if (keyCode !== "Enter") return
    if (!searchText.trim()) return
    const to = `/discover?q=${encodeURIComponent(searchText.trim())}`
    router.push(to)
  }

  const onSigninButtonClick = () => {
    if (username) {
      auth.logout()
    } else {
      if (auth.user) {
        if (!auth.username) {
          router.push("/signin")
        }
      } else {
        auth.login()
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen flex-col w-64 border-r bg-white overflow-y-auto">
        <div className="p-4 border-b">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">Lupyd</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {dedupedNavItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={`${item.path}-${index}`}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md ${isActive ? "bg-gray-100" : "hover:bg-gray-100"}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        {auth.username ? (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link to={`/user/${auth.username}`}>
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
                onClick={onSigninButtonClick}
                className="text-gray-500 hover:text-black hover:bg-gray-100"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <Button className="m-4" onClick={onSigninButtonClick}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Sign In</span>
          </Button>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full md:ml-64">
        {/* Sticky Top Navigation Bar */}
        <div className="sticky top-0 z-20 bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              <Link to="/" className="ml-2">
                <span className="text-xl font-bold">Lupyd</span>
              </Link>
            </div>
            {/* SEARCH BAR will always be sticky */}
            <div className="relative w-full max-w-md mx-4 hidden md:block">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-gray-100 border-none"
                onKeyDown={searchSubmit}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <NotificationsDropdown />
              {/* Profile button next to notifications for mobile & desktop */}
              <Link
                to={auth.username ? "/dashboard/profile" : "/signin"}
                aria-label="View profile"
                className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                title="View profile"
              >
                <UserAvatar username={username ?? ""} />
                <span className="sr-only">View profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay (Fixed + Scrollable) */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            />
            {/* Off-canvas sidebar */}
            <aside
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-xl md:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between p-4 border-b">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-semibold">
                  Lupyd
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                <nav className="flex flex-col p-4 space-y-2">
                  {dedupedNavItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={`${item.path}-${index}`}
                        to={item.path}
                        className={`flex items-center px-3 py-2 rounded-md ${
                          isActive ? "bg-gray-100" : "hover:bg-gray-100"
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
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="pl-8 bg-gray-100 border-none w-full"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      onKeyDown={searchSubmit}
                    />
                  </div>
                </div>

                {/* Sign In/Out button within the mobile sidebar */}
                <div className="p-4 border-t">
                  <Button
                    className="w-full"
                    variant={username ? "destructive" : "default"}
                    onClick={() => {
                      onSigninButtonClick()
                      setMobileMenuOpen(false)
                    }}
                  >
                    {username ? (
                      <>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Page Content - only this area is scrollable */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 max-w-full">{children}</div>
        </div>
      </main>
    </div>
  )
}
