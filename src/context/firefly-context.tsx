"use client"

import * as fireflyClientJs from "firefly-client-js"
import { createContext, useContext, useRef, useEffect, useState, useMemo } from "react"

import { useAuth } from "./auth-context"
import { Outlet } from "react-router-dom";

import { bMessageToDMessage, EncryptionPlugin, isBMessage, type DMessage } from "./encryption-plugin";
import { fromBase64, toBase64 } from "@/lib/utils";



let _fireflyClient: undefined | fireflyClientJs.FireflyWsClient = undefined
let _refs = 0

const acquireFireflyClient = (getAuthToken: () => Promise<string>) => {
  if (!_fireflyClient) {
    const apiUrl = process.env.NEXT_PUBLIC_JS_ENV_CHAT_API_URL
    const websocketUrl = process.env.NEXT_PUBLIC_JS_ENV_CHAT_WEBSOCKET_URL
    if (typeof apiUrl !== "string" || typeof websocketUrl !== "string") {
      throw new Error(`Missing CHAT ENV VARS`)
    }
    _fireflyClient = new fireflyClientJs.FireflyWsClient(websocketUrl, getAuthToken, Number.MAX_SAFE_INTEGER, 1000, 5000)
  }
  _fireflyClient.authToken = getAuthToken
  _refs += 1;
  return _fireflyClient;
}

const disposeFireflyClient = () => {
  _refs -= 1;
  if (_refs == 0) {
    if (_fireflyClient) {
      _fireflyClient!.dispose()
    }
  }

}



export type MessageCallbackType = (client: fireflyClientJs.FireflyWsClient, message: DMessage) => void;

type FireflyContextType = {
  client: fireflyClientJs.FireflyWsClient,
  service: fireflyClientJs.FireflyService,
  addEventListener: (cb: MessageCallbackType) => void,
  removeEventListener: (cb: MessageCallbackType) => void,

  initialize: () => Promise<void>,
  dispose: () => void,

  encryptAndSend: (convoId: bigint, other: string, text: Uint8Array) => Promise<DMessage>,

  encryptAndSendViaWebSocket: (convoId: bigint, other: string, text: Uint8Array) => Promise<DMessage>
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
        const isValid = isBMessage(data)
        console.log(`onUserMessage Recevied  ${isValid} ${JSON.stringify(data)}`)
        const dmsg = bMessageToDMessage(data)
        eventListeners.current.forEach(e => e(client.current, dmsg))
      })

    return () => { listener.then(_ => _.remove()) }

  }, [])


  if (!auth.username) {
    return <div>User should complete authentication to see this page</div>
  }


  const buildClient = () => {

    const c = acquireFireflyClient(async () => {
      if (!auth.username) throw Error(`Not authenticated`);
      const token = await auth.getToken(); if (!token) {
        throw Error(`Not authenticated`)
      } else {
        return token
      }
    })

    c.addEventListener("onMessage", onMessageEventListener)

    c.addEventListener("onConnect", onConnectEventListener)

    console.log(`Build a WS Client`)

    return c;
  }

  const onConnectEventListener = () => {
    EncryptionPlugin.syncUserMessages()
  }

  const onMessageEventListener = (e: Event) => {
    const event = e as CustomEvent<fireflyClientJs.protos.ServerMessage>
    onMessageCallback(event.detail)
  }

  const client = useRef<fireflyClientJs.FireflyWsClient>(buildClient())


  const service = useMemo(() => new fireflyClientJs.FireflyService(apiUrl, async () => {
    if (!auth.username) throw Error(`Not authenticated`);
    const token = await auth.getToken(); if (!token) {
      throw Error(`Not authenticated`)
    } else {
      return token
    }
  }), [auth])

  useEffect(() => {
    return () => {

      client.current.removeEventListener("onConnect", onConnectEventListener);
      client.current.removeEventListener("onMessage", onMessageEventListener);

      disposeFireflyClient();
    };
  }, [])

  useEffect(() => {
    if (auth.username) {
      if (client.current.isDisconnected()) {
        client.current.initialize().then(() => console.log(`Firefly initialized`)).catch(console.error);
      }
    }
  }, [auth])


  async function encryptAndSend(convoId: bigint, other: string, text: Uint8Array) {

    const token = await service.getAuthToken()
    const msg = await EncryptionPlugin.encryptAndSend({
      convoId: Number(convoId), textB64: toBase64(text), to: other, token,
    })

    return bMessageToDMessage(msg)
  }


  async function encryptAndSendViaWebSocket(convoId: bigint, other: string, text: Uint8Array) {
    const textB64 = toBase64(text)
    const encrypted = await EncryptionPlugin.encrypt({ to: other, textB64 })
    const response = await client.current.sendRequest(
      fireflyClientJs.protos.Request.create({
        createUserMessage: fireflyClientJs.protos.UserMessage.create({
          conversationId: convoId,
          text: fromBase64(encrypted.cipherTextB64),
          type: encrypted.messageType
        })
      }),
      5_000
    )

    if (response.error) {
      throw Error(`Server Responded with ${response.error.errorCode} ${response.error.error}`)
    }

    if (!response.createdUserMessage) {
      throw Error(`Server sent no response back`)
    }

    const msg: DMessage = {
      convoId: Number(convoId),
      text,
      from: auth.username!,
      to: other,
      id: Number(response.createdUserMessage!.id),
    }

    return msg

  }

  async function onMessageCallback(message: fireflyClientJs.protos.ServerMessage) {
    if (message.userMessage) {
      await handleUserMessage(message.userMessage)
    }
  }

  async function handleUserMessage(message: fireflyClientJs.protos.UserMessage) {
    const msg = await EncryptionPlugin.onUserMessage({
      convoId: Number(message.conversationId),
      from: message.from,
      to: message.to,
      textB64: toBase64(message.text),
      type: message.type,
      id: Number(message.id),
    })

    const dmsg = bMessageToDMessage(msg)

    eventListeners.current.forEach(e => e(client.current, dmsg))

    return dmsg
  }


  const addEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.add(cb)
  }
  const removeEventListener = (cb: MessageCallbackType) => {
    eventListeners.current.delete(cb)
  }


  return <FireflyContext.Provider value={{
    client: client.current,
    addEventListener, removeEventListener,
    initialize: client.current.initialize,
    dispose: client.current.dispose,
    service,
    encryptAndSend,

    encryptAndSendViaWebSocket,
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
export function isCallRejectedMessage(obj: any): obj is { type: "rejected", sessionId: number  } {
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
