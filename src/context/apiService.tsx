import { ApiService } from "lupyd-js"
import { createContext, type ReactNode, useContext, useMemo, useRef } from "react"
import { useAuth } from "./auth-context"

type ApiServiceContextType = {
  api: ApiService,
  apiUrl: string,
  apiCdnUrl: string,
  cdnUrl: string
}


const ApiServiceContext = createContext<ApiServiceContextType | undefined>(undefined)


export function ApiServiceProvider({ children }: { children: ReactNode }) {

  const auth = useAuth()

  const apiUrl = process.env.NEXT_PUBLIC_JS_ENV_API_URL

  if (!apiUrl) {
    throw Error(`NEXT_PUBLIC_JS_ENV_API_URL env var not set`)
  }

  const apiCdnUrl = process.env.NEXT_PUBLIC_JS_ENV_API_CDN_URL

  if (!apiCdnUrl) {
    throw Error(`NEXT_PUBLIC_JS_ENV_API_CDN_URL env var not set`)
  }

  const cdnUrl = process.env.NEXT_PUBLIC_JS_ENV_CDN_STORAGE
  if (!cdnUrl) {
    throw Error(`NEXT_PUBLIC_JS_ENV_CDN_STORAGE env var not set`)
  }

  // Keep getToken in a ref so the ApiService closure always calls the latest
  // version without needing to be in the useMemo dependency array.
  // This is critical: if [auth] were a dep, every auth context update (e.g.
  // username change) would recreate `api`, triggering useEffect([api]) re-runs
  // everywhere and hammering the server with redundant requests.
  const getTokenRef = useRef(auth.getToken)
  getTokenRef.current = auth.getToken

  const api = useMemo(() => new ApiService(apiUrl, apiCdnUrl,
    async () => {
      const token = await getTokenRef.current()
      if (!token) {
        throw new Error("User not authenticated")
      }
      return token
    }), [apiUrl, apiCdnUrl])  // no auth dep — api is created once per session


  return <ApiServiceContext.Provider value={{ api, apiCdnUrl, apiUrl, cdnUrl }}>{children}</ApiServiceContext.Provider>

}




export function useApiService() {
  const context = useContext(ApiServiceContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


