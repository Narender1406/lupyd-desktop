"use client"

// import { AuthHandler, fbElement, initFbElement } from "lupyd-js"
import { createContext, useContext, useState, type ReactNode } from "react"

import { Auth0Handler, getAuthHandler } from "lupyd-js"
import type { User } from "@auth0/auth0-spa-js"


type AuthContextType = {
  user: User | null
  username: string | null
  isAuthenticated: boolean
  logout: () => void
  login: () => void
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to logged in for development
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  if (typeof window !== "undefined") {

    console.log(`initalizing auth`)
    const clientId = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_CLIENT_ID

    if (!clientId) {
      throw new Error("Missing CLIENT_ID env var")
    }
    const audience = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_AUDIENCE
    if (!audience) {
      throw new Error("Missing AUDIENCE env var")
    }


    Auth0Handler.initialize(clientId, audience, (user) => {
      setUser(user || null)
      if (user) {
        setUsername(user["uname"])
      } else {
        setUsername(null)
      }
    })


    // console.log(`Assigned FB User callback`)

    // const fbConfigBase64 =
    //   process.env.NEXT_PUBLIC_JS_ENV_FIREBASE_CONFIG

    // if (!fbConfigBase64) {
    //   throw Error("Missing NEXT_PUBLIC_JS_ENV_FIREBASE_CONFIG env var")
    // }
    // const config = JSON.parse(atob(fbConfigBase64))

    // const emulatorAddress = process.env.NEXT_PUBLIC_JS_ENV_EMULATOR_ADDR

    // initFbElement(config, emulatorAddress)
    //   .setOnAuthStateChangeCallback((username, user) => {
    //     // if (username != null) {
    //     console.log(`User [${username}] status `, user)
    //     setUser(user)
    //     setUsername(username)
    //   })

  }

  const logout = () => getAuthHandler()!.logout()
  const login = () => getAuthHandler()!.login()

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!username, logout, username, login }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

