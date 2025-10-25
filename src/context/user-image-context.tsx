
"use client"


import { createContext, type ReactNode, useContext } from "react";



const UserImageContext = createContext<Map<string, string | null>>(new Map());

export function UserImageProvider({ children }: { children: ReactNode }) {

  return <UserImageContext.Provider value={new Map()}>{children}</UserImageContext.Provider>
}


export function useUserImage() {
  const context = useContext(UserImageContext)
  if (context == undefined) {
    throw new Error("useUserImage must be used within an UserImageContext")
  }

  return context
}
