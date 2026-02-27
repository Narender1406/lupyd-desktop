import { fromBase64, toBase64 } from "@/lib/utils";

import { decryptBlobV1 } from "@/lib/utils";
import { isTauri } from "@tauri-apps/api/core";
import { protos as FireflyProtos } from "firefly-client-js";
import { TauriEncryptionPluginInstance } from './tauri-encryption-plugin';


export interface UpdateRoleProposal {
  name: string;
  roleId: number;
  permissions: number;
  delete: boolean;
}

export interface UpdateUserProposal {
  username: string;
  roleId: number;
}

export interface Conversation {
  other: string;
  settings: number;
}

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
  id: number,
  channelId: number,
  epoch: number,
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

export function groupMessageToBGroupMessage(msg: GroupMessage): BGroupMessage {
  return {
    ...msg,
    textB64: toBase64(msg.text)
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


export interface EncryptionPluginType {

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

  getFileServerUrl(): Promise<{ url: string, token: string }>,


  getLastGroupMessages(): Promise<{ result: BGroupMessage[] }>


  encryptAndSendGroupMessage(options: BGroupMessage): Promise<{ messageId: number }>


  getGroupExtension(options: { groupId: number }): Promise<{ resultB64: string }>



  createGroup(options: { groupName: string, }): Promise<BGroupInfo>


  getGroupInfos(): Promise<{ result: BGroupInfo[] }>

  getGroupInfoAndExtension(options: { groupId: number }): Promise<BGroupInfo & { extensionB64: string }>



  getGroupMessages(options: { groupId: number, startBefore: number, limit: number }): Promise<{ result: BGroupMessage[] }>

  updateGroupChannel(options: {
    groupId: number,
    id: number,
    delete: boolean,
    name: string,
    channelTy: number,
    defaultPermissions: number
  }): Promise<{ messageId: number }>

  updateGroupRoles(options: {
    groupId: number,
    roles: UpdateRoleProposal[]
  }): Promise<{ messageId: number }>

  updateGroupRolesInChannel(options: {
    groupId: number,
    channelId: number,
    roles: UpdateRoleProposal[]
  }): Promise<{ messageId: number }>

  updateGroupUsers(options: {
    groupId: number,
    users: UpdateUserProposal[]
  }): Promise<{ messageId: number }>

  getConversations(options: { token: string }): Promise<{ result: Conversation[] }>

  dispose(): Promise<void>

  testMethod(options: { [key: string]: any }): Promise<{ [key: string]: any }>

  clearNotifications(): Promise<void>

  addGroupMember(options: { groupId: number, username: string, roleId: number }): Promise<void>

  kickGroupMember(options: { groupId: number, username: string }): Promise<void>

  deleteGroup(options: { groupId: number }): Promise<void>
};

// Check if running in Tauri environment

export const EncryptionPlugin =
  TauriEncryptionPluginInstance

export const TestPlugin =
  TauriEncryptionPluginInstance

//@ts-ignore
window["_plugins"] = { TestPlugin, EncryptionPlugin }



async function streamToUint8Array(stream: ReadableStream<Uint8Array>, capacity: number = 1024) {
  let out = new Uint8Array(Math.min(capacity, 1024))
  const reader = stream.getReader()
  let bytesRead = 0

  while (true) {
    const { value, done } = await reader.read()
    if (done) break


    if (bytesRead + value.byteLength > out.byteLength) {
      const newOut = new Uint8Array(out.byteLength + Math.max(value.byteLength, out.byteLength))
      newOut.set(out.subarray(0, bytesRead), 0)
      out = newOut
    }


    out.set(value, bytesRead)
    bytesRead += value.byteLength
  }


  return out.subarray(0, bytesRead)
}


export const getFileUrl = (fileUrl: string, fileServerUrl: string, fileServerToken: string) => {
  let pathname = new URL(fileUrl).pathname
  if (pathname.startsWith("/")) {
    pathname = pathname.substring(1)
  }
  const filename = pathname
  return `${fileServerUrl}/decrypted/${filename}?token=${fileServerToken}`
}

export const decryptStreamAndSave = async (
  file: FireflyProtos.EncryptedFile,
  bufferAll: boolean = true,
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
      body: bufferAll ? await streamToUint8Array(stream, file.contentLength) : stream, // stupid browsers won't let you stream request
      //@ts-ignore
      duplex: "half",
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


export enum GroupPermission {
  AddMessage = 4,
  ManageChannel = 8,
  ManageRole = 16,
  ManageMember = 32,
  ManageGroup = 64,
}
