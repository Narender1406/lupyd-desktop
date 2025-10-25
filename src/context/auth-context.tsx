"use client"

// import { AuthHandler, fbElement, initFbElement } from "lupyd-js"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { Auth0Handler, getAuthHandler, type DecodedToken } from "lupyd-js"
import { Navigate } from "react-router-dom"
import { App } from "@capacitor/app"
import { Browser } from "@capacitor/browser"
import { Auth0Provider, useAuth0, User } from "@auth0/auth0-react"

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

  const redirectUrl = `com.example.app://lupyd-dev.eu.auth0.com/capacitor/com.example.app/callback`;


  return (<Auth0Provider
    domain={domain!}
    clientId={clientId!}
    authorizationParams={{
      redirect_uri: redirectUrl
    }}
    // For using Auth0-React with Ionic on Android and iOS,
    // it's important to use refresh tokens without the fallback
    useRefreshTokens={true}
    useRefreshTokensFallback={false}
  >
    {children}
  </Auth0Provider>
  )



}



export function AuthProvider({ children }: { children: ReactNode }) {

  // const domain = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_DOMAIN
  // if (!domain) {
  //   throw new Error("Missing DOMAIN env var")
  // }
  // const clientId = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_CLIENT_ID
  // if (!clientId) {
  //   throw new Error("Missing CLIENT_ID env var")
  // }
  // const audience = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_AUDIENCE
  // if (!audience) {
  //   throw new Error("Missing AUDIENCE env var")
  // }

  // const redirectUrl = `com.example.app://lupyd-dev.eu.auth0.com/capacitor/com.example.app/callback`;

  const auth0 = useAuth0()


  // Default to logged in for development
  const [user, setUser] = useState<DecodedToken | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const [isReady, setIsReady] = useState(true);



  const onUserUpdate = (user: DecodedToken | null) => {
    if (user) {
      setUser(user)
      setUsername(user?.uname ?? null)
    } else {
      setUser(null)
      setUsername(null)
    }
  }


  function getPayloadFromAccessToken(token: string): DecodedToken {
    const [_header, payload, _signature] = token.split(".");
    return JSON.parse(atob(payload)) as DecodedToken;
  }

  const logout = useCallback(async () => {
    await auth0.logout()

    throw new Error("Unimplemeted")

  }, [auth0])


  const login = useCallback(() => {
    return auth0.loginWithRedirect({
      async openUrl(url) {
        await Browser.open({
          url,
          windowName: "_self"
        });
      }
    })

  }, [auth0])

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


// export function AuthProvider({ children }: { children: ReactNode }) {

//   const domain = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_DOMAIN
//   if (!domain) {
//     throw new Error("Missing DOMAIN env var")
//   }
//   const clientId = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_CLIENT_ID
//   if (!clientId) {
//     throw new Error("Missing CLIENT_ID env var")
//   }
//   const audience = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_AUDIENCE
//   if (!audience) {
//     throw new Error("Missing AUDIENCE env var")
//   }

//   const redirectUrl = `com.example.app://lupyd-dev.eu.auth0.com/capacitor/com.example.app/callback`;


//   // Default to logged in for development
//   const [user, setUser] = useState<DecodedToken | null>(null)
//   const [username, setUsername] = useState<string | null>(null)

//   const [isReady, setIsReady] = useState(false);




//   useEffect(() => {
//     if (typeof window !== "undefined") {

//       // const redirectUrl = `lupyd://m.lupyd.com/signin`

//       Auth0Handler.initialize(domain, clientId, audience, redirectUrl, (user) => {
//         setUser(user || null)
//         if (user) {
//           setUsername(user.uname || null)
//         } else {
//           setUsername(null)
//         }
//         console.log({ user });
//       }).then(() => setIsReady(true)).catch(console.error)

//     }

//   }, [])




//   const logout = () => getAuthHandler()!.logout()
//   const login = () => {
//     App.addListener("appUrlOpen", async ({ url }) => {

//       console.log(`RECEIVED URL: ${url}`)
//       if (url.startsWith("lupyd://m.lupyd.com/signin")) {
//         await getAuthHandler()!.handleRedirectCallback(url)
//         Navigate({ to: "/signin" })

//       }
//     })




//     return getAuthHandler()!.login({ targetPath: window.location.toString().slice(window.location.origin.length) }, async (url) => { await Browser.open({ url, windowName: '_self' }) })


//   }

//   const handleRedirectCallback = () => getAuthHandler()!.handleRedirectCallback()

//   const getToken = () => getAuthHandler()!.getToken()

//   const assignUsername = (username: string) => getAuthHandler()!.assignUsername(username)

//   const isAuthenticated = useMemo(() => username != null, [username])

//   if (!isReady) {
//     return (<div />);
//   }

//   return (
//     <AuthContext.Provider value={{ user, isAuthenticated: isAuthenticated, logout, username, login, getToken, handleRedirectCallback, assignUsername }}>{children}</AuthContext.Provider>
//   )
// }

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

