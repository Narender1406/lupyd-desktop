import { ApiService } from "lupyd-js"
import { createContext, type ReactNode, useCallback, useContext, useMemo, useEffect } from "react"
import {useAuth} from "./auth-context"

type ApiServiceContextType = {
  api: ApiService
}


const ApiServiceContext =createContext<ApiServiceContextType | undefined>(undefined)


export function ApiServiceProvider({children}: {children: ReactNode}) {

  const auth = useAuth()

  const apiUrl = process.env.NEXT_PUBLIC_JS_ENV_API_URL

  if (!apiUrl) {
    throw Error(`NEXT_PUBLIC_JS_ENV_API_URL env var not set`)
  }
  
  const apiCdnUrl = process.env.NEXT_PUBLIC_JS_ENV_API_CDN_URL

  if (!apiCdnUrl) {
    throw Error(`NEXT_PUBLIC_JS_ENV_API_CDN_URL env var not set`)
  }


  const getToken = useCallback(async () => {
    const token = await auth.getToken()
    if (!token) {
      throw new Error("User not authenticated")
    }
    return token
  }, [auth])
  

  const api = useMemo(() => new ApiService(apiUrl, apiCdnUrl, getToken), [getToken])


  useEffect(() => {
    console.log({ apiUrl, apiCdnUrl })
    
  }, [])


  return <ApiServiceContext.Provider value={{api}}>{children}</ApiServiceContext.Provider>
  
}


export function useApiService() {
  const context = useContext(ApiServiceContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


