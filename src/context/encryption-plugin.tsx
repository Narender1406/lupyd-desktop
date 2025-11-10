import { fromBase64 } from "@/lib/utils";

import { type Plugin as CapacitorPlugin, registerPlugin, type PluginCallback, type PluginListenerHandle } from '@capacitor/core'
import { protos as FireflyProtos } from "firefly-client-js";
import { decryptBlobV1 } from "@/lib/utils";

export interface BMessage {
  id: number,
  convoId: number,
  from: string,
  to: string,
  textB64: string,
}


export function isBMessage(obj: any): obj is BMessage {
  return (
    obj &&
    typeof obj.id === "number" &&
    typeof obj.convoId === "number" &&
    typeof obj.from === "string" &&
    typeof obj.to === "string" &&
    typeof obj.textB64 === "string"
  );
}


export type DMessage = Omit<BMessage, "textB64"> & { text: Uint8Array }

export function bMessageToDMessage(msg: BMessage): DMessage {
  return {
    ...msg,
    text: fromBase64(msg.textB64)
  }
}


export interface EncryptionPluginType extends CapacitorPlugin {
  onUserMessage(options: {
    convoId: number,
    textB64: string,
    from: string,
    to: string,
    type: number,
    id: number,
  }): Promise<BMessage>,
  encryptAndSend(options: {
    convoId: number,
    textB64: string,
    to: string,
    token: string
  }): Promise<BMessage>,


  getLastMessages(options: {
    from: string,
    to: string,
    limit: number,
    before: number
  }): Promise<{ result: BMessage[] }>

  getLastMessagesFromAllConversations(): Promise<{ result: BMessage[] }>
  getLastMessagesInBetween(
    options: {
      from: string,
      to: string,
      limit: number,
      before: number
    }
  ): Promise<{ result: BMessage[] }>

  checkSetup(): Promise<void>,

  saveTokens(options: {
    accessToken: string,
    refreshToken: string,
  }): Promise<void>


  syncUserMessages(): Promise<void>,

  testMethod(obj: any): Promise<any>,


  markAsReadUntil(options: { username: string, ts: number }): Promise<void>,

  getLastSeenUserMessageTimestamp(options: { username: string }): Promise<{ ts: number }>


  getNumberOfMessagesInBetweenSince(options: { from: string, to: string, since: number }): Promise<{ count: number }>


  showUserNotification(options: {
    from: string,
    to: string,
    me: string,
    textB64: string,
    conversationId: number,
    id: number,
  }): Promise<void>

  showCallNotification(options: {
    caller: string,
    sessionId: number,
    conversationId: number,
  }): Promise<void>


  requestAllPermissions(options: { permissions: string[] }): Promise<any>

  encrypt(options: { to: string, textB64: string, }): Promise<{ messageType: number, cipherTextB64: string }>



  processPreKeyBundle(options: { owner: string, preKeyBundleB64: string }): Promise<void>


  handleMessage(msg: BMessage): Promise<void>,


  getFileServerUrl(): Promise<{ url: string }>,
};

export const EncryptionPlugin = registerPlugin<EncryptionPluginType>("EncryptionPlugin")


export const getFileUrl = async (fileUrl: string) => {
  const { url } = await EncryptionPlugin.getFileServerUrl()
  const pathname = new URL(fileUrl).pathname
  const filename = pathname
  return `${url}/decrypted/${filename}`
  
}

export const decryptStreamAndSave = async (
  file: FireflyProtos.EncryptedFile,
) => {
  const response = await fetch(file.url);

  if (!response.ok) {
    throw new Error(`failed to download file`);
  }

  const blob = await response.blob();

  const stream = decryptBlobV1(blob, file.secretKey);
  {
    const response = await fetch(await getFileUrl(file.url), {
      method: "PUT",
      body: stream
    })

    if (!response.ok) {
      throw new Error("failed to save file")
    }
  }
}


export const checkIfFileExists = async (file: FireflyProtos.EncryptedFile) => {

  const response = await fetch(await getFileUrl(file.url), { method: "HEAD"})
  if (response.ok) {
    return true
  }
  
  return false
}
