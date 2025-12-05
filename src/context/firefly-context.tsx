"use client"

import * as fireflyClientJs from "firefly-client-js"
import { createContext, useContext, useRef, useEffect, useMemo } from "react"

import { useAuth } from "./auth-context"
import { Outlet } from "react-router-dom";

import { bUserMessageToUserMessage, EncryptionPlugin, isBUserMessage, type UserMessage } from "./encryption-plugin";
import {  toBase64 } from "@/lib/utils";


export type MessageCallbackType = (message: UserMessage) => void;

type FireflyContextType = {
  addEventListener: (cb: MessageCallbackType) => void,
  removeEventListener: (cb: MessageCallbackType) => void,
  encryptAndSend: (convoId: bigint, other: string, text: Uint8Array) => Promise<UserMessage>,
  service:fireflyClientJs.FireflyService
}


const FireflyContext = createContext<FireflyContextType | undefined>(undefined)




export default function FireflyProvider() {
  const auth = useAuth()


  const eventListeners = useRef(new Set<MessageCallbackType>())


  const apiUrl = process.env.NEXT_PUBLIC_JS_ENV_CHAT_API_URL
  const websocketUrl = process.env.NEXT_PUBLIC_JS_ENV_CHAT_WEBSOCKET_URL


  if (typeof apiUrl !== "string" || typeof websocketUrl !== "string") {
    throw new Error(`Missing CHAT ENV VARS`)
  }




  useEffect(() => {

    const listener =
      EncryptionPlugin.addListener("onUserMessage", (data) => {
        const isValid = isBUserMessage(data)
        console.log(`onUserMessage Recevied  ${isValid} ${JSON.stringify(data)}`)
        const dmsg = bUserMessageToUserMessage(data)
        eventListeners.current.forEach(e => e(dmsg))
      })

    return () => { listener.then(_ => _.remove()) }

  }, [])


  if (!auth.username) {
    return <div>User should complete authentication to see this page</div>
  }


  const service = useMemo(() => new fireflyClientJs.FireflyService(apiUrl, async () => {
    if (!auth.username) throw Error(`Not authenticated`);
    const token = await auth.getToken(); if (!token) {
      throw Error(`Not authenticated`)
    } else {
      return token
    }
  }), [auth])



  async function encryptAndSend(convoId: bigint, other: string, text: Uint8Array) {

    const msg = await EncryptionPlugin.encryptAndSend({
      convoId: Number(convoId), textB64: toBase64(text), to: other, 
    })

    return bUserMessageToUserMessage(msg)
  }

    


  const addEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.add(cb)
  }
  const removeEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.delete(cb)
  }


  return <FireflyContext.Provider value={{
    addEventListener, removeEventListener,
    service,
    encryptAndSend,
  }}> <Outlet /> </FireflyContext.Provider>
}



export function useFirefly() {
  const context = useContext(FireflyContext)
  if (context === undefined) {
    throw new Error("useFirefly must be used within an FireflyProvider")
  }
  return context
}


export function isCallRequestMessage(obj: any): obj is { type: "request", sessionId: number, exp: number } {
  if ("type" in obj && obj["type"] == "request" && typeof obj["sessionId"] === "number" && typeof obj["exp"] === "number") {
    return true
  } else {
    return false
  }
}
export function isCallRejectedMessage(obj: any): obj is { type: "rejected", sessionId: number } {
  if ("type" in obj && obj["type"] == "rejected" && typeof obj["sessionId"] === "number") {
    return true
  } else {
    return false
  }
}

export function isCallEndedMessage(obj: any): obj is { type: "end", sessionId: number } {
  if ("type" in obj && obj["type"] == "end" && typeof obj["sessionId"] === "number") {
    return true
  } else {
    return false
  }
}

