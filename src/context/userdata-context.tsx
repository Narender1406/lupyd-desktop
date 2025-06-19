"use client"

import { getFollowedUsersState, UserData, UsersFollowState } from "lupyd-js"
import { createContext, type ReactNode, useContext, useEffect, useState } from "react"


type UserDataContextType = {
  follows: UsersFollowState
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined)


export function UserDataProvider({ children }: { children: ReactNode }) {

  const [state, setState] = useState<UsersFollowState | null>(null)


  useEffect(() => {
    const _state =getFollowedUsersState(); 
    setState(_state);
    _state.setOnChangeCallback(setState)
  })



  return <UserDataContext.Provider value={{ follows: state! }}>{children}</UserDataContext.Provider>
}

export function useUserData() {
  const context = useContext(UserDataContext)
  if (context == undefined) {
    throw new Error("useUserData must be used within an UserDataProvider")
  }
  return context
}
