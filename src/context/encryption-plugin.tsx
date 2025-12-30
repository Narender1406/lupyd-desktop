import { fromBase64, toBase64 } from "@/lib/utils";

import { type Plugin as CapacitorPlugin, registerPlugin, } from '@capacitor/core'
import { protos as FireflyProtos } from "firefly-client-js";
import { decryptBlobV1 } from "@/lib/utils";


export interface BUserMessage {
  id: number,
  other: string,
  sentByOther: boolean,
  textB64: string,
}

export interface BGroupMessage {
  sender: string,
  groupId: number,
  textB64: string,
}


export interface BGroupInfo {
  name: string,
  groupId: number,
  description: string,
}


export function isBUserMessage(obj: any): obj is BUserMessage {
  return (
    obj &&
    typeof obj.id === "number" &&
    typeof obj.textB64 === "string" &&
    typeof obj.other == "string" &&
    typeof obj.sentByOther == "boolean"
  );
}
export function isBGroupMessage(obj: any): obj is BUserMessage {
  return (
    obj &&
    typeof obj.id === "number" &&
    typeof obj.textB64 === "string" &&
    typeof obj.groupId == "number"
  );
}


export type UserMessage = Omit<BUserMessage, "textB64"> & { text: Uint8Array }
export type GroupMessage = Omit<BGroupMessage, "textB64"> & { text: Uint8Array }


export function bUserMessageToUserMessage(msg: BUserMessage): UserMessage {
  return {
    ...msg,
    text: fromBase64(msg.textB64)
  }
}

export function bGroupMessageToGroupMessage(msg: BGroupMessage): GroupMessage {
  return {
    ...msg,
    text: fromBase64(msg.textB64)
  }
}

export function userMessageToBUserMessage(msg: UserMessage): BUserMessage {
  const o = {
    ...msg,
    textB64: toBase64(msg.text)
  };

  delete (o as any)["text"]

  return o
}


export interface EncryptionPluginType extends CapacitorPlugin {

  encryptAndSend(options: {
    textB64: string,
    to: string,
  }): Promise<BUserMessage>,


  getLastMessages(options: {
    other: string,
    limit: number,
    before: number
  }): Promise<{ result: BUserMessage[] }>

  getLastMessagesFromAllConversations(): Promise<{ result: { message: BUserMessage, count: number }[] }>

  saveTokens(options: {
    accessToken: string,
    refreshToken: string,
  }): Promise<void>


  markAsReadUntil(options: { username: string, ts: number }): Promise<void>,

  showUserNotification(options: BUserMessage): Promise<void>

  showCallNotification(options: {
    caller: string,
    sessionId: number,
    conversationId: number,
  }): Promise<void>


  requestAllPermissions(options: { permissions: string[] }): Promise<any>

  handleMessage(msg: BUserMessage): Promise<void>,

  getFileServerUrl(): Promise<{ url: string, token: string }>,



  getLastGroupMessages(): Promise<{ result: BGroupMessage[] }>


  encryptAndSendGroupMessage(options: BGroupMessage): Promise<{ messageId: number }>


  getGroupExtension(options: { groupId: number }): Promise<{ resultB64: string }>



  createGroup(options: { name: string, }): Promise<BGroupInfo>


  getGroupInfos(): Promise<{ result: BGroupInfo[] }>

  
  getGroupMessages(options: { groupId: number, startBefore: number, limit: number }): Promise<{ result: BGroupMessage[]}>
};

export const EncryptionPlugin = registerPlugin<EncryptionPluginType>("EncryptionPlugin")


export const getFileUrl = (fileUrl: string, fileServerUrl: string, fileServerToken: string) => {
  const pathname = new URL(fileUrl).pathname
  const filename = pathname
  return `${fileServerUrl}/decrypted/${filename}?token=${fileServerToken}`
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
    const { url, token } = await EncryptionPlugin.getFileServerUrl()


    const response = await fetch(getFileUrl(file.url, url, token), {
      method: "PUT",
      body: stream
    })

    if (!response.ok) {
      throw new Error("failed to save file")
    }
  }
}


export const checkIfFileExists = async (file: FireflyProtos.EncryptedFile) => {

  const { url, token } = await EncryptionPlugin.getFileServerUrl()

  const response = await fetch(getFileUrl(file.url, url, token), { method: "HEAD", })
  if (response.ok) {
    return true
  }

  return false
}
