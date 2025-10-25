"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import {Link} from "react-router-dom"
import { AuthHandler } from "lupyd-js"

export function AuthStatus() {
  const { isAuthenticated } = useAuth()

  const login = () => {

  }

  const logout = () => {
    AuthHandler.signOut()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
      <div className="flex flex-col space-y-2">
        <div className="text-sm font-medium">Development Mode: {isAuthenticated ? "Logged In" : "Logged Out"}</div>
        <div className="flex space-x-2">
          {isAuthenticated ? (
            <>
              <Button size="sm" variant="outline" onClick={logout}>
                Simulate Logout
              </Button>
              <Link to="/dashboard">
                <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                  View Dashboard
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button size="sm" className="bg-black text-white hover:bg-gray-800" onClick={login}>
                Simulate Login
              </Button>
              <Link to="/dashboard">
                <Button size="sm" className="bg-black text-white hover:bg-gray-800">
                  View Dashboard
                </Button>
              </Link></>
          )}
        </div>
      </div>
    </div>
  )
}

