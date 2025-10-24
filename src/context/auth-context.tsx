"use client"

// import { AuthHandler, fbElement, initFbElement } from "lupyd-js"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { Auth0Provider, useAuth0, User, type AppState } from "@auth0/auth0-react"

import { type DecodedToken, getPayloadFromAccessToken } from "lupyd-js"


type AuthContextType = {
  user: DecodedToken | null
  username: string | null
  isAuthenticated: boolean
  logout: () => Promise<void>
  login: () => Promise<void>,
  getToken: (forceReload?: boolean) => Promise<string | undefined>,
  handleRedirectCallback: () => Promise<any>,
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {

  const auth0 = useAuth0()


  // Default to logged in for development
  const [user, setUser] = useState<DecodedToken | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const isReady = useMemo(() => !auth0.isLoading, [auth0])


  // useEffect(() => {
  //   if (typeof window !== "undefined") {

  //     const domain = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_DOMAIN

  //     if (!domain) {
  //       throw new Error("Missing DOMAIN env var")
  //     }

  //     const clientId = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_CLIENT_ID

  //     if (!clientId) {
  //       throw new Error("Missing CLIENT_ID env var")
  //     }
  //     const audience = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_AUDIENCE
  //     if (!audience) {
  //       throw new Error("Missing AUDIENCE env var")
  //     }

  //     const redirectUrl = `${window.location.origin}/signin`

  //     Auth0Handler.initialize(domain, clientId, audience, redirectUrl, (user) => {
  //       setUser(user || null)
  //       if (user) {
  //         setUsername(user.uname || null)
  //       } else {
  //         setUsername(null)
  //       }
  //       console.log({ user });
  //     }).then(() => setIsReady(true)).catch(console.error)

  //   }

  // }, [])



  const onUpdateUser = (token: string | null) => {
    if (!token) {
      setUser(null)
      setUsername(null)
    } else {
      const user = getPayloadFromAccessToken(token!)
      setUser(user)
      setUsername(user?.uname ?? null)
    }

    console.log({ authStatus: { user, username, token } })


    if (typeof window !== "undefined") {
      Object.assign(window, { "auth0Token": `${token}` })
    }

  }

  const logout = useCallback(async () => {
    await auth0.logout()
    onUpdateUser(null)
  }, [auth0])
  // const login = () => getAuthHandler()!.login({ targetPath: window.location.toString().slice(window.location.origin.length) })


  const login = useCallback(() => {
    return auth0.loginWithRedirect()
  }, [auth0])

  const getToken = useCallback(async (refresh?: boolean) => {
    if (auth0.isLoading) return

    if (auth0.isAuthenticated) {
      const token = await auth0.getAccessTokenSilently({ cacheMode: refresh ? 'off' : 'on' });
      if (refresh) {
        onUpdateUser(token)
      }
      return token;
    }
    return undefined;
  }, [auth0])

  // const handleRedirectCallback = () => getAuthHandler()!.handleRedirectCallback()
  const handleRedirectCallback = useCallback(async (url?: string) => {
    console.log(`handling handle redirect callback with ${url}, at full path: ${window.location.href}`)
    const _result = await auth0.handleRedirectCallback(url)
    console.log({ _result })
    const token = await getToken()
    onUpdateUser(token ?? null)
  }, [auth0])






  useEffect(() => {
    (async () => {
      if (auth0.isLoading) return
      const token = await getToken()
      console.log({token})
      onUpdateUser(token ?? null)
    })()
  }, [auth0])


  // const assignUsername = (username: string) => getAuthHandler()!.assignUsername(username)


  const isAuthenticated = useMemo(() => username != null, [username])

  if (!isReady) {
    return (<div />);
  }


  const deleteAccount = async () => {
    throw Error("UNIMPLEMENTED")
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: isAuthenticated, logout, username, login, getToken, handleRedirectCallback }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


export function LupydAuth0Provider({ children }: { children: ReactNode }) {

  const domain = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_DOMAIN
  if (!domain) {
    throw new Error("Missing DOMAIN env var")
  }
  const clientId = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_CLIENT_ID
  if (!clientId) {
    throw new Error("Missing CLIENT_ID env var")
  }
  const audience = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_AUDIENCE
  if (!audience) {
    throw new Error("Missing AUDIENCE env var")
  }

  const redirectUrl = `${window.location.origin}/signin`


  // const redirectUrl = `com.example.app://lupyd-dev.eu.auth0.com/capacitor/com.example.app/callback`;


  const onRedirectCallback = (state: AppState | undefined, user: User | undefined) => {
    console.log({ onRedirect: { state, user } })
  };

  return (<Auth0Provider
    domain={domain!}
    clientId={clientId!}
    onRedirectCallback={onRedirectCallback}
    cacheLocation="localstorage"
    authorizationParams={{
      redirect_uri: redirectUrl,
      audience: audience
    }}
    useRefreshTokens={true}
    useRefreshTokensFallback={false}
  >
    {children}
  </Auth0Provider>
  )

}

