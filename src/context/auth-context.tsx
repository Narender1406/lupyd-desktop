"use client"

import {   AuthHandler, fbElement } from "lupyd-js"
import { createContext, useContext, useState, type ReactNode } from "react"

import type { User } from "firebase/auth"


type AuthContextType = {
  user: User | null
  username: string | null
  isAuthenticated: boolean
  logout: () => void
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to logged in for development
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string| null>(null)

  if (typeof window !== "undefined") {
    console.log(`Assigned FB User callback`)
    fbElement().setOnAuthStateChangeCallback((username, user) => {
      // if (username != null) {
      console.log(`User [${username}] status `, user)
      setUser(user)
      setUsername(username)
    })

  }

  const logout = () => AuthHandler.signOut()

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, logout, username }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

