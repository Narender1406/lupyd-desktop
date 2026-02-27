"use client"

// import { AuthHandler, fbElement, initFbElement } from "lupyd-js"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { launchBrowserUrl } from "@/lib/utils"
import { Auth0Provider, useAuth0, User, type AppState } from "@auth0/auth0-react"
import { getPayloadFromAccessToken } from "lupyd-js"
import { useNavigate } from "react-router-dom"
import { EncryptionPlugin } from "./encryption-plugin"


type AuthContextType = {
  // user: DecodedToken | null
  username: string | null
  isAuthenticated: boolean
  logout: () => Promise<void>
  login: () => Promise<void>,
  getToken: (forceReload?: boolean) => Promise<string | undefined>,
  handleRedirectCallback: (url: string | undefined) => Promise<any>,
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {

  const auth0 = useAuth0()
  const navigate = useNavigate()


  // const [user, setUser] = useState<DecodedToken | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  const isReady = useMemo(() => !auth0.isLoading, [auth0])


  const onUpdateUser = (token: string | null) => {
    if (!token) {
      // setUser(null)
      setUsername(null)
    } else {
      const user = getPayloadFromAccessToken(token!)
      // setUser(user)
      setUsername(user?.uname ?? null)
    }
  }

  const returnToUrl = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_SIGNOUT_RETURN_TO ?? window.location.origin

  const logout = useCallback(async () => {
    await auth0.logout({ logoutParams: { returnTo: returnToUrl } })
    onUpdateUser(null)
  }, [auth0])


  const login = useCallback(() => {
    return auth0.loginWithRedirect({
      openUrl(url) {
        return launchBrowserUrl(url)
      },
    })
  }, [auth0])

  const getToken = useCallback(async (refresh?: boolean) => {
    if (auth0.isLoading) {
      console.log(`Auth0 is still loading`)
      return undefined
    }

    if (auth0.isAuthenticated) {
      const result = await auth0.getAccessTokenSilently({ detailedResponse: true, cacheMode: refresh ? "off" : "on" })

      const accessToken = result.access_token;

      if ("refresh_token" in result && typeof result["refresh_token"] === "string") {
        const refreshToken = result.refresh_token;
        console.log(`Saving tokens `, { accessToken, refreshToken })
        EncryptionPlugin.saveTokens({ accessToken, refreshToken })
      } else {
        console.warn(`Unable to get refresh token`, JSON.stringify(result))
      }

      if (refresh) {
        onUpdateUser(accessToken)
      }
      return accessToken;
    }
    return undefined;
  }, [auth0])

  const handleRedirectCallback = useCallback(async (url?: string) => {
    console.log(`Handling redirect callback ${url}`)

    // Bail out on stale deep-link URLs (e.g. getCurrent() returning a previous
    // session's code which is already consumed). Without this, a stale code
    // causes auth0.handleRedirectCallback to throw, and navigate('/signin')
    // would still fire — sending the user to /signin on every cold start.
    try {
      await auth0.handleRedirectCallback(url)
    } catch (e) {
      console.warn('handleRedirectCallback failed — likely a stale deep link, ignoring:', e)
      return
    }

    // Callback succeeded. Auth0 has the session internally but React state
    // hasn't propagated yet. Pre-fetch the token so username is set BEFORE
    // navigating to /signin, preventing the stuck-screen for existing users.
    try {
      const result = await auth0.getAccessTokenSilently({
        detailedResponse: true,
        cacheMode: 'off',
      })
      onUpdateUser(result.access_token)
    } catch (e) {
      console.warn('Could not pre-fetch token after redirect callback:', e)
    }

    navigate('/signin')
  }, [auth0])






  useEffect(() => {
    (async () => {
      if (auth0.isLoading) return
      const token = await getToken()

      //@ts-ignore
      window["_auth0_token"] = token
      
      onUpdateUser(token ?? null)
    })()
  }, [auth0])


  // const assignUsername = (username: string) => getAuthHandler()!.assignUsername(username)


  const isAuthenticated = useMemo(() => username != null, [username])

  if (!isReady) {
    return (<div />);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: isAuthenticated, logout, username, login, getToken, handleRedirectCallback }}>{children}</AuthContext.Provider>
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



  const redirectUrl = process.env.NEXT_PUBLIC_JS_ENV_AUTH0_REDIRECT_CALLBACK ?? `${window.location.origin}/signin`




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

