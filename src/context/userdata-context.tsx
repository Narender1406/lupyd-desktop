"use client"

import { UserRelationsState } from "lupyd-js"
import { createContext, type ReactNode, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"


type UserDataContextType = {
  follows: string[],
  blocked: string[],
  relationState: UserRelationsState,
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)


export function UserDataProvider({ children }: { children: ReactNode }) {

  const [state, setState] = useState<{ follows: string[], blocked: string[] }>({ follows: [], blocked: [] })

  const [relationState, setRelationState] = useState<UserRelationsState | null>(null)

  const auth = useAuth()


  useEffect(() => {
    setRelationState(new UserRelationsState((follows, blocked) => {
      setState({ follows, blocked })
    }))
  }, [])


  useEffect(() => {
    if (auth.username) {
      relationState?.refresh()
    }
  }, [auth])



  return <UserDataContext.Provider value={{ follows: state.follows, blocked: state.blocked, relationState: relationState! }}>{children}</UserDataContext.Provider>
}

export function useUserData() {
  const context = useContext(UserDataContext)
  if (context == undefined) {
    throw new Error("useUserData must be used within an UserDataProvider")
  }
  return context
}
