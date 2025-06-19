"use client"

import { useState } from "react"
import {Link} from "react-router-dom"
import { User, Lock, Bell, Globe, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

export function ProfileSettings() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [privateAccount, setPrivateAccount] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-gray-500">Manage your account settings and preferences</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Account</h3>

        <Link
          to="/dashboard/profile/edit"
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
        >
          <div className="flex items-center">
            <User className="h-5 w-5 mr-3 text-gray-500" />
            <span>Edit Profile</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>

        <Link
          to="/dashboard/profile/security"
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
        >
          <div className="flex items-center">
            <Lock className="h-5 w-5 mr-3 text-gray-500" />
            <span>Security</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>

        <div className="flex items-center justify-between p-2">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-3 text-gray-500" />
            <span>Notifications</span>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} aria-label="Toggle notifications" />
        </div>

        <div className="flex items-center justify-between p-2">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-3 text-gray-500" />
            <span>Private Account</span>
          </div>
          <Switch checked={privateAccount} onCheckedChange={setPrivateAccount} aria-label="Toggle private account" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Preferences</h3>

        <div className="flex items-center justify-between p-2">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 mr-3 text-gray-500"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            <span>Dark Mode</span>
          </div>
          <Switch checked={darkMode} onCheckedChange={setDarkMode} aria-label="Toggle dark mode" />
        </div>

        <Link
          to="/dashboard/profile/language"
          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
        >
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-3 text-gray-500" />
            <span>Language</span>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">English</span>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </Link>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-500">Support</h3>

        <Link to="/dashboard/help" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
          <div className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-3 text-gray-500" />
            <span>Help Center</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>

        <Link to="/dashboard/report" className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 mr-3 text-gray-500"
            >
              <path d="m3 3 18 18" />
              <path d="M10.5 10.5a2.5 2.5 0 0 0 3 3" />
              <path d="M7.34 7.34A6 6 0 0 0 12 18a6 6 0 0 0 5.66-8" />
              <path d="M12 18v3" />
              <path d="M8 21h8" />
              <path d="m4.9 4.9 14.2 14.2" />
            </svg>
            <span>Report a Problem</span>
          </div>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </Link>
      </div>

      <Separator />

      <Button variant="destructive" className="w-full" onClick={() => console.log("Logout")}>
        <LogOut className="h-4 w-4 mr-2" />
        Log Out
      </Button>
    </div>
  )
}
