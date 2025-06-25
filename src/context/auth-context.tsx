"use client"

import { AuthHandler, fbElement, initFbElement } from "lupyd-js"
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
  const [username, setUsername] = useState<string | null>(null)

  if (typeof window !== "undefined") {
    console.log(`Assigned FB User callback`)

    const fbConfigBase64 =
      process.env.NEXT_PUBLIC_JS_ENV_FIREBASE_CONFIG

    if (!fbConfigBase64) {
      throw Error("Missing NEXT_PUBLIC_JS_ENV_FIREBASE_CONFIG env var")
    }
    const config = JSON.parse(atob(fbConfigBase64))

    const emulatorAddress = process.env.NEXT_PUBLIC_JS_ENV_EMULATOR_ADDR

    initFbElement(config, emulatorAddress)
      .setOnAuthStateChangeCallback((username, user) => {
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

