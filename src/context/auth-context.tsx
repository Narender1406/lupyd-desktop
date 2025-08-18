"use client"

// import { AuthHandler, fbElement, initFbElement } from "lupyd-js"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { Auth0Handler, getAuthHandler, type DecodedToken } from "lupyd-js"


type AuthContextType = {
  user: DecodedToken | null
  username: string | null
  isAuthenticated: boolean
  logout: () => Promise<void>
  login: () => Promise<void>,
  getToken: () => Promise<string | undefined>,
  handleRedirectCallback: () => Promise<any>,
  assignUsername: (username: string) => Promise<void>,
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Default to logged in for development
  const [user, setUser] = useState<DecodedToken | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const [isReady, setIsReady] = useState(false)


  useEffect(() => {
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

      const redirectUrl = `${window.location.origin}/signin`

      Auth0Handler.initialize(clientId, audience, redirectUrl, (user) => {
        setUser(user || null)
        if (user) {
          setUsername(user.uname || null)
        } else {
          setUsername(null)
        }
        console.log({ user });
      }).then(() => setIsReady(true)).catch(console.error)

    }

  }, [])


  const logout = () => getAuthHandler()!.logout()
  const login = () => getAuthHandler()!.login({ targetPath: window.location.toString().slice(window.location.origin.length) })


  const handleRedirectCallback = () => getAuthHandler()!.handleRedirectCallback()

  const getToken = () => getAuthHandler()!.getToken()

  const assignUsername = (username: string) => getAuthHandler()!.assignUsername(username)

  const isAuthenticated = useMemo(() => username != null, [username])

  if (!isReady) {
    return (<div />);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: isAuthenticated, logout, username, login, getToken, handleRedirectCallback, assignUsername }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

