"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { NavBar } from "@/components/ui/tubelight-navbar"
import { useAuth } from "@/context/auth-context"
import {
  Bookmark,
  Compass,
  Group,
  Home,
  LogIn,
  LogOut,
  MessageSquare,
  PlusSquare,
  Search,
  Settings,
  User,
  X,
  Hash
} from "lucide-react"
import { getPayloadFromAccessToken } from "lupyd-js"
import type React from "react"
import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { UserAvatar } from "../user-avatar"
import { NotificationsDropdown } from "./notifications-dropdown"
import { EncryptionPlugin, type BGroupInfo } from "@/context/encryption-plugin"
import { useFirefly, type GroupMessageCallbackType } from "@/context/firefly-context"

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

  const [groups, setGroups] = useState<BGroupInfo[]>([])
  const firefly = useFirefly()

  useEffect(() => {
    // Fetch initial groups
    EncryptionPlugin.getGroupInfos().then(({ result }) => {
      setGroups(result)
    })

    // Listen for new groups (via messages that might indicate group updates, 
    // strictly speaking we might need a specific group list update event, 
    // but often re-fetching or listening to group messages helps discover new ones if logic exists.
    // The previous implementation in GroupsPage listened to ALL group text messages to re-sort list.
    // For sidebar, we might just want to know if a group is added.
    // For now, let's just fetch once. Adding a robust listener for "Group Created" might require more specific backend events.
    // However, we can reuse the listener pattern if we want to be fancy.
    // Let's stick to fetch-on-mount for stability first.

    // Listen for custom "groups-updated" event
    const handleGroupsUpdate = () => {
      EncryptionPlugin.getGroupInfos().then(({ result }) => {
        setGroups(result)
      })
    }

    window.addEventListener("groups-updated", handleGroupsUpdate)

    return () => {
      window.removeEventListener("groups-updated", handleGroupsUpdate)
    }

  }, [])

  // Navigation itemseed
  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/create-post", label: "Create Post", icon: PlusSquare },
    { path: "/messages", label: "Messages", icon: MessageSquare },
    { path: "/discover", label: "Discover", icon: Compass },
    // { path: "/activity", label: "Activity", icon: Activity },
    { path: "/saved-posts", label: "Saved", icon: Bookmark },
    { path: "/groups", label: "Groups", icon: Group },
    // { path: "/analytics", label: "Analytics", icon: BarChart },
    // { path: "/subscription", label: "Subscriptions", icon: Crown },
    // { path: "/business", label: "Business", icon: BriefcaseBusinessIcon },
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
    };
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

  // Allow body scrolling but handle mobile keyboard properly
  useEffect(() => {
    // Don't prevent body scrolling by default
    document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [])


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
    <>
      {/* Header stays visible */}
      <header className="sticky top-0 z-50 bg-white dark:bg-black">
        {/* Sidebar - Desktop Only - Hidden on mobile */}
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
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <div key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md ${isActive
                      ? "bg-gray-100 dark:bg-neutral-900 text-gray-900 dark:text-white"
                      : "hover:bg-gray-100 dark:hover:bg-neutral-900 text-gray-700 dark:text-gray-300"
                      }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>

                  {/* Render Groups Sub-list if this is the Groups item */}
                  {item.label === "Groups" && groups.length > 0 && (
                    <div className="ml-9 mt-1 space-y-1">
                      {groups.map((group) => {
                        const isGroupActive = location.pathname.startsWith(`/groups/${group.groupId}`)
                        return (
                          <Link
                            key={group.groupId}
                            to={`/groups/${group.groupId}`}
                            className={`flex items-center px-3 py-2 rounded-md text-sm ${isGroupActive
                              ? "text-primary font-medium bg-gray-50 dark:bg-neutral-900"
                              : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                              }`}
                          >
                            <Hash className="mr-2 h-3 w-3" />
                            <span className="truncate">{group.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Profile / Sign In or Out */}
          <div className="p-4 border-t dark:border-neutral-800">
            {username ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Link to={`/user/${username}`}>
                    <UserAvatar username={username} />
                  </Link>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">@{username}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onSigninButtonClick}
                  className="text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-neutral-900"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                onClick={onSigninButtonClick}
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </aside>

        {/* Top Bar - No sidebar toggle on mobile in header anymore */}
        <div
          className="border-b bg-white dark:bg-black"
          style={{
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <div className="flex items-center justify-between p-4 md:ml-64">
            {/* Logo - shown on both mobile and desktop */}
            <div className="flex items-center">
              <Link to="/" className="font-bold text-xl">
                Lupyd
              </Link>
            </div>

            {/* Search - shown only on desktop */}
            <div className="relative w-full max-w-md mx-4">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-gray-100 dark:bg-black border-none text-gray-900 dark:text-white"
                onKeyDown={searchSubmit}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            {/* Notifications, Create Post & Profile - shown on both mobile and desktop */}
            <div className="flex items-center space-x-2 ml-auto">
              {/* Create Post button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/create-post")}
                className="text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-neutral-900"
              >
                <PlusSquare className="h-5 w-5" />
              </Button>

              <NotificationsDropdown />

              {/* Profile - redirect to sign in page when not authenticated, profile page when authenticated */}
              <Link
                to={username ? `/user/${username}` : "#"}
                onClick={!username ? onSigninButtonClick : undefined}
                className="inline-flex items-center"
              >
                <UserAvatar username={username ?? ""} />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <aside className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] shadow-xl md:hidden flex flex-col bg-white dark:bg-black border-r overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-xl">Lupyd</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {dedupedNavItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t">
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 bg-gray-100 dark:bg-black border-none w-full"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={searchSubmit}
              />
            </div>

            <div className="p-4 border-t">
              <Button
                className="w-full"
                variant={username ? "destructive" : "default"}
                onClick={() => {
                  onSigninButtonClick();
                  setMobileMenuOpen(false);
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
          </aside>
        )}
      </header>

      {/* Content flows normally */}
      <main>
        <div className="container mx-auto p-4 pt-6 max-w-full md:ml-64">
          {children}
        </div>

        {/* Mobile Navbar */}
        <NavBar
          items={[
            { name: 'Home', url: '/', icon: Home },
            { name: 'Messages', url: '/messages', icon: MessageSquare },
            { name: 'Groups', url: '/groups', icon: Group },
            { name: 'Discover', url: '/discover', icon: Compass },
            { name: 'Profile', url: username ? `/user/${username}` : '/signin', icon: User },
            { name: 'Settings', url: '/settings', icon: Settings },
          ]}
          className="fixed bottom-0"
        />
      </main>
    </>
  )
}