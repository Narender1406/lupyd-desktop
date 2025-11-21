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
  Plus,
  PlusSquare,
  Search,
  Settings,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { UserAvatar } from "../user-avatar"
import { NotificationsDropdown } from "./notifications-dropdown"
import { getPayloadFromAccessToken } from "lupyd-js"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
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

  // Set safe area insets as CSS variables
  useEffect(() => {
    const setSafeArea = () => {
      const top = getComputedStyle(document.documentElement).getPropertyValue('--sat') || getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)') || '0px';
      document.documentElement.style.setProperty('--status-bar-height', top);
    };

    setSafeArea();
    window.addEventListener('resize', setSafeArea);
    return () => window.removeEventListener('resize', setSafeArea);
  }, [])

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);


  if (!isMounted) {
    return null
  }

  const searchSubmit = async (e: React.KeyboardEvent) => {
    const keyCode = e.code || e.key
    if (keyCode !== "Enter") return
    if (!searchText.trim()) return
    const to = `/discover?q=${encodeURIComponent(searchText.trim())}`
    navigate(to)
  }

  const onSigninButtonClick = () => {
    if (username) {
      auth.logout()
    } else {
      if (!auth.username) {
        auth.getToken().then((value) => {
          if (value) {
            if (!getPayloadFromAccessToken(value).uname) {
              navigate("/signin")
            }
          } else {
            auth.login()
          }
        })
      }
    }
  }

  return (
    <div className="flex min-h-screen ">
     
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen flex-col w-64 border-r bg-white dark:bg-black dark:border-neutral-800 overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b dark:border-neutral-800">
      <Link to="/" className="flex items-center">
       <span className="text-xl font-bold text-gray-900 dark:text-white">Lupyd</span>
      </Link>
      </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
        {dedupedNavItems.map((item, index) => {
          const Icon = item.icon
        const isActive = location.pathname === item.path
        return (
           <Link
           key={`${item.path}-${index}`}
            to={item.path}
            className={`flex items-center px-3 py-2 rounded-md transition-colors duration-150 ${
              isActive
                ? "bg-gray-100 text-gray-900 dark:bg-neutral-900 dark:text-white"
                  : "hover:bg-gray-100 text-gray-700 dark:text-gray-300 dark:hover:bg-neutral-900 dark:hover:text-white"
                }`}
              >
              <Icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
          </Link>
          )
          })}
          </nav>

          {/* Profile / Sign Out or Sign In */}
          {auth.username ? (
          <div className="p-4 border-t dark:border-neutral-800">
            <div className="flex items-center justify-between">
            <div className="flex items-center">
            <Link to={`/user/${auth.username}`}>
              <UserAvatar username={username ?? ""} />
              </Link>
                <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{username}</p>
                <p className="text-xs text-muted-foreground dark:text-gray-400">@{username}</p>
                </div>
              </div>
              <Button
              variant="ghost"
              size="icon"
              onClick={onSigninButtonClick}
              className="text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-neutral-900"
              title="Logout"
              >
              <LogOut className="h-5 w-5" />
              </Button>
              </div>
              </div>
                ) : (
                <Button
                className="m-4 bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                onClick={onSigninButtonClick}
                 >
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign In</span>
                  </Button>
                )}
              </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen max-w-full md:ml-64 overflow-hidden" style={{ overscrollBehavior: 'none' }}>
        {/* Sticky Top Navigation Bar */}
        <div className="sticky top-0 z-20 border-b">
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
               <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 
                     text-muted-foreground dark:text-gray-400" />
                <Input
               type="search"
               placeholder="Search..."
               className="pl-8 bg-gray-100 border-none text-gray-900 placeholder-gray-500 
               dark:bg-black dark:text-white dark:placeholder-gray-400 
               focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
               onKeyDown={searchSubmit}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => navigate("/create-post")}
                title="Create post"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <NotificationsDropdown />
              {/* Profile button next to notifications for mobile & desktop */}
              <Link
                to={auth.username ? `/user/${auth.username}` : "/signin"}
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
              className="fixed inset-0 z-40  md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close mobile menu"
            />
            {/* Off-canvas sidebar */}
            <aside
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw]  shadow-xl md:hidden flex flex-col"
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
              <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
                <nav className="flex flex-col p-4 space-y-2">
                  {dedupedNavItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={`${item.path}-${index}`}
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
                    variant={username ? "outline" : "default"}
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
        <div className="flex-1 overflow-auto" style={{ overscrollBehavior: 'none' }}>
          <div className="container mx-auto p-4 md:p-6 max-w-full">{children}</div>
        </div>
      </main>
    </div>
  )
}
