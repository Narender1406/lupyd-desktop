"use client"

import { FireflyClient, protos as FireflyProtos } from "firefly-client-js"
import { createContext, type ReactNode, useContext, useRef, useEffect, useState } from "react"

import { useAuth } from "./auth-context"
import { Outlet } from "react-router-dom";
type MessageCallbackType = (client: FireflyClient, message: FireflyProtos.ServerMessage) => void;

type FireflyContextType = {
  client: FireflyClient,
  addEventListener: (cb: MessageCallbackType) => void,
  removeEventListener: (cb: MessageCallbackType) => void,

  initialize: () => Promise<void>,
  dispose: () => void,

}


const FireflyContext = createContext<FireflyContextType | undefined>(undefined)




export default function  FireflyProvider() {
  const auth = useAuth()


  const eventListeners = useRef(new Set<MessageCallbackType>())


  const apiUrl = process.env.NEXT_PUBLIC_JS_ENV_CHAT_API_URL
  const websocketUrl = process.env.NEXT_PUBLIC_JS_ENV_CHAT_WEBSOCKET_URL


  if (typeof apiUrl !== "string" || typeof websocketUrl !== "string") {
    throw new Error(`Missing CHAT ENV VARS`)
  }


  const buildClient = () =>
    new FireflyClient(apiUrl, websocketUrl, async () => {
      const token = await auth.getToken(); if (!token) {
        throw Error(`Not authenticated`)
      } else {
        return token
      }
    }, onMessageCallback, () => {
      console.error(`Retrying failed`)
    });
  const [client, _] = useState<FireflyClient>(buildClient())

  useEffect(() => {
    return () => { client.dispose(); };
  }, [])

  useEffect(() => {
    if (auth.username) {
      client!.initialize().then(() => console.log(`Firefly initialized`)).catch(console.error);
    }

  }, [auth])



  function onMessageCallback(message: FireflyProtos.ServerMessage) {
    for (const listener of eventListeners.current) {
      listener(client!, FireflyProtos.ServerMessage.create({ ...message }))
    }
  }

  const addEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.add(cb)
  }
  const removeEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.delete(cb)
  }


  return <FireflyContext.Provider value={{
    client: client,
    addEventListener, removeEventListener,
    initialize: client.initialize,
    dispose: client.dispose
  }}> <Outlet /> </FireflyContext.Provider>
}



export function useFirefly() {
  const context = useContext(FireflyContext)
  if (context === undefined) {
    throw new Error("useFirefly must be used within an FireflyProvider")
  }
  return context
}

